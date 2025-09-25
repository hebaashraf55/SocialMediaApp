import { RoulEnum } from "../../DB/Models/User.model";


export const endPoint = {
    profile : [ RoulEnum.USER, RoulEnum.ADMIN ],
    logout : [ RoulEnum.USER, RoulEnum.ADMIN ],
    refreshtoken : [ RoulEnum.USER, RoulEnum.ADMIN ]
}