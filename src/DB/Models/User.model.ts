import { model, Types, Schema, models, HydratedDocument } from 'mongoose';


export enum GenderEnum {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}
export enum RoulEnum {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface IUser { 
    _id : Types.ObjectId;
    firstName : string;
    lastName : string;
    userName ?: string;

    email : string;
    confirmEmailOTP?: string;
    confirmedAT?: Date;

    password : string;
    resetPassword : string;
    changeCridentialsTime: string;

    phone ?: string;
    address ?: string;
    gender: GenderEnum;
    role: RoulEnum;

    createdAt : Date;
    updatedAt ?: Date;

}
export const userSchema = new Schema<IUser>({
    firstName : { type : String, required : true, minLength : 3, maxLength : 25 },
    lastName : { type : String, required : true, minLength : 3, maxLength : 25 },

    email : { type : String, required : true, unique : true },
    confirmEmailOTP :  String ,
    confirmedAT : Date ,

    password : { type : String, required : true },
    resetPassword : String ,
    changeCridentialsTime : Date ,

    phone : String ,
    address :  String ,
    gender : { type : String, enum : Object.values(GenderEnum), default : GenderEnum.MALE },
    role : { type : String, enum : Object.values(RoulEnum), default : RoulEnum.USER },

}, {
    timestamps : true,
    toJSON : {
        virtuals : true
    },
    toObject : {
        virtuals : true
    }
},);


userSchema
.virtual("userName")
.set(function (value:string){
   const[ firstName, lastName ] =  value.split(" ") || []
   this.set({firstName, lastName})
})
.get(function(){
    return `${this.firstName} ${this.lastName}`
})

export const UserModel = models.User || model<IUser>('User', userSchema)

export type HUserDocument = HydratedDocument<IUser>