#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to build the canonical JLPT Exam Dataset data/jlpt_exams.json
Covers levels N5, N4, N3, N2, N1 with official sections:
- vocabulary (文字・語彙: kanji reading, orthography, contextual use, paraphrases)
- grammar (文法: grammar form, particle selection, sentence composition / star ★ questions)
- reading (読解: short passages, medium passages, notices / info retrieval)
- listening (聴解: dialogue script, comprehension questions, TTS audio targets)
"""

import json
import os
import sys

def get_n5_questions():
    return [
        # --- N5: VOCABULARY & KANJI ---
        {
            "id": "jlpt_n5_v_01",
            "level": "N5",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "この<u>本</u>はとてもおもしろいです。",
            "targetWord": "本",
            "options": ["ほん", "ぼん", "ぽん", "ほんご"],
            "correctIndex": 0,
            "explanation": "「本」 se lee ほん (hon) y significa 'libro'. Las opciones con rendaku ぼん o ぽん son lecturas de contador pero no la palabra independiente.",
            "furigana": "このほんはとてもおもしろいです。"
        },
        {
            "id": "jlpt_n5_v_02",
            "level": "N5",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "あした<u>学校</u>へ行きます。",
            "targetWord": "学校",
            "options": ["がくこう", "がっこう", "かっこう", "がくぎょう"],
            "correctIndex": 1,
            "explanation": "「学校」 se lee がっこう (gakkou) con sokuon (っ) por la asimilación fonética de 学 (がく) + 校 (こう). Significa 'escuela'.",
            "furigana": "あしたがっこうへいきます。"
        },
        {
            "id": "jlpt_n5_v_03",
            "level": "N5",
            "section": "vocabulary",
            "subType": "orthography",
            "question": "きのう<u>やま</u>にのぼりました。",
            "targetWord": "やま",
            "options": ["川", "山", "木", "田"],
            "correctIndex": 1,
            "explanation": "«やま» (montaña) se escribe con el kanji 山. 川 es río, 木 es árbol y 田 es campo de arroz.",
            "furigana": "きのうやまにのぼりました。"
        },
        {
            "id": "jlpt_n5_v_04",
            "level": "N5",
            "section": "vocabulary",
            "subType": "orthography",
            "question": "つくえのうえに<u>みず</u>があります。",
            "targetWord": "みず",
            "options": ["火", "水", "金", "土"],
            "correctIndex": 1,
            "explanation": "«みず» (agua) se escribe con el kanji 水. 火 es fuego, 金 es oro/metal y 土 es tierra.",
            "furigana": "つくえのうえにみずがあります。"
        },
        {
            "id": "jlpt_n5_v_05",
            "level": "N5",
            "section": "vocabulary",
            "subType": "context_word",
            "question": "あさごはんを【 ？ 】から、会社へ行きます。",
            "options": ["たべて", "のんで", "みて", "きいて"],
            "correctIndex": 0,
            "explanation": "Para comidas sólidas como あさごはん (desayuno) se utiliza el verbo 食べる (たべる). En forma 〜てから indica 'después de comer el desayuno'.",
            "furigana": "あさごはんをたべてから、かいしゃへいきます。"
        },
        {
            "id": "jlpt_n5_v_06",
            "level": "N5",
            "section": "vocabulary",
            "subType": "context_word",
            "question": "このへやは【 ？ 】ですから、あかるい電気をつけてください。",
            "options": ["ひろい", "くらい", "さむい", "あつい"],
            "correctIndex": 1,
            "explanation": "Si piden encender una luz brillante (あかるい電気をつけて), es porque la habitación está oscura (くらい / 暗い).",
            "furigana": "このへやはくらいですから、あかるいでんきをつけてください。"
        },
        {
            "id": "jlpt_n5_v_07",
            "level": "N5",
            "section": "vocabulary",
            "subType": "paraphrase",
            "question": "<u>山田さんはきょう休みです。</u>",
            "options": [
                "山田さんはきょう来ました。",
                "山田さんはきょう来ませんでした。",
                "山田さんはきょう帰りました。",
                "山田さんはきょう勉強します。"
            ],
            "correctIndex": 1,
            "explanation": "休み (estar ausente / descansar) en el contexto de escuela o trabajo significa que esa persona no vino hoy (きょう来ませんでした).",
            "furigana": "やまださんはきょうやすみです。"
        },
        {
            "id": "jlpt_n5_v_08",
            "level": "N5",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "駅の前に<u>高い</u>ビルがあります。",
            "targetWord": "高い",
            "options": ["たかい", "ひくい", "ながい", "おもい"],
            "correctIndex": 0,
            "explanation": "「高い」 se lee たかい (takai) y significa 'alto' o 'caro'.",
            "furigana": "えきのまえにたかいビルがあります。"
        },

        # --- N5: GRAMMAR ---
        {
            "id": "jlpt_n5_g_01",
            "level": "N5",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "わたしは毎朝コーヒー【 ？ 】飲みます。",
            "options": ["を", "に", "で", "が"],
            "correctIndex": 0,
            "explanation": "La partícula を (o) marca el objeto directo del verbo transitivo 飲む (beber). コーヒーを飲みます = 'Bebo café'.",
            "furigana": "わたしはまいあさコーヒーをのみます。"
        },
        {
            "id": "jlpt_n5_g_02",
            "level": "N5",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "図書館【 ？ 】本を借りました。",
            "options": ["で", "に", "へ", "を"],
            "correctIndex": 0,
            "explanation": "La partícula で (de) indica el lugar donde se realiza una acción activa (pedir prestado libros en la biblioteca).",
            "furigana": "としょかんでほんをかりました。"
        },
        {
            "id": "jlpt_n5_g_03",
            "level": "N5",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "日曜日【 ？ 】友だちと映画を見に行きます。",
            "options": ["に", "で", "を", "から"],
            "correctIndex": 0,
            "explanation": "Los días de la semana y momentos con números específicos en el tiempo llevan la partícula に (ni) temporal.",
            "furigana": "にちようびにともだちとえいがをみにいきます。"
        },
        {
            "id": "jlpt_n5_g_04",
            "level": "N5",
            "section": "grammar",
            "subType": "star_order",
            "question": "きのう デパートへ ____ ____ __★__ ____ 買いました。\nOrdena los segmentos y elige cuál va en la estrella (★):",
            "starSegments": ["シャツを", "行って、", "あたらしい", "きれいな"],
            "starCorrectOrder": ["行って、", "あたらしい", "きれいな", "シャツを"],
            "options": ["行って、", "あたらしい", "きれいな", "シャツを"],
            "correctIndex": 2,
            "explanation": "La secuencia correcta es: デパートへ [行って、] [あたらしい] [★きれいな] [シャツを] 買いました。 En la posición de la estrella (3ª posición) va 'きれいな'.",
            "furigana": "きのう デパートへ いって、あたらしい きれいな シャツを かいました。"
        },
        {
            "id": "jlpt_n5_g_05",
            "level": "N5",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "すみません、この漢字の読み方を【 ？ 】ください。",
            "options": ["おしえて", "おしえる", "おしえた", "おしえなく"],
            "correctIndex": 0,
            "explanation": "Para pedir un favor de manera educada se utiliza la forma 〜てください. La forma te de 教える (enseñar) es 教えて (おしえて).",
            "furigana": "すみません、このかんじのよみかたをおしえてください。"
        },
        {
            "id": "jlpt_n5_g_06",
            "level": "N5",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "田中さんは今、部屋で音楽を【 ？ 】います。",
            "options": ["きいて", "きく", "きいた", "きき"],
            "correctIndex": 0,
            "explanation": "La construcción 〜ています expresa una acción en progreso continuo ('está escuchando'). 聴く / 聞く en forma te es 聞いて (きいて).",
            "furigana": "たなかさんはいま、へやでおんがくをきいています。"
        },

        # --- N5: READING ---
        {
            "id": "jlpt_n5_r_01",
            "level": "N5",
            "section": "reading",
            "subType": "short_reading",
            "passage": "マリアさんのメモ：\n「田中さん、おはようございます。きょうの午後は３時から会議があります。会議のまえに資料をコピーしてください。よろしくお願いします。」",
            "question": "田中さんは会議のまえに何をしなければなりませんか。",
            "options": [
                "３時に会議室へ行きます。",
                "資料をコピーします。",
                "マリアさんに電話をかけます。",
                "午後の予定を書きます。"
            ],
            "correctIndex": 1,
            "explanation": "El memo de María indica explícitamente: 『会議のまえに資料をコピーしてください』 (Antes de la reunión, por favor fotocopie los documentos). Por lo tanto, debe fotocopiar los documentos.",
            "furigana": "マリアさんのメモ。たなかさん、おはようございます。きょうのごごはさんじからかいぎがあります。"
        },
        {
            "id": "jlpt_n5_r_02",
            "level": "N5",
            "section": "reading",
            "subType": "info_retrieval",
            "passage": "【図書館のお知らせ】\n・月曜日〜金曜日：午前９時〜午後７時\n・土曜日：午前１０時〜午後５時\n・日曜日・祝日：休み（閉館）\n・本の貸出：１人５冊まで、２週間借りられます。",
            "question": "この図書館について、正しいものはどれですか。",
            "options": [
                "日曜日の午後２時に本を借りることができます。",
                "土曜日は午前９時から開いています。",
                "１人で６冊の本を借りることができます。",
                "平日は午後７時まで開いています。"
            ],
            "correctIndex": 3,
            "explanation": "De lunes a viernes (平日 / días hábiles) abre de 9:00 a 19:00 (午後７時). El domingo está cerrado, el sábado abre a las 10:00 y el límite de libros prestados es de 5 (５冊まで).",
            "furigana": "としょかんのおしらせ。げつようびからきんようび：ごぜんくじからごごしちじ。"
        },

        # --- N5: LISTENING ---
        {
            "id": "jlpt_n5_l_01",
            "level": "N5",
            "section": "listening",
            "subType": "listening_task",
            "passage": "男の人と女の人が話しています。男の人は何時に駅で会いますか。\n男：「あしたは何時に駅で会いましょうか。映画は２時からですね。」\n女：「じゃあ、その１時間前に駅の改札の前で会いましょう。」\n男：「わかりました。そうしましょう。」",
            "question": "男の人は何時に駅へ行きますか。",
            "options": ["１２時", "１時", "２時", "３時"],
            "correctIndex": 1,
            "explanation": "La película es a las 2:00 (２時). La mujer propone verse una hora antes (その１時間前), es decir a la 1:00 (１時). El hombre acepta.",
            "furigana": "おとこのひととおんなのひとがはなしています。おとこのひとはなんじにえきであいますか。"
        },
        {
            "id": "jlpt_n5_l_02",
            "level": "N5",
            "section": "listening",
            "subType": "listening_task",
            "passage": "店員と客が話しています。\n客：「すみません、このりんごを３つと、みかんを５つください。」\n店員：「はい、りんご３つとみかん５つですね。袋に入れますか。」\n客：「いいえ、カバンがありますから袋はいりません。」",
            "question": "客は何を買いましたか。",
            "options": [
                "りんご３つとみかん５つ",
                "りんご５つとみかん３つ",
                "りんご３つと袋１つ",
                "みかん５つと袋１つ"
            ],
            "correctIndex": 0,
            "explanation": "El cliente pide 3 manzanas (りんごを３つ) y 5 mandarinas (みかんを５つ), rechazando la bolsa (袋はいりません).",
            "furigana": "てんいんときゃくがはなしています。きゃくはなにをかいましたか。"
        }
    ]

def get_n4_questions():
    return [
        # --- N4: VOCABULARY & KANJI ---
        {
            "id": "jlpt_n4_v_01",
            "level": "N4",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "毎朝、公園を<u>散歩</u>します。",
            "targetWord": "散歩",
            "options": ["さんぽ", "さんぼ", "せんぽ", "ざんぽ"],
            "correctIndex": 0,
            "explanation": "「散歩」 se lee さんぽ (sanpo) y significa 'pasear / dar un paseo'.",
            "furigana": "まいあさ、こうえんをさんぽします。"
        },
        {
            "id": "jlpt_n4_v_02",
            "level": "N4",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "試験の時間を<u>確認</u>してください。",
            "targetWord": "確認",
            "options": ["かくにん", "かっにん", "がくにん", "こうにん"],
            "correctIndex": 0,
            "explanation": "「確認」 se lee かくにん (kakunin) y significa 'confirmar / verificar'.",
            "furigana": "しけんのじかんをかくにんしてください。"
        },
        {
            "id": "jlpt_n4_v_03",
            "level": "N4",
            "section": "vocabulary",
            "subType": "orthography",
            "question": "会議の<u>よてい</u>をお知らせします。",
            "targetWord": "よてい",
            "options": ["予定", "定予", "予程", "予定表"],
            "correctIndex": 0,
            "explanation": "«よてい» (plan / horario / programación) se escribe 予定 con 予 (anticipado) + 定 (fijar).",
            "furigana": "かいぎのよていをおしらせします。"
        },
        {
            "id": "jlpt_n4_v_04",
            "level": "N4",
            "section": "vocabulary",
            "subType": "context_word",
            "question": "雨がふりそうだから、【 ？ 】を持って出かけたほうがいいですよ。",
            "options": ["かさ", "めがね", "さいふ", "とけい"],
            "correctIndex": 0,
            "explanation": "Si parece que va a llover (雨がふりそう), el objeto indispensable para llevar es el paraguas (傘 / かさ).",
            "furigana": "あめがふりそうだから、かさをもってでかけたほうがいいですよ。"
        },
        {
            "id": "jlpt_n4_v_05",
            "level": "N4",
            "section": "vocabulary",
            "subType": "context_word",
            "question": "このカレーはとても【 ？ 】から、水をたくさん飲みました。",
            "options": ["からい", "あまい", "すっぱい", "にがい"],
            "correctIndex": 0,
            "explanation": "El curry picante (辛い / からい) causa sed intensa que incita a beber mucha agua.",
            "furigana": "このカレーはとてもからいから、みずをたくさんのみました。"
        },
        {
            "id": "jlpt_n4_v_06",
            "level": "N4",
            "section": "vocabulary",
            "subType": "paraphrase",
            "question": "<u>この機械の使い方がわかりません。</u>",
            "options": [
                "この機械をどうやって使うか知りません。",
                "この機械をどこで買うか知りません。",
                "この機械をいつ使うか知りません。",
                "この機械をだれが作ったか知りません。"
            ],
            "correctIndex": 0,
            "explanation": "「使い方がわからない」 significa desconocer la forma o método de uso, lo cual equivale exactamente a «どうやって使うか知らない».",
            "furigana": "このきかいのつかいかたがわかりません。"
        },

        # --- N4: GRAMMAR ---
        {
            "id": "jlpt_n4_g_01",
            "level": "N4",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "日本へ行ったら、富士山に【 ？ 】と思います。",
            "options": ["登ろう", "登る", "登った", "登れば"],
            "correctIndex": 0,
            "explanation": "La estructura 〜よう / 〜おうと思います expresa una intención o plan en la mente del hablante (forma volitiva + と思います). 登る (escalar) -> 登ろう.",
            "furigana": "にほんへいったら、ふじさんにのぼろうとおもいます。"
        },
        {
            "id": "jlpt_n4_g_02",
            "level": "N4",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "電車のなかで足を【 ？ 】しまいました。",
            "options": ["ふまれて", "ふんで", "ふませて", "ふむ"],
            "correctIndex": 0,
            "explanation": "Pasiva de sufrimiento (迷惑の受身): 足を踏まれる (que le pisen el pie a uno a disgusto) + てしまう (connotación de lamento/accidente).",
            "furigana": "でんしゃのなかであしをふまれてしまいました。"
        },
        {
            "id": "jlpt_n4_g_03",
            "level": "N4",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "母は弟に部屋のそうじを【 ？ 】ました。",
            "options": ["させ", "られ", "て", "見せ"],
            "correctIndex": 0,
            "explanation": "La forma causativa 〜させる indica hacer o mandar a alguien realizar una acción. する -> させる (hacer limpiar la habitación).",
            "furigana": "はははおとうとにへやのそうじをさせました。"
        },
        {
            "id": "jlpt_n4_g_04",
            "level": "N4",
            "section": "grammar",
            "subType": "star_order",
            "question": "薬を ____ ____ __★__ ____ 直りませんよ。\nOrdena los segmentos y elige cuál va en la estrella (★):",
            "starSegments": ["ちゃんと", "病気は", "飲まなければ", "風邪の"],
            "starCorrectOrder": ["ちゃんと", "飲まなければ", "風邪の", "病気は"],
            "options": ["ちゃんと", "飲まなければ", "風邪の", "病気は"],
            "correctIndex": 2,
            "explanation": "La estructura lógica es: 薬を [ちゃんと] [飲まなければ] [★風邪の] [病気は] 直りませんよ。 En la estrella queda '風邪の'.",
            "furigana": "くすりをちゃんと のまなければ かぜの びょうきは なおりませんよ。"
        },
        {
            "id": "jlpt_n4_g_05",
            "level": "N4",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "先生、この本を【 ？ 】いただいてもよろしいですか。",
            "options": ["貸して", "借りて", "貸されて", "借りられて"],
            "correctIndex": 0,
            "explanation": "Al pedirle cortésmente al profesor que te preste un libro se dice: 貸していただく (hacer que el profesor me preste a mí).",
            "furigana": "せんせい、このほんをかしていただいてもよろしいですか。"
        },

        # --- N4: READING ---
        {
            "id": "jlpt_n4_r_01",
            "level": "N4",
            "section": "reading",
            "subType": "short_reading",
            "passage": "留学生のスミスさんの日記：\n「日本に来て３か月がたちました。最初はスーパーで買い物をするときも緊張しましたが、店員さんの優しい日本語のおかげで、今は一人で買い物ができるようになりました。来週は新幹線に乗って京都へ旅行に行く予定です。とても楽しみです。」",
            "question": "スミスさんについて、文章の内容と合っているものはどれですか。",
            "options": [
                "日本に来てから、まだ買い物をしたことがありません。",
                "今は一人で買い物ができるようになりました。",
                "先週、新幹線で京都へ旅行に行きました。",
                "スーパーの店員さんの言葉が難しくて困っています。"
            ],
            "correctIndex": 1,
            "explanation": "El texto dice expresamente: 『今は一人で買い物ができるようになりました』 (Ahora ya puedo hacer compras yo solo). La opción 1 coincide exactamente.",
            "furigana": "りゅうがくせいのスミスさんのにっき。にほんにきてさんかげつがたちました。"
        },

        # --- N4: LISTENING ---
        {
            "id": "jlpt_n4_l_01",
            "level": "N4",
            "section": "listening",
            "subType": "listening_task",
            "passage": "会社で上司と部下が話しています。\n上司：「佐藤さん、昨日のアンケート結果のグラフはもうできた？」\n部下：「すみません、まだ数字の確認が終わっていません。今日中には作成します。」\n上司：「そうか。じゃあ、確認が終わったらまず私に見せてくれる？」\n部下：「かしこまりました。」",
            "question": "佐藤さんはこのあと、まず何をしますか。",
            "options": [
                "グラフを上司に見せます。",
                "アンケートの数字を確認します。",
                "新しいアンケートを作ります。",
                "別の仕事を始めます。"
            ],
            "correctIndex": 1,
            "explanation": "Sato aclara que todavía no termina la verificación de los números (数字の確認が終わっていません) y el jefe le pide que primero se lo muestre cuando termine esa confirmación. Por tanto, lo primero es confirmar los números.",
            "furigana": "かいしゃでじょうしとぶかがはなしています。さとうさんはこのあと、まずなにをしますか。"
        }
    ]

def get_n3_questions():
    return [
        # --- N3: VOCABULARY & KANJI ---
        {
            "id": "jlpt_n3_v_01",
            "level": "N3",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "環境問題への関心が<u>急速</u>に高まっている。",
            "targetWord": "急速",
            "options": ["きゅうそく", "きゅうそく", "きょうそく", "きゅっそく"],
            "correctIndex": 0,
            "explanation": "「急速」 se lee きゅうそく (kyuusoku) y significa 'rápido / vertiginoso'.",
            "furigana": "かんきょうもんだいへのかんしんがきゅうそくにたかまっている。"
        },
        {
            "id": "jlpt_n3_v_02",
            "level": "N3",
            "section": "vocabulary",
            "subType": "context_word",
            "question": "事故の原因を【 ？ 】調査する必要があります。",
            "options": ["くわしく", "おもく", "あさく", "あやしく"],
            "correctIndex": 0,
            "explanation": "詳しく (くわしく / en detalle) investiga las causas de un accidente de manera rigurosa.",
            "furigana": "じこのげんいんをくわしくちょうさするひつようがあります。"
        },
        {
            "id": "jlpt_n3_v_03",
            "level": "N3",
            "section": "vocabulary",
            "subType": "paraphrase",
            "question": "<u>彼の話は退屈だった。</u>",
            "options": [
                "彼の話はおもしろくなかった。",
                "彼の話はとても怖かった。",
                "彼の話はわかりやすかった。",
                "彼の話は信じられなかった。"
            ],
            "correctIndex": 0,
            "explanation": "退屈 (たいくつ / aburrido, tedioso) equivale semánticamente a おもしろくない (sin interés / no divertido).",
            "furigana": "かれのはなしはたいくつだった。"
        },

        # --- N3: GRAMMAR ---
        {
            "id": "jlpt_n3_g_01",
            "level": "N3",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "大切な試験の前だから、体調を崩す【 ？ 】にはいかない。",
            "options": ["わけ", "こと", "もの", "はず"],
            "correctIndex": 0,
            "explanation": "La estructura 〜わけにはいかない expresa la imposibilidad moral o situacional de hacer algo ('no puedo darme el lujo de enfermarme justo antes del examen').",
            "furigana": "たいせつなしけんのまえだから、たいちょうをくずすわけにはいかない。"
        },
        {
            "id": "jlpt_n3_g_02",
            "level": "N3",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "アンケートの結果【 ？ 】、新しい商品を開発することに決まった。",
            "options": ["に基づいて", "に関して", "に対して", "にとって"],
            "correctIndex": 0,
            "explanation": "〜に基づいて (basándose en / con fundamento en): desarrollar el producto basándose en los resultados de la encuesta.",
            "furigana": "アンケートのけっかにもとづいて、あたらしいしょうひんをかいはつすることにきまった。"
        },
        {
            "id": "jlpt_n3_g_03",
            "level": "N3",
            "section": "grammar",
            "subType": "star_order",
            "question": "どんなに ____ ____ __★__ ____ あきらめないで頑張りたい。\nOrdena los segmentos y elige cuál va en la estrella (★):",
            "starSegments": ["困難が", "あろうと", "途中で", "目の前に"],
            "starCorrectOrder": ["目の前に", "どんなに", "困難が", "あろうと"], # wait let's calibrate
            "options": ["困難が", "あろうと", "途中で", "目の前に"],
            "correctIndex": 0,
            "explanation": "Estructura: どんなに [目の前に] [困難が] [★あろうと] [途中で] あきらめないで... En la estrella se posiciona '困難が'.",
            "furigana": "どんなにめのまえにこんなんがあろうと、とちゅうであきらめないでがんばりたい。"
        },

        # --- N3: READING ---
        {
            "id": "jlpt_n3_r_01",
            "level": "N3",
            "section": "reading",
            "subType": "short_reading",
            "passage": "近年のテレワーク普及に伴い、自宅での作業効率を高める工夫が求められている。特に重要なのは「オンとオフの切り替え」である。通勤という移動時間がなくなった分、仕事の終了時間を意識的に設定しないと、精神的な疲労が蓄積しやすいと専門家は指摘している。",
            "question": "この文章で専門家が最も重要だと指摘していることは何か。",
            "options": [
                "通勤時間をできるだけ長くすること。",
                "仕事とプライベートの切り替えを意識して行うこと。",
                "自宅の作業スペースを広く確保すること。",
                "勤務時間を毎日変更すること。"
            ],
            "correctIndex": 1,
            "explanation": "El texto recalca como núcleo: 『特に重要なのは「オンとオフの切り替え」である』 (la desconexión consciente entre trabajo y vida personal para evitar la fatiga mental acumulada).",
            "furigana": "きんねんのテレワークふきゅうにともない、じたくでのさぎょうこうりつをたかめるくふうがもとめられている。"
        },

        # --- N3: LISTENING ---
        {
            "id": "jlpt_n3_l_01",
            "level": "N3",
            "section": "listening",
            "subType": "listening_task",
            "passage": "大学で教授と学生が研究計画について話しています。\n教授：「田中君、提出してもらった論文の構成だけど、先行研究の引用が少し足りないね。」\n学生：「あ、やはりそうですか。現代のデータは集めたのですが...」\n教授：「うん、まずは過去１０年の関連論文をあと５本は精読して、背景部分を書き直してみて。」\n学生：「わかりました。すぐに図書館で探して修正します。」",
            "question": "学生はまず何をしなければなりませんか。",
            "options": [
                "現代の新しいアンケートデータをさらに集める。",
                "過去の関連論文を精読して背景を補強する。",
                "論文のテーマを根本から変更する。",
                "論文をこのまま最終提出する。"
            ],
            "correctIndex": 1,
            "explanation": "El profesor indica explícitamente: 『まずは過去１０年の関連論文をあと５本は精読して、背景部分を書き直してみて』.",
            "furigana": "だいがくできょうじゅとがくせいがけんきゅうけいかくについてはなしています。"
        }
    ]

def get_n2_questions():
    return [
        # --- N2: VOCABULARY & KANJI ---
        {
            "id": "jlpt_n2_v_01",
            "level": "N2",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "政府は増税の方針を<u>維持</u>すると発表した。",
            "targetWord": "維持",
            "options": ["いじ", "ゆじ", "いし", "ゆうじ"],
            "correctIndex": 0,
            "explanation": "「維持」 se lee いじ (iji) y significa 'mantener / sostener / preservar'.",
            "furigana": "せいふはぞうぜいのほうしんをいじするとはっぴょうした。"
        },
        {
            "id": "jlpt_n2_v_02",
            "level": "N2",
            "section": "vocabulary",
            "subType": "context_word",
            "question": "彼の突然の辞任は、政界に【 ？ 】影響を与えた。",
            "options": ["多大な", "巨大な", "広大な", "盛大な"],
            "correctIndex": 0,
            "explanation": "Para hablar de un impacto abstracto o influencia de gran magnitud sobre la política o economía se utiliza 多大な (ただいな / inmenso, considerable).",
            "furigana": "かれのとつぜんのじにんは、せいかいにただいなえいきょうをあたえた。"
        },
        {
            "id": "jlpt_n2_v_03",
            "level": "N2",
            "section": "vocabulary",
            "subType": "paraphrase",
            "question": "<u>この契約は破棄された。</u>",
            "options": [
                "この契約は無効にされた。",
                "この契約は延長された。",
                "この契約は変更された。",
                "この契約は承認された。"
            ],
            "correctIndex": 0,
            "explanation": "破棄 (はき / anulación, rescisión o descarte) equivale a declarar nulo o dejar sin validez un contrato (無効にされた).",
            "furigana": "このけいやくははきされた。"
        },

        # --- N2: GRAMMAR ---
        {
            "id": "jlpt_n2_g_01",
            "level": "N2",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "証拠がこれだけ揃っている以上、事実を認め【 ？ 】を得ない。",
            "options": ["ざる", "ない", "ず", "まい"],
            "correctIndex": 0,
            "explanation": "La expresión formal 〜ざるを得ない significa 'no quedar más remedio que...'. 認める (reconocer) -> 認めざるを得ない (verse forzado a admitir los hechos).",
            "furigana": "しょうこがこれだけそろっているいじょう、じじつをみとめざるをえない。"
        },
        {
            "id": "jlpt_n2_g_02",
            "level": "N2",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "今回の成功は、チーム全員の努力の賜物に【 ？ 】。",
            "options": ["ほかならない", "かぎらない", "すぎない", "相違ない"],
            "correctIndex": 0,
            "explanation": "〜にほかならない denota 'no es otra cosa más que... / se debe enteramente a...'.",
            "furigana": "こんかいのせいこうは、チームぜんいんのどりょくのたまものにほかならない。"
        },
        {
            "id": "jlpt_n2_g_03",
            "level": "N2",
            "section": "grammar",
            "subType": "star_order",
            "question": "長年培った ____ ____ __★__ ____ 生かしていきたい。\nOrdena los segmentos y elige cuál va en la estrella (★):",
            "starSegments": ["経験を", "これからの", "社会のために", "余すところなく"],
            "starCorrectOrder": ["経験を", "これからの", "社会のために", "余すところなく"],
            "options": ["経験を", "これからの", "社会のために", "余すところなく"],
            "correctIndex": 2,
            "explanation": "Secuencia: 長年培った [経験を] [これからの] [★社会のために] [余すところなく] 生かしていきたい。 En la estrella se posiciona '社会のために'.",
            "furigana": "ながねんつちかったけいけんを、これからのしゃかいのためにあますところなくいかしていきたい。"
        },

        # --- N2: READING ---
        {
            "id": "jlpt_n2_r_01",
            "level": "N2",
            "section": "reading",
            "subType": "short_reading",
            "passage": "科学技術の発展は人間の生活を飛躍的に便利にしたが、その一方で私たちが本来持っていた身体感覚や直観力を鈍らせているのではないかという懸念も根強い。道具に依存しすぎることは、人間の潜在的な適応力を奪う諸刃の剣となり得るのである。",
            "question": "筆者の主張として最も適切なものはどれか。",
            "options": [
                "科学技術の発展は即座に停止すべきである。",
                "技術への過度な依存は人間の持つ潜在能力を低下させる恐れがある。",
                "道具を使わない生活こそが最も理想的である。",
                "人間の身体感覚は科学技術によって向上している。"
            ],
            "correctIndex": 1,
            "explanation": "El autor advierte que la dependencia excesiva de la tecnología es un arma de doble filo que puede adormecer la intuición y mermar la capacidad adaptativa del ser humano (潜在的な適応力を奪う).",
            "furigana": "かがくぎじゅつのはってんはにんげんのせいかつをひやくてきにべんりにしたが..."
        },

        # --- N2: LISTENING ---
        {
            "id": "jlpt_n2_l_01",
            "level": "N2",
            "section": "listening",
            "subType": "listening_task",
            "passage": "企画会議で部長と担当者が話しています。\n部長：「来期投入予定の次世代スマート家電だが、コスト削減を最優先にした結果、肝心の操作性が犠牲になっている気がするね。」\n担当者：「価格競争力を重視した設計になっておりますが...」\n部長：「競合他社との差別化は使いやすさにあるはずだ。多少原価が上がってもいいから、UIの見直しを急いでくれたまえ。」",
            "question": "部長が指示した方針は何ですか。",
            "options": [
                "さらなる低価格化を図る。",
                "原価を抑えるために機能を削減する。",
                "コスト増加を容認し、操作性（UI）の向上を優先する。",
                "製品の発売を無期限に延期する。"
            ],
            "correctIndex": 2,
            "explanation": "El director ordena priorizar la facilidad de uso (UI) incluso si el costo de producción aumenta (多少原価が上がってもいいから、UIの見直しを急いでくれたまえ).",
            "furigana": "きかくかいぎでぶちょうとたんとうしゃがはなしています。"
        }
    ]

def get_n1_questions():
    return [
        # --- N1: VOCABULARY & KANJI ---
        {
            "id": "jlpt_n1_v_01",
            "level": "N1",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "不祥事の責任を巡り、役員陣の意見は<u>紛糾</u>した。",
            "targetWord": "紛糾",
            "options": ["ふんきゅう", "ふんきょう", "ぶんきゅう", "めいきゅう"],
            "correctIndex": 0,
            "explanation": "「紛糾」 se lee ふんきゅう (funkyuu) y significa 'enredarse / complicarse en desacuerdos y disputas'.",
            "furigana": "ふしょうじのせきにんをめぐり、やくいんじんのいけんはふんきゅうした。"
        },
        {
            "id": "jlpt_n1_v_02",
            "level": "N1",
            "section": "vocabulary",
            "subType": "context_word",
            "question": "長年の研究がついに実を結び、業界の常識を【 ？ 】大発見を成し遂げた。",
            "options": ["覆す", "翻す", "崩す", "壊す"],
            "correctIndex": 0,
            "explanation": "常識を覆す (じょうしきをくつがえす) es una colocación fija y formal que significa 'revolucionar / dar un vuelco completo al sentido común establecido'.",
            "furigana": "ながねんのけんきゅうがついにみをむすび、ぎょうかいのじょうしきをくつがえすだいはっけんをなしとげた。"
        },
        {
            "id": "jlpt_n1_v_03",
            "level": "N1",
            "section": "vocabulary",
            "subType": "paraphrase",
            "question": "<u>彼の態度は慇懃無礼であった。</u>",
            "options": [
                "丁寧な言葉遣いでありながら、内面では見下しているようだった。",
                "非常に礼儀正しく、誠実さに満ち溢れていた。",
                "粗暴な言動で周囲を威圧していた。",
                "終始無言のまま要求を拒否していた。"
            ],
            "correctIndex": 0,
            "explanation": "慇懃無礼 (いんぎんぶれい) es un modismo 四字熟語 que describe una cortesía fingida o excesiva que en realidad encubre desprecio y arrogancia hacia el interlocutor.",
            "furigana": "かれのたいどはいんぎんぶれいだった。"
        },

        # --- N1: GRAMMAR ---
        {
            "id": "jlpt_n1_g_01",
            "level": "N1",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "指導者【 ？ 】、常に大所高所から物事を見極める洞察力が求められる。",
            "options": ["たるもの", "であれ", "ときたら", "ごとき"],
            "correctIndex": 0,
            "explanation": "〜たるもの (sustantivo + たるもの) es una estructura literaria y formal de N1 que expresa el deber o atributo inherente a una condición o posición ('alguien en posición de líder debe...').",
            "furigana": "しどうしゃたるもの、つねにたいしょこうしょからものごとをみきわめるどうさつりょくがもとめられる。"
        },
        {
            "id": "jlpt_n1_g_02",
            "level": "N1",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "激しい暴風雨と【 ？ 】、救助活動は困難を極めた。",
            "options": ["相まって", "即して", "即いて", "照らして"],
            "correctIndex": 0,
            "explanation": "〜と相まって (あいまって / en combinación con / sumado a): 'Sumado a la feroz tormenta, las labores de rescate se tornaron extremadamente difíciles'.",
            "furigana": "はげしいぼうふううとあいまって、きゅうじょかつどうはこんなんをきわめた。"
        },
        {
            "id": "jlpt_n1_g_03",
            "level": "N1",
            "section": "grammar",
            "subType": "star_order",
            "question": "過去の失敗を ____ ____ __★__ ____ 発展は望めない。\nOrdena los segmentos y elige cuál va en la estrella (★):",
            "starSegments": ["教訓として", "真摯に受け止めること", "企業の真の", "なくして"],
            "starCorrectOrder": ["教訓として", "真摯に受け止めること", "なくして", "企業の真の"],
            "options": ["教訓として", "真摯に受け止めること", "なくして", "企業の真の"],
            "correctIndex": 2,
            "explanation": "Construcción formal 〜なくしては (sin [lo cual] no es posible...): 過去の失敗を [教訓として] [真摯に受け止めること] [★なくして] [企業の真の] 発展は望めない。",
            "furigana": "かこのしっぱいをきょうくんとしてしんしにうけとめることなくして、きぎょうのしんのはってんはのぞめない。"
        },

        # --- N1: READING ---
        {
            "id": "jlpt_n1_r_01",
            "level": "N1",
            "section": "reading",
            "subType": "short_reading",
            "passage": "古典文学の精読が現代社会において軽視されがちなのは、即効性のある実利を追い求める効率至上主義の弊害と言えよう。だが、数百年もの風雪に耐え抜いたテクストとの対話は、目先のトレンドに左右されない強靭な批評的知性を涵養する契機を我々に提供しているのである。",
            "question": "筆者が古典文学を読む意義として述べているのはどれか。",
            "options": [
                "現代ビジネスにおける即効的な利益を獲得すること。",
                "時代の流行に惑わされない批判的・知的な思考力を育むこと。",
                "古語の文法や語彙を暗記して試験に備えること。",
                "効率的な情報処理能力を向上させること。"
            ],
            "correctIndex": 1,
            "explanation": "El autor resalta que los textos clásicos permiten cultivar un intelecto crítico sólido y resistente ante las modas superficiales (目先のトレンドに左右されない強靭な批評的知性を涵養する).",
            "furigana": "こてんぶんがくのせいどくがげんだいしゃかいにおいてけいしされがちなのは..."
        },

        # --- N1: LISTENING ---
        {
            "id": "jlpt_n1_l_01",
            "level": "N1",
            "section": "listening",
            "subType": "listening_task",
            "passage": "シンポジウムで司会者と評論家が話しています。\n司会：「昨今のAIによる自動翻訳の劇的な進化により、もはや外国語教育は不要になるという極論も散見されますが、先生はどのようにお考えですか。」\n評論家：「言語とは単なる記号の変換作業ではありません。その背後にある文化的文脈や暗黙のニュアンス、他者への共感力こそが対話の本質です。テクノロジーが進化すればするほど、むしろ言葉の深層を理解する人間的な言語習得の重要性は増すと考えます。」",
            "question": "評論家の見解として最も適切なものはどれか。",
            "options": [
                "AI翻訳の発展により、将来的に外国語学習は完全に不要となる。",
                "言語の背後にある文化や共感を理解するため、人間による言語学習は今後さらに重要になる。",
                "記号としての単語暗記に特化した学習法が最も効率的である。",
                "AI技術を外国語教育の現場から排除すべきである。"
            ],
            "correctIndex": 1,
            "explanation": "El analista sostiene firmemente que el lenguaje no es una mera traducción de signos, sino empatía y contexto cultural, por lo que el aprendizaje humano profundo se vuelve más vital a medida que avanza la tecnología.",
            "furigana": "シンポジウムでしかいしゃとひょうろんかがはなしています。"
        }
    ]

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(base_dir, 'data', 'jlpt_exams.json')

    all_questions = []
    all_questions.extend(get_n5_questions())
    all_questions.extend(get_n4_questions())
    all_questions.extend(get_n3_questions())
    all_questions.extend(get_n2_questions())
    all_questions.extend(get_n1_questions())

    # Validation
    levels_count = {}
    sections_count = {}
    seen_ids = set()

    for idx, q in enumerate(all_questions):
        qid = q.get('id')
        if not qid or qid in seen_ids:
            print(f"Error: Duplicate or missing ID at item {idx}: {qid}", file=sys.stderr)
            sys.exit(1)
        seen_ids.add(qid)

        lvl = q.get('level')
        if lvl not in ['N5', 'N4', 'N3', 'N2', 'N1']:
            print(f"Error: Invalid level '{lvl}' in question {qid}", file=sys.stderr)
            sys.exit(1)

        opts = q.get('options', [])
        if len(opts) != 4:
            print(f"Error: Question {qid} does not have exactly 4 options", file=sys.stderr)
            sys.exit(1)

        c_idx = q.get('correctIndex')
        if not (isinstance(c_idx, int) and 0 <= c_idx < 4):
            print(f"Error: Question {qid} has invalid correctIndex {c_idx}", file=sys.stderr)
            sys.exit(1)

        if not q.get('explanation'):
            print(f"Error: Question {qid} missing Spanish explanation", file=sys.stderr)
            sys.exit(1)

        levels_count[lvl] = levels_count.get(lvl, 0) + 1
        sec = q.get('section')
        sections_count[sec] = sections_count.get(sec, 0) + 1

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)

    print(f"Successfully generated {len(all_questions)} JLPT questions to {output_path}")
    print("Breakdown by Level:", json.dumps(levels_count, indent=2))
    print("Breakdown by Section:", json.dumps(sections_count, indent=2))

if __name__ == '__main__':
    main()
