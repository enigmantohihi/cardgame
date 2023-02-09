"use strict";
class Card {
    constructor(param) {
        this.param = param;
        this.elements = null;
    }
    change_mode() {
        this.param.mode = (this.param.mode + 1) % this.param.img_path_list.length;
        this.update_card_element();
        this.adjust_pos();
        this.move(this.param.pos.x, this.param.pos.y, 0);
        return this.param.mode;
    }
    display(mode) {
        const img_path = this.param.img_path_list[mode];
        return img_path;
    }
    is_overlap(x, y) {
        // マウスカーソルと重なったらtrue
        const over_x = this.param.pos.x < x && x < (this.param.pos.x + this.param.parent_size.width);
        const over_y = this.param.pos.y < y && y < (this.param.pos.y + this.param.parent_size.height);
        return over_x && over_y;
    }
    move(x, y, center = 1) {
        this.param.pos.x = x - (this.param.parent_size.width / 2 * center);
        this.param.pos.y = y - (this.param.parent_size.height / 2 * center);
        const start_pos = { x: 0, y: 0 };
        const limit_pos = { x: SCREEN_SIZE.width, y: SCREEN_SIZE.height };
        // 画面外に行かないようにする
        if (limit_pos.x < this.param.pos.x + this.param.parent_size.width) {
            this.param.pos.x = limit_pos.x - this.param.parent_size.width;
        }
        else if (this.param.pos.x < start_pos.x) {
            this.param.pos.x = start_pos.x;
        }
        if (limit_pos.y < this.param.pos.y + this.param.parent_size.height) {
            this.param.pos.y = limit_pos.y - this.param.parent_size.height;
        }
        else if (this.param.pos.y < start_pos.y) {
            this.param.pos.y = start_pos.y;
        }
        if (this.elements) {
            this.elements.parent.style.left = `${this.param.pos.x}px`;
            this.elements.parent.style.top = `${this.param.pos.y}px`;
        }
        return true;
    }
    rotate() {
        this.param.angle = ((this.param.angle + 90) % (180));
        const tmp = this.param.parent_size.width;
        this.param.parent_size.width = this.param.parent_size.height;
        this.param.parent_size.height = tmp;
        if (this.elements) {
            this.elements.parent.style.width = `${this.param.parent_size.width}px`;
            this.elements.parent.style.height = `${this.param.parent_size.height}px`;
            this.elements.img.style.transform = `rotate(${this.param.angle}deg)`;
            this.adjust_pos();
        }
        this.move(this.param.pos.x, this.param.pos.y, 0);
        return this.param.angle;
    }
    adjust_pos() {
        if (!this.elements)
            return 0;
        if (this.param.angle == 90) {
            // 回転時は位置調整
            const n = (this.param.img_size.width < this.param.img_size.height) ? 1 : -1;
            this.elements.img.style.left = `${n * (Math.abs(this.param.img_size.width - this.param.img_size.height) / 2)}px`;
            this.elements.img.style.top = `${n * (-Math.abs(this.param.img_size.width - this.param.img_size.height) / 2)}px`;
        }
        else {
            this.elements.img.style.left = `${(0)}px`;
            this.elements.img.style.top = `${(0)}px`;
        }
        return 0;
    }
    // change_modeなどで画像を変更した時 width,heightを更新
    update_card_element() {
        const card = this;
        if (!card.elements)
            return;
        const element = card.elements.parent;
        const element_img = card.elements.img;
        element_img.src = card.display(card.param.mode);
        element_img.onload = function () {
            console.log(`id:${card.param.id} load!`);
            const size = get_aspect(element_img);
            card.param.img_size = size;
            set_element_size(element_img, { width: card.param.img_size.width, height: card.param.img_size.height });
            if (card.param.angle == 90) {
                card.param.parent_size = { width: size.height, height: size.width };
                set_element_size(element, { width: card.param.img_size.height, height: card.param.img_size.width });
            }
            else {
                card.param.parent_size = { width: size.width, height: size.height };
                set_element_size(element, { width: card.param.img_size.width, height: card.param.img_size.height });
            }
            card.adjust_pos();
            card.move(card.param.pos.x, card.param.pos.y, 0);
        };
    }
}
let mouse_pos = { x: 0, y: 0 };
const keys = {
    A: false,
};
let selected_card; // 選択したカード
let selecting_card; // 選択中のカード
const my_cards = { decks: [], hands: [] };
const other_cards = { decks: [], hands: [] };
// クライアント側にカード情報保持
// 同期は相手クライアントの自分のカード情報をいじる
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
    // リストを逆から探索
    for (let i = my_cards.hands.length - 1; i >= 0; i--) {
        const card = my_cards.hands[i];
        if (card.is_overlap(offset_pos.x, offset_pos.y)) {
            console.log("this is card");
            if (keys.A)
                card.change_mode();
            selecting_card = card;
            selected_card = card;
            break;
        }
        selecting_card = null;
    }
}
function mouse_move(e) {
    const x = e.pageX;
    const y = e.pageY;
    const offset_pos = offsetPos(x, y);
    if (selecting_card) {
        selecting_card.move(offset_pos.x, offset_pos.y, 1);
    }
}
function mouse_up(e) {
    const x = e.pageX;
    const y = e.pageY;
    const offset_pos = offsetPos(x, y);
    if (mouse_pos.x == offset_pos.x && mouse_pos.y == offset_pos.y && !keys.A) {
        if (selecting_card) {
            selecting_card.rotate();
        }
    }
    selecting_card = null;
}
function key_press(e) {
    if (e.key === 'a' || e.key === 'A') {
        keys.A = true;
    }
    else if (e.key === 'z' || e.key === 'Z') {
        if (selected_card)
            zoom_card(selected_card.display(selected_card.param.mode));
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
    const card_place_pos = get_element_pos(card_place);
    const result = {
        x: x - card_place_pos.x,
        y: y - card_place_pos.y
    };
    return result;
}
