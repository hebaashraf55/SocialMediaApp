import {  Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { IFriendRequest } from "../Models/friendRequest.model";


export class FriendRepository extends DatabaseRepository<IFriendRequest> {
    constructor(protected override readonly model : Model<IFriendRequest>) {
        super(model)
    }

}