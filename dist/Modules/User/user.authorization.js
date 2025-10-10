"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const User_model_1 = require("../../DB/Models/User.model");
exports.endPoint = {
    profile: [User_model_1.RoulEnum.USER, User_model_1.RoulEnum.ADMIN],
    logout: [User_model_1.RoulEnum.USER, User_model_1.RoulEnum.ADMIN],
    refreshtoken: [User_model_1.RoulEnum.USER, User_model_1.RoulEnum.ADMIN],
    friendRequest: [User_model_1.RoulEnum.USER, User_model_1.RoulEnum.ADMIN],
    accepFriend: [User_model_1.RoulEnum.USER, User_model_1.RoulEnum.ADMIN],
};
