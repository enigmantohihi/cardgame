"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const config_1 = __importDefault(require("./config"));
// window.addEventListener("load", init);
init();
function init() {
    console.log("start!");
    const PORT = process.env.PORT || (0, config_1.default)();
    const socket = (0, socket_io_client_1.io)(`http://localhost:${PORT}`);
}
