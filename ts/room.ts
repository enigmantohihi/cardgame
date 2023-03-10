const ROOMS_OVERFLOW_HEIGHT: number = 600;

// 生成する要素のid名
const username_textbox_id = "username_textbox";
const roomname_textbox_id = "roomname_textbox";
const create_room_button_id = "create_room_button"

const rooms_overflow_id = "rooms_overflow";
const join_room_button_class = "join_room_button"
//


const rooms = [
    {room_name: "A", user_ids: ["1","",""]},
    {room_name: "A", user_ids: ["1","",""]},
    {room_name: "A", user_ids: ["1","",""]},
    {room_name: "A", user_ids: ["1","",""]},
    {room_name: "A", user_ids: ["1","",""]},
    {room_name: "A", user_ids: ["1","",""]},
    {room_name: "A", user_ids: ["1","",""]},
]

window.addEventListener("load",() => {
    start_room();
    off_room();
});

function start_room() {
    const root = <Element>document.getElementById("room_root");
    while (root.firstChild) { root.firstChild.remove();};
    create_grid(root);
}

function on_room() {
    const root = <HTMLElement>document.getElementById("room_root");
    root.style.display = "block";
}

function off_room() {
    const root = <HTMLElement>document.getElementById("room_root");
    root.style.display = "none";
}

function create_grid(root: Element) {
    // 2列のGrid
    const row = document.createElement("div");
    row.classList.add("row");

    // 左列
    const col_left = document.createElement("div");
    col_left.classList.add("col-sm-6");
    row.appendChild(col_left);

    // 右列
    const col_right = document.createElement("div");
    col_right.classList.add("col-sm-6");
    row.appendChild(col_right);

    root.appendChild(row);
    create_info_room(col_left);
    create_roomlist(col_right);
}


function create_info_room(root: Element) {
    const parent = document.createElement("div");

    // タイトル
    const title = document.createElement("h2");
    title.textContent = "部屋を作る";
    parent.appendChild(title);
    parent.appendChild(document.createElement("hr"));

    // ユーザー名テキストボックス
    const username_textbox = document.createElement("input");
    username_textbox.id = username_textbox_id;
    username_textbox.classList.add("form-control");
    username_textbox.classList.add("mb-2");
    username_textbox.type = "text";
    username_textbox.placeholder = "名前";
    parent.appendChild(username_textbox);

    // ルーム名テキストボックス
    const roomname_textbox = document.createElement("input");
    roomname_textbox.id = roomname_textbox_id;
    roomname_textbox.classList.add("form-control");
    roomname_textbox.classList.add("mb-2");
    roomname_textbox.type = "text";
    roomname_textbox.placeholder = "部屋の名前";
    parent.appendChild(roomname_textbox);

    // ルーム作成ボタン
    const create_room_button = document.createElement("button");
    create_room_button.id = create_room_button_id;
    create_room_button.type = "button";
    create_room_button.className = "btn btn-primary w-100";
    create_room_button.textContent = "部屋を作る";
    parent.appendChild(create_room_button);

    // 親要素に全て追加
    root.appendChild(parent);
}

function create_roomlist(root: Element) {
    const parent = document.createElement("div");
    
    const title = document.createElement("h2");
    title.classList.add("d-none");
    title.classList.add("d-sm-block");
    title.textContent = "ルーム一覧";
    parent.appendChild(title);
    parent.appendChild(document.createElement("hr"));

    // ルーム一覧を表示する親要素を生成
    const overflow = document.createElement("div");
    overflow.id = rooms_overflow_id;
    overflow.className = "overflow-auto";
    overflow.style.height = `${ROOMS_OVERFLOW_HEIGHT}px`;
    parent.appendChild(overflow);


    // 親要素に全て追加
    root.appendChild(parent);
}

function set_rooms(rooms:any[]) {
    const rooms_overflow = <HTMLElement>document.getElementById(rooms_overflow_id);
    while (rooms_overflow.firstChild) {rooms_overflow.firstChild.remove();};
    for (const room of rooms) {
        set_room(room, rooms_overflow);
    }
}

function set_room(room:any, parent:Element) {
    // 行作成
    const row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("m-1")
    add_border(row);

    // 左列
    const col_left = document.createElement("div");
    col_left.classList.add("col-6");
    const title = document.createElement("h4");
    title.textContent = room.roomname;
    const room_count_text = document.createElement("p");
    room_count_text.textContent = `人数:${room.user_ids.length}人`;
    col_left.appendChild(title);
    col_left.appendChild(room_count_text);
    row.appendChild(col_left);

    // 右列
    const col_right = document.createElement("div");
    col_right.classList.add("col-6");
    col_right.classList.add("my-4");
    const join_button = document.createElement("button");
    join_button.type = "button";
    join_button.className = "btn btn-primary w-100";
    join_button.classList.add(join_room_button_class);
    join_button.name = room.roomname;
    join_button.textContent = "参加";

    join_button.onclick = function() {
        join_room(room.roomname);
    }

    col_right.appendChild(join_button);
    row.appendChild(col_right);

    parent.appendChild(row);

}
/** ユーザー名を取得 */
function get_username() {
    const username_text_box = <HTMLInputElement>document.getElementById(username_textbox_id);
    const user_name = String(username_text_box.value);
    return user_name;
}
function set_username(name: string) {
    const username_text_box = <HTMLInputElement>document.getElementById(username_textbox_id);
    username_text_box.value = name;
}

/** ルーム名を取得 */
function get_roomname() {
    const roomname_text_box = <HTMLInputElement>document.getElementById(roomname_textbox_id);
    const room_name = String(roomname_text_box.value);
    return room_name;
}