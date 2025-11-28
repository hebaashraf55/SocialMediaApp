import { GraphQLObjectType } from "graphql";
import { userFields } from "./userModule/user.fields";




export const queryType = new GraphQLObjectType({
        name : "RouteQueryType",
        fields : {
            hello : userFields.hello,
            sayHi : userFields.sayHi,
            signup : userFields.signup,
        },
    })