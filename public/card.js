"use strict";
class Card {
    constructor(id, owner, img_path_list) {
        this.id = id;
        this.owner = owner;
        this.visible = false;
        this.pos = { x: 0, y: 0 };
        this.parent_size = { width: 0, height: 0 };
        this.img_size = { width: 0, height: 0 };
        this.angle = 0;
        this.mode = 0;
        this.img_path_list = img_path_list;
        this.elements = null;
    }
}
let cards = [];
// server.js のRoomにカードリストを載せる
// まずカード全て生成 -> いったん非表示
// カードのon offは diplay:noneで処理
// server.js上のカード情報を変更して進める
// 自分のカードしか触れないようにする
window.addEventListener("load", () => {
});
