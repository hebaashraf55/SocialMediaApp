"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const chat_events_1 = require("./chat.events");
class ChatGateway {
    _chatEvent = new chat_events_1.ChatEvent();
    constructor() { }
    register = (socket, io) => {
        this._chatEvent.sayHi(socket, io);
        this._chatEvent.sendMessage(socket, io);
        this._chatEvent.joinRoom(socket, io);
        this._chatEvent.sendGroupMessage(socket, io);
    };
}
exports.ChatGateway = ChatGateway;
