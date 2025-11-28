import { UserModel } from "../../../../DB/Models/User.model";
import { UserRepository } from "../../../../DB/reposetories/user.repository";
import { generateOTP } from "../../../../Utils/generateOTP";
import { ConfilectException } from "../../../../Utils/response/error.response";
import { generateHashing } from "../../../../Utils/security/hash";


class UserResolver {

    private readonly _userModel = new UserRepository(UserModel)

    getAllUsers = async () => {
        return await this._userModel.find({})
    }


    sayHi(parent: any ,args : any, context: any, info:any){
        return `hello ${args.name} ------> ${args.age}`;
    }

    signup = async (parent: any ,args : any, context: any, info:any) => {
        const { userName, email, password } = args ;

        const checkUser = await this._userModel.findOne({
            filter : {email},
            options : {lean : true,}
        });

        if(checkUser) throw new ConfilectException('User Already Exists');

        const otp = generateOTP()

        const user = await this._userModel.createUser({
            data : [
                {
                userName,
                email,
                password : await generateHashing(password),
                confirmEmailOTP : await generateHashing(String(otp)),
            }
        ],
            options : {
                validateBeforeSave : true
            }
        })

        return {
            message: " User Created Successfully",
            status : 201,
            data: user
        }
   
    }

    
}

export const userResolver = new UserResolver();