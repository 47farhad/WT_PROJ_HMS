export const verifyDoctor = async (req: any, res: any, next: any) => {
    try {
        if(req.user.userType !== "Doctor"){
            return res.status(403).json({ message: "Forbidden - Not a Doctor" });
        }

        next();
    } catch (error: any) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};