"use strict";
/*
player_number:PLAYER_NUMBER,
action:Action,
pos: {x,y},
other: ... {Actionによってことなる}
*/
class Card {
    constructor(id, player_number, img_path_list) {
        this.id = id;
        this.owner = player_number, // カード所有者ID
            this.visible = false, //trueのとき表示
            this.pos = { x: 0, y: 0 },
            this.parent_size = { width: 0, height: 0 },
            this.img_size = [],
            this.angle = 0,
            this.mode = 0, // どのimgを表示するかのindex
            this.img_path_list = img_path_list;
    }
}
let mouse_pos = { x: 0, y: 0 };
const keys = {
    A: false,
};
let selected_card; // 選択したカード
let selecting_card; // 選択中のカード
let mydeck_count = 0;
let otherdeck_count = 0;
let modal_select_id = [];
// サーバにカード情報保持
// 最初にまずカード要素前作成
// 要素全部非表示 -> handsの中にあるカードだけ表示する
window.addEventListener("load", () => {
    const my_card_place = document.getElementById(mycard_place_id);
    my_card_place.addEventListener("mousedown", mouse_down);
    my_card_place.addEventListener("mousemove", mouse_move);
    my_card_place.addEventListener("mouseup", mouse_up);
    document.addEventListener("keypress", key_press);
    document.addEventListener("keyup", key_up);
});
function mouse_down(e) {
    const x = e.pageX;
    const y = e.pageY;
    const offset_pos = offsetPos(x, y);
    mouse_pos = offset_pos;
    if (keys.A) {
        console.log("change mode call");
        const send_data = {
            player_number: my_number,
            action: "ChangeMode",
            pos: { x: offset_pos.x, y: offset_pos.y }
        };
        socket.emit("receive_action", send_data);
    }
    console.log("select call");
    const send_data = {
        player_number: my_number,
        action: "Select",
        pos: { x: offset_pos.x, y: offset_pos.y }
    };
    socket.emit("receive_action", send_data);
}
function mouse_move(e) {
    const x = e.pageX;
    const y = e.pageY;
    const offset_pos = offsetPos(x, y);
    console.log("move call");
    const send_data = {
        player_number: my_number,
        action: "Move",
        pos: { x: offset_pos.x, y: offset_pos.y }
    };
    socket.emit("receive_action", send_data);
}
function mouse_up(e) {
    const x = e.pageX;
    const y = e.pageY;
    const offset_pos = offsetPos(x, y);
    // マウスを押したところから動かさずにupしていたらRotateイベント呼ぶ
    if (mouse_pos.x == offset_pos.x && mouse_pos.y == offset_pos.y && !keys.A) {
        console.log("rotate call");
        const send_data = {
            player_number: my_number,
            action: "Rotate",
            pos: { x: offset_pos.x, y: offset_pos.y }
        };
        socket.emit("receive_action", send_data);
    }
    // マウス離した時に選択中カードの解除イベント呼ぶ
    console.log("release call");
    const send_data = {
        player_number: my_number,
        action: "Release",
        pos: { x: offset_pos.x, y: offset_pos.y }
    };
    socket.emit("receive_action", send_data);
}
function key_press(e) {
    if (e.key === 'a' || e.key === 'A') {
        keys.A = true;
    }
    else if (e.key === 'z' || e.key === 'Z') {
        if (selected_card)
            zoom_card(selected_card.img_path_list[selected_card.mode]);
    }
}
function key_up(e) {
    if (e.key === 'a' || e.key === 'A') {
        keys.A = false;
    }
    else if (e.key === 'z' || e.key === 'Z') {
        const overlay = document.getElementById(zoom_overlay_id);
        if (overlay.style.display == "block")
            overlay.style.display = "none";
    }
}
// 自分のカード置き場要素の中のマウスの相対的な座標を求める
//(card_place要素の左上角が{x:0,y:0}となるようにする)
function offsetPos(x, y) {
    const card_place = document.getElementById(mycard_place_id);
    const card_place_pos = get_element_AbsolutePos(card_place);
    const result = {
        x: x - card_place_pos.x,
        y: y - card_place_pos.y
    };
    return result;
}
// ドローボタンを押した時に呼ぶ
function draw_card() {
    const deck_index_input = document.getElementById(deck_index_input_id);
    const radio1 = document.getElementById(draw_radio_id + 0);
    const radio2 = document.getElementById(draw_radio_id + 1);
    const index = Number(deck_index_input.value) - 1;
    const front = (radio1.checked) ? true : false;
    // serverに送信
    const send_data = {
        player_number: my_number,
        event: "Draw",
        index: index,
        front: front
    };
    socket.emit("receive_event", send_data);
}
// 戻すボタンを押した時に呼ぶ
function back_card() {
    const back_index_input = document.getElementById(back_index_input_id);
    const radio1 = document.getElementById(back_radio_id + 0);
    const radio2 = document.getElementById(back_radio_id + 1);
    const offset = (radio1.checked) ? -1 : 0;
    const index = Number(back_index_input.value) + offset; // 何番目に戻すか
    // serverに送信
    const send_data = {
        player_number: my_number,
        event: "Back",
        index: index
    };
    socket.emit("receive_event", send_data);
}
// showボタンを押した時に呼ぶ
function show_decks_call() {
    // serverにclientのshow_decks()を呼ぶCallを送る
    const send_data = {
        player_number: my_number,
        event: "GetDeck",
    };
    socket.emit("receive_event", send_data);
}
// 山札の一覧をmodalに表示
function show_decks(card_list) {
    const radio1 = document.getElementById(show_radio_id + 0);
    const radio2 = document.getElementById(show_radio_id + 1);
    const mode = (radio1.checked) ? 0 : 1;
    const modal_card_parent = document.getElementById(modal_card_parent_id);
    while (modal_card_parent.firstChild) {
        modal_card_parent.removeChild(modal_card_parent.firstChild);
    }
    for (const card of card_list) {
        const modal_card = create_modal_card(card, mode);
        modal_card_parent.appendChild(modal_card);
    }
    modal_select_id = [];
}
function create_modal_card(card, mode) {
    const modal_card = document.createElement("img");
    modal_card.className = "modal_card";
    modal_card.src = card.img_path_list[mode];
    const size = card.img_size[mode];
    set_element_size(modal_card, size);
    modal_card.onclick = function () {
        console.log("click id=", card.id);
        select_id(card.id);
        if (modal_select_id.includes(card.id)) {
            modal_card.classList.add("border");
            modal_card.classList.add("border-4");
            modal_card.classList.add("border-warning");
        }
        else {
            modal_card.classList.remove("border");
            modal_card.classList.remove("border-4");
            modal_card.classList.remove("border-warning");
        }
    };
    return modal_card;
}
function select_id(id) {
    const index = modal_select_id.indexOf(id);
    if (index == -1) {
        // 選択したIDリストの中に選択したIDがないときリストに追加
        modal_select_id.push(id);
    }
    else {
        // リストから削除
        modal_select_id.splice(index, 1);
    }
}
// modal中の選択したカードを山札から手札に引き抜く
function selected_draw() {
    console.log("selected draw");
    if (modal_select_id.length <= 0)
        return;
    const radio1 = document.getElementById(draw_radio_id + 0);
    const radio2 = document.getElementById(draw_radio_id + 1);
    const front = (radio1.checked) ? true : false;
    // serverに送信
    const send_data = {
        player_number: my_number,
        event: "SelectDraw",
        id_list: modal_select_id,
        front: front
    };
    socket.emit("receive_event", send_data);
    modal_select_id = [];
}
function updata_states() {
    const deck_text0 = document.getElementById(deck_count_text_id + 0);
    const deck_text1 = document.getElementById(deck_count_text_id + 1);
    deck_text0.textContent = `${otherdeck_count}枚`;
    deck_text1.textContent = `${mydeck_count}枚`;
    const draw_index_input = document.getElementById(deck_index_input_id);
    const back_index_input = document.getElementById(back_index_input_id);
    adjust_input(draw_index_input);
    adjust_input(back_index_input);
}
