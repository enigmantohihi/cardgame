"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const config_1 = __importDefault(require("./config"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.default.Server(server);
console.log("dirname=" + __dirname);
app.use(express_1.default.static("public"));
app.get("/", (req, res) => {
    // res.sendFile(__dirname + "/index.html");
});
let rooms = [];
let users = [];
io.on("connection", (socket) => {
    // 初期接続
    console.log(`[connection] socket.id:${socket.id}`);
    // ユーザーにIDを渡す
    io.to(socket.id).emit("receive_id", socket.id);
    // ルーム一覧を渡す
    io.emit("update_rooms", rooms);
    // Room接続時
    socket.on("create_room", (data) => {
        // Room名やユーザー名を取得
        console.log("[create room] ", data);
        // ユーザー作成
        const user = {
            id: socket.id,
            username: data.username,
        };
        const roomname = data.roomname;
        // 部屋があるか検索
        const room = get_room(roomname);
        if (!room) {
            // まだ部屋がないときの処理
            const room = {
                roomname: roomname,
                user_ids: [],
                player_ids: ["", ""],
                other_ids: [],
                hands1P: [], decks1P: [],
                hands2P: [], decks2P: []
            };
            rooms.push(room);
            room.user_ids.push(socket.id);
            room.player_ids[0] = socket.id;
            // ルームに参加
            socket.join(roomname);
            // Roomに参加通知
            io.to(roomname).emit("join_room", data);
            //Room内のUserIDリスト送信
            io.to(roomname).emit("update_users", room.user_ids);
            console.log("user ids=", room.user_ids);
            // プレイしているユーザーリスト送信
            io.to(roomname).emit("update_plyaer_ids", room.player_ids);
            console.log("player ids=", room.player_ids);
            const cards_data = {
                hands1P: room.hands1P,
                decks1P: room.decks1P,
                hands2P: room.hands2P,
                decks2P: room.decks2P,
            };
            // ルームのデッキ情報送信
            io.to(roomname).emit("sync_card_data", cards_data);
        }
        console.log(rooms);
        // ルーム一覧を渡す
        io.emit("update_rooms", rooms);
        // userリストに追加
        users.push(user);
        // RoomのUserリスト取得
        // const room_users = get_room_users(roomname);
        // RoomUserリスト送信
        // io.to(roomname).emit("update_users", room_users);
    });
    socket.on("join_room", (data) => {
        // Room名やユーザー名を取得
        console.log("[join room] ", data);
        // ユーザー作成
        const user = {
            id: socket.id,
            username: data.username,
        };
        // userリストに追加
        users.push(user);
        const roomname = data.roomname;
        // 部屋があるか検索
        const room = get_room(roomname);
        if (room) {
            // 既に部屋があるときの処理
            room.user_ids.push(socket.id);
            // ルームに参加
            socket.join(roomname);
            // Roomに参加通知
            io.to(roomname).emit("join_room", data);
            if (room.player_ids[0] == "")
                room.player_ids[0] = socket.id;
            else if (room.player_ids[1] == "")
                room.player_ids[1] = socket.id;
            else
                room.other_ids.push(socket.id);
            // io.to(roomname).emit("update_users", room.user_ids);
            console.log("user ids=", room.user_ids);
            // プレイしているユーザーリスト送信
            io.to(roomname).emit("update_plyaer_ids", room.player_ids);
            console.log("player ids=", room.player_ids);
            const cards_data = {
                hands1P: room.hands1P,
                decks1P: room.decks1P,
                hands2P: room.hands2P,
                decks2P: room.decks2P,
            };
            // ルームのデッキ情報送信
            io.to(socket.id).emit("sync_card_data", cards_data);
        }
        // ルーム一覧を渡す
        io.emit("update_rooms", rooms);
        // RoomのUserリスト取得
        const room_users = get_room_users(roomname);
        console.log("users=", users);
        console.log("room_users=", room_users);
    });
    // メッセージ受付時
    socket.on("send_message", (message) => {
        console.log("[send message]", message);
        const user = get_user(socket.id);
        const username = (user) ? user.username : "unknown";
        const roomname = get_joined_room_name(socket.id);
        if (roomname)
            io.to(roomname).emit("receive_message", { username, message });
    });
    // ユーザー切断時
    socket.on("disconnect", () => {
        console.log(`[disconnect]: ${socket.id}`);
        // IDからユーザー取得
        const user = get_user(socket.id);
        if (user) {
            const roomname = get_joined_room_name(socket.id);
            if (roomname) {
                io.to(roomname).emit("leave", user);
                const room = get_room(roomname);
                if (room) {
                    // 切断したuserのidだけを省いてusersを更新
                    room.user_ids = room.user_ids.filter(id => id != socket.id);
                    io.to(roomname).emit("update_users", room.user_ids);
                    console.log("user ids=", room.user_ids);
                    // 切断したユーザーのidをプレイしているユーザーリストまたは観戦者リストから削除
                    if (room.player_ids[0] == socket.id)
                        room.player_ids[0] = "";
                    else if (room.player_ids[1] == socket.id)
                        room.player_ids[1] = "";
                    else
                        room.other_ids = room.other_ids.filter(id => id != socket.id);
                    // プレイしているユーザーリスト送信
                    io.to(roomname).emit("update_plyaer_ids", room.player_ids);
                    console.log("player ids=", room.player_ids);
                    console.log("other ids=", room.other_ids);
                }
                // 部屋のユーザー更新
                // const users = get_room_users(roomname)
                // io.emit("update_users", users);
            }
        }
        // Userリスト更新
        users = users.filter(user => user.id != socket.id);
        // 部屋のusersが0人のとこを省いて更新
        rooms = rooms.filter(room => room.user_ids.length != 0);
        // ルーム一覧を渡す
        io.emit("update_rooms", rooms);
        // io.emit("update_users", users);
    });
    //// カードゲーム関係 ////
    // デッキ情報を受信(デッキファイル読み込み時)
    socket.on("read_cards", (data) => {
        console.log("[Read cards]");
        const roomname = get_joined_room_name(socket.id);
        if (roomname) {
            const room = get_room(roomname);
            const player_number = data.player_number; // 何Pの通信か
            // Roomのデッキ情報に入れる
            if (player_number == "1P") {
                room.hands1P = data.hands;
                room.decks1P = data.decks;
            }
            else if (player_number == "2P") {
                room.hands2P = data.hands;
                room.decks2P = data.decks;
            }
            io.to(roomname).emit("send_card_data", { player_number: player_number, hands: data.hands, decks: data.decks });
        }
    });
});
const PORT = process.env.PORT || (0, config_1.default)();
server.listen(PORT, () => {
    console.log(`Access to http://localhost:${PORT}`);
});
function get_room(room_name) {
    for (const room of rooms) {
        if (room.roomname == room_name)
            return room;
    }
    return false;
}
function get_room_users(room_name) {
    const user_ids = get_room_user_ids(room_name);
    if (user_ids) {
        const result = [];
        for (const user of users) {
            if (user_ids.includes(user.id))
                result.push(user);
        }
        return result;
    }
    else {
        return false;
    }
}
function get_room_user_ids(room_name) {
    for (const room of rooms) {
        if (room.roomname == room_name)
            return room.user_ids;
    }
    return false;
}
function get_joined_room_name(user_id) {
    for (const room of rooms) {
        const room_user_ids = get_room_user_ids(room.roomname);
        if (room_user_ids && room_user_ids.includes(user_id))
            return room.roomname;
    }
    return false;
}
function get_user(user_id) {
    for (const user of users) {
        if (user.id == user_id)
            return user;
    }
    return false;
}
function get_user_index(user_id) {
    const user = users.findIndex((user) => {
        user.id == user_id;
    });
    return user;
}
