// Runs GraphQL operations against a real MongoDB. Use a throwaway database:
//   MONGODB_URI=mongodb://127.0.0.1:27017/graphql_test npm test
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";
import { graphql } from "graphql";
import mongoose from "mongoose";
import { Company, User } from "../database/models.js";
import { createLoaders } from "../loaders/loaders.js";
import schema from "../schema/schema.js";

const uri = process.env.MONGODB_URI;

// Counts the queries Mongoose sends, to prove batching.
let queries = [];
const run = async (source, variableValues) => {
  queries = [];
  const result = await graphql({ schema, source, variableValues, contextValue: { loaders: createLoaders() } });
  return result;
};

describe("GraphQL schema", { skip: !uri && "set MONGODB_URI to a test database" }, () => {
  let acme, globex;

  before(async () => {
    await mongoose.connect(uri);
    mongoose.set("debug", (collection, method, filter, ...rest) => queries.push({ collection, method, filter, rest }));
  });
  after(() => mongoose.disconnect());

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Company.deleteMany({})]);
    [acme, globex] = await Company.insertMany([
      { name: "Acme", slogan: "We make everything" },
      { name: "Globex", slogan: "Worldwide" },
    ]);
    await User.insertMany([
      { firstName: "Ann", age: 30, companyId: String(acme._id) },
      { firstName: "Ben", age: 40, companyId: String(acme._id) },
      { firstName: "Cid", age: 50, companyId: String(globex._id) },
      { firstName: "Dee", age: 20 },
    ]);
  });

  test("users with their companies take two queries, not one per user", async () => {
    const { data, errors } = await run("{ users { firstName company { name } } }");
    assert.equal(errors, undefined);
    assert.equal(data.users.length, 4);
    assert.equal(data.users.find((u) => u.firstName === "Ann").company.name, "Acme");
    assert.equal(data.users.find((u) => u.firstName === "Dee").company, null);
    assert.deepEqual(queries.map((q) => `${q.collection}.${q.method}`), ["users.find", "companies.find"]);
  });

  test("companies with their users take two queries", async () => {
    const { data } = await run("{ companies { name users { firstName } } }");
    assert.deepEqual(data.companies.find((c) => c.name === "Acme").users.map((u) => u.firstName).sort(), ["Ann", "Ben"]);
    assert.equal(queries.length, 2);
  });

  test("reads only the selected fields", async () => {
    const { data } = await run("{ users { firstName } }");
    assert.equal(data.users.length, 4);
    const [find] = queries;
    assert.deepEqual(JSON.parse(JSON.stringify(find.rest)).flat().find((o) => o?.projection)?.projection, { firstName: 1 });
  });

  test("updates return the updated document and keep fields that weren't passed", async () => {
    const { data } = await run(`mutation($id: ID!) { updateCompany(id: $id, slogan: "New slogan") { name slogan } }`, { id: String(acme._id) });
    assert.deepEqual({ ...data.updateCompany }, { name: "Acme", slogan: "New slogan" });
  });

  test("missing ids are errors, not silent successes", async () => {
    const missing = String(new mongoose.Types.ObjectId());
    const del = await run(`mutation($id: ID!) { deleteUser(id: $id) }`, { id: missing });
    assert.match(del.errors[0].message, /Can't find the user/);
    const create = await run(`mutation($c: ID) { createUser(firstName: "Eve", age: 22, companyId: $c) { id } }`, { c: missing });
    assert.match(create.errors[0].message, /Can't find the company/);
  });

  test("deleting a company detaches its users", async () => {
    await run(`mutation($id: ID!) { deleteCompany(id: $id) }`, { id: String(acme._id) });
    const { data } = await run("{ users { firstName company { name } } }");
    assert.equal(data.users.find((u) => u.firstName === "Ann").company, null);
  });

  test("a new request sees changes made by an earlier one (no stale loader cache)", async () => {
    await run("{ users { company { name } } }");
    await run(`mutation($id: ID!) { updateCompany(id: $id, name: "Acme Corp") { name } }`, { id: String(acme._id) });
    const { data } = await run("{ users { firstName company { name } } }");
    assert.equal(data.users.find((u) => u.firstName === "Ann").company.name, "Acme Corp");
  });
});
