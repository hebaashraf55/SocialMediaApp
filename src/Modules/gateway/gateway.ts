
import { Server as httpSerfver } from "node:http";
import { Server } from "socket.io";
import { decodeToken, TokenEnum } from "../../Utils/security/token";
import { IAuthSocket } from "./gateway.dto";
import { ChatGateway } from "../Chat/chat.gateway";


let io : Server | null = null
export const initalize = ( httpServer : httpSerfver ) => {

    io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
   })

   const connectedSockets =  new Map<string, string[]>();

   // socket middleware
   io.use(async (socket : IAuthSocket , next) => {
    try{
        const { user, decoded } = await decodeToken({
            authorization : socket.handshake.auth.authorization,
            tokenType : TokenEnum.ACCESS
        });
        const userTabs = connectedSockets.get(user._id.toString()) || []; // to get all tabs
        userTabs.push(socket.id);
        connectedSockets.set(user._id.toString(), userTabs );
        socket.criedentials = { user, decoded }
        next()
    } catch(error: any) {
        next(error)
    }
   })

   // disconnection function ------
   function disconnection (socket : IAuthSocket ) {

   socket.on('disconnect', () => {
        const userId = socket.criedentials?.user._id?.toString() as string;
        let remainingTabs = connectedSockets.get(userId)?.filter(
            (tab) => { return tab !== socket.id}
        ) || [];
        if(remainingTabs.length){
            connectedSockets.set(userId, remainingTabs);
        } else {
            connectedSockets.delete(userId);
        }
        console.log(`After delete : ${connectedSockets.get(userId)}`);
        console.log(connectedSockets);
        
        
        // connectedSockets.delete(
        //     socket.criedentials?.user._id?.toString() as string 
        // );
        
        //console.log(`Log Out From :: ${socket.id} This User Is Disconnected !!`);
       }); 
   }

   const chatGateway : ChatGateway = new ChatGateway();
   // connection io 
   io.on('connection', (socket: IAuthSocket) => {
    chatGateway.register(socket, getIo());
    console.log(connectedSockets);
    disconnection(socket);
   })
}

export const getIo = () : Server => {
    if(!io) throw new Error('Socket Is Not Initalized')
    return io;
}