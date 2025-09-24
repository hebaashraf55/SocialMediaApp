"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.createLoginCredentials = exports.getSignatures = exports.getSignatureLevel = exports.verifyToken = exports.generateToken = exports.TokenEnum = exports.SignatureLevelEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const model_user_1 = require("../../DB/Models/model.user");
const error_response_1 = require("../response/error.response");
const user_repository_1 = require("../../DB/reposetories/user.repository");
var SignatureLevelEnum;
(function (SignatureLevelEnum) {
    SignatureLevelEnum["ADMIN"] = "ADMIN";
    SignatureLevelEnum["USER"] = "USER";
})(SignatureLevelEnum || (exports.SignatureLevelEnum = SignatureLevelEnum = {}));
var TokenEnum;
(function (TokenEnum) {
    TokenEnum["ACCESS"] = "ACCESS";
    TokenEnum["REFRESH"] = "REFRESH";
})(TokenEnum || (exports.TokenEnum = TokenEnum = {}));
const generateToken = async ({ payload, secret = process.env.ACCESS_USER_SIGNATURE, options = { expiresIn: Number(process.env.ACCESS_EXPIRES_IN) } }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret = process.env.ACCESS_USER_SIGNATURE, }) => {
    return (0, jsonwebtoken_1.verify)(token, secret);
};
exports.verifyToken = verifyToken;
const getSignatureLevel = async (role = model_user_1.RoulEnum.USER) => {
    let signatureLevel = SignatureLevelEnum.USER;
    switch (role) {
        case model_user_1.RoulEnum.ADMIN:
            signatureLevel = SignatureLevelEnum.ADMIN;
            break;
        case model_user_1.RoulEnum.USER:
            signatureLevel = SignatureLevelEnum.USER;
            break;
        default:
            break;
    }
    return signatureLevel;
};
exports.getSignatureLevel = getSignatureLevel;
const getSignatures = async (signatureLevel = SignatureLevelEnum.USER) => {
    let signatures = { access_signature: '', refresh_signature: '' };
    switch (signatureLevel) {
        case SignatureLevelEnum.ADMIN:
            signatures.access_signature = process.env.ACCESS_ADMIN_SIGNATURE;
            signatures.refresh_signature = process.env.REFRESH_ADMIN_SIGNATURE;
            break;
        case SignatureLevelEnum.USER:
            signatures.access_signature = process.env.ACCESS_USER_SIGNATURE;
            signatures.refresh_signature = process.env.REFRESH_USER_SIGNATURE;
            break;
        default:
            break;
    }
    return signatures;
};
exports.getSignatures = getSignatures;
const createLoginCredentials = async (user) => {
    const signatureLevel = await (0, exports.getSignatureLevel)(user.role);
    const signatures = await (0, exports.getSignatures)(signatureLevel);
    const accessToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.access_signature,
        options: { expiresIn: Number(process.env.ACCESS_EXPIRES_IN) }
    });
    const refreshToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.refresh_signature,
        options: { expiresIn: Number(process.env.REFRESH_EXPIRES_IN) }
    });
    return {
        accessToken,
        refreshToken
    };
};
exports.createLoginCredentials = createLoginCredentials;
const decodeToken = async ({ authorization, tokenType = TokenEnum.ACCESS }) => {
    const userModel = new user_repository_1.UserRepository(model_user_1.UserModel);
    const [bearer, token] = authorization.split(' ');
    if (!bearer || !token)
        throw new error_response_1.UnAuthorizedException("Missing Authorization Header");
    const signature = await (0, exports.getSignatures)(bearer);
    const decoded = await (0, exports.verifyToken)({
        token,
        secret: tokenType === TokenEnum.REFRESH
            ? signature.refresh_signature
            : signature.access_signature
    });
    if (!decoded?._id || !decoded.iat)
        throw new error_response_1.UnAuthorizedException("Invalid Token Payload");
    const user = await userModel.findOne({
        filter: { _id: decoded._id }
    });
    if (!user)
        throw new error_response_1.UnAuthorizedException("Not Register Account");
    return { user, decoded };
};
exports.decodeToken = decodeToken;
