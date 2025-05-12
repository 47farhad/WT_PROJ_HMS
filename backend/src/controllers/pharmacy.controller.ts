import cloudinary from "../lib/cloudinary.js";
import OfferedMedicine from "../models/offeredMedicine.model.js";

export const createOfferedMedicine = async (req: any, res: any) => {
    try {
        const defaultMedicine = new OfferedMedicine();

        const savedMedicine = await defaultMedicine.save();

        res.status(201).json(savedMedicine);

    } catch (error) {
        console.log("Error in createOfferedMedicine controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getOfferedMedicine = async (req: any, res: any) => {
    try {
        const reqUserType = req.user.userType;

        let medicines;
        if (reqUserType === 'Admin') {
            medicines = await OfferedMedicine.find({});
        } else {
            medicines = await OfferedMedicine.find(
                { status: 'available' },
                { stock: 0, status: 0 }
            );
        }

        res.status(200).json(medicines);

    } catch (error) {
        console.log("Error in getOfferedMedicine controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteOfferedMedicine = async (req: any, res: any) => {
    try {
        const { medicineId } = req.params;

        if (!medicineId) {
            return res.status(400).json({ message: "Medicine ID is required" });
        }

        const deletedMedicine = await OfferedMedicine.findOneAndDelete({ _id: medicineId });

        if (!deletedMedicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        res.status(200).json({
            message: "Medicine deleted successfully",
        });

    } catch (error) {
        console.log("Error in deleteOfferedMedicine controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateOfferedMedicine = async (req: any, res: any) => {
    try {
        const { medicineId } = req.params;
        const { name, description, price, dosage, status, requiresPrescription, stock, picture } = req.body;

        if (!medicineId) {
            return res.status(400).json({ message: "Medicine ID is required" });
        }

        const existingMedicine = await OfferedMedicine.findById(medicineId);
        if (!existingMedicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        const updateData: any = {};

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({ message: "Name must be a non-empty string" });
            }
            updateData.name = name.trim();
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || description.trim() === '') {
                return res.status(400).json({ message: "Description must be a non-empty string" });
            }
            updateData.description = description.trim();
        }

        if (price !== undefined) {
            if (typeof price !== 'number' || isNaN(price) || price < 0) {
                return res.status(400).json({ message: "Price must be a positive number" });
            }
            updateData.price = price;
        }

        if (dosage !== undefined) {
            if (typeof dosage !== 'number' || isNaN(dosage) || dosage < 0) {
                return res.status(400).json({ message: "Dosage must be a positive number" });
            }
            updateData.dosage = dosage;
        }

        if (status !== undefined) {
            if (!['available', 'unavailable'].includes(status)) {
                return res.status(400).json({ message: "Status must be either 'available' or 'unavailable'" });
            }
            updateData.status = status;
        }

        if (requiresPrescription !== undefined) {
            if (typeof requiresPrescription !== 'boolean') {
                return res.status(400).json({ message: "requiresPrescription must be a boolean value" });
            }
            updateData.requiresPrescription = requiresPrescription;
        }

        if (stock !== undefined) {
            if (typeof stock !== 'number' || isNaN(stock) || stock < 0) {
                return res.status(400).json({ message: "Stock must be a positive number" });
            }
            updateData.stock = stock;
        }

        if (picture) {
            const uploadResponse = await cloudinary.uploader.upload(picture);
            updateData.picture = uploadResponse.secure_url;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        const updatedMedicine = await OfferedMedicine.findByIdAndUpdate(
            medicineId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedMedicine);

    } catch (error) {
        console.log("Error in updateOfferedMedicine controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};