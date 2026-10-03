import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { graphqlHTTP } from "express-graphql";
import connectDB from "./database/connection.js";
import { createLoaders } from "./loaders/loaders.js";
import schema from "./schema/schema.js";

dotenv.config();
await connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/welcoming", (req, res) => {
  res.send("Welcome To Express Server!");
});

app.use(
  "/graphql",
  graphqlHTTP(() => ({
    schema,
    graphiql: process.env.NODE_ENV !== "production", // in-browser IDE for development
    context: { loaders: createLoaders() }, // fresh DataLoader caches per request
  }))
);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
});
