import mongoose from "mongoose";

const uri = () => process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
