let socket_id;

window.addEventListener("load", load);

function load() {
    const socket = id();
}

function create_room() {
    const username = get_username();
    const roomname = get_roomname();
    if (roomname==null || roomname=="" || roomname.match(/^[ 　\r\n\t]*$/)) {
        alert("部屋名を入力してください");
        return;
    }
    if (username==null || username=="" || username.match(/^[ 　\r\n\t]*$/)) {
        username = "名無し";
        set_username(username);
    }
    socket.emit("create_room", { username,roomname });
}

function disconnect() {
    socket.disconnect();
    disconnected();
}

function set_message(text) {
    const message_list = document.getElementById("message_list");
    const parent = document.createElement("div");
    parent.className = "row list-group-item mb-1";

    const li = document.createElement("li");
    li.textContent = `${text}`;
    parent.appendChild(li);
    message_list.appendChild(parent);
}

function send() {
    const message = message_text_box.value;
    socket.emit("send", message);
}
receive();

// ルームにjoinしたとき呼ぶ
function connected(){

}

//　ルームから退出したとき呼ぶ
function disconnected(){
    location.reload();
}

function receive() {
    socket.on("receive_id", ($socket_id) => {
        socket_id = $socket_id;
    });
    socket.on("update_rooms", (rooms) => {
        console.log("update_rooms");
        set_rooms(rooms);
    });
    socket.on("join", function(data){
        console.log("join: " + data.user_name);
        set_message(`join: ${data.user_name}`);
        connected();
    });
    socket.on("leave", function(data){
        console.log("leave: " + data.user_name);
        set_message(`leave: ${data.user_name}`);
        connected();
    });
    socket.on("update_users", (users) => {
        set_users(users);
    });
    socket.on("send", function(data){
        console.log("send: " + data.message);
        set_message(`${data.user_name}: ${data.message}`);
    });
}      