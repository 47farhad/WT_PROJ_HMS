import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

// --- Types ---
interface Pagination {
	total?: number;
	page?: number;
	pages?: number;
	hasMore: boolean;
	isPageLoading: boolean;
	currentPage: number;
}

interface Patient {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	profilePic?: string;
	medicalInfo?: {
		dateOfBirth?: Date;
	};
	appointment?: string;
	reason?: string;
	doctor?: string;
}

interface WorkSchedule {
	day: string;
	isWorking: boolean;
	startTime: string;
	endTime: string;
	slotDuration: number;
}

interface Doctor {
	_id: string;
	name: string;
	specialization: string;
	department: string;
	profilePic?: string;
	workSchedule: WorkSchedule[];
}

interface Appointment {
	_id: string;
	datetime: Date;
	date: Date;
	startTime: string;
	endTime: string;
	doctorId: string | Doctor;
	patientId: string | Patient;
	description: string;
	reason?: string;
	status: "confirmed" | "pending" | "cancelled" | "completed" | "no-show";
	paymentStatus?: "pending" | "completed" | "refunded";
	paymentAmount?: number;
}

interface Transaction {
	_id: string;
	userId: { _id: string; firstName: string; lastName: string };
	referenceId: string;
	type: "Appointment" | "LabTest" | "Order";
	amount: number;
	status: "unpaid" | "paid" | "failed";
	createdAt: string;
}

interface DoctorScheduleWithAppointments {
	doctor: Doctor;
	appointments: Appointment[];
}

// --- Store Interface ---
interface AdminStore {
	// 1. Dashboard Helper
	loadDashboardData: () => Promise<void>;

	// 2. Patients section
	patients: {
		data: Patient[];
		pagination: Pagination;
	};
	patient: Patient | null;
	isPatientsLoading: boolean;
	isPatientLoading: boolean;
	isConvertingPatient: boolean;
	getPatients: (page?: number, limit?: number) => Promise<void>;
	getPatientDetails: (patientId: string) => Promise<void>;
	convertToDoctor: (patientId: string) => Promise<void>;
	convertToAdmin: (patientId: string) => Promise<void>;

	// 3. Doctors section (General List)
	doctors: {
		data: Doctor[];
		total: number;
	};
	getDoctors: () => Promise<void>;

	// 4. Appointments section
	appointments: {
		data: Appointment[];
		pagination: Pagination;
	};
	isAppointmentsLoading: boolean;
	getAppointments: (
		page?: number,
		filters?: Record<string, any>,
	) => Promise<void>;
	updateAppointment: (
		id: string,
		data: Partial<Appointment>,
	) => Promise<void>;

	// 5. Doctors schedules section
	doctorSchedules: {
		data: DoctorScheduleWithAppointments[];
		startDate: Date | null;
		endDate: Date | null;
	};
	isDoctorSchedulesLoading: boolean;
	getDoctorSchedules: (startDate: Date, endDate: Date) => Promise<void>;
	updateDoctorSchedule: (
		doctorId: string,
		workSchedule: WorkSchedule[],
	) => Promise<void>;

	// 6. Transactions section
	transactions: {
		data: Transaction[];
		total: number;
	};
	isTransactionsLoading: boolean;
	getTransactions: (page?: number) => Promise<void>;
	updateTransactionStatus: (
		id: string,
		status: "unpaid" | "paid" | "failed",
	) => Promise<void>;
}

// --- Store Implementation ---
export const useAdminStore = create<AdminStore>((set, get) => ({
	// --- Initial State ---
	patients: {
		data: [],
		pagination: {
			total: 0,
			page: 1,
			pages: 0,
			hasMore: false,
			isPageLoading: false,
			currentPage: 1,
		},
	},
	patient: null,
	isPatientsLoading: false,
	isPatientLoading: false,
	isConvertingPatient: false,

	doctors: { data: [], total: 0 }, // Initial doctors state

	appointments: {
		data: [],
		pagination: {
			total: 0,
			page: 1,
			pages: 0,
			hasMore: false,
			isPageLoading: false,
			currentPage: 1,
		},
	},
	isAppointmentsLoading: false,

	doctorSchedules: { data: [], startDate: null, endDate: null },
	isDoctorSchedulesLoading: false,

	transactions: { data: [], total: 0 },
	isTransactionsLoading: false,

	// --- Actions ---

	// 1. Dashboard Helper
	loadDashboardData: async () => {
		// Fetches everything needed for the dashboard in parallel
		await Promise.all([
			get().getDoctors(),
			get().getPatients(1, 5), // Limit 5 for "Recent"
			get().getAppointments(1, {}), // Page 1 for "Recent" + Total count
			get().getTransactions(1), // Page 1 for "Recent" + Total count
		]);
	},

	// 2. Doctors (General List)
	getDoctors: async () => {
		try {
			const res = await axiosInstance.get("/admin/doctors");
			// Adapting response: check if data is directly an array or inside a .data property
			const doctorList = res.data.data || res.data || [];
			const totalCount =
				res.data.total || res.data.count || doctorList.length;

			set({
				doctors: {
					data: doctorList,
					total: totalCount,
				},
			});
		} catch (error) {
			console.error("Failed to fetch doctors", error);
			// Don't toast here to avoid spamming the dashboard on load
		}
	},

	// 3. Patients Actions
	getPatients: async (page = 1, limit = 20) => {
		const isInitialLoad = page === 1;
		if (isInitialLoad) {
			set({ isPatientsLoading: true });
		} else {
			set((state) => ({
				patients: {
					...state.patients,
					pagination: {
						...state.patients.pagination,
						isPageLoading: true,
					},
				},
			}));
		}

		try {
			const res = await axiosInstance.get(
				`/admin/getPatients?page=${page}&limit=${limit}`,
			);

			// --- FIX START ---
			// If the backend doesn't send 'total', use the length of the array we received
			const fetchedCount = res.data.patients?.length || 0;
			const backendTotal = res.data.pagination?.total;
			const realTotal =
				backendTotal !== undefined ? backendTotal : fetchedCount;
			// --- FIX END ---

			set((state) => ({
				patients: {
					data: isInitialLoad
						? res.data.patients
						: [...state.patients.data, ...res.data.patients],
					pagination: {
						currentPage: res.data.pagination?.currentPage || 1,
						hasMore: res.data.pagination?.hasMore || false,
						isPageLoading: false,

						// Use the calculated total
						total: realTotal,

						page: res.data.pagination?.page || page,
						pages: res.data.pagination?.pages || 0,
					},
				},
				isPatientsLoading: false,
			}));
		} catch (error: any) {
			set((state) => ({
				isPatientsLoading: false,
				patients: {
					...state.patients,
					pagination: {
						...state.patients.pagination,
						isPageLoading: false,
					},
				},
			}));
			toast.error(
				error.response?.data?.message || "Failed to fetch patients",
			);
		}
	},

	getPatientDetails: async (patientId) => {
		try {
			set({ isPatientLoading: true });
			const res = await axiosInstance.get(
				`/admin/getPatientDetails/${patientId}`,
			);
			set({ patient: res.data, isPatientLoading: false });
		} catch (error: any) {
			set({ isPatientLoading: false });
			toast.error(
				error.response?.data?.message || "Failed to fetch patient data",
			);
		}
	},

	convertToDoctor: async (patientId) => {
		try {
			set({ isConvertingPatient: true });
			await axiosInstance.patch(
				`/admin/convertPatientToDoctor/${patientId}`,
			);
			toast.success("User converted to doctor successfully!");
			set({ isConvertingPatient: false });
		} catch (error: any) {
			set({ isConvertingPatient: false });
			toast.error(
				error.response?.data?.message || "Failed to convert account",
			);
		}
	},

	convertToAdmin: async (patientId) => {
		try {
			set({ isConvertingPatient: true });
			await axiosInstance.patch(
				`/admin/convertPatientToAdmin/${patientId}`,
			);
			toast.success("User converted to admin successfully!");
			set({ isConvertingPatient: false });
		} catch (error: any) {
			set({ isConvertingPatient: false });
			toast.error(
				error.response?.data?.message || "Failed to convert account",
			);
		}
	},

	// 4. Appointments Actions
	getAppointments: async (page = 1, filters = {}) => {
		try {
			set((state) => ({
				isAppointmentsLoading: page === 1,
				appointments: {
					...state.appointments,
					pagination: {
						...state.appointments.pagination,
						isPageLoading: true,
					},
				},
			}));

			const queryParams = new URLSearchParams();
			queryParams.append("page", page.toString());
			Object.entries(filters).forEach(([key, value]) => {
				if (value) queryParams.append(key, value.toString());
			});

			const response = await axiosInstance.get(
				`/admin/appointments?${queryParams.toString()}`,
			);

			set((state) => ({
				appointments: {
					data:
						page === 1
							? response.data.data
							: [
									...state.appointments.data,
									...response.data.data,
								],
					pagination: response.data.pagination,
				},
				isAppointmentsLoading: false,
			}));
		} catch (error: any) {
			set({ isAppointmentsLoading: false });
			toast.error("Failed to load appointments");
		}
	},

	updateAppointment: async (id, data) => {
		try {
			const response = await axiosInstance.put(
				`/admin/appointments/${id}`,
				data,
			);
			set((state) => ({
				appointments: {
					...state.appointments,
					data: state.appointments.data.map((app) =>
						app._id === id
							? { ...app, ...response.data.data }
							: app,
					),
				},
			}));
			toast.success("Appointment updated successfully");
		} catch (error: any) {
			toast.error("Failed to update appointment");
			throw error;
		}
	},

	// 5. Doctor Schedules Actions
	getDoctorSchedules: async (startDate, endDate) => {
		try {
			set({ isDoctorSchedulesLoading: true });
			const formattedStartDate = startDate.toISOString().split("T")[0];
			const formattedEndDate = endDate.toISOString().split("T")[0];
			const response = await axiosInstance.get(
				`/admin/doctors/schedules?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
			);
			set({
				doctorSchedules: {
					data: response.data.data,
					startDate,
					endDate,
				},
				isDoctorSchedulesLoading: false,
			});
		} catch (error: any) {
			set({ isDoctorSchedulesLoading: false });
			toast.error("Failed to load doctor schedules");
		}
	},

	updateDoctorSchedule: async (doctorId, workSchedule) => {
		try {
			const response = await axiosInstance.put(
				`/admin/doctors/${doctorId}/schedule`,
				{ workSchedule },
			);
			set((state) => ({
				doctorSchedules: {
					...state.doctorSchedules,
					data: state.doctorSchedules.data.map((item) =>
						item.doctor._id === doctorId
							? {
									...item,
									doctor: {
										...item.doctor,
										workSchedule:
											response.data.data.doctorInfo
												.workSchedule,
									},
								}
							: item,
					),
				},
			}));
			toast.success("Doctor schedule updated successfully");
		} catch (error: any) {
			toast.error("Failed to update doctor schedule");
			throw error;
		}
	},

	// 6. Transactions Actions
	getTransactions: async (page = 1) => {
		set({ isTransactionsLoading: true });
		try {
			const res = await axiosInstance.get(
				`/transactions/getAllTransactions?page=${page}`,
			);

			// 1. Extract the array using the correct key from your response
			const transactionList = res.data.transactionsData || [];

			// 2. Extract total from pagination or fallback to the list length
			// (Note: If your backend adds 'total' to the pagination object later, use it here)
			const totalCount =
				res.data.pagination?.total || transactionList.length;

			set({
				transactions: {
					data: transactionList,
					total: totalCount,
				},
				isTransactionsLoading: false,
			});
		} catch (error) {
			set({ isTransactionsLoading: false });
			console.error("Error fetching transactions:", error);
			// Don't toast on empty data, only on actual 400/500 errors
			if (axios.isAxiosError(error) && error.response) {
				toast.error("Failed to load transactions");
			}
		}
	},

	updateTransactionStatus: async (
		id: string,
		status: "unpaid" | "paid" | "failed",
	) => {
		try {
			await axiosInstance.patch(`/admin/transactions/${id}`, { status });
			set((state) => ({
				transactions: {
					...state.transactions,
					data: state.transactions.data.map((t) =>
						t._id === id ? { ...t, status } : t,
					),
				},
			}));
			toast.success(`Transaction marked as ${status}`);
		} catch (error) {
			toast.error("Update failed");
		}
	},
}));
