# CardGameTool
[CardGameTool](https://cardgame-2efj.onrender.com/)

## デッキの作り方
[template.json](https://github.com/enigmantohihi/cardgame/blob/main/template.json) をダウンロードして  
**img_path**に使いたい画像のURL,**count**に枚数を入力します。  
mainは通常の山札でotherに記入すると最初から山札外に表示されます。  
``` template.json
{
    "back_img_path": "カードの裏面画像URL",
    "main": {
        "cards": [
            { "img_path": "画像URL", "count": "何枚使うか(半角整数)"},
            { "img_path": ["配列にすることで","複数指定できます"], "count": 2},
        ]
    },
    "other": {
        "cards": [
            { "img_path": [
                "",
                ""], "count": 0}
        ]
    }
}
```

## 操作方法
**マウス**
* 左クリックでカードの回転
* クリック長押しで移動

**キーボード**
* Aキー + マウス右クリックで表裏切り替え
* Sキー + マウス右クリックで裏面のカードの表面表示(自分にだけ見える)
* Zキー で選択したカードのズーム表示
