let socket_id;
let socket;

window.addEventListener("load", () => {
    socket = io();
    start();
    // 最初ページにアクセスした時に呼ぶ
    function start() {
        on_room();
        const create_button = document.getElementById(create_room_button_id);
        create_button.onclick = create_room;
    }
    // ルームにjoinしたとき呼ぶ
    function joined_room() {
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

// 部屋作成
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
// 部屋に参加
function join_room(roomname) {
    let username = get_username();
    if (is_text_space(username)) {
        username = "名無し";
        set_username(username);
    }
    socket.emit("join_room", { username,roomname });
}

// ルーム参加ボタンに処理を割り当てる
function set_join_button() {
    const join_buttons = document.getElementsByClassName(join_room_button_class);
    for (join_button of join_buttons) {
        const roomname = join_button.name;
        join_button.onclick = function() {
            join_room(roomname);
        }
    }
};

function unko() {
    console.log("unko");
}