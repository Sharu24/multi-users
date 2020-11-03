const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(config.cloudMongoDB, config.options);
    console.log("Connected to MongoDB Successfully");
  } catch (err) {
    console.error(err);
  }
};

connectDB();
