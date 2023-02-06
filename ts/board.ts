const BOARD_SIZE: Size = { width:800, height:500 };
const BOARD_POS: Position = { x:0, y:0 };

const SCREEN_SIZE: Size = { width:600, height:500 };
const SCREEN_POS: Position = { x:0, y:0 };

const UIROOT_SIZE: Size = { width:100, height:500};
const UIROOT_POS: Position = { x:625, y:0 };

const DECK_SIZE: Size = { width:90, height:125.72 };
const DECK_POS: Position = { x:480, y:20 };

// 生成する要素のid名
const deck_index_input = "draw_index_input";
const draw_radio = "draw_radio";
const draw_button = "draw_button";

const back_index_input = "back_index_input";
const back_radio = "back_radio";
const back_button = "buck_button";

const show_radio = "show_radio";
const show_button = "show_button";
const deck_list_modal = "deck_list_modal";
const modal_selected_button = "modal_selected_button";

const zoom_overlay = "zoom_overlay";
const zoom_img = "zoom_img";
//

window.addEventListener("load",() => {
    start_board();
});

function start_board() {
    // root要素
    const root = document.getElementsByClassName("container")[0];
    create_board(root,0);
    root.appendChild(document.createElement("hr"));
    create_board(root,1);
}

function create_board(root:Element, type:number=0) {
    // board要素
    const board = document.createElement("div");
    board.classList.add("board");
    // add_border(board);
    set_element_pos(board, BOARD_POS);
    set_element_size(board, BOARD_SIZE);
    root.appendChild(board);

    // screen要素
    const screen = document.createElement("div");
    screen.classList.add("screen");
    add_border(screen);
    const screen_pos = (type==1)?SCREEN_POS:reverse_pos(BOARD_SIZE,SCREEN_SIZE,SCREEN_POS,false,true);
    set_element_pos(screen, screen_pos);
    set_element_size(screen, SCREEN_SIZE);
    board.appendChild(screen);
    console.log("screen pos=", get_element_pos(screen));

    // UI要素
    const ui_root = document.createElement("div");
    ui_root.classList.add("ui_root");
    add_border(ui_root);
    const uiroot_pos = (type==1)?UIROOT_POS:reverse_pos(BOARD_SIZE,UIROOT_SIZE,UIROOT_POS,false,true);
    set_element_pos(ui_root, uiroot_pos);
    set_element_size(ui_root, UIROOT_SIZE);
    board.appendChild(ui_root);
    if (type==1) {
        create_ui(ui_root);
        create_decklist_modal(root);
        create_overlay(root);
    }
    // デッキ要素
    const deck = document.createElement("div");
    deck.id = `deck${type}`;
    deck.classList.add("deck");
    add_border(deck);
    const deck_pos = (type==1)?DECK_POS:reverse_pos(SCREEN_SIZE,DECK_SIZE,DECK_POS);
    set_element_pos(deck, deck_pos);
    set_element_size(deck, DECK_SIZE);
    screen.appendChild(deck);
    console.log("deck pos=", get_element_pos(deck));
}

function create_ui(ui_root:Element) {
    const parent = document.createElement("div");
    parent.classList.add("text-center");
    create_input_number(parent, deck_index_input);
    create_radio(parent, draw_radio, "表", "裏");
    create_button(parent, draw_button, "引く");
    parent.appendChild(document.createElement("hr"));

    create_input_number(parent, back_index_input);
    create_radio(parent, back_radio, "上", "下");
    create_button(parent, back_button, "戻す");
    parent.appendChild(document.createElement("hr"));

    create_radio(parent, show_radio, "表", "裏");
    create_button(parent, show_button, "一覧", true);

    ui_root.appendChild(parent);
}

function create_input_number(parent:Element, name:string) {
    const p = document.createElement("p");
    p.textContent = "何番目";
    p.classList.add("mb-0");
    const input = document.createElement("input");
    input.type = "number";
    input.id = name;
    input.className = "w-50 text-center";
    parent.appendChild(p);
    parent.appendChild(input);
}
function create_radio(parent:Element, name:string, text1:string, text2:string) {
    const radio_parent = document.createElement("div");
    radio_parent.className = "w-50 mx-3";

    const radio = function(checked:boolean, id:number, text:string) {
        const form = document.createElement("div");
        form.className = "form-check";
        const input = document.createElement("input");
        input.id = name+id;
        input.className = "form-check-input";
        input.type = "radio";
        input.name = name;
        input.checked = checked;
        const label = document.createElement("label");
        label.className = "form-check-label";
        label.textContent = text;
        form.appendChild(input);
        form.appendChild(label);
        return form;
    }
    const radio1 = radio(true, 0, text1);
    const radio2 = radio(false, 1, text2);
    radio_parent.appendChild(radio1);
    radio_parent.appendChild(radio2);
    parent.appendChild(radio_parent);
}
function create_button(parent:Element, name:string, text:string, modal:boolean=false) {
    if (modal) {
        const div = document.createElement("div");
        const button = 
            `<button id="${name}" type="button" class="btn btn-primary w-80 mb-1" data-bs-toggle="modal" data-bs-target="#${deck_list_modal}">${text}</button>`;
        div.innerHTML = button;
        parent.appendChild(div);
    } else {
        const button = document.createElement("button");
        button.id = name;
        button.type = "button";
        button.className = "btn btn-primary w-80 mb-1";
        button.textContent = text;
        parent.appendChild(button);
    }
}

function create_decklist_modal(parent:Element) {
    const div = document.createElement("div");
    const label = "deck_list_modal_label";
    const modal = 
        ` <div class="modal fade" id="${deck_list_modal}" tabindex="-1" data-bs-backdrop="static" aria-labelledby="${label}" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="${label}">デッキ内リスト</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span class="d-inline">←先頭</span>
                        <span class="d-inline">後尾→</span>
                    </div>
                    <div class="modal-body">
                        <div id="modal_card_parent" class="d-inline-flex align-items-center">
                        </div>
                    </div>
                    <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button id="${modal_selected_button}" type="button" class="btn btn-primary" data-bs-dismiss="modal">完了</button>
                    </div>
                </div>
            </div>
        </div>`
        div.innerHTML = modal;
        parent.appendChild(div);
}
function create_overlay(parent:Element) {
    const overlay = document.createElement("div");
    overlay.id = zoom_overlay;
    overlay.className = "zoom_overlay";
    const img = document.createElement("img");
    img.id = zoom_img;
    img.className = "zoom_img";
    overlay.appendChild(img);
    parent.appendChild(overlay);
}

function add_border(element:HTMLElement) {
    element.classList.add("bg-light");
    element.classList.add("border");
    element.classList.add("border-2");
    element.classList.add("border-dark");
    element.classList.add("rounded");
}

// 要素のページ内の絶対位置を取得
function get_element_pos(element:HTMLElement) {
    const x = element.getBoundingClientRect().left + window.pageXOffset;
    const y = element.getBoundingClientRect().top + window.pageYOffset;
    const pos:Position = {x:x, y:y};
    return pos;
}
function set_element_pos(element:HTMLElement, pos:Position) {
    element.style.left = `${pos.x}px`;
    element.style.top = `${pos.y}px`;
}
function set_element_size(element:HTMLElement, size:Size) {
    element.style.width = `${size.width}px`;
    element.style.height = `${size.height}px`;
}

// 親要素内での位置の逆転
function reverse_pos(parent_size:Size, this_size:Size, this_pos:Position, reverse_x:boolean=true, reverse_y:boolean=true):Position {
    const x = (reverse_x)?(parent_size.width-this_size.width)-this_pos.x : this_pos.x;
    const y = (reverse_y)?(parent_size.height-this_size.height)-this_pos.y: this_pos.y;
    return {x,y};
}

function get_deck_pos(id:number) {
    const deck = <HTMLElement>document.getElementById(`deck${id}`);
    console.log("deck pos=", get_element_pos(deck));
    return get_element_pos(deck);
}