// Fills the database in MONGODB_URI with demo companies and users: `npm run seed`.
// It wipes both collections first.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Company, User } from "../database/models.js";

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);
await Promise.all([User.deleteMany({}), Company.deleteMany({})]);

const companies = await Company.insertMany([
  { name: "Nile Logistics", slogan: "Deliveries that arrive on time" },
  { name: "Pyramid Analytics", slogan: "Data you can build on" },
  { name: "Delta Health", slogan: "Care, closer to home" },
]);
const [nile, pyramid, delta] = companies.map((c) => String(c._id));

await User.insertMany([
  { firstName: "Mona", age: 29, companyId: nile },
  { firstName: "Omar", age: 34, companyId: nile },
  { firstName: "Salma", age: 26, companyId: nile },
  { firstName: "Youssef", age: 41, companyId: pyramid },
  { firstName: "Nour", age: 31, companyId: pyramid },
  { firstName: "Karim", age: 38, companyId: delta },
  { firstName: "Laila", age: 27, companyId: delta },
  { firstName: "Hassan", age: 45 },
]);

console.log("Seeded 3 companies and 8 users.");
await mongoose.disconnect();
