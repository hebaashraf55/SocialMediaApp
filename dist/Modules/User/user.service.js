"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserService {
    constructor() { }
    getProfile = async (req, res, next) => {
        return res.status(200).json({ message: ' Done', user: req.user, decoded: req.decoded });
    };
}
exports.default = new UserService;
