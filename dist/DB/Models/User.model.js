"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.userSchema = exports.RoulEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
const hash_1 = require("../../Utils/security/hash");
const email_event_1 = require("../../Utils/events/email.event");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["MALE"] = "MALE";
    GenderEnum["FEMALE"] = "FEMALE";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoulEnum;
(function (RoulEnum) {
    RoulEnum["USER"] = "USER";
    RoulEnum["ADMIN"] = "ADMIN";
})(RoulEnum || (exports.RoulEnum = RoulEnum = {}));
exports.userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, minLength: 3, maxLength: 25 },
    lastName: { type: String, required: true, minLength: 3, maxLength: 25 },
    slug: { type: String, required: true, minLength: 3, maxLength: 51 },
    email: { type: String, required: true, unique: true },
    confirmEmailOTP: String,
    confirmedAT: Date,
    password: { type: String, required: true },
    resetPassword: String,
    changeCridentialsTime: Date,
    phone: String,
    address: String,
    gender: { type: String, enum: Object.values(GenderEnum), default: GenderEnum.MALE },
    role: { type: String, enum: Object.values(RoulEnum), default: RoulEnum.USER },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
exports.userSchema
    .virtual("userName")
    .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replace(/\s+/g, '-') });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.userSchema.pre('save', async function (next) {
    this.wasNew = this.isNew;
    if (this.isModified('password')) {
        this.password = await (0, hash_1.generateHashing)(this.password);
    }
    if (this.isModified('confirmEmailOTP')) {
        this.confirmEmailPlainOTP = this.confirmEmailOTP;
        this.confirmEmailOTP = await (0, hash_1.generateHashing)(this.confirmEmailOTP);
    }
    next();
});
exports.userSchema.post('save', async function (doc, next) {
    const that = this;
    if (that.wasNew && that.confirmEmailPlainOTP) {
        email_event_1.emailEvent.emit('confirmeEmail', { to: this.email,
            userName: this.userName,
            otp: that.confirmEmailPlainOTP
        });
    }
    next();
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)('User', exports.userSchema);
