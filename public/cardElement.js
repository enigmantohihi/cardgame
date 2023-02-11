"use strict";
const my_cards = [];
const other_cards = [];
function create_card_elements(card_owner, cards) {
    for (const card of cards) {
        const elements = create_card_element(card);
        // 自分のプレイヤー番号とカードの所有者番号を比較して上と下どちらに配置するか計算
        const player_number = (my_number == "1P" || my_number == "Audience") ? "1P" : "2P";
        if (player_number == card_owner) {
            my_cards.push(elements);
            const card_place = document.getElementById(mycard_place_id);
            card_place.appendChild(elements.parent);
        }
        else {
            other_cards.push(elements);
            const card_place = document.getElementById(othercard_place_id);
            card_place.appendChild(elements.parent);
        }
    }
}
// Cardクラスからhtml要素生成
function create_card_element(card) {
    const element = document.createElement("div"); // 親要素
    const element_img = document.createElement("img"); // img要素
    const elements = { id: card.id, parent: element, img: element_img }; // interfaceにセット
    element.appendChild(element_img); // imgを親要素の子にする
    const player_number = (my_number == "1P" || my_number == "Audience") ? "1P" : "2P";
    element.id = `card${card.id}_${player_number}`;
    element.classList.add("card");
    add_border(element);
    element_img.className = "card_img";
    update_card_element(card, elements);
    return elements;
}
// 既に生成しているhtml要素のパラメータ更新
function update_card_element(card, elements) {
    set_element_size(elements.parent, card.parent_size);
    set_element_size(elements.img, card.img_size[card.mode]);
    set_element_mode(card, elements);
    set_element_pos(elements.parent, card.pos);
    set_element_visible(card, elements.parent);
    elements.img.src = card.img_path_list[card.mode];
}
// 山札と手札間でカードが移動したときに呼ぶ
function transport_card(cards) {
    // const player_number:PLAYER_NUMBER = (my_number=="1P" || my_number=="Audience")?"1P":"2P";
    for (const card of cards) {
        const id = card.id;
        const element = find_card_element(card.owner, id);
        if (element) {
            update_card_element(card, element);
        }
    }
}
// デッキと場の間の移動アニメーション
function move_animation(card, element) {
}
// カードのidと所有者idから検索
function find_card_element(owner, target_id) {
    const player_number = (my_number == "1P" || my_number == "Audience") ? "1P" : "2P";
    const element_list = (player_number == owner) ? my_cards : other_cards;
    for (const element of element_list) {
        if (target_id == element.id) {
            return element;
        }
    }
    return false; // 見つからなかったらfalseを返す
}
