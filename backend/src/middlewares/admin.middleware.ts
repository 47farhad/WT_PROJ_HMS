export const isAdminOrDoc = (req: any, res: any, next: any) => {
    try {
        if (req.user.userType !== 'Admin' && req.user.userType !== 'Doctor') {
            return res.status(401).json({ message: "Unauthorized " })
        }

        next();
    }
    catch (error: any) {
        console.log("Error in isAdmin middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}