interface Position { x: number, y: number }
interface Size { width: number, height: number }
interface CardElement { parent: HTMLElement, img: HTMLImageElement }

class Card {
    id: number
    owner: string // カード所有者ID
    visible: boolean //trueのとき表示
    pos: Position
    parent_size: Size
    img_size: Size
    angle: number
    mode: number // どのimgを表示するかのindex
    img_path_list: string[]
    elements: CardElement | null

    constructor(id:number, owner:string, carddata: any) {
        this.id = id;
        this.owner = owner;
        this.visible = false;
        this.pos = {x:0,y:0};
        this.parent_size = {width:0,height:0};
        this.img_size = {width:0,height:0};
        this.angle = 0;
        this.mode = 0;
        this.img_path_list = [];
        this.elements = null;
    }
}

// server.js のRoomにカードリストを載せる
// まずカード全て生成 -> いったん非表示
// カードのon offは diplay:noneで処理
// server.js上のカード情報を変更して進める
// 自分のカードしか触れないようにする

window.addEventListener("load",() => {
    
});