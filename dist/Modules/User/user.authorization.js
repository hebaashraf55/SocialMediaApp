"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const model_user_1 = require("../../DB/Models/model.user");
exports.endPoint = {
    profile: [model_user_1.RoulEnum.USER, model_user_1.RoulEnum.ADMIN]
};
