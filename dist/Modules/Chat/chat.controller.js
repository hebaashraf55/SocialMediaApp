"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const chat_authorization_1 = require("./chat.authorization");
const token_1 = require("../../Utils/security/token");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const validators = __importStar(require("./chat.validation"));
const chat_service_1 = __importDefault(require("./chat.service"));
const router = (0, express_1.Router)({
    mergeParams: true
});
router.get('/', (0, authentication_middleware_1.authentication)(chat_authorization_1.endPoint.getChat, token_1.TokenEnum.ACCESS), (0, validation_middleware_1.validation)(validators.getChatSchema), chat_service_1.default.getChat);
router.post('/group', (0, authentication_middleware_1.authentication)(chat_authorization_1.endPoint.getChat, token_1.TokenEnum.ACCESS), (0, validation_middleware_1.validation)(validators.createGroupChatSchema), chat_service_1.default.createGroupChat);
router.get('/group/:groupId', (0, authentication_middleware_1.authentication)(chat_authorization_1.endPoint.getChat, token_1.TokenEnum.ACCESS), (0, validation_middleware_1.validation)(validators.getGroupChatSchema), chat_service_1.default.getGroupChat);
exports.default = router;
