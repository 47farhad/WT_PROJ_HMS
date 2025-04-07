import express from "express";

const app = express();

app.listen(5001, () => {
    console.log("Backend is up on port 5001")
})