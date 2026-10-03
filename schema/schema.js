import {
  GraphQLError,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { Company, User } from "../database/models.js";
import { projectionFor } from "./projection.js";
import { CompanyType, UserType } from "./types.js";

const notFound = (type, id) => new GraphQLError(`Can't find the ${type} with id (${id})`);

// Only the arguments that were actually passed, so an update never blanks a field.
const definedOnly = (fields) =>
  Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));

async function assertCompanyExists(companyId) {
  if (!(await Company.exists({ _id: companyId }))) throw notFound("company", companyId);
}

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      user: {
        type: UserType,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        async resolve(_parent, { id }, _context, info) {
          const user = await User.findById(id).select(projectionFor(info));
          if (!user) throw notFound("user", id);
          return user;
        },
      },
      users: {
        type: new GraphQLList(UserType),
        // Reads only the fields the query selects.
        resolve(_parent, _args, _context, info) {
          return User.find().select(projectionFor(info));
        },
      },
      company: {
        type: CompanyType,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        async resolve(_parent, { id }) {
          const company = await Company.findById(id);
          if (!company) throw notFound("company", id);
          return company;
        },
      },
      companies: {
        type: new GraphQLList(CompanyType),
        resolve() {
          return Company.find();
        },
      },
    },
  }),

  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      createUser: {
        type: UserType,
        args: {
          firstName: { type: new GraphQLNonNull(GraphQLString) },
          age: { type: new GraphQLNonNull(GraphQLInt) },
          companyId: { type: GraphQLID },
        },
        async resolve(_parent, { firstName, age, companyId }) {
          if (companyId) await assertCompanyExists(companyId);
          return User.create({ firstName, age, companyId });
        },
      },
      updateUser: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          firstName: { type: GraphQLString },
          age: { type: GraphQLInt },
          companyId: { type: GraphQLID },
        },
        async resolve(_parent, { id, ...fields }) {
          if (fields.companyId) await assertCompanyExists(fields.companyId);
          const user = await User.findByIdAndUpdate(id, definedOnly(fields), { new: true });
          if (!user) throw notFound("user", id);
          return user;
        },
      },
      deleteUser: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        async resolve(_parent, { id }) {
          if (!(await User.findByIdAndDelete(id))) throw notFound("user", id);
          return "User deleted";
        },
      },
      createCompany: {
        type: CompanyType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          slogan: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve(_parent, { name, slogan }) {
          return Company.create({ name, slogan });
        },
      },
      updateCompany: {
        type: CompanyType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          name: { type: GraphQLString },
          slogan: { type: GraphQLString },
        },
        async resolve(_parent, { id, ...fields }) {
          const company = await Company.findByIdAndUpdate(id, definedOnly(fields), { new: true });
          if (!company) throw notFound("company", id);
          return company;
        },
      },
      deleteCompany: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        async resolve(_parent, { id }) {
          if (!(await Company.findByIdAndDelete(id))) throw notFound("company", id);
          // Detach its users rather than leaving them pointing at a deleted company.
          await User.updateMany({ companyId: id }, { $unset: { companyId: 1 } });
          return "Company deleted";
        },
      },
    },
  }),
});
