import { GraphQLList, GraphQLString, GraphQLNonNull, GraphQLInt} from "graphql";
import { userResolver } from "./user.resolve";
import { signupRes, UserType } from "../../../types/types";


export const userFields = {
            hello : {
                type : new GraphQLList(UserType),
                resolve : userResolver.getAllUsers
            }, 
            sayHi : {
                type: GraphQLString,
                args: {
                    name : {type : new GraphQLNonNull(GraphQLString)},
                    age : { type : new GraphQLNonNull(GraphQLInt)}
                },
                resolve : userResolver.sayHi
            },

            signup : {
                type : signupRes,
                args: {
                    userName: { type :new GraphQLNonNull(GraphQLString)},
                    email : { type :new GraphQLNonNull(GraphQLString)},
                    password : { type :new GraphQLNonNull(GraphQLString)},
                    confirmPassword : { type :new GraphQLNonNull(GraphQLString)}
                },
                resolve: userResolver.signup

            }
        }