import User from "../models/user.model.js";

export const getPatients = async (req: any, res: any) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const aggregationResult = await User.aggregate([
            {
                $match: {
                    userType: 'Patient'
                }
            },
            {
                $facet: {
                    patients: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                "profilePic": 1,
                                "firstName": 1,
                                "lastName": 1,
                                "_id": 1,
                                "medicalInfo.dateOfBirth": 1
                            }
                        },
                        { $sort: { createdAt: -1 } }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const patients = aggregationResult[0].patients;
        const totalCount = aggregationResult[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            patients: patients,
            pagination: {
                currentPage: page,
                hasMore: page < totalPages,
            }
        });
    }
    catch (error: any) {
        console.log("Error in getPatients controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};