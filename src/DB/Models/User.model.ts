import { model, Types, Schema, models, HydratedDocument } from 'mongoose';
import { generateHashing } from '../../Utils/security/hash';
import { emailEvent } from '../../Utils/events/email.event';



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

    slug: string;

    email : string;
    confirmEmailOTP?: string;
    confirmedAT?: Date;

    password : string;
    resetPassword : string;
    changeCridentialsTime: Date;

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

    slug: { type: String, required: true, minLength : 3 , maxLength : 51},

    email : { type : String, required : true, unique : true },
    confirmEmailOTP :  String ,
    confirmedAT : Date ,

    password : { type : String, required : true },
    resetPassword : String ,
    changeCridentialsTime : Date, 

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


// excute before Hook
userSchema
.virtual("userName")
.set(function (value:string){
   const[ firstName, lastName ] =  value.split(" ") || []
   this.set({firstName, lastName, slug: value.replace(/\s+/g, '-')})
})
.get(function(){
    return `${this.firstName} ${this.lastName}`
})


userSchema.pre('save', async function(
    this: HUserDocument & {wasNew: boolean, confirmEmailPlainOTP ?: string},
    next) {

    this.wasNew = this.isNew;
    if(this.isModified('password')) {
        this.password = await generateHashing(this.password)
    }
    if(this.isModified('confirmEmailOTP')) {
        this.confirmEmailPlainOTP = this.confirmEmailOTP as string 
        this.confirmEmailOTP = await generateHashing(this.confirmEmailOTP as string)
    }
    next()
})

userSchema.post('save', async function(doc,next){
    const that = this as HUserDocument & {wasNew: boolean, confirmEmailPlainOTP ?: string}
    if( that.wasNew && that.confirmEmailPlainOTP ) {
            emailEvent.emit('confirmeEmail', 
        {   to: this.email, 
            userName : this.userName, 
            otp : that.confirmEmailPlainOTP
        })
    }
    next()
})



export const UserModel = models.User || model<IUser>('User', userSchema)

export type HUserDocument = HydratedDocument<IUser>