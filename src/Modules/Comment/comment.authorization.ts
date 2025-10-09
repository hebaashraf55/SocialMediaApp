import { RoulEnum } from "../../DB/Models/User.model";


export const endPoint = {
    createComment : [ RoulEnum.USER, RoulEnum.ADMIN ],
    createReply : [ RoulEnum.USER, RoulEnum.ADMIN ]
}