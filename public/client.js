"use strict";
let my_number; // 自分が1P,2Pどちらかを保持
let socket_id;
let socket;
window.addEventListener("load", () => {
    // @ts-ignore
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
        on_input_file();
        const send_button = document.getElementById(send_message_button_id);
        send_button.onclick = function () {
            const message = get_message_textbox().value;
            get_message_textbox().value = "";
            if (!is_text_space(message)) {
                socket.emit("send_message", message);
            }
        };
    }
    function disconnect() {
        socket.disconnect();
        disconnected();
    }
    //　ルームから退出したとき呼ぶ
    function disconnected() {
        location.reload();
    }
    receive();
    function receive() {
        socket.on("receive_id", ($socket_id) => {
            console.log("id=", $socket_id);
            socket_id = $socket_id;
        });
        socket.on("update_users", ($userid_list) => {
            // set_users(users);
        });
        socket.on("update_rooms", (rooms) => {
            console.log("update_rooms");
            set_rooms(rooms);
        });
        socket.on("join_room", function (data) {
            console.log("join: " + data.username);
            joined_room();
            set_message_list(`join! ${data.username}`);
        });
        socket.on("leave", function (data) {
            console.log("leave: " + data.user_name);
            set_message_list(`leave! ${data.username}`);
        });
        socket.on("receive_message", function (data) {
            console.log("receive_message: " + data.message);
            set_message_list(`${data.username}:${data.message}`);
        });
        // card用
        socket.on("update_plyaer_ids", (player_ids) => {
            my_number =
                (player_ids[0] == socket_id) ? "1P" :
                    (player_ids[1] == socket_id) ? "2P" :
                        "Audience";
            console.log("Player Number:", my_number);
        });
        // Room入室時Roomのデッキ情報を取得して表示
        socket.on("sync_card_data", (data) => {
            console.log("sync data:", data);
            const player1 = "1P";
            const player2 = "2P";
            create_card_elements(player1, data.hands1P);
            create_card_elements(player1, data.decks1P);
            create_card_elements(player2, data.hands2P);
            create_card_elements(player2, data.decks2P);
        });
        // 誰かがファイル入力からデッキ情報セットしたらサーバーを通ってここに来る
        socket.on("send_card_data", (data) => {
            console.log("send_card_data card");
            const player_number = data.player_number;
            create_card_elements(player_number, data.hands);
            create_card_elements(player_number, data.decks);
        });
        // Cardのアクション同期受付
        socket.on("update_hands", (data) => {
            console.log("Updata Hands:", data);
            const player_number = data.player_number;
            const target_id = data.card.id;
            const card = data.card;
            const elements = find_card_element(player_number, target_id);
            if (elements)
                update_card_element(card, elements);
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
    socket.emit("create_room", { username, roomname });
}
// 部屋に参加
function join_room(roomname) {
    let username = get_username();
    if (is_text_space(username)) {
        username = "名無し";
        set_username(username);
    }
    socket.emit("join_room", { username, roomname });
}
