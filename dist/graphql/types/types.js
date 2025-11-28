"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupRes = exports.UserType = void 0;
const graphql_1 = require("graphql");
const GenderEnumType = new graphql_1.GraphQLEnumType({
    name: "GenderEnum",
    values: {
        MALE: { value: 'MALE' },
        FEMALE: { value: 'FEMALE' },
    }
});
const RoleEnumType = new graphql_1.GraphQLEnumType({
    name: "RoleEnum",
    values: {
        USER: { value: 'USER' },
        ADMIN: { value: 'ADMIN' },
    }
});
exports.UserType = new graphql_1.GraphQLObjectType({
    name: 'UserType',
    fields: () => ({
        _id: { type: graphql_1.GraphQLID },
        firstName: { type: graphql_1.GraphQLString },
        lastName: { type: graphql_1.GraphQLString },
        userName: { type: graphql_1.GraphQLString },
        slug: { type: graphql_1.GraphQLString },
        email: { type: graphql_1.GraphQLString },
        confirmEmailOTP: { type: graphql_1.GraphQLString },
        confirmedAt: { type: graphql_1.GraphQLString, description: " ISO Date string" },
        password: { type: graphql_1.GraphQLString, description: " sensetive : dont expose in production" },
        resetPasswordOTP: { type: graphql_1.GraphQLString },
        changeCredentialsTime: { type: graphql_1.GraphQLString, description: "ISO date string" },
        phone: { type: graphql_1.GraphQLString },
        address: { type: graphql_1.GraphQLString },
        gender: { type: GenderEnumType },
        role: { type: RoleEnumType },
        freezedBy: { type: graphql_1.GraphQLID },
        freezedAt: { type: graphql_1.GraphQLString, description: "ISO Date string" },
        restoredBy: { type: graphql_1.GraphQLID },
        restoredAt: { type: graphql_1.GraphQLString, description: "ISO Date string" },
        friends: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        createdAt: { type: graphql_1.GraphQLString, description: "ISO Date string" },
        updatedAt: { type: graphql_1.GraphQLString, description: "ISO Date string" },
    }),
});
exports.signupRes = new graphql_1.GraphQLObjectType({
    name: "SignUpResponse",
    fields: {
        message: { type: graphql_1.GraphQLString },
        res: { type: graphql_1.GraphQLInt },
        data: { type: exports.UserType }
    }
});
