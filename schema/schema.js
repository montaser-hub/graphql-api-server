import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLError,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
} from "graphql";
import { CompanyType, UserType } from "./types.js";
import { Company, User } from "../database/models.js";

/* any query is agraphql object typeb {fileds"callback" contains(type= return type of the field, resolve= callback function that returns the value), name(any name you want)} */
export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      user: {
        type: UserType,
        args: { id: { type: GraphQLID } }, // new GraphQLNonNull(GraphQLID) to set field to be required
        async resolve(_parentValue, args) {
          let user = await User.findById(args.id); // {firstName, age, companyId}
          if (!user) {
            throw new GraphQLError(`Can't find the user with id (${args.id})`);
          }
          return user;
        },
      },
      users: {
        type: new GraphQLList(UserType),
        async resolve(_parentNode, _args, context) {
          console.log("########################################", context);
          let users = await User.find();
          return users;
        },
      },
      company: {
        type: CompanyType,
        args: { id: { type: GraphQLID } },
        async resolve(_parentValue, args) {
          let company = await Company.findById(args.id); // {firstName, age, companyId}
          if (!company) {
            throw new GraphQLError(
              `Can't find the company with id (${args.id})`
            );
          }
          return company;
        },
      },
      companies: {
        type: new GraphQLList(CompanyType), // type of the field that will be returned from the resolver as a list
        async resolve() {
          let companies = await Company.find();
          return companies;
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
          companyId: { type: new GraphQLNonNull(GraphQLID) },
        },
        async resolve(parent, args) {
          const { firstName, age, companyId } = args;
          const validateCompany = await Company.findById(companyId);
          if (!validateCompany) {
            throw new GraphQLError(
              `Can't find the company with id (${companyId})`
            );
          }
          let user = await User.create({ firstName, age, companyId });
          return user;
        },
      },
      createCompany: {
        type: CompanyType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          slogan: { type: new GraphQLNonNull(GraphQLString) },
        },
        async resolve(parent, args) {
          const { name, slogan } = args;
          return await Company.create({ name, slogan });
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
        async resolve(parent, args) {
          const { id, firstName, age, companyId } = args;
          return await User.findByIdAndUpdate(id, {
            firstName,
            age,
            companyId,
          });
        },
      },
      updateCompany: {
        type: CompanyType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          name: { type: GraphQLString },
          slogan: { type: GraphQLString },
        },
        async resolve(parent, args) {
          const { id, name, slogan } = args;
          return await Company.findByIdAndUpdate(id, { name, slogan });
        },
      },
      deleteUser: {
        type: GraphQLString,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        async resolve(parent, args) {
          const { id } = args;
          await User.findByIdAndDelete(id);
          return "User deleted";
        },
      },
      deleteCompany: {
        type: GraphQLString,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        async resolve(parent, args) {
          const { id } = args;
          await Company.findByIdAndDelete(id);
          return "Company deleted";
        },
      },
    },
  }),
});
