import {io} from "socket.io-client";
import get_port from "./config";
// window.addEventListener("load", init);
init();
function init() {
    console.log("start!");
    const PORT= process.env.PORT || get_port();
    const socket = io(`http://localhost:${PORT}`);
}