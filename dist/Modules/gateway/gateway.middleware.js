"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gateWayMiddleware = void 0;
const gateWayMiddleware = (socket, io) => {
    io.use(async (socket, next) => {
        try {
            const { user, decoded } = await decodeToken({
                authorization: socket.handshake.auth.authorization,
                tokenType: TokenEnum.ACCESS
            });
            const userTabs = connectedSockets.get(user._id.toString()) || [];
            userTabs.push(socket.id);
            connectedSockets.set(user._id.toString(), userTabs);
            socket.criedentials = { user, decoded };
            next();
        }
        catch (error) {
            next(error);
        }
    });
    next();
};
exports.gateWayMiddleware = gateWayMiddleware;
