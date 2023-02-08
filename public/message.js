"use strict";
const MESSAGES_HEIGHT = 100;
// 生成する要素のid名
const message_root_id = "message_root";
const message_list_id = "message_list";
const message_textbox_id = "message_textbox";
const send_message_button_id = "send_message_button";
//
window.addEventListener("load", () => {
    start_messages();
    off_messages();
});
function start_messages() {
    // root要素
    const root = document.getElementById(message_root_id);
    while (root.firstChild) {
        root.firstChild.remove();
    }
    ;
    create_message_grid(root);
}
function on_messages() {
    const root = document.getElementById(message_root_id);
    root.style.display = "block";
}
function off_messages() {
    const root = document.getElementById(message_root_id);
    root.style.display = "none";
}
function create_message_grid(root) {
    // 2列のGrid
    const row = document.createElement("div");
    row.classList.add("row");
    // 左列
    const col_left = document.createElement("div");
    col_left.classList.add("col-sm-8");
    row.appendChild(col_left);
    // 右列
    const col_right = document.createElement("div");
    col_right.classList.add("col-sm-4");
    row.appendChild(col_right);
    root.appendChild(row);
    create_message_list(col_left);
    create_send_form(col_right);
}
function create_message_list(root) {
    const parent = document.createElement("div");
    parent.classList.add("my-3");
    add_border(parent);
    const message_list = document.createElement("div");
    message_list.id = message_list_id;
    message_list.className = "overflow-auto";
    message_list.style.height = `${MESSAGES_HEIGHT}px`;
    parent.appendChild(message_list);
    root.appendChild(parent);
}
function create_send_form(root) {
    const parent = document.createElement("div");
    const send_form = document.createElement("div");
    send_form.style.height = `${MESSAGES_HEIGHT}px`;
    // メッセージテキストボックス
    const message_textbox = document.createElement("input");
    message_textbox.id = message_textbox_id;
    message_textbox.classList.add("form-control");
    message_textbox.classList.add("my-3");
    message_textbox.type = "text";
    message_textbox.placeholder = "メッセージ";
    send_form.appendChild(message_textbox);
    // 送信ボタン
    const send_message_button = document.createElement("button");
    send_message_button.id = send_message_button_id;
    send_message_button.type = "button";
    send_message_button.className = "btn btn-primary w-100";
    send_message_button.textContent = "送信";
    send_form.appendChild(send_message_button);
    parent.appendChild(send_form);
    root.appendChild(parent);
}
// メッセージリストに表示
function set_message_list(text) {
    const message_list = document.getElementById(message_list_id);
    const parent = document.createElement("div");
    parent.className = "mx-2";
    message_list.appendChild(parent);
    const message = document.createElement("p");
    message.className = "my-0";
    message.textContent = `${text}`;
    parent.appendChild(message);
    const send_time = document.createElement("p");
    send_time.className = "text-end my-0";
    const now = new Date();
    send_time.textContent = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    parent.appendChild(send_time);
    const hr = document.createElement("hr");
    hr.className = "my-0";
    parent.appendChild(hr);
}
// メッセージテキストボックスの内容の取得
function get_message_textbox() {
    const textbox = document.getElementById(message_textbox_id);
    return textbox;
}
// 送信ボタンの取得
function get_send_button() {
    const button = document.getElementById(send_message_button_id);
    return button;
}
// 文字が入力されていなかったり、空白のみだったりしたらtrueを返す
function is_text_space(text) {
    const result = (text == null || text == "" || text.match(/^[ 　\r\n\t]*$/));
    return result;
}
