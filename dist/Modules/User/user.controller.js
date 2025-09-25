"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const user_authorization_1 = require("./user.authorization");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const token_1 = require("../../Utils/security/token");
const router = (0, express_1.Router)();
router.get('/profile', (0, authentication_middleware_1.authentication)(user_authorization_1.endPoint.profile), user_service_1.default.getProfile);
router.post('/logout', (0, authentication_middleware_1.authentication)(user_authorization_1.endPoint.logout), user_service_1.default.logOut);
router.post('/refresh-token', (0, authentication_middleware_1.authentication)(user_authorization_1.endPoint.refreshtoken, token_1.TokenEnum.REFRESH), user_service_1.default.refreshToken);
exports.default = router;
