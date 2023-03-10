const BOARD_SIZE: Size = { width:800, height:480 };
const BOARD_POS: Position = { x:0, y:0 };

const SCREEN_SIZE: Size = { width:600, height:480 };
const SCREEN_POS: Position = { x:0, y:0 };

const UIROOT_SIZE: Size = { width:100, height:480};
const UIROOT_POS: Position = { x:625, y:0 };

const DECK_SIZE: Size = { width:90, height:125.72 };
const DECK_POS: Position = { x:480, y:20 };

const HAND_SIZE: Size = { width:SCREEN_SIZE.width, height:150 };
const HAND_POS: Position = { x:0, y:SCREEN_SIZE.height-HAND_SIZE.height};

// 生成する要素のid名
const board_root_id = "board_root";

const mycard_place_id = "my_card_place";
const othercard_place_id = "other_card_place";

const deck_id = "deck";
const deck_count_text_id = "deck_count_text";

const shuffle_button_id = "shuffle_button";

const deck_index_input_id = "draw_index_input";
const draw_radio_id = "draw_radio";
const draw_button_id = "draw_button";

const back_index_input_id = "back_index_input";
const back_radio_id = "back_radio";
const back_button_id = "buck_button";

const show_radio_id = "show_radio";
const show_button_id = "show_button";
const deck_list_modal_id = "deck_list_modal";
const modal_card_parent_id = "modal_card_parent";
const modal_selected_button_id = "modal_selected_button";

const zoom_overlay_id = "zoom_overlay";
const zoom_img_id = "zoom_img";

const show_front_id = "look_front";
//

window.addEventListener("load",() => {
    start_board();
    off_board();
});

function start_board() {
    // root要素
    const root = <Element>document.getElementById(board_root_id);
    while (root.firstChild) { root.firstChild.remove();};
    create_board(root,0);
    root.appendChild(document.createElement("hr"));
    create_board(root,1);
    root.appendChild(document.createElement("hr"));
}
function on_board() {
    const root = <HTMLElement>document.getElementById(board_root_id);
    root.style.display = "block";
}

function off_board() {
    const root = <HTMLElement>document.getElementById(board_root_id);
    root.style.display = "none";
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

    // UI要素
    const ui_root = document.createElement("div");
    ui_root.classList.add("ui_root");
    add_border(ui_root);
    const uiroot_size = (type==1)?UIROOT_SIZE:{width:100,height:SCREEN_SIZE.height} as Size;
    set_element_size(ui_root, uiroot_size);
    const uiroot_pos = (type==1)?UIROOT_POS:reverse_pos(BOARD_SIZE,uiroot_size,UIROOT_POS,false,true);
    set_element_pos(ui_root, uiroot_pos);
    
    board.appendChild(ui_root);
    if (type==1) {
        create_ui(ui_root);
        create_decklist_modal(root);
        create_overlay(root);
    }
    // デッキ要素
    const deck = document.createElement("div");
    deck.id = `${deck_id}${type}`;
    deck.classList.add("deck");
    add_border(deck);
    const deck_pos = (type==1)?DECK_POS:reverse_pos(SCREEN_SIZE,DECK_SIZE,DECK_POS);
    set_element_pos(deck, deck_pos);
    set_element_size(deck, DECK_SIZE);
    const deck_parent = document.createElement("div");
    deck_parent.className = "h-50 my-1 text-center";
    const deck_text = document.createElement("p");
    deck_text.className = "mt-3";
    deck_text.textContent = "残り";
    const count_text = document.createElement("p");
    count_text.id = deck_count_text_id+type;
    count_text.textContent = "枚";
    deck_parent.appendChild(deck_text);
    deck_parent.appendChild(count_text);
    deck.appendChild(deck_parent);
    screen.appendChild(deck);

    //カード設置場所
    const card_place = document.createElement("div");
    card_place.classList.add("card_place");
    card_place.classList.add("w-100");
    card_place.classList.add("h-100");
    card_place.id = (type==0)? othercard_place_id: mycard_place_id; //`${card_place_id}${type}`;
    screen.appendChild(card_place);

    // 手札置き場(相手の手札置き場は見えないようにする)
    const hand_place = document.createElement("div");
    hand_place.classList.add("hand_place");
    hand_place.classList.add("bg-primary");
    hand_place.style.zIndex = (type==1)? "0":"2";
    add_border(hand_place,1);
    set_element_size(hand_place, HAND_SIZE);
    const hand_pos = (type==1)?HAND_POS:reverse_pos(SCREEN_SIZE,HAND_SIZE,HAND_POS);
    set_element_pos(hand_place, hand_pos);
    screen.appendChild(hand_place);
}

function create_ui(ui_root:Element) {
    const parent = document.createElement("div");
    parent.classList.add("text-center");

    // シャッフルボタン
    const shuffle_button = create_button(parent,shuffle_button_id,"シャッフル");
    shuffle_button.classList.add("mt-2");
    shuffle_button.style.height = "50%";
    shuffle_button.style.fontSize = "60%"
    shuffle_button.onclick = function() {shuffle_call();};
    create_hr(parent,0,2);

    const deck_index_input = create_input_number(parent, deck_index_input_id);
    deck_index_input.oninput = function(){ set_input_index(deck_index_input)};
    set_input_index(deck_index_input)
    create_radio(parent, draw_radio_id, "表", "裏");
    const draw_button = create_button(parent, draw_button_id, "引く");
    draw_button.onclick = function() { draw_card();}
    create_hr(parent,0,2);

    const back_index_input = create_input_number(parent, back_index_input_id);
    back_index_input.oninput = function(){ set_input_index(back_index_input)};
    set_input_index(back_index_input);
    create_radio(parent, back_radio_id, "上", "下");
    const back_button = create_button(parent, back_button_id, "戻す");
    back_button.onclick = function() { back_card();}
    create_hr(parent,0,2);

    create_radio(parent, show_radio_id, "表", "裏");
    const show_button = create_button(parent, show_button_id, "一覧", true);
    ui_root.appendChild(parent);
}
function create_hr(parent:Element, mx:number=0, my:number=0) {
    const hr = document.createElement("hr");
    hr.className = `mx-${mx} my-${my}`;
    parent.appendChild(hr);
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
    return input;
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
function create_button(parent:Element, id:string, text:string, modal:boolean=false) {
    if (modal) {
        const div = document.createElement("div");
        const button = 
            `<button id="${id}" type="button" class="btn btn-primary w-80" onclick="show_decks_call()" data-bs-toggle="modal" data-bs-target="#${deck_list_modal_id}">${text}</button>`;
        div.innerHTML = button;
        parent.appendChild(div);
        return div;
    } else {
        const button = document.createElement("button");
        button.id = id;
        button.type = "button";
        button.className = "btn btn-primary w-80";
        button.textContent = text;
        parent.appendChild(button);
        return button;
    }
}

function create_decklist_modal(parent:Element) {
    const div = document.createElement("div");
    const label = "deck_list_modal_label";
    const modal = 
        ` <div class="modal fade" id="${deck_list_modal_id}" tabindex="-1" data-bs-backdrop="static" aria-labelledby="${label}" aria-hidden="true">
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
                        <div id="${modal_card_parent_id}" class="d-inline-flex align-items-center">
                        </div>
                    </div>
                    <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button id="${modal_selected_button_id}" type="button" onclick="selected_draw()" class="btn btn-primary" data-bs-dismiss="modal">完了</button>
                    </div>
                </div>
            </div>
        </div>`
        div.innerHTML = modal;
        parent.appendChild(div);
}
function create_overlay(parent:Element) {
    const overlay = document.createElement("div");
    overlay.id = zoom_overlay_id;
    overlay.className = "zoom_overlay";
    const img = document.createElement("img");
    img.id = zoom_img_id;
    img.className = "zoom_img";
    overlay.appendChild(img);
    parent.appendChild(overlay);
}
function zoom_card(img_path:string) {
    const overlay = <HTMLElement>document.getElementById(zoom_overlay_id);
    overlay.style.left = `${window.pageXOffset}px`;
    overlay.style.top = `${window.pageYOffset}px`;
    overlay.style.display = "block";
    overlay.onclick = function() { overlay.style.display = "none";}
    const img = <HTMLImageElement>document.getElementById(zoom_img_id);
    img.src = img_path;
}

function add_border(element:HTMLElement, width:number=2) {
    element.classList.add("border");
    element.classList.add(`border-${width}`);
    element.classList.add("border-dark");
    element.classList.add("rounded");
}

// 要素のページ内の絶対位置を取得
function get_element_AbsolutePos(element:HTMLElement) {
    const x = element.getBoundingClientRect().left + window.pageXOffset;
    const y = element.getBoundingClientRect().top + window.pageYOffset;
    const pos:Position = {x:x, y:y};
    return pos;
}
function get_element_RelativePos(element:HTMLElement) {
    const parentElemnt = <HTMLElement>element.parentElement;
    if (!parentElemnt) return;
    const parent_pos = get_element_AbsolutePos(parentElemnt);
    const this_pos = get_element_AbsolutePos(element);
    const x = this_pos.x - parent_pos.x;
    const y = this_pos.y - parent_pos.y;
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

// オリジナルの画像の幅と高さを取得
function get_img_size(element: any) {
    const width = element.naturalWidth;
    const height = element.naturalHeight;
    const size = {width: width, height: height};
    return size;
};
const aspects:Size[] = [
    {width:90, height:125.72}, // 0.725
    {width:125.72, height:90}, // 1.37
    {width:125.72, height:270} // 0.45
]
// オリジナル画像の幅,高さの比率から一番近い比率の幅,高さを返す
function get_near_aspect(width: number, height: number) {
    let near_diff = 0;
    let result = aspects[0];
    const rate = width / height;

    let i=0;
    for (const aspect of aspects) {
        const diff = Math.abs((rate) - (aspect.width/aspect.height));
        if (i==0) {
            near_diff = diff;
            result = aspect;
        }
        if (diff < near_diff) {
            near_diff = diff;
            result = aspect;
        }
        i++;
    }
    return result;
}
function get_aspect(element: HTMLElement) {
    const img_size: any = get_img_size(element);
    const element_size = get_near_aspect(img_size.width, img_size.height);
    return element_size;
}

// 親要素内での位置の逆転
function reverse_pos(parent_size:Size, this_size:Size, this_pos:Position, reverse_x:boolean=true, reverse_y:boolean=true):Position {
    const x = (reverse_x)?(parent_size.width-this_size.width)-this_pos.x : this_pos.x;
    const y = (reverse_y)?(parent_size.height-this_size.height)-this_pos.y: this_pos.y;
    return {x,y};
}

function get_deck_pos(id:number) {
    const deck = <HTMLElement>document.getElementById(`deck${id}`);
    console.log("deck pos=", get_element_RelativePos(deck));
    return get_element_RelativePos(deck);
}
function set_element_visible(card:Card, element:HTMLElement) {
    if (card.visible) element.classList.remove("d-none");
    else element.classList.add("d-none");
}
function set_element_angle(elements:CardElement, angle:number) {
    elements.img.style.transform = `rotate(${angle}deg)`;
}
// 角度やモードチェンジしたときの画像をもとにカードのサイズ計算,更新
function set_element_mode(card:Card, elements:CardElement) {
    const img_size = card.img_size[card.mode];
    const angle = card.angle;
    // elements.img.style.transform = `rotate(${angle}deg)`;
    if (angle==90) {
        set_element_size(elements.parent, {width:img_size.height, height:img_size.width});
        const n = (img_size.width < img_size.height)?1:-1;
        const x = n*(Math.abs(img_size.width-img_size.height)/2);
        const y = n*(-Math.abs(img_size.width-img_size.height)/2);
        set_element_pos(elements.img, {x:x,y:y});
    } else {
        set_element_size(elements.parent, img_size);
        set_element_pos(elements.img, {x:0,y:0});
    }
}

function set_input_index(input:HTMLInputElement) {
    const value = Number(input.value);
    if (value <= 0) {
        input.value = String(mydeck_count);
    } else if (mydeck_count < value) {
        input.value = String(1);
    }
}
function adjust_input(input_element: HTMLInputElement) {
    const value = Number(input_element.value);
    if (value <= 0) {
        input_element.value = "1";
    } else if (mydeck_count < value) {
        input_element.value = String(mydeck_count);
    }
}

function reverse_cardPos(card:Card): Position {
    const player_number:PLAYER_NUMBER = (my_number=="1P" || my_number=="Audience")?"1P":"2P";
    const isMy = (card.owner==player_number);
    if (!isMy) {
        const x = SCREEN_SIZE.width - card.pos.x - card.parent_size.width;
        const y = SCREEN_SIZE.height - card.pos.y - card.parent_size.height;
        return {x:x, y:y};
    }
    return {x:card.pos.x, y:card.pos.y};
}
function reverse_cardAngle(card:Card) {
    const player_number:PLAYER_NUMBER = (my_number=="1P" || my_number=="Audience")?"1P":"2P";
    const isMy = (card.owner==player_number);
    if (!isMy) {
        const angle = card.angle+180;
        return angle;
    }
    return card.angle;
}