"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const User_model_1 = require("../../DB/Models/User.model");
exports.endPoint = {
    createComment: [User_model_1.RoulEnum.USER, User_model_1.RoulEnum.ADMIN],
    createReply: [User_model_1.RoulEnum.USER, User_model_1.RoulEnum.ADMIN]
};
