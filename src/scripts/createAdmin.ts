import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User";

const createAdmin = async () => {
  await mongoose.connect(
    process.env.MONGO_URI as string
  );

  const hashedPassword =
    await bcrypt.hash("Test@123#", 10);

  const existingAdmin=await User.findOne({
    email: "admin@gmail.com"
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit();
  }

  await User.create({
    name: "Super Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "admin",
    status: "approved",
  });

  console.log(
    "Admin Created Successfully"
  );

  process.exit();
};

createAdmin();