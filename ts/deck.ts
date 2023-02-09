// 生成する要素のid名
const input_file_root_id = "input_file_root";
const input_file_id = "input_file";
//

//

let id = 0;
let back_img_path = "https://pics.prcm.jp/0be3ee414924e/71891496/jpeg/71891496.jpeg";
//

window.addEventListener("load",() => {
    start_input_file();
    off_input_file();
});
function start_input_file() {
    // root要素
    const root = <Element>document.getElementById(input_file_root_id);
    while (root.firstChild) { root.firstChild.remove();};
    create_input_file(root);
}
function on_input_file() {
    const root = <HTMLElement>document.getElementById(input_file_root_id);
    root.style.display = "block";
}

function off_input_file() {
    const root = <HTMLElement>document.getElementById(input_file_root_id);
    root.style.display = "none";
}

function create_input_file(parent:Element) {
    // デッキファイル入力
    const input_file = document.createElement("input");
    input_file.type = "file";
    input_file.accept = ".json";
    input_file.id = input_file_id;
    input_file.onchange = selected_file;
    parent.appendChild(input_file);
}

function selected_file() {
    const input_file: HTMLInputElement = <HTMLInputElement>document.getElementById(input_file_id);
    const files: FileList | null = input_file.files;
    if (files) {
        for (const file of files) {
            reader.readAsText(file);
        }
    }
}   

// ファイル読み込みのやつを読み込み
const reader = new FileReader();
// ファイル読み込み時の処理
reader.onload = function(e) {
    const data = (e.target as any).result;
    const obj = JSON.parse(data);
    console.log("obj = ", obj);

    for (const key of Object.keys(obj)) {
        if (key == "back_img_path") {
            back_img_path = obj.back_img_path;
        } else if (key == "main") {
            my_cards.decks = set_cards(obj.main.cards);
        } else if (key == "other") {
            my_cards.hands = set_cards(obj.other.cards, 1);
        }
    }
 
    const player_number = (socket_id=="")?get_player_number(socket_id):0;
    const send_data = {player:player_number, cards:my_cards};
    if (socket) socket.emit("set_cards", send_data);

    let count = 0;
    for (const card of my_cards.hands) {
        const x = 45 * ((count%2==0)?0:1) + SCREEN_POS.x;
        const y = Math.floor(count/2) * 63 + SCREEN_POS.y;
        card.move(x,y,1);
        set_card_element(card);
        count++;
    }
}


function set_cards(obj:any, type:number=0) {
    const cards:Card[] = [];
    for (const carddata of obj) {      
        for (let i=0;i<carddata.count;i++) {
            const img_path_list = create_img_path_list(carddata);
            const cardPram:CardPram = set_cardParam(id, player_number, img_path_list)
            const card = new Card(cardPram);

            if (type==0) cards.push(card);
            else cards.push(card);
            id++;
        }
    }
    return cards;
}

function set_cardParam(id:number, player_number:PLAYER_NUMBER, img_path_list:string[]) {
    const cardParam:CardPram = {
        id: id,
        owner: player_number, // カード所有者ID
        visible: false, //trueのとき表示
        pos: {x:0,y:0},
        parent_size: {width:0,height:0},
        img_size: {width:0,height:0},
        angle: 0,
        mode: 0, // どのimgを表示するかのindex
        img_path_list: img_path_list
    }
    return cardParam;
}

function create_img_path_list(carddata:any) {
    const img_path_list = 
        typeof(carddata.img_path)=="string" ? [carddata.img_path, back_img_path]
        : typeof(carddata.img_path)=="object" && carddata.img_path.length==1 ? [carddata.img_path[0], back_img_path]
        : carddata.img_path;
    return img_path_list;
}