"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFields = void 0;
const graphql_1 = require("graphql");
const user_resolve_1 = require("./user.resolve");
const types_1 = require("../../../types/types");
exports.userFields = {
    hello: {
        type: new graphql_1.GraphQLList(types_1.UserType),
        resolve: user_resolve_1.userResolver.getAllUsers
    },
    sayHi: {
        type: graphql_1.GraphQLString,
        args: {
            name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            age: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) }
        },
        resolve: user_resolve_1.userResolver.sayHi
    },
    signup: {
        type: types_1.signupRes,
        args: {
            userName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            confirmPassword: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
        },
        resolve: user_resolve_1.userResolver.signup
    }
};
