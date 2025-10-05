"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_1 = require("../../DB/Models/User.model");
const error_response_1 = require("../../Utils/response/error.response");
const user_repository_1 = require("../../DB/reposetories/user.repository");
const hash_1 = require("../../Utils/security/hash");
const generateOTP_1 = require("../../Utils/generateOTP");
const token_1 = require("../../Utils/security/token");
const s3_config_1 = require("../../Utils/multer/s3.config");
const cluod_multer_1 = require("../../Utils/multer/cluod.multer");
class AuthenticationService {
    _userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
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
                    password,
                    confirmEmailOTP: `${otp}`
                }
            ],
            options: {
                validateBeforeSave: true
            }
        });
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
    profileImage = async (req, res) => {
        const { ContentType, Originalname } = req.body;
        const { url, Key } = await (0, s3_config_1.createPreSignedURL)({
            path: `users/${req.decoded?._id}`,
            ContentType,
            Originalname
        });
        return res.status(200).json({ message: ' Profile Image Uploaded Successfully', url, Key });
    };
    coverImage = async (req, res) => {
        const urls = await (0, s3_config_1.uploadFiles)({
            storageApproch: cluod_multer_1.StorageEnum.DISK,
            files: req.files,
            path: `users/${req.decoded?._id}/cover`
        });
        return res.status(200).json({ message: ' Cover Images Uploaded Successfully', urls });
    };
}
exports.default = new AuthenticationService;
