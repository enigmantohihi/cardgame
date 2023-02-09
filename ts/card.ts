interface Position { x: number, y: number }
interface Size { width: number, height: number }
interface CardElement { parent: HTMLElement, img: HTMLImageElement }
interface Cards { decks: Card[], hands: Card[] }

interface CardPram {
    id: number
    owner: PLAYER_NUMBER // 何Pのカードか
    visible: boolean //trueのとき表示
    pos: Position
    parent_size: Size
    img_size: Size
    angle: number
    mode: number // どのimgを表示するかのindex
    img_path_list: string[]
}

class Card {
    param: CardPram
    elements: CardElement | null

    constructor(param: CardPram) {
        this.param = param;
        this.elements = null;
    }
    change_mode(): number {
        this.param.mode = (this.param.mode+1)%this.param.img_path_list.length;
        this.update_card_element();
        this.adjust_pos();
        this.move(this.param.pos.x, this.param.pos.y, 0);
        return this.param.mode;
    }
    display(mode: number): string {
        const img_path = this.param.img_path_list[mode];
        return img_path;
    }
    is_overlap(x:number, y:number): boolean {
        // マウスカーソルと重なったらtrue
        const over_x = this.param.pos.x < x && x < (this.param.pos.x + this.param.parent_size.width);
        const over_y = this.param.pos.y < y && y < (this.param.pos.y + this.param.parent_size.height);
        return over_x && over_y;
    }
    move(x:number, y:number, center:number=1): boolean {
        this.param.pos.x = x - (this.param.parent_size.width/2 * center);
        this.param.pos.y = y - (this.param.parent_size.height/2 * center);
        // const card_place_pos = get_cardplace_pos(1);
        const start_pos:Position = {x:0,y:0};
        const limit_pos:Position = {x:SCREEN_SIZE.width,y:SCREEN_SIZE.height};
        // 画面外に行かないようにする
        if (limit_pos.x < this.param.pos.x + this.param.parent_size.width) {
            this.param.pos.x = limit_pos.x - this.param.parent_size.width;
        } else if (this.param.pos.x < start_pos.x) {
            this.param.pos.x = start_pos.x;
        }
        if (limit_pos.y < this.param.pos.y + this.param.parent_size.height) {
            this.param.pos.y = limit_pos.y - this.param.parent_size.height;
        } else if (this.param.pos.y < start_pos.y) {
            this.param.pos.y = start_pos.y;
        }
        if (this.elements) {
            this.elements.parent.style.left = `${this.param.pos.x}px`;
            this.elements.parent.style.top = `${this.param.pos.y}px`;
        }
        return true;
    }
    rotate(): number {
        this.param.angle = ((this.param.angle+90)%(180));
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
    adjust_pos(): number {
        if (!this.elements) return 0;
        if (this.param.angle==90) {
            // 回転時は位置調整
            const n = (this.param.img_size.width < this.param.img_size.height)?1:-1;
            this.elements.img.style.left = `${n*(Math.abs(this.param.img_size.width-this.param.img_size.height)/2)}px`;
            this.elements.img.style.top = `${n*(-Math.abs(this.param.img_size.width-this.param.img_size.height)/2)}px`;
        } else {
            this.elements.img.style.left = `${(0)}px`;
            this.elements.img.style.top = `${(0)}px`;
        }
        return 0;
    }
    // change_modeなどで画像を変更した時 width,heightを更新
    update_card_element() {
        const card = this;
        if (!card.elements) return;
        const element = card.elements.parent
        const element_img = card.elements.img;
        element_img.src = card.display(card.param.mode);
        element_img.onload = function() {
            console.log(`id:${card.param.id} load!`);
            const size = get_aspect(element_img);     
            card.param.img_size = size;
            set_element_size(element_img, {width:card.param.img_size.width, height:card.param.img_size.height});
            if (card.param.angle==90) {
                card.param.parent_size = {width: size.height, height: size.width};
                set_element_size(element, {width:card.param.img_size.height, height:card.param.img_size.width});
            } else {
                card.param.parent_size = {width: size.width, height: size.height};
                set_element_size(element, {width:card.param.img_size.width, height:card.param.img_size.height});
            }
            card.adjust_pos();
            card.move(card.param.pos.x, card.param.pos.y, 0);
        }
    }
}

const my_cards:Cards = {decks:[], hands:[]};
const other_cards:Cards = {decks:[], hands:[]};

// クライアント側にカード情報保持
// 同期は相手クライアントの自分のカード情報をいじる

window.addEventListener("load",() => {
    const my_card_place = <HTMLElement>document.getElementById(mycard_place_id);
    my_card_place.addEventListener("mousemove", (e) => {
        const x = e.offsetX;
        const y = e.offsetY;
    });
    
});