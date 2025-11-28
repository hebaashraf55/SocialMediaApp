"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = void 0;
const User_model_1 = require("../../../../DB/Models/User.model");
const user_repository_1 = require("../../../../DB/reposetories/user.repository");
const generateOTP_1 = require("../../../../Utils/generateOTP");
const error_response_1 = require("../../../../Utils/response/error.response");
const hash_1 = require("../../../../Utils/security/hash");
class UserResolver {
    _userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    getAllUsers = async () => {
        return await this._userModel.find({});
    };
    sayHi(parent, args, context, info) {
        return `hello ${args.name} ------> ${args.age}`;
    }
    signup = async (parent, args, context, info) => {
        const { userName, email, password } = args;
        const checkUser = await this._userModel.findOne({
            filter: { email },
            options: { lean: true, }
        });
        if (checkUser)
            throw new error_response_1.ConfilectException('User Already Exists');
        const otp = (0, generateOTP_1.generateOTP)();
        const user = await this._userModel.createUser({
            data: [
                {
                    userName,
                    email,
                    password: await (0, hash_1.generateHashing)(password),
                    confirmEmailOTP: await (0, hash_1.generateHashing)(String(otp)),
                }
            ],
            options: {
                validateBeforeSave: true
            }
        });
        return {
            message: " User Created Successfully",
            status: 201,
            data: user
        };
    };
}
exports.userResolver = new UserResolver();
