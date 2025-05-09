export const verifyPatient = async (req: any, res: any, next: any) => {
    try {
        if(req.user.userType !== "Patient"){
            return res.status(403).json({ message: "Forbidden - Not a patient" });
        }

        next();
    } catch (error: any) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};