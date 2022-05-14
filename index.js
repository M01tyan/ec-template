const carts = []
$(() => {
    // 商品詳細画面を追加
    items.forEach((item, index) => {
        const isShowCartWindow = $('.cart').css('display') === "block"
        const detailItemElement = $(`
            <div class="content-detail" id="detail-${index}" style="width: ${isShowCartWindow ? '46%' : '60%'}">
                <img src="assets/images/${item.image}" />
                <div class="item-title">
                    <h1>${item.title}</h1>
                    <p>${item.sub_title}</p>
                </div>
                <h1 class="item-price">¥${item.price.toLocaleString()}</h1>
                <div class="detail-info">
                    <span>詳細情報</span>
                    <div class="detail-box">
                    </div>
                </div>
                <div class="add-cart-button">カートに追加</div>
            </div>
        `)
        if (index > 0) { detailItemElement.hide() }
        let detailTags = []
        for (const [key, value] of Object.entries(item.details)) {
            detailTags.push(`
                <div class="detail-item">
                    <span>${key}</span>
                    <p>${value}</p>
                </div>
            `)
        }
        detailItemElement.find('.detail-box').append(detailTags.join(""))
        $('.content').append(detailItemElement)
    })
    // リストを追加
    buildItemElement(items)

    // カートを空にする
    $('.cart > div > a').on('click', (event) => {
        $('.cart > div > p')[0].innerText = `選択中（0）`
        $('.cart > div > span')[0].innerText = `合計金額：¥0`
        $('.cart-item').remove()
        $('.checkbox > img').remove()
        $('.add-cart-button').css({
            color: '#536FCA',
            backgroundColor: '#FFFFFF',
            border: '1px solid #536FCA',
        })
        $('.add-cart-button').hover(
            () => $('.add-cart-button').css({
                color: '#FFFFFF',
                backgroundColor: '#536FCA'
            }),
            () => $('.add-cart-button').css({
                color: '#536FCA',
                backgroundColor: '#FFFFFF'
            })
        )
        $('.add-cart-button').html('カートに追加')
        hideCartWindow()
        carts.length = 0
    })

    // リストのフィルター機能
    $('.filter-header label').on('click', (event) => {
        const parentElement = $(event.currentTarget.parentElement)
        parentElement.find('label').removeClass('active')
        $(event.currentTarget).addClass('active')
        const genre = parentElement.attr('class')
        const filter = event.currentTarget.innerText
        switch (genre) {
            case 'sale-filter':
                break;
            case 'category-filter':
                const filterItems = filter !== "すべて" ? items.filter((item, index) => {
                    return item.categories.includes(filter)
                }) : items
                buildItemElement(filterItems)
                break;
        }
    })
})

// リストを描写
function buildItemElement(showItems) {
    $('.list-item').remove()
    showItems.forEach( (item, index) => {
        const isAppendedCart = carts.find(itemIndex => items[itemIndex].title === item.title)
        const cartIndex = items.findIndex(it => it.title === item.title)
        const listItemElement = $(`
            <div class="list-item" id="list-${cartIndex}">
                <label class="checkbox">${isAppendedCart === undefined ? '' : '<img src="assets/images/check.svg" />'}</label>
                <img src="assets/images/${item.image}" />
                <div class="item-title">
                    <h2>${item.title}</h2>
                    <p>${item.sub_title}</p>
                </div>
                <div class="item-price">¥${item.price.toLocaleString()}</div>
            </div>
        `)
        $('.content .list').append(listItemElement)
    })

    $('.list-item').on('click', (event) => {
        $('.list-item').css('border', '')
        event.currentTarget.style = "border: 2px solid #7B91D7; box-sizing: border-box;"
        const index = new RegExp("^list-([0-9]+)$").exec(event.currentTarget.id)[1]
        $(`.content-detail`).hide()
        $(`#detail-${index}`).show()
    })

    $('.checkbox, .add-cart-button').on('click', (event) => {
        const matches = new RegExp("^(list|detail)-([0-9]+)$").exec(event.currentTarget.parentElement.id)
        const itemIndex = matches[2]
        const addCartButton = $(`#detail-${itemIndex}`).find('.add-cart-button')
        if (!carts.includes(itemIndex)) {
            carts.push(itemIndex)
            const checkImage = $(`<img />`, {
                src: "assets/images/check.svg"
            })
            addCartButton.css({
                backgroundColor: '#A5A5A5',
                border: '1px solid #A5A5A5',
                color: '#FFFFFF'
            })
            addCartButton.off('mouseenter mouseleave')
            addCartButton.html('追加済み')
            checkImage.appendTo($(`#list-${itemIndex}`).find('.checkbox'))
            buildCartElement()
            showCartWindow()
        } else {
            removeItem(event)
            buildCartElement()
        }
    })
}

// カートを描写
function buildCartElement() {
    // 一度カートの中を空にする
    $('.cart-item').remove()
    const totalPrice = items.reduce((sum, item, index) => {
        return sum + (carts.includes(`${index}`) ? item.price : 0)
    }, 0)
    $('.cart > div > p')[0].innerText = `選択中（${carts.length}）`
    $('.cart > div > span')[0].innerText = `合計金額：¥${totalPrice.toLocaleString()}`
    carts.forEach((itemIndex, index) => {
        const addCartItem = items[itemIndex]
        const cartItemElement = $(`
            <div class="cart-item" id="cart-${index}">
                <img src="assets/images/${addCartItem.image}" />
                <p>${addCartItem.title}</p>
                <span>¥${addCartItem.price.toLocaleString()}</span>
                <img src="assets/images/delete.png" class="delete-icon" />
            </div>
        `)
        $('.cart').append(cartItemElement)
    })
    $('.cart-item').on('click', (event) => {
        const index = new RegExp("^cart-([0-9]+)$").exec(event.currentTarget.id)[1]
        $('.list-item').css('border', '')
        $(`#list-${carts[index]}`).css({
            border: '2px solid #7B91D7',
            boxSizing: 'border-box'
        })
        $(`.content-detail`).hide()
        $(`#detail-${carts[index]}`).show()
    })
    $('.delete-icon').on('click', (event) => {
        removeItem(event)
    })
}

// カートからアイテムを削除
function removeItem(event) {
    let cartIndex
    if (event.currentTarget.className === 'checkbox' ) {
        const checkboxIndex = new RegExp("^list-([0-9]+)$").exec(event.currentTarget.parentElement.id)[1]
        cartIndex = carts.indexOf(checkboxIndex)
    } else if (event.currentTarget.className === 'delete-icon') {
        cartIndex = new RegExp("^cart-([0-9]+)$").exec(event.currentTarget.parentElement.id)[1]
    } else if (event.currentTarget.className === 'add-cart-button') {
        const itemIndex = new RegExp("^detail-([0-9]+)$").exec(event.currentTarget.parentElement.id)[1]
        cartIndex = carts.indexOf(itemIndex)
    }
    $(`#cart-${cartIndex}`).remove()
    const listValue = carts.splice(cartIndex, 1)[0]
    $(`#list-${listValue}`).find('.checkbox > img').remove()
    const addCartButton = $(`#detail-${listValue}`).find('.add-cart-button')
    addCartButton.css({
        backgroundColor: '#FFFFFF',
        border: '1px solid #536FCA',
        color: '#536FCA'
    })
    addCartButton.hover(
        () => addCartButton.css({
            color: '#FFFFFF',
            backgroundColor: '#536FCA'
        }),
        () => addCartButton.css({
            color: '#536FCA',
            backgroundColor: '#FFFFFF'
        })
    )
    addCartButton.html('カートに追加')
    if (carts.length === 0) {
        hideCartWindow()
    }
}

// カートウィンドウを表示
function showCartWindow() {
    $('.content-detail').animate({width: '46%'}, 300)
    $('.cart').animate({'width': '15%'}, 300)
    $('.cart').show()
}

// カートウィンドウを隠す
function hideCartWindow() {
    $('.content-detail').animate({width: '60%'}, 300)
    $('.cart').animate({'width': '0%'}, 300)
    $('.cart').hide()
}

const items = [
    {
        "title": "ソニー 65V型 液晶テレビ ブラビア",
        "sub_title": "KJ-65X80J",
        "price": 140000,
        "categories": ["家電", "テレビ"],
        "image": "tv.webp",
        "details": {
            "画面サイズ": "65",
            "ディスプレイの種類" : "液晶",
            "HDMIポート数": "4",
            "Total Usb Ports": "2",
            "ブランド": "ソニー(SONY)",
            "色": "ブラック",
            "付属品": "標準スタンド、音声検索機能付リモコン(無線）、単4形乾電池（2個）、転倒防止用固定ベルト一式",
            "メーカー": "ソニー(SONY)",
            "メーカー型番": "KJ-65X80J",
            "発売年": "2021",
            "ネットワーク": "Wi-Fi, USB, Ethernet, HDMI"
        }
    },
    {
        "title": "アイリスオーヤマ 24V型 液晶テレビ",
        "sub_title": "24WB10",
        "price": 19800,
        "categories": ["家電", "テレビ"],
        "image": "tv2.jpg",
        "details": {
            "画面サイズ": "24",
            "ディスプレイの種類" : "液晶",
            "HDMIポート数": "2",
            "ブランド": "アイリスオーヤマ(IRIS OHYAMA)",
            "色": "ブラック",
            "付属品": "リモコン、リモコン用単4乾電池×2、miniB-CASカード、スタンド×2、スタンド固定用ねじ×4、AV入力アダプター",
            "メーカー": "アイリスオーヤマ(IRIS OHYAMA)",
            "メーカー型番": "24WB10",
            "発売年": "2020",
            "ネットワーク": "なし",
            "アスペクト比": "16:9",
            "表示画素数": "1366 x 768 ピクセル"
        }
    },
    {
        "title": "日立 冷蔵庫 ブリリアントブラック",
        "sub_title": "R-V38NVL",
        "price": 128000,
        "categories": ["家電", "冷蔵庫"],
        "image": "refrigerator.jpg",
        "details": {
            "性能・容量" : "375 L",
            "ドア数": "2",
            "ブランド": "日立(HITACHI)",
            "色": "ブリリアントブラック",
            "付属品": "取扱説明書、保証書",
            "メーカー": "日立(HITACHI)",
            "製品型番": "R-V38NVL K",
            "発売年": "2020",
            "年間エネルギー消費量": "345 Kilowatt Hours Per Year",
            "霜取り機能": "自動",
            "ドアの開き方": "左開き"
        }
    },
    {
        "title": "COMFEE' 冷蔵庫 小型 2ドア",
        "sub_title": "RCD45/RCT90",
        "price": 17798,
        "categories": ["家電", "冷蔵庫"],
        "image": "refrigerator2.jpg",
        "details": {
            "性能・容量" : "90 L",
            "ドア数": "1",
            "ブランド": "コンフィー(COMFEE’)",
            "色": "ホワイト",
            "付属品": "製氷皿, 霜取り用ヘラ, 貯氷ケース, 冷凍室棚",
            "メーカー": "コンフィー(COMFEE’)",
            "製品型番": "RCT90WH/E",
            "発売年": "2021",
            "年間エネルギー消費量": "207 Kilowatt Hours Per Year",
            "霜取り機能": "手動",
            "ドアの開き方": "右開き"
        }
    },
    {
        "title": "シャープ 洗濯機 ドラム式 ヒートポンプ乾燥",
        "sub_title": "ESWS13TR",
        "price": 222242,
        "categories": ["家電", "洗濯機"],
        "image": "washer.jpg",
        "details": {
            "性能・容量": "11 キログラム",
            "特殊機能" : "インバータ, 自動投入",
            "扉の位置": "前面",
            "電池使用": "いいえ",
            "ブランド": "シャープ(SHARP)",
            "色": "ブラウン",
            "付属品": "取扱説明書、保証書",
            "メーカー": "シャープ(SHARP)",
            "製品型番": "ESWS13TR",
            "発売年": "2020",
            "商品の重量": "86 kg"
        }
    },
    {
        "title": "アイリスオーヤマ 洗濯機 ドラム式",
        "sub_title": "HD71",
        "price": 62800,
        "categories": ["家電", "洗濯機"],
        "image": "washer2.jpg",
        "details": {
            "性能・容量": "7.5 キログラム",
            "標準使用水量" : "72 L",
            "扉の位置": "前面",
            "電池使用": "いいえ",
            "ブランド": "アイリスオーヤマ(IRIS OHYAMA)",
            "色": "ホワイト/シルバー",
            "付属品": "なし",
            "メーカー": "アイリスオーヤマ(IRIS OHYAMA)",
            "製品型番": "HD71",
            "発売年": "2019",
            "商品の重量": "66 kg"
        }
    },
    {
        "title": "タンスのゲン ソファー 3人掛け L字",
        "sub_title": "B01AJ6RMAU",
        "price": 42999,
        "categories": ["家具", "ソファー"],
        "image": "sofa.jpg",
        "details": {
            "色": "ブラック(レザー)",
            "サイズ" : "1.（2P+1P+コーナー+オットマン）",
            "座面高": "35 センチメートル",
            "電池使用": "いいえ",
            "ブランド": "タンスのゲン",
            "素材": "張地:PUレザー,PVCレザー中材:ポケットコイル,Sバネ,シリコンフィル綿,チップウレタン脚,フレーム:天然木",
            "メーカー": "タンスのゲン",
            "ASIN": "B01AJ6RMAU",
            "発売年": "2018",
        }
    },
    {
        "title": "アイリスプラザ ソファ 2人掛け",
        "sub_title": "EJ-2107",
        "price": 11000,
        "categories": ["家具", "ソファー"],
        "image": "sofa2.jpg",
        "details": {
            "色": "コーヒーブラウン",
            "サイズ" : "2人掛け",
            "商品重量": "23 キログラム",
            "電池使用": "いいえ",
            "ブランド": "アイリスプラザ(IRIS PLAZA)",
            "素材": "構造部材:木製フレーム/張材:ポリエステル100%",
            "メーカー": "アイリスプラザ(IRIS PLAZA)",
            "製品型番": "EJ-2107",
            "発売年": "2017",
        }
    },
    {
        "title": "FLEXISPOT スタンディングデスク 電動式昇降デスク",
        "sub_title": "B092VXFSTY",
        "price": 73700,
        "categories": ["家具", "机"],
        "image": "desk.jpg",
        "details": {
            "色": "足ブラック＋カーブ型天板ブラウン",
            "材質" : "天板木材",
            "商品の重量": "56.6 kg",
            "耐荷重": "125kg",
            "ブランド": "FLEXISPOT",
            "天板のサイズ": "140×70×2.5cm",
            "メーカー": "FLEXISPOT",
            "ASIN": "B092VXFSTY",
            "発売年": "2020",
        }
    },
    {
        "title": "YEARCOLOR パソコンデスク PCデスク 学習机 勉強机 折りたたみ",
        "sub_title": "YCM-HO01_FBA2_L120",
        "price": 6980,
        "categories": ["家具", "机"],
        "image": "desk2.jpg",
        "details": {
            "色": "アンティークブラウン",
            "材質" : "金属",
            "商品の重量": "13.5 キログラム",
            "耐荷重": "135kg",
            "ブランド": "YEARCOLOR",
            "サイズ": "幅118cm×奥行60cm",
            "メーカー": "YEARCOLOR",
            "型番": "YCM-HO01_FBA2_L120",
            "発売年": "2020",
        }
    },
    {
        "title": "GTRACING ゲーミングチェア スピーカー付き",
        "sub_title": "GT890MF-RED-VC",
        "price": 24800,
        "categories": ["家具", "椅子"],
        "image": "char.jpg",
        "details": {
            "色": "Red",
            "素材": "フェイクレザー",
            "商品重量" : "48 ポンド",
            "スタイル": "オットマン付き",
            "フレームの素材": "ポリカーボネート",
            "ブランド": "GTRACING",
            "メーカー": "GTRACING",
            "メーカー型番": "GT890MF-RED-VC",
            "発売年": "2022",
        }
    },
    {
        "title": "アイリスプラザ 椅子 ダイニングチェア イームズチェア",
        "sub_title": "PP-623",
        "price": 3281,
        "categories": ["家具", "椅子"],
        "image": "char2.jpg",
        "details": {
            "色": "ホワイト",
            "素材": "木材",
            "サイズ": "肘掛け無し",
            "商品重量" : "4.4 キログラム",
            "スタイル": "1脚",
            "フレームの素材": "ポリカーボネート",
            "ブランド": "アイリスプラザ(IRIS PLAZA)",
            "メーカー": "アイリスプラザ(IRIS PLAZA)",
            "メーカー型番": "PP-623",
            "発売年": "2016",
        }
    },
    {
        "title": "ダイソン Dyson V8 Fluffy Extra SV10 TI",
        "sub_title": "SV10 TI",
        "price": 33390,
        "categories": ["家電", "掃除機"],
        "image": "cleaner.jpg",
        "details": {
            "電源" : "バッテリー式",
            "フィルタータイプ": "カートリッジ",
            "商品重量": "4284 グラム",
            "ブランド": "Dyson(ダイソン)",
            "特徴": "ポータブル",
            "メーカー": "Dyson(ダイソン)",
            "メーカー型番": "SV10 TI",
            "発売年": "2021",
        }
    },
    {
        "title": "三菱電機 Be-K 日本製 紙パック掃除機",
        "sub_title": "TC-FXG5J-A",
        "price": 11980,
        "categories": ["家電", "掃除機"],
        "image": "cleaner2.jpg",
        "details": {
            "電源": "電源コード式",
            "内容量": "1.5 リットル",
            "色": "ミルキーブルー",
            "商品重量": "2400 グラム",
            "ブランド": "三菱電機(MITSUBISHI ELECTRIC)",
            "特徴": "軽量, コンパクト",
            "メーカー": "三菱電機(MITSUBISHI ELECTRIC)",
            "メーカー型番": "TC-FXG5J-A",
            "発売年": "2017",
        }
    },
    {
        "title": "ルンバ i3 ロボット掃除機 アイロボット",
        "sub_title": "i315060",
        "price": 49800,
        "categories": ["家電", "掃除機"],
        "image": "cleaner3.jpg",
        "details": {
            "色": "グレー",
            "商品重量": "0.53 ポンド",
            "ブランド": "アイロボット",
            "特徴": "ロボット掃除機",
            "メーカー": "アイロボット",
            "メーカー型番": "i315060",
            "発売年": "2021",
        }
    },
    {
        "title": "PANTHER (パンサー) ロードバイク",
        "sub_title": "ZEUS-3.0",
        "price": 59800,
        "categories": ["その他", "自転車"],
        "image": "bike.jpg",
        "details": {
            "色": "New Black×Blue",
            "サイズ" : "500mm(L)",
            "素材": "アルミニウムAL6061",
            "ギア枚数": "16",
            "ブランド": "PANTHER (パンサー)",
            "自転車タイプ": "ロードバイク",
            "ホイールサイズ": "700 インチ",
            "メーカー": "PANTHER (パンサー)",
            "メーカー型番": "ZEUS-3.0",
            "発売年": "2020",
            "用途": "公路"
        }
    },
    {
        "title": "折りたたみ自転車 カゴ付 20インチ",
        "sub_title": "P-008N",
        "price": 13470,
        "categories": ["その他", "自転車"],
        "image": "bike2.jpg",
        "details": {
            "色": "ブラック",
            "ギア枚数": "6",
            "ブランド": "THREE STONE",
            "自転車タイプ": "通勤用自転車, 折りたたみ自転車",
            "ホイールサイズ": "20 インチ",
            "メーカー": "THREE STONE",
            "メーカー型番": "P-008N",
            "発売年": "2018",
            "用途": "ロード"
        }
    }
]