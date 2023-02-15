import express from "express";
import http from "http";
import socketio from "socket.io";
import path from "path";
import get_port from "./config";
import { type } from "os";

interface User {
    id: string,
    username: string,
}
interface Room  {
    roomname: string
    user_ids: string[] // ルームに参加しているplayerのidリスト
    player_ids: string[] // ゲームをプレイしているユーザー(配列の長さは2で固定)
    other_ids: string[] // プレイしている人以外ここに入れる

    selected_card1P:Card|null, // 1P選択したカード
    selecting_card1P:Card|null; // 1P選択中のカード
    hands1P: Card[] // 1P手札
    decks1P: Card[] // 1P山札
    selected_card2P:Card|null, // 2P選択したカード
    selecting_card2P:Card|null; // 2P選択中のカード
    hands2P: Card[] // 2P手札
    decks2P: Card[] // 2P山札
}
const SCREEN_SIZE: Size = { width:600, height:480 };

const app = express();
const server = http.createServer(app);
const io: socketio.Server = new socketio.Server(server);

console.log("dirname=" + __dirname);
app.use(express.static("public"));

app.get("/", (req,res) => {
    // res.sendFile(__dirname + "/index.html");
});

let rooms: Room[] = [];
let users: User[] = [];
io.on("connection", (socket: socketio.Socket) => {
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
        const user: User = {
            id: socket.id,
            username: data.username,
        }
        const roomname = data.roomname;
        // 部屋があるか検索
        const room = get_room(roomname);
        if (!room) {
            // まだ部屋がないときの処理
            const room: Room = {
                roomname: roomname, 
                user_ids:[], 
                player_ids:["",""], 
                other_ids:[], 
                selected_card1P:null, selecting_card1P:null, hands1P:[], decks1P:[], 
                selected_card2P:null, selecting_card2P:null, hands2P:[], decks2P:[] 
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
                hands1P:room.hands1P,
                decks1P:room.decks1P,
                hands2P:room.hands2P,
                decks2P:room.decks2P,
            }
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
        const user: User = {
            id: socket.id,
            username: data.username,
        }
        // userリストに追加
        users.push(user);

        const roomname:string = data.roomname;
        // 部屋があるか検索
        const room = get_room(roomname);
        if (room) {
            // 既に部屋があるときの処理
            room.user_ids.push(socket.id);
            // ルームに参加
            socket.join(roomname);
            // Roomに参加通知
            io.to(roomname).emit("join_room", data);
            if (room.player_ids[0]=="") room.player_ids[0] = socket.id;
            else if (room.player_ids[1]=="") room.player_ids[1] = socket.id;
            else room.other_ids.push(socket.id);

            // io.to(roomname).emit("update_users", room.user_ids);
            console.log("user ids=", room.user_ids);
            // プレイしているユーザーリスト送信
            io.to(roomname).emit("update_plyaer_ids", room.player_ids);
            console.log("player ids=", room.player_ids);

            const cards_data = {
                hands1P:room.hands1P,
                decks1P:room.decks1P,
                hands2P:room.hands2P,
                decks2P:room.decks2P,
            }
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
        const username = (user)?user.username:"unknown";
        const roomname = get_joined_room_name(socket.id);
        if (roomname) io.to(roomname).emit("receive_message", {username,message});
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
                    room.user_ids = room.user_ids.filter(id => id!=socket.id );
                    io.to(roomname).emit("update_users", room.user_ids);
                    console.log("user ids=", room.user_ids);

                    // 切断したユーザーのidをプレイしているユーザーリストまたは観戦者リストから削除
                    if (room.player_ids[0]==socket.id) room.player_ids[0]="";
                    else if (room.player_ids[1]==socket.id) room.player_ids[1]="";
                    else room.other_ids = room.other_ids.filter(id => id!=socket.id);
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
        console.log("[Read cards]", data);
        const roomname = get_joined_room_name(socket.id);
        if (roomname) {
            const room = <Room>get_room(roomname);
            const player_number:PLAYER_NUMBER = data.player_number; // 何Pの通信か
            // Roomのデッキ情報に入れる
            if (player_number=="1P") {
                room.hands1P = convert_card(data.hands);
                room.decks1P = convert_card(data.decks);
                io.to(roomname).emit("get_decks", {player_number:player_number, deck_length:data.decks.length});
            } else if (player_number=="2P") {
                room.hands2P = convert_card(data.hands);
                room.decks2P = convert_card(data.decks);
                io.to(roomname).emit("get_decks", {player_number:player_number, deck_length:data.decks.length});
            }
            
            io.to(roomname).emit("send_card_data", {player_number:player_number, hands:data.hands, decks:data.decks});
        }
    });

    // カードのイベント処理(移動や回転など)
    socket.on("receive_action", (data) => {
        // console.log("[Receive Action]", data);
        const roomname = get_joined_room_name(socket.id);
        if (roomname) {
            const room = <Room>get_room(roomname);
            const player_number:PLAYER_NUMBER = data.player_number; // 何Pの通信か
            const action:CardAction = data.action; // どのアクションか
            if (action=="Move") {
                const selecting_card = (player_number=="1P")?room.selecting_card1P:room.selecting_card2P;
                if (!selecting_card) return;
                const pos = data.pos;
                selecting_card.move(pos.x, pos.y, 1);
                io.to(roomname).emit("update_hands", {player_number:player_number, card:selecting_card});
            } else if (action=="Rotate") {
                const card = get_card(data.pos.x, data.pos.y, player_number, room);
                if (!card) return;
                card.rotate();
                io.to(roomname).emit("update_hands", {player_number:player_number, card:card});
            } else if (action=="ChangeMode") {
                const card = get_card(data.pos.x, data.pos.y, player_number, room);
                if (!card) return;
                card.change_mode();
                io.to(roomname).emit("update_hands", {player_number:player_number, card:card});
            } else if (action=="Select") {
                const card = get_card(data.pos.x, data.pos.y, player_number, room);
                if(!card) return;
                if (player_number=="1P") {
                    room.selecting_card1P = card;
                    room.selected_card1P = card;
                } else {
                    room.selecting_card2P = card;
                    room.selected_card2P = card;
                }
            } else if (action=="Release") {
                if (player_number=="1P") room.selecting_card1P = null;
                else room.selecting_card2P = null;
            } else if (action=="LookFront") {
                const card = get_card(data.pos.x, data.pos.y, player_number, room);
                if (card && card.mode!=0) {
                    io.to(socket.id).emit("look_frontCard", {player_number:player_number, card:card});
                }
            }
        }
    });

    // 山札,手札のイベント処理(ドローや山札に戻すなど)
    socket.on("receive_event", (data) => {
        console.log("[Receive Event]", data);
        const roomname = get_joined_room_name(socket.id);
        if (!roomname) return;

        const room = <Room>get_room(roomname);
        const player_number:PLAYER_NUMBER = data.player_number; // 何Pの通信か
        const event:CardEvent = data.event; // どのアクションか
        const deck_list = (player_number=="1P")? room.decks1P:room.decks2P;

        if (event=="Draw") {
            const card_list = draw_card(data.index, data.front, data.pos, player_number, room);
            if (!card_list) return;
            io.to(roomname).emit("update_decks", {player_number:player_number, event:event, card_list:card_list});
            io.to(roomname).emit("get_decks", {player_number:player_number, deck_length:deck_list.length});
        } else if (event=="Back") {
            const card_list = back_card(data.index, player_number, room);
            if (!card_list) return;
            io.to(roomname).emit("update_decks", {player_number:player_number, event:event, card_list:card_list});
            io.to(roomname).emit("get_decks", {player_number:player_number, deck_length:deck_list.length});
        } else if (event=="GetDeck") {
            if (!deck_list) return;
            io.to(roomname).emit("show_decks", { deck:deck_list });
        } else if (event=="SelectDraw") {
            const card_list = select_id_draw(data.id_list, data.front,data.pos, player_number, room);
            if (!card_list) return;
            io.to(roomname).emit("update_decks", {player_number:player_number, event:event, card_list:card_list});
            io.to(roomname).emit("get_decks", {player_number:player_number, deck_length:deck_list.length});
        } else if (event=="Shuffle") {
            deck_shuffle(player_number, room);
        }
    });
})
const PORT= process.env.PORT || get_port();
server.listen(PORT, () => {
    console.log(`Access to http://localhost:${PORT}`);
});

function get_room(room_name: string) {
    for (const room of rooms) {
        if (room.roomname == room_name) return room;
    }
    return false;
}

function get_room_users(room_name: string) {
    const user_ids = get_room_user_ids(room_name);
    if (user_ids) {
        const result: User[] = [];
        for (const user of users) {
            if (user_ids.includes(user.id)) result.push(user);
        }
        return result;

    } else {
        return false;
    }
}

function get_room_user_ids(room_name: string) {
    for (const room of rooms) {
        if (room.roomname == room_name) return room.user_ids;
    }
    return false;
}

function get_joined_room_name(user_id: string) {
    for (const room of rooms) {
        const room_user_ids = get_room_user_ids(room.roomname);
        if (room_user_ids && room_user_ids.includes(user_id)) return room.roomname;
    }
    return false;
}

function get_user(user_id: string) {
    for (const user of users) {
        if (user.id == user_id) return user;
    }
    return false;
}

function get_user_index(user_id: string) {
    const user = users.findIndex((user) => {
        user.id  == user_id;
    });
    return user;
}

////
class Card {
    id: number
    owner: PLAYER_NUMBER // 何Pのカードか
    visible: boolean //trueのとき表示
    pos: Position
    parent_size: Size
    img_size: Size[]
    angle: number
    mode: number // どのimgを表示するかのindex
    img_path_list: string[]

    constructor(id:number, player_number:PLAYER_NUMBER, img_path_list:string[]) {
        this.id = id;
        this.owner = player_number, // カード所有者ID
        this.visible = false, //trueのとき表示
        this.pos = {x:0,y:0},
        this.parent_size = {width:0,height:0},
        this.img_size = [],
        this.angle = 0,
        this.mode = 0, // どのimgを表示するかのindex
        this.img_path_list = img_path_list
    }
    change_mode(): number {
        this.mode = (this.mode+1)%this.img_path_list.length;
        const img_size = this.img_size[this.mode];
        if (this.angle==90) {
            this.parent_size = {width: img_size.height, height: img_size.width};
        } else {
            this.parent_size = {width: img_size.width, height: img_size.height};;
        }
        this.move(this.pos.x, this.pos.y, 0);
        return this.mode;
    }
    display(): string {
        const img_path = this.img_path_list[this.mode];
        return img_path;
    }
    is_overlap(x:number, y:number): boolean {
        // console.log(`card pos x:${this.pos.x} y:${this.pos.y}, size w:${this.img_size[this.mode].width} h:${this.img_size[this.mode].height}`);
        // マウスカーソルと重なったらtrue
        const over_x = this.pos.x < x && x < (this.pos.x + this.parent_size.width);
        const over_y = this.pos.y < y && y < (this.pos.y + this.parent_size.height);
        return over_x && over_y;
    }
    move(x:number, y:number, center:number=1): boolean {
        this.pos.x = x - (this.parent_size.width/2 * center);
        this.pos.y = y - (this.parent_size.height/2 * center);
        const start_pos:Position = {x:0,y:0};
        const limit_pos:Position = {x:SCREEN_SIZE.width,y:SCREEN_SIZE.height};
        // 画面外に行かないようにする
        if (limit_pos.x < this.pos.x + this.parent_size.width) {
            this.pos.x = limit_pos.x - this.parent_size.width;
        } else if (this.pos.x < start_pos.x) {
            this.pos.x = start_pos.x;
        }
        if (limit_pos.y < this.pos.y + this.parent_size.height) {
            this.pos.y = limit_pos.y - this.parent_size.height;
        } else if (this.pos.y < start_pos.y) {
            this.pos.y = start_pos.y;
        }
        return true;
    }
    rotate(): number {
        this.angle = ((this.angle+90)%(180));
        const tmp = this.parent_size.width;
        this.parent_size.width = this.parent_size.height;
        this.parent_size.height = tmp;
        this.move(this.pos.x, this.pos.y, 0);
        return this.angle;
    }
}

type CardAction = "Move" | "Rotate" | "ChangeMode" | "Select" | "Release" | "LookFront";
type CardEvent = "Draw" | "Back" | "GetDeck" | "SelectDraw" | "Shuffle";
////
function convert_card(card_data:any[]) {
    const cards:Card[] = [];
    for (const data of card_data) {
        const id = data.id;
        const owner = data.owner;
        const img_path_list = data.img_path_list;
        const card = new Card(id, owner, img_path_list);
        card.visible = data.visible;
        card.pos = data.pos;
        card.parent_size = data.parent_size;
        card.img_size = data.img_size;
        card.angle = data.angle;
        card.mode = data.mode;
        cards.push(card);
    }
    return cards;
}

function get_card(x:number, y:number, player_number:PLAYER_NUMBER, room:Room) {
    const card_list = (player_number=="1P")?room.hands1P:room.hands2P;
    // リストを逆から探索
    for (let i=card_list.length-1;i>=0;i--) {
        const card = card_list[i];
        if (card.is_overlap(x, y)) {
            return card;
        }
    }
    console.log("cant get card");
    return false;
}

function draw_card(index:number, front:boolean, pos:Position, player_number:PLAYER_NUMBER, room:Room) {
    const hands = (player_number=="1P")?room.hands1P:room.hands2P;
    const decks = (player_number=="1P")?room.decks1P:room.decks2P;
    const card = decks.splice(index, 1)[0];
    if (!card) return false;
    card.mode = (front)?0:1;
    card.move(pos.x,pos.y,1);
    card.visible = true;
    hands.push(card);
    return [card];
}
function back_card(index:number, player_number:PLAYER_NUMBER, room:Room) {
    const back_card = (player_number=="1P")?room.selected_card1P:room.selected_card2P;
    if (!back_card) return false;
    const hands = (player_number=="1P")?room.hands1P:room.hands2P;
    const decks = (player_number=="1P")?room.decks1P:room.decks2P;
    back_card.visible = false;
    
    // 手札(デッキ外)の中から選択したカードのインデックスを取得
    const pull_index = hands.indexOf(back_card);
    hands.splice(pull_index,1);
    decks.splice(index,0,back_card);
    if (player_number=="1P") room.selected_card1P = null;
    else if (player_number=="2P") room.selected_card2P = null;

    return [back_card];
}

function select_id_draw(id_list:number[], front:boolean, pos:Position, player_number:PLAYER_NUMBER, room:Room) {
    const hands = (player_number=="1P")?room.hands1P:room.hands2P;
    const decks = (player_number=="1P")?room.decks1P:room.decks2P;
    const result:Card[] = [];
    for (const id of id_list) {
        const card = decks.find($card => $card.id == id);
        if (card) {
            card.mode = (front)?0:1;
            card.move(pos.x,pos.y,1);
            card.visible = true;
            // デッキの中から選択したカードのインデックスを取得
            const index = decks.indexOf(card);
            decks.splice(index,1);
            hands.push(card);
            result.push(card);
            pos.x += 50;
        }
    }
    return result;
}

function deck_shuffle(player_number:PLAYER_NUMBER, room:Room) {
    let decks = (player_number=="1P")?room.decks1P:room.decks2P;
    const shuffle = (array:Card[]) => {
        for (let i = array.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
        return array;
    }
    decks = shuffle(decks);
}