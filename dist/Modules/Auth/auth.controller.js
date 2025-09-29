"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const auth_validation_1 = require("./auth.validation");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const cluod_multer_1 = require("../../Utils/multer/cluod.multer");
const auth_authorization_1 = require("./auth.authorization");
const token_1 = require("../../Utils/security/token");
const router = (0, express_1.Router)();
router.post('/signup', (0, validation_middleware_1.validation)(auth_validation_1.signUpSchema), auth_service_1.default.signUp);
router.post('/login', (0, validation_middleware_1.validation)(auth_validation_1.logInSchema), auth_service_1.default.logIn);
router.patch('/profile-image', (0, authentication_middleware_1.authentication)(auth_authorization_1.endPoint.image, token_1.TokenEnum.ACCESS), (0, cluod_multer_1.cloudFileUpload)({
    storageApproch: cluod_multer_1.StorageEnum.MEMORY,
    validation: cluod_multer_1.fileValidation.images,
}).single('attachment'), auth_service_1.default.profileImage);
router.patch('/profile-cover-image', (0, authentication_middleware_1.authentication)(auth_authorization_1.endPoint.image, token_1.TokenEnum.ACCESS), (0, cluod_multer_1.cloudFileUpload)({
    storageApproch: cluod_multer_1.StorageEnum.DISK,
    validation: cluod_multer_1.fileValidation.images,
    maxsize: 2
}).array('attachments', 5), auth_service_1.default.coverImage);
router.patch('/confirme-email', (0, validation_middleware_1.validation)(auth_validation_1.confirmeEmailSchema), auth_service_1.default.confirmeEmail);
exports.default = router;
