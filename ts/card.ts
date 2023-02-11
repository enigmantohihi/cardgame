interface Position { x: number, y: number }
interface Size { width: number, height: number }
interface CardElement { id:number, parent: HTMLElement, img: HTMLImageElement }
interface Cards { decks: Card[], hands: Card[] }
type PLAYER_NUMBER = "1P" | "2P" | "Audience";
type CardAction = "Move" | "Rotate" | "ChangeMode" | "Select" | "Release";
type CardEvent = "Draw" | "Back";
/*
player_number:PLAYER_NUMBER,
action:Action,
pos: {x,y},
other: ... {Actionによってことなる}
*/
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
}

let mouse_pos:Position = {x:0,y:0};
const keys = {
    A: false,
}
let selected_card: Card | null; // 選択したカード
let selecting_card: Card | null; // 選択中のカード

// サーバにカード情報保持
// 最初にまずカード要素前作成
// 要素全部非表示 -> handsの中にあるカードだけ表示する

window.addEventListener("load",() => {
    const my_card_place = <HTMLElement>document.getElementById(mycard_place_id);
    my_card_place.addEventListener("mousedown", mouse_down);
    my_card_place.addEventListener("mousemove", mouse_move);
    my_card_place.addEventListener("mouseup", mouse_up);
    document.addEventListener("keypress", key_press);
    document.addEventListener("keyup", key_up);
    
});

function mouse_down(e:any) {
    const x = e.pageX;
    const y = e.pageY;
    const offset_pos = offsetPos(x,y);
    mouse_pos = offset_pos;
    if (keys.A) {
        console.log("change mode call");
        const send_data = {
            player_number:my_number,
            action: "ChangeMode" as CardAction,
            pos: {x:offset_pos.x, y:offset_pos.y}
        }
        socket.emit("receive_action", send_data);
    }
    console.log("select call");
        const send_data = {
            player_number:my_number,
            action: "Select" as CardAction,
            pos: {x:offset_pos.x, y:offset_pos.y}
        }
        socket.emit("receive_action", send_data);
}
function mouse_move(e:any) {
    const x = e.pageX;
    const y = e.pageY;
    const offset_pos = offsetPos(x,y);
    console.log("move call");
    const send_data = {
        player_number:my_number,
        action: "Move" as CardAction,
        pos: {x:offset_pos.x, y:offset_pos.y}
    }
    socket.emit("receive_action", send_data);
}
function mouse_up(e:any) {
    const x = e.pageX;
    const y = e.pageY;
    const offset_pos = offsetPos(x,y);

    // マウスを押したところから動かさずにupしていたらRotateイベント呼ぶ
    if (mouse_pos.x == offset_pos.x && mouse_pos.y == offset_pos.y && !keys.A) {
        console.log("rotate call");
        const send_data = {
            player_number:my_number,
            action: "Rotate" as CardAction,
            pos: {x:offset_pos.x, y:offset_pos.y}
        }
        socket.emit("receive_action", send_data);
    }

    // マウス離した時に選択中カードの解除イベント呼ぶ
    console.log("release call");
    const send_data = {
        player_number:my_number,
        action: "Release" as CardAction,
        pos: {x:offset_pos.x, y:offset_pos.y}
    }
    socket.emit("receive_action", send_data);
}
function key_press(e: any) {
    if(e.key === 'a' || e.key === 'A'){
        keys.A = true;
    } else if(e.key === 'z' || e.key === 'Z'){
        // if(selected_card)zoom_card(selected_card.display());
    }
}
function key_up(e: any) {
    if(e.key === 'a' || e.key === 'A'){
        keys.A = false;
    } else if(e.key === 'z' || e.key === 'Z'){
        const overlay = <HTMLElement>document.getElementById(zoom_overlay_id);
        if(overlay.style.display == "block") overlay.style.display = "none";
    }
}

// 自分のカード置き場要素の中のマウスの相対的な座標を求める
//(card_place要素の左上角が{x:0,y:0}となるようにする)
function offsetPos(x:number, y:number) {
    const card_place = <HTMLElement>document.getElementById(mycard_place_id);
    const card_place_pos = get_element_pos(card_place);
    const result:Position = {
        x: x - card_place_pos.x,
        y: y - card_place_pos.y
    }
    return result;
}

function draw_card() {
    const deck_index_input = <HTMLInputElement>document.getElementById(deck_index_input_id);
    const radio1 = <HTMLInputElement>document.getElementById(draw_radio_id+0);
    const radio2 = <HTMLInputElement>document.getElementById(draw_radio_id+1);
    const index = Number(deck_index_input.value)-1;
    const front = (radio1.checked)?true:false;
    
    // serverに送信
}
function back_card() {
    const back_index_input = <HTMLInputElement>document.getElementById(back_index_input_id);
    const radio1 = <HTMLInputElement>document.getElementById(back_radio_id+0);
    const radio2 = <HTMLInputElement>document.getElementById(back_radio_id+1);
    const offset = (radio1.checked)?-1:0;
    const index = Number(back_index_input.value) + offset; // 何番目に戻すか

    // serverに送信
}

function updata_states() {

}