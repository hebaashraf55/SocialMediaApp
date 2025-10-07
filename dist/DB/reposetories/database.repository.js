"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async findOne({ filter, select, options }) {
        const doc = this.model.findOne(filter).select(select || '');
        if (options?.populate) {
            doc.populate(options.populate);
        }
        ;
        if (options?.lean) {
            doc.lean(options.lean);
        }
        ;
        return doc.exec();
    }
    async find({ filter, select, options }) {
        const doc = this.model.find(filter || {}).select(select || '');
        if (options?.populate) {
            doc.populate(options.populate);
        }
        ;
        if (options?.lean) {
            doc.lean(options.lean);
        }
        ;
        return doc.exec();
    }
    async findOneAndUpdate({ filter, update, options = { new: true } }) {
        const doc = this.model.findOneAndUpdate(filter, update);
        if (options?.populate) {
            doc.populate(options.populate);
        }
        ;
        if (options?.lean) {
            doc.lean(options.lean);
        }
        ;
        return doc.exec();
    }
    async findById({ id, select, options }) {
        const doc = this.model.findById(id).select(select || '');
        if (options?.populate) {
            doc.populate(options.populate);
        }
        ;
        if (options?.lean) {
            doc.lean(options.lean);
        }
        ;
        return doc.exec();
    }
    async create({ data, options }) {
        return await this.model.create(data, options);
    }
    async insertMany({ data }) {
        return (await this.model.insertMany(data));
    }
    async updateOne({ filter, update, options }) {
        if (Array.isArray(update)) {
            update.push({
                $set: { __v: { $add: ["$__v", 1] } }
            });
            return await this.model.updateOne(filter, update, options);
        }
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async deleteOne({ filter, }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter, }) {
        return await this.model.deleteMany(filter);
    }
    async findOneAndDelete({ filter, }) {
        return await this.model.findOneAndDelete(filter);
    }
}
exports.DatabaseRepository = DatabaseRepository;
