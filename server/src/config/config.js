import mongoose from "mongoose";

const connectDB = async (MONGO_URI) => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Database Connected"); 
    } catch (error) {
        console.error("Database Connection Failed! ",error.message);
        process.exit(1);        
    }
}

export default connectDB;