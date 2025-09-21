"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHashing = exports.generateHashing = void 0;
const bcrypt_1 = require("bcrypt");
const generateHashing = async (plainText, saltRound = Number(process.env.SALT)) => {
    return await (0, bcrypt_1.hash)(plainText, saltRound);
};
exports.generateHashing = generateHashing;
const compareHashing = async (plainText, hash) => {
    return await (0, bcrypt_1.compare)(plainText, hash);
};
exports.compareHashing = compareHashing;
