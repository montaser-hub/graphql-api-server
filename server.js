import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/connection.js";
import { graphqlHTTP } from "express-graphql";//connect to graphql server
import schema from "./schema/schema.js";

//^ Load environment variables
dotenv.config();
//^ Connect to MongoDB
connectDB();

//* make express instance
const app = express();

//^ Enable CORS
app.use(cors());

//^ Parse JSON bodies
app.use(express.json());

//^ routes
app.get("/welcoming", (req, res) => {
  res.send("Welcome To Express Server!");
});

let x = 0;

app.use(
  "/graphql",
  graphqlHTTP((req, res) => {
    return {
      schema,// graphQL schema query, mutation, subscription
      graphiql: true,//show graphiql interface for development
      context: {
        test: x++,
      },
    };
  })
);

app.listen(3000, () => {
  console.log("Express endpoint: http://localhost:3000");
});
