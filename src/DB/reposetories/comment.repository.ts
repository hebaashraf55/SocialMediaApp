import {  Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { IComment } from '../Models/comment.model';


export class CommentRepository extends DatabaseRepository<IComment> {
    constructor(protected override readonly model : Model<IComment>) {
        super(model)
    }


}