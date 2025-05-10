import OfferedTest from "../models/offeredTest.model.js";

export const createOfferedTest = async (req: any, res: any) => {
    try {
        const defaultTest = new OfferedTest();

        const savedTest = await defaultTest.save();

        res.status(201).json(savedTest);

    } catch (error) {
        console.log("Error in createOfferedTest controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getOfferedLabTests = async (req: any, res: any) => {
    try {
        const reqUserType = req.user.userType;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        let query = {};
        if (reqUserType !== 'Admin') {
            query = { status: 'available' };
        }

        const labTests = await OfferedTest.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

     
        const total = await OfferedTest.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            labTests,
            pagination: {
                currentPage: page,
                totalPages,
                hasMore: page < totalPages,
                totalItems: total
            }
        });

    } catch (error) {
        console.log("Error in getOfferedLabTests controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const deleteLabTest = async (req: any, res: any) => {
    try {
        const { testId } = req.params;

        if (!testId) {
            return res.status(400).json({ message: "Test ID is required" });
        }

        const existingTest = await OfferedTest.findById(testId);
        if (!existingTest) {
            return res.status(404).json({ message: "Lab test not found" });
        }

        await OfferedTest.findByIdAndDelete(testId);

        res.status(200).json({
            message: "Lab test deleted successfully",
        });

    } catch (error) {
        console.log("Error in deleteLabTest controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateOfferedTest = async (req: any, res: any) => {
    try {
        const { testId } = req.params;
        const { name, description, price, requirements, status } = req.body;

        if (!testId) {
            return res.status(400).json({ message: "Test ID is required" });
        }

        const existingTest = await OfferedTest.findById(testId);
        if (!existingTest) {
            return res.status(404).json({ message: "Lab test not found" });
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

        if (requirements !== undefined) {
            if (!Array.isArray(requirements)) {
                return res.status(400).json({ message: "Requirements must be an array" });
            }
            if (requirements.some(req => typeof req !== 'string' || req.trim() === '')) {
                return res.status(400).json({ message: "All requirements must be non-empty strings" });
            }
            updateData.requirements = requirements.map(req => req.trim());
        }

        if (status !== undefined) {
            if (!['available', 'unavailable'].includes(status)) {
                return res.status(400).json({ message: "Status must be either 'available' or 'unavailable'" });
            }
            updateData.status = status;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        const updatedTest = await OfferedTest.findByIdAndUpdate(
            testId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedTest);

    } catch (error) {
        console.log("Error in updateOfferedTest controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};