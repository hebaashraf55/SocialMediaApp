"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryType = void 0;
const graphql_1 = require("graphql");
const user_fields_1 = require("./userModule/user.fields");
exports.queryType = new graphql_1.GraphQLObjectType({
    name: "RouteQueryType",
    fields: {
        hello: user_fields_1.userFields.hello,
        sayHi: user_fields_1.userFields.sayHi,
        signup: user_fields_1.userFields.signup,
    },
});
