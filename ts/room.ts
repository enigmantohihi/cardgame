// 生成する要素のid名
const username_textbox_id = "username_textbox";


window.addEventListener("load",() => {
    start_room();
});

function start_room() {
    const root = <Element>document.getElementById("room_root");
    while (root.firstChild) { root.firstChild.remove();};

}

function off_room() {
    const root = <Element>document.getElementById("room_root");
    while (root.firstChild) { root.firstChild.remove();};
}


function create_create_room(parent: Element) {
    const div = document.createElement("div");
    const username_textbox = document.createElement("input");
    username_textbox.id = username_textbox_id;
}