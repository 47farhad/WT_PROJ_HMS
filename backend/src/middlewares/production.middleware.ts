export const productionCheck = (req: any, res: any, next: any) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({ message: "This action is not allowed in production mode. This is just a demo" })
        }

        next();
    }
    catch (error: any) {
        console.log("Error in productionCheck middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}