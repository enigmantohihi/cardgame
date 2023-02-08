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
    init_state();
    for (const key of Object.keys(obj)) {
        if (key == "back_img_path") {
            back_img_path = obj.back_img_path;
        } else if (key == "main") {
            set_cards(obj.main.cards);
        } else if (key == "other") {
            set_cards(obj.other.cards, 1);
        }
    }
}

// 初期化
function init_state() {
    cards = [];
}


function set_cards(data:any, type:number=0) {
    for (const carddata of data) {      
        for (let i=0;i<carddata.count;i++) {
            const img_path = create_img_path_list(carddata)
            const card = new Card(id, "", img_path);

            cards.push(card);
            id++;
        }
    }
}

function create_img_path_list(carddata:any) {
    const img_path_list = 
        typeof(carddata.img_path)=="string" ? [carddata.img_path, back_img_path]
        : typeof(carddata.img_path)=="object" && carddata.img_path.length==1 ? [carddata.img_path[0], back_img_path]
        : carddata.img_path;
    return img_path_list;
}