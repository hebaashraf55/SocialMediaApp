"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const query_1 = require("./query/modules/query");
const mainSchema = new graphql_1.GraphQLSchema({
    query: query_1.queryType
});
exports.default = mainSchema;
