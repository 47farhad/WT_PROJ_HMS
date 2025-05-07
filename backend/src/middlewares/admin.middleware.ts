export const isAdmin = (req: any, res: any, next: any) => {
    try {
        if (req.user.userType !== 'Admin') {
            return res.status(401).json({ message: "Unauthorized - not an admin" })
        }

        next();
    }
    catch (error: any) {
        console.log("Error in isAdmin middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}