// 生成する要素のid名
const input_file_root_id = "input_file_root";
const input_file_id = "input_file";
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
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.id = input_file_id;
    parent.appendChild(input);
}