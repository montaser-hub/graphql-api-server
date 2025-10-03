import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  age: Number,
  companyId: String,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const companySchema = new mongoose.Schema({
  name: String,
  slogan: String,
});

const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);

export { User, Company };
