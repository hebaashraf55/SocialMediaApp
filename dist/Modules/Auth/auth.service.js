"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_user_1 = require("../../DB/Models/model.user");
const error_response_1 = require("../../Utils/response/error.response");
const user_repository_1 = require("../../DB/reposetories/user.repository");
const hash_1 = require("../../Utils/security/hash");
const email_event_1 = require("../../Utils/events/email.event");
const generateOTP_1 = require("../../Utils/generateOTP");
const token_1 = require("../../Utils/security/token");
class AuthenticationService {
    _userModel = new user_repository_1.UserRepository(model_user_1.UserModel);
    constructor() { }
    signUp = async (req, res) => {
        const { userName, email, password } = req.body;
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
                    confirmEmailOTP: await (0, hash_1.generateHashing)(String(otp))
                }
            ],
            options: {
                validateBeforeSave: true
            }
        });
        email_event_1.emailEvent.emit('confirmeEmail', { to: email, userName: userName, otp });
        return res.status(201).json({ message: ' User Created Successfully', user });
    };
    logIn = async (req, res) => {
        const { email, password } = req.body;
        const user = await this._userModel.findOne({
            filter: { email },
        });
        if (!user)
            throw new error_response_1.NotFoundException('invalid Account');
        if (!(0, hash_1.compareHashing)(password, user.password))
            throw new error_response_1.BadRequestException('invalid password');
        const criedentials = await (0, token_1.createLoginCredentials)(user);
        return res.status(200).json({
            message: ' User Loged in Successfully',
            criedentials
        });
    };
    confirmeEmail = async (req, res) => {
        try {
            const { email, otp } = req.body;
            const user = await this._userModel.findOne({
                filter: {
                    email,
                    confirmEmailOTP: { $exists: true },
                    confirmedAT: { $exists: false },
                }
            });
            if (!user)
                throw new error_response_1.NotFoundException('invalid Account');
            if (!(0, hash_1.compareHashing)(otp, user?.confirmEmailOTP))
                throw new error_response_1.BadRequestException('invalid otp');
            await this._userModel.updateOne({
                filter: { email },
                update: {
                    confirmedAT: Date.now(),
                    $unset: { confirmEmailOTP: true },
                }
            });
        }
        catch (error) {
            throw new error_response_1.BadRequestException('invalid otp');
        }
        return res.status(200).json({
            message: ' User Email Confirmed Successfully'
        });
    };
}
exports.default = new AuthenticationService;
