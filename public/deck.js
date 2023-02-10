"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// 生成する要素のid名
const input_file_root_id = "input_file_root";
const input_file_id = "input_file";
//
//
let id = 0;
let back_img_path = "https://pics.prcm.jp/0be3ee414924e/71891496/jpeg/71891496.jpeg";
//
window.addEventListener("load", () => {
    start_input_file();
    off_input_file();
});
function start_input_file() {
    // root要素
    const root = document.getElementById(input_file_root_id);
    while (root.firstChild) {
        root.firstChild.remove();
    }
    ;
    create_input_file(root);
}
function on_input_file() {
    const root = document.getElementById(input_file_root_id);
    root.style.display = "block";
}
function off_input_file() {
    const root = document.getElementById(input_file_root_id);
    root.style.display = "none";
}
function create_input_file(parent) {
    // デッキファイル入力
    const input_file = document.createElement("input");
    input_file.type = "file";
    input_file.accept = ".json";
    input_file.id = input_file_id;
    input_file.onchange = selected_file;
    parent.appendChild(input_file);
}
function selected_file() {
    const input_file = document.getElementById(input_file_id);
    const files = input_file.files;
    if (files) {
        for (const file of files) {
            reader.readAsText(file);
        }
    }
}
// ファイル読み込みのやつを読み込み
const reader = new FileReader();
// ファイル読み込み時の処理
reader.onload = function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = e.target.result;
        const obj = JSON.parse(data);
        console.log("obj = ", obj);
        let hands = [];
        let decks = [];
        for (const key of Object.keys(obj)) {
            if (key == "back_img_path") {
                back_img_path = obj.back_img_path;
            }
            else if (key == "main") {
                // my_cards.decks = set_cards(obj.main.cards);
                decks = yield set_cardPrams(my_number, obj.main.cards);
                console.log("deck:", decks);
            }
            else if (key == "other") {
                // my_cards.hands = set_cards(obj.other.cards, 1);
                hands = yield set_cardPrams(my_number, obj.other.cards);
                console.log("hands:", hands);
            }
        }
        // handsのカードの位置調整
        let count = 0;
        for (const card of hands) {
            const x = 45 * ((count % 2 == 0) ? 0 : 1) + SCREEN_POS.x;
            const y = Math.floor(count / 2) * 63 + SCREEN_POS.y;
            card.pos = { x: x, y: y };
            card.visible = true;
            count++;
        }
        const send_data = { player_number: my_number, hands: hands, decks: decks };
        // serverにデッキ情報を送る
        if (socket)
            socket.emit("read_cards", send_data);
    });
};
function set_cardPrams(player_number, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        const cards = [];
        for (const carddata of obj) {
            for (let i = 0; i < carddata.count; i++) {
                const img_path_list = create_img_path_list(carddata);
                const card = new Card(id, player_number, img_path_list);
                for (const img_path of img_path_list) {
                    const img = yield load_image(img_path);
                    if (img) {
                        const size = get_aspect(img);
                        card.img_size.push(size);
                    }
                }
                card.parent_size = card.img_size[card.mode];
                cards.push(card);
                id++;
            }
        }
        return cards;
    });
}
// サーバーから受けとったカードのパラメーター情報配列をもとにカードを生成
// function create_cards(params:Card[]) {
//     const cards:Card[] = [];
//     for (const param of params) {
//         const card = new Card(param);
//         cards.push(card);
//         set_card_element(card);
//     }
//     return cards;
// }
function create_img_path_list(carddata) {
    const img_path_list = typeof (carddata.img_path) == "string" ? [carddata.img_path, back_img_path]
        : typeof (carddata.img_path) == "object" && carddata.img_path.length == 1 ? [carddata.img_path[0], back_img_path]
            : carddata.img_path;
    return img_path_list;
}
function load_image(path) {
    return __awaiter(this, void 0, void 0, function* () {
        let img = null;
        const promise = new Promise(function (resolve) {
            img = new Image();
            img.onload = function () {
                resolve();
            };
            img.src = path;
        });
        yield promise;
        return img;
    });
}
