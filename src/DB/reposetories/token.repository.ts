import {  Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { IToken } from "../Models/token.model";


export class TokenRepository extends DatabaseRepository<IToken> {
    constructor(protected override readonly model : Model<IToken>) {
        super(model)
    }


}