import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { projectionFor } from "./projection.js";

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      // Batched: every user's company in one query is fetched with a single find().
      resolve(user, _args, context, info) {
        if (!user.companyId) return null;
        return context.loaders.companyLoader.load({ id: user.companyId, fields: projectionFor(info) });
      },
    },
  }),
});

export const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    slogan: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(company, _args, context) {
        return context.loaders.usersByCompanyLoader.load(company._id);
      },
    },
  }),
});
