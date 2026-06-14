const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoUrl =
            process.env.MONGO_URL ||
            process.env.MONGODB_URI ||
            process.env.MONGO_URI;

        if (!mongoUrl) {
            throw new Error(
                "MongoDB connection string is missing. Set MONGO_URL in Render Environment Variables."
            );
        }

        await mongoose.connect(mongoUrl);

        console.log("MongoDB Connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDB;
