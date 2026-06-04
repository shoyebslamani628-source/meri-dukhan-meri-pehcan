const mongoose = require("mongoose");

const getMongoHost = (mongoUri) => {
  try {
    return new URL(mongoUri).host;
  } catch (error) {
    return "unknown host";
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing from environment variables.");
  }

  try {
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    if (error.code === "ENOTFOUND" && mongoUri.startsWith("mongodb+srv://")) {
      const host = getMongoHost(mongoUri);
      throw new Error(
        `MongoDB Atlas SRV DNS lookup failed for ${host}. Check that MONGO_URI uses the exact cluster hostname from Atlas, or switch to a local URI like mongodb://127.0.0.1:27017/mechanic_inventory.`
      );
    }

    throw error;
  }
};

module.exports = connectDB;
