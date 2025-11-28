import {  GraphQLEnumType, GraphQLID,  GraphQLInt,  GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

const GenderEnumType = new GraphQLEnumType ({
    name : "GenderEnum",
    values : { 
    MALE : { value :'MALE'},
    FEMALE : { value :'FEMALE'},
    }
})
const RoleEnumType  = new GraphQLEnumType ({ 
    name : "RoleEnum",
    values: { 
    USER : { value: 'USER'},
    ADMIN :{ value :'ADMIN'},
}
})

export const UserType = new GraphQLObjectType({
    name : 'UserType',
    fields : () => ({
        _id : { type : GraphQLID},
        firstName : { type : GraphQLString},
        lastName : { type : GraphQLString},
        userName : { type : GraphQLString},
        slug : { type : GraphQLString},
        email : { type : GraphQLString},
        confirmEmailOTP : { type : GraphQLString},
        confirmedAt : { type : GraphQLString, description : " ISO Date string"},
        password: { type : GraphQLString, description: " sensetive : dont expose in production"},
        resetPasswordOTP : { type : GraphQLString},
        changeCredentialsTime : { type : GraphQLString, description : "ISO date string"},
        phone : { type : GraphQLString},
        address : { type : GraphQLString},
        gender : { type : GenderEnumType},
        role : { type : RoleEnumType},
        freezedBy : { type : GraphQLID},
        freezedAt : { type : GraphQLString, description : "ISO Date string"},
        restoredBy : { type : GraphQLID},
        restoredAt : { type : GraphQLString, description : "ISO Date string"},
        friends : {type : new GraphQLList(GraphQLID)},
        createdAt : { type : GraphQLString, description : "ISO Date string"},
        updatedAt : { type : GraphQLString, description : "ISO Date string"},
    }),
})

export const signupRes = new GraphQLObjectType({
    name : "SignUpResponse",
    fields : {
        message : {type : GraphQLString},
        res : { type : GraphQLInt},
        data : {type : UserType}
    }
})