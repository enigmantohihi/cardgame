let socket_id;
let socket;
window.addEventListener("load", () => {
    socket = io();
    on_room();
    const create_button = document.getElementById(create_room_button_id);
    create_button.onclick = create_room;

    function create_room() {
        let username = get_username();
        let roomname = get_roomname();
        if (is_text_space(username)) {
            username = "名無し";
            set_username(username);
        }
        if (is_text_space(roomname)) {
            alert("部屋名を入力してください");
            return;
        }
        socket.emit("create_room", { username,roomname });
    }
    // ルームにjoinしたとき呼ぶ
    function joined_room(){
        // 表示ページ切り替え
        off_room();
        on_messages();
        on_board();
        const send_button = document.getElementById(send_message_button_id);
        send_button.onclick = function() {
            const message = get_message_textbox().value;
            get_message_textbox().value = "";
            if (!is_text_space(message)) {
                socket.emit("send_message", message);
            }
        }
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
    
    //　ルームから退出したとき呼ぶ
    function disconnected(){
        location.reload();
    }
    receive();
    function receive() {
        socket.on("receive_id", ($socket_id) => {
            console.log("id=", $socket_id)
            socket_id = $socket_id;
        });
        socket.on("update_users", (users) => {
            // set_users(users);
        });
        socket.on("update_rooms", (rooms) => {
            console.log("update_rooms");
            set_rooms(rooms);
        });
        socket.on("join_room", function(data){
            console.log("join: " + data.username);
            joined_room();
            set_message_list(`join! ${data.username}`);
        });
        socket.on("leave", function(data){
            console.log("leave: " + data.user_name);
            set_message_list(`leave! ${data.username}`);
        });
        socket.on("receive_message", function(data){
            console.log("receive_message: " + data.message);
            set_message_list(`${data.username}:${data.message}`);
        });
    }      
});