"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const auth_validation_1 = require("./auth.validation");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/signup', (0, validation_middleware_1.validation)(auth_validation_1.signUpSchema), auth_service_1.default.signUp);
router.post('/login', (0, validation_middleware_1.validation)(auth_validation_1.logInSchema), auth_service_1.default.logIn);
router.patch('/confirme-email', (0, validation_middleware_1.validation)(auth_validation_1.confirmeEmailSchema), auth_service_1.default.confirmeEmail);
exports.default = router;
