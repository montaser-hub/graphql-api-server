import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { User, Company } from "../database/models.js";

export const UserType = new GraphQLObjectType({
  name: "User",
  // {firstName, age, companyId}
  fields: () => ( {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parentNode) {
        return await Company.findById(parentNode.companyId);
      },
    },
  }),
});

export const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ( {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    slogan: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentNode) {
        return await User.find({ companyId: parentNode._id });
      },
    },
  }),
});
