const my_cards:CardElement[] = []; 
const other_cards:CardElement[] = [];

function create_card_elements(card_owner:PLAYER_NUMBER, cards:Card[]) {
    for (const card of cards) {
        const elements = create_card_element(card);

        // 自分のプレイヤー番号とカードの所有者番号を比較して上と下どちらに配置するか計算
        const player_number:PLAYER_NUMBER = (my_number=="1P" || my_number=="Audience")?"1P":"2P";
        if (player_number==card_owner) {
            my_cards.push(elements);
            const card_place = <HTMLElement>document.getElementById(mycard_place_id);
            card_place.appendChild(elements.parent);
        } else {
            other_cards.push(elements);
            const card_place = <HTMLElement>document.getElementById(othercard_place_id);
            card_place.appendChild(elements.parent);
        }
    }
}

// Cardクラスからhtml要素生成
function create_card_element(card:Card) {
    const element = document.createElement("div"); // 親要素
    const element_img = document.createElement("img") // img要素
    const elements: CardElement = { id:card.id, parent: element, img: element_img }; // interfaceにセット
    element.appendChild(element_img); // imgを親要素の子にする

    const player_number:PLAYER_NUMBER = (my_number=="1P" || my_number=="Audience")?"1P":"2P";
    element.id = `card${card.id}_${player_number}`;
    element.classList.add("card");
    add_border(element);
    element_img.className = "card_img"

    update_card_element(card, elements);
    return elements;
}

// 既に生成しているhtml要素のパラメータ更新
function update_card_element(card:Card, elements:CardElement) {
    set_element_size(elements.parent, card.parent_size);
    set_element_size(elements.img, card.img_size[card.mode]);
    set_element_angle(elements, reverse_cardAngle(card));
    set_element_mode(card, elements);
    set_element_pos(elements.parent, reverse_cardPos(card));
    set_element_visible(card, elements.parent);
    elements.img.src = card.img_path_list[card.mode];
}

// 山札と手札間でカードが移動したときに呼ぶ
function transport_card(cards: Card[], mode:number=0) {
    for (const card of cards) {
        const id = card.id;
        const element = find_card_element(card.owner, id);
        if (element) {
            update_card_element(card, element);
            // 山札要素の位置を取得
            const player_number:PLAYER_NUMBER = (my_number=="1P" || my_number=="Audience")?"1P":"2P";
            const deck_pos = <Position>((player_number==card.owner)?get_deck_pos(1):get_deck_pos(0));
            if (mode==0) {
                const start_pos = deck_pos;
                const end_pos = reverse_cardPos(card);
                move_animation(element.parent, start_pos, end_pos);
            } else {
                const parent = element.parent.parentElement;
                if (!parent) return;
                const clone = clone_element(card, parent);
                const start_pos = reverse_cardPos(card);
                const end_pos = deck_pos;
                move_animation(clone.parent, start_pos, end_pos);
            }
        }
    }
}

// デッキと場の間の移動アニメーション
function move_animation(element:HTMLElement, start_pos: Position, end_pos: Position){
    element.animate(
        [
            {"left":start_pos.x + "px", "top":start_pos.y + "px"},
            {"left":end_pos.x + "px", "top":end_pos.y + "px"},
        ],
        {
            duration: 200,
        });
}

// カードのidと所有者idから検索
function find_card_element(owner:PLAYER_NUMBER, target_id:number) {
    const player_number:PLAYER_NUMBER = (my_number=="1P" || my_number=="Audience")?"1P":"2P";
    const element_list = (player_number==owner)? my_cards:other_cards;
    for (const element of element_list) {
        if (target_id==element.id) {
            return element;
        }
    }
    return false; // 見つからなかったらfalseを返す
}

function clone_element(card:Card, parent:HTMLElement) {
    console.log("clone");
    const clone = create_card_element(card);
    clone.parent.classList.remove("d-none")
    parent.appendChild(clone.parent);
    window.setTimeout(function() {
        console.log("animation終了")
        clone.parent.remove();
    }, 200);
    return clone;
}