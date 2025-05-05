import { Link } from "react-router-dom";

function PatientDashboard() {
  return (
    <div className="h-full w-full p-6 bg-gray-100">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold text-[#243954] mb-6">Welcome to Your Dashboard</h1>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Appointments */}
          <Link
            to="http://localhost:5173/Appointments"
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                <i className="fas fa-calendar-alt text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
                <p className="text-sm text-gray-500">View and manage your appointments</p>
              </div>
            </div>
          </Link>

          {/* Payments */}
          <Link
            to="http://localhost:5173/Payments"
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-600 p-4 rounded-full">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Payments</h3>
                <p className="text-sm text-gray-500">Track your payment history</p>
              </div>
            </div>
          </Link>

          {/* Pharmacy */}
          <Link
            to="http://localhost:5173/Pharmacy"
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 text-purple-600 p-4 rounded-full">
                <i className="fas fa-pills text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Pharmacy</h3>
                <p className="text-sm text-gray-500">Order and manage medicines</p>
              </div>
            </div>
          </Link>

          {/*Lab tests*/}
          <Link
            to="http://localhost:5173/LabTests"
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full">
                <i className="fas fa-user text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Lab Tests</h3>
                <p className="text-sm text-gray-500">Book and view Lab Tests</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-[#243954] mb-4">Recent Activity</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-gray-500">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;