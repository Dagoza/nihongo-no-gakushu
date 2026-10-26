#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_stories_complete.py
Genera y consolida el catálogo canónico de historias para Nihongo Master.
"""

import json
import re

def clean_for_ime(text):
    return re.sub(r'[、。！？「」\s\(\)（）\.\?]', '', text).strip()

print("🚀 Generando catálogo maestro de 10 historias completas (N5 a N1)...")

# =============================================================================
# HISTORIA 1: 日本での一日 (Un día en Japón) - JLPT N5
# =============================================================================
story_1_paragraphs = [
    {
        "chapter": 1,
        "title": "朝の始まり (Comienza la mañana)",
        "japanese": "私は今年、外国から来ました。私の国は遠いです。今日は四月一日、月曜日です。今は午前六時半です。私は毎日、早く起きます。天気が良くて、空に白い雲が少しだけあるけど、だいたい青いです。でも、外はとても寒いです。私は冷たい水で顔を洗います。朝ごはんはいつも味が良くて、美味しいです。もちろん、少しだけ食べます。父と母はもう会社へ行きました。子供たちはまだ家にいる。",
        "hiragana": "わたしは ことし、がいこくから きました。わたしの くには とおいです。きょうは しがつついたち、げつようびです。いまは ごぜん ろくじはんです。わたしは まいにち、はやく おきます。てんきが よくて、そらに しろい くもが すこしだけ あるけど、だいたい あおいです。でも、そとは とても さむいです。わたしは つめたい みずで かおを あらいます。あさごはんは いつも あじが よくて、おいしいです。もちろん、すこしだけ たべます。ちちと ははは もう かいしゃへ いきました。こどもたちは まだ いえに いる。",
        "translation_es": "Llegué del extranjero este año. Mi país natal está lejos. Hoy es lunes primero de abril. Ahora son las seis y media de la mañana. Me levanto temprano todos los días. Hace buen tiempo, y aunque hay pocas nubes blancas en el cielo, está mayormente azul. Pero afuera hace mucho frío. Me lavo la cara con agua fría. El desayuno siempre tiene buen sabor y es delicioso. Por supuesto, solo como un poco. Mi padre y mi madre ya se fueron al trabajo. Los niños todavía están en la casa.",
        "rubyDict": {"私": "わたし", "今年": "ことし", "外国": "がいこく", "来ました": "きました", "国": "くに", "遠い": "とおい", "今日": "きょう", "四月一日": "しがつついたち", "月曜日": "げつようび", "今": "いま", "午前六時半": "ごぜんろくじはん", "毎日": "まいにち", "早く": "はやく", "起きます": "おきます", "天気": "てんき", "良くて": "よくて", "空": "そら", "白い": "しろい", "雲": "くも", "青い": "あおい", "外": "そと", "寒い": "さむい", "冷たい": "つめたい", "水": "みず", "顔": "かお", "洗います": "あらいます", "朝ごはん": "あさごはん", "味": "あじ", "美味しい": "おいしい", "食べます": "たべます", "父": "ちち", "母": "はは", "会社": "かいしゃ", "子供たち": "こどもたち", "家": "いえ"}
    },
    {
        "chapter": 2,
        "title": "学校への道と友達 (El camino a la escuela y amigos)",
        "japanese": "私は学生です。学校から駅は近いですが、家から遠いので、電車に乗ります。駅への道は長いです。道に大きい木と美しい花があります。木の下に、男の子と女の子が立っています。右と左に古い店や新しい小さい店が見えます。駅の前に、大勢の人がいます。電車は速いですが、いつも人が多いです。八時に駅を出て、学校へ入ります。学校の南口で友達に会いました。彼女の名前は「みか」です。「おはよう！元気？」と私が言います。",
        "hiragana": "わたしは がくせいです。がっこうから えきは ちかいですが、いえから とおいので、でんしゃに のります。えきへの みちは ながいです。みちに おおきい きと うつくしい はなが あります。きの したに、おとこのこと おんなのこが たっています。みぎと ひだりに ふるい みせや あたらしい ちいさい みせが みえます。えきの まえに、おおぜいの ひとが います。でんしゃは はやいですが、いつも ひとが おおいです。はちじに えきを でて、がっこうへ はいります。がっこうの みなみぐちで ともだちに あいました。かのじょの なまえは「みか」です。「おはよう！げんき？」と わたしが いいます。",
        "translation_es": "Soy estudiante. La estación está cerca de la escuela, pero como está lejos de mi casa, tomo el tren. El camino hacia la estación es largo. En el camino hay árboles grandes y flores hermosas. Debajo del árbol, están de pie un niño y una niña. A la derecha y a la izquierda se ven tiendas antiguas y pequeñas tiendas nuevas. Frente a la estación hay una multitud de personas. El tren es veloz, pero siempre va lleno de gente. A las ocho salgo de la estación y entro a la escuela. En la puerta sur de la escuela me encontré con mi amiga. Su nombre es Mika. '¡Buenos días! ¿Cómo estás?' le digo.",
        "rubyDict": {"学生": "がくせい", "学校": "がっこう", "駅": "えき", "近い": "ちかい", "電車": "でんしゃ", "乗ります": "のります", "道": "みち", "長い": "ながい", "大きい": "おおきい", "木": "き", "美しい": "うつくしい", "花": "はな", "男の子": "おとこのこ", "女の子": "おんなのこ", "立っています": "たっています", "右": "みぎ", "左": "ひだり", "古い": "ふるい", "店": "みせ", "新しい": "あたらしい", "小さい": "ちいさい", "見えます": "みえます", "大勢": "おおぜい", "人": "ひと", "速い": "はやい", "多い": "おおい", "八時": "はちじ", "南口": "みなみぐち", "友達": "ともだち", "会いました": "あいました", "彼女": "かのじょ", "名前": "なまえ", "言います": "いいます"}
    },
    {
        "chapter": 3,
        "title": "日本語の授業 (Clase de japonés)",
        "japanese": "今日は日本語の勉強をします。先生方はみんな、良い人です。かばんの中に本があります。机の上に本を出します。私たちは先生の話をよく聞いて、本を読みます。そして、字を書きます。今日のテストはあまり易しくないです。ちょっと難しいです。私は「この漢字の読み方は何ですか」と先生に聞きます。授業はつまらないですか？いいえ、よく勉強するから、面白いです。休み時間に、私たちは話をします。",
        "hiragana": "きょうは にほんごの べんきょうを します。せんせいがたは みんな、よい ひとです。かばんの なかに ほんが あります。つくえの うえに ほんを だします。わたしたちは せんせいの はなしを よく きいて、ほんを よみます。そして、じを かきます。きょうの てすとは あまり やすくないです。ちょっと むずかしいです。わたしは「この かんじの よみかたは なんですか」と せんせいに ききます。じゅぎょうは つまらないですか？いいえ、よく べんきょうするから、おもしろいです。やすみじかんに、わたしたちは はなしを します。",
        "translation_es": "Hoy estudiamos japonés. Todos los profesores son excelentes personas. Hay libros dentro de la mochila. Saco los libros sobre el escritorio. Escuchamos atentamente las explicaciones del profesor y leemos el libro. Luego, escribimos caracteres. El examen de hoy no es muy fácil. Es un poco difícil. Le pregunto al profesor: '¿Cuál es la lectura de este kanji?'. ¿La clase es aburrida? No, como estudiamos con ganas, es muy entretenida. En el receso escolar, conversamos juntos.",
        "rubyDict": {"日本語": "にほんご", "勉強": "べんきょう", "先生方": "せんせいがた", "本": "ほん", "机": "つくえ", "出します": "だします", "話": "はなし", "聞いて": "きいて", "読みます": "よみます", "字": "じ", "書きます": "かきます", "易しくない": "やすくない", "難しい": "むずかしい", "漢字": "かんじ", "読み方": "よみかた", "何": "なん", "授業": "じゅぎょう", "面白い": "おもしろい", "休み時間": "やすみじかん"}
    },
    {
        "chapter": 4,
        "title": "昼休みと週末の計画 (El almuerzo y planes de fin de semana)",
        "japanese": "午後十二時です。皆で外へ出て、魚を食べます。飲み物も買います。お茶は百五十円ぐらいです。全部で千二百九十八円です。安いです。私は友達に言います。「今週の土曜日と日曜日に何をしますか？」「東の山に行きます。山は高いですか？いいえ、低いですが、空気が良くて楽しいです。」「いいですね。私は西の川に行きます。足を入れると気持ちがいいです。」「火曜日、水曜日、木曜日、金曜日は忙しいけど、休みは楽しいです。今年は暑いから、たくさん水を飲んでね。」友達のお父さんは三万円で古い車を買いました。だから、私たちは車で行くかもしれません。でも、車は遅いから、電車で行く方がいいです。北の空が黒いです。悪い天気になるかもしれません。雨が来るかもしれません。でも、もちろん行きます。自分の目と耳と口と手で、大きい山を楽しみます。あと五分で、時間が来ます。二、三、四、五、六、七、八、九、十。さあ、行きましょう！",
        "hiragana": "ごご じゅうにじです。みんなで そとへ でて、さかなを たべます。のみものも かいます。おちゃは ひゃくごじゅうえん ぐらいです。ぜんぶで せんにひゃくきゅうじゅうはちえんです。やすいです。わたしは ともだちに いいます。「こんしゅうの どようびと にちようびに なにを しますか？」「ひがしの やまに いきます。やまは たかいですか？いいえ、ひくいですが、くうきが よくて たのしいです。」「いいですね。わたしは にしの かわに いきます。あしを いれると きもちが いいです。」「かようび、すいようび、もくようび、きんようびは いそがしいけど、やすみは たのしいです。ことしは あついから、たくさん みずを のんでね。」ともだちの おとうさんは さんまんえんで ふるい くるまを かいました。だから、わたしたちは くるまで いくかもしれません。でも、くるまは おそいから、でんしゃで いくほうが いいです。きたの そらが くろいです。わるい てんきに なるかもしれません。あめが くるかもしれません。でも、もちろん いきます。じぶんの めと みみと くちと てで、おおきい やまを たのしみます。あと ごふんで、じかんが きます。に、さん、し、ご、ろく、しち、はち、きゅう、じゅう。さあ、いきましょう！",
        "translation_es": "Son las doce del mediodía. Salimos todos afuera y comemos pescado. También compramos bebidas. El té cuesta alrededor de ciento cincuenta yenes. En total son mil doscientos noventa y ocho yenes. Es barato. Le digo a mi amiga: '¿Qué harás el sábado y el domingo de esta semana?'. 'Voy a la montaña del este. ¿Es alta la montaña? No, es baja, pero el aire es puro y es divertido'. '¡Qué bien! Yo voy al río del oeste. Meter los pies en el agua se siente muy fresco'. 'Los martes, miércoles, jueves y viernes estamos ocupados, pero el descanso es divertido. Como este año hace calor, bebe mucha agua'. El padre de mi amiga compró un automóvil viejo por treinta mil yenes. Por eso, tal vez vayamos en automóvil. Sin embargo, como el auto es lento, es mejor viajar en tren. El cielo del norte se ve oscuro. Quizás el tiempo empeore. Quizás empiece a llover. Aun así, por supuesto que iremos. Disfrutaremos de la gran montaña con nuestros propios ojos, oídos, boca y manos. En cinco minutos llegará la hora. Dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez. ¡Vamos ya!",
        "rubyDict": {"午後十二時": "ごごじゅうにじ", "皆": "みな", "魚": "さかな", "飲み物": "のみもの", "買います": "かいます", "お茶": "おちゃ", "百五十円": "ひゃくごじゅうえん", "全部": "ぜんぶ", "千二百九十八円": "せんにひゃくきゅうじゅうはちえん", "安い": "やすい", "今週": "こんしゅう", "土曜日": "どようび", "日曜日": "にちようび", "東": "ひがし", "山": "やま", "高い": "たかい", "低い": "ひくい", "空気": "くうき", "楽しい": "たのしい", "西": "にし", "川": "かわ", "足": "あし", "入れる": "いれる", "気持ち": "きもち", "火曜日": "かようび", "水曜日": "すいようび", "木曜日": "もくようび", "金曜日": "きんようび", "忙しい": "いそがしい", "休み": "やすみ", "暑い": "あつい", "飲んで": "のんで", "お父さん": "おとうさん", "三万円": "さんまんえん", "車": "くるま", "遅い": "おそい", "北": "きた", "黒い": "くろい", "悪い": "わるい", "雨": "あめ", "目": "め", "耳": "みみ", "口": "くち", "手": "て", "五分": "ごふん", "時間": "じかん", "行きましょう": "いきましょう"}
    }
]

story_1_sentences = [
    # Cap 1
    {"id": "sent_1", "chapter": 1, "japanese": "私は今年、外国から来ました。", "translation_es": "Llegué del extranjero este año.", "grammar_note": "Partícula から indica procedencia u origen geográfico. 来ました es el pasado formal de 来る.", "clean_target": clean_for_ime("私は今年外国から来ました")},
    {"id": "sent_2", "chapter": 1, "japanese": "私の国は遠いです。", "translation_es": "Mi país natal está lejos.", "grammar_note": "Partícula の denota posesión ('mi país'). 遠い es un adjetivo い que significa 'lejano'.", "clean_target": clean_for_ime("私の国は遠いです")},
    {"id": "sent_3", "chapter": 1, "japanese": "今日は四月一日、月曜日です。", "translation_es": "Hoy es lunes primero de abril.", "grammar_note": "一日 se lee ついたち como lectura especial irregular para el primer día del mes.", "clean_target": clean_for_ime("今日は四月一日月曜日です")},
    {"id": "sent_4", "chapter": 1, "japanese": "今は午前六時半です。", "translation_es": "Ahora son las seis y media de la mañana.", "grammar_note": "午前 expresa AM (antes del mediodía). 半 significa 'y media' en expresiones horarias.", "clean_target": clean_for_ime("今は午前六時半です")},
    {"id": "sent_5", "chapter": 1, "japanese": "私は毎日、早く起きます。", "translation_es": "Me levanto temprano todos los días.", "grammar_note": "早く es la forma adverbial de 早い (temprano) que modifica al verbo 起きます (levantarse).", "clean_target": clean_for_ime("私は毎日早く起きます")},
    {"id": "sent_6", "chapter": 1, "japanese": "天気が良くて、空に白い雲が少しだけあるけど、だいたい青いです。", "translation_es": "Hace buen tiempo y, aunque hay pocas nubes blancas, el cielo está mayormente azul.", "grammar_note": "良くて es la forma て del adjetivo irregular 良い (bueno). 〜けど actúa como conector adversativo.", "clean_target": clean_for_ime("天気が良くて空に白い雲が少しだけあるけどだいたい青いです")},
    {"id": "sent_7", "chapter": 1, "japanese": "でも、外はとても寒いです。", "translation_es": "Sin embargo, afuera hace mucho frío.", "grammar_note": "でも introduce contraste al inicio de frase. 寒い es un adjetivo い para clima frío.", "clean_target": clean_for_ime("でも外はとても寒いです")},
    {"id": "sent_8", "chapter": 1, "japanese": "私は冷たい水で顔を洗います。", "translation_es": "Me lavo la cara con agua fría.", "grammar_note": "Partícula で indica el medio instrumental (con agua). 冷たい denota frialdad táctil de objetos.", "clean_target": clean_for_ime("私は冷たい水で顔を洗います")},
    {"id": "sent_9", "chapter": 1, "japanese": "朝ごはんはいつも味が良くて、美味しいです。", "translation_es": "El desayuno siempre tiene buen sabor y es delicioso.", "grammar_note": "La forma て de un adjetivo une dos cualidades descriptivas en serie acumulativa.", "clean_target": clean_for_ime("朝ごはんはいつも味が良くて美味しいです")},
    {"id": "sent_10", "chapter": 1, "japanese": "もちろん、少しだけ食べます。", "translation_es": "Por supuesto, solo como un poco.", "grammar_note": "だけ delimita cantidad en sentido restrictivo ('únicamente', 'solamente un poco').", "clean_target": clean_for_ime("もちろん少しだけ食べます")},
    {"id": "sent_11", "chapter": 1, "japanese": "父と母はもう会社へ行きました。", "translation_es": "Mi padre y mi madre ya se fueron a la empresa.", "grammar_note": "もう con verbo en pasado expresa que una acción ya ha concluido con anterioridad.", "clean_target": clean_for_ime("父と母はもう会社へ行きました")},
    {"id": "sent_12", "chapter": 1, "japanese": "子供たちはまだ家にいる。", "translation_es": "Los niños todavía están en casa.", "grammar_note": "たち forma el plural de personas (niños). まだ indica persistencia temporal ('aún').", "clean_target": clean_for_ime("子供たちはまだ家にいる")},
    # Cap 2
    {"id": "sent_13", "chapter": 2, "japanese": "私は学生です。", "translation_es": "Soy estudiante.", "grammar_note": "Estructura canónica de presentación: A は B です.", "clean_target": clean_for_ime("私は学生です")},
    {"id": "sent_14", "chapter": 2, "japanese": "学校から駅は近いですが、家から遠いので、電車に乗ります。", "translation_es": "La estación está cerca de la escuela, pero como está lejos de mi casa, tomo el tren.", "grammar_note": "〜ので introduce justificación causal objetiva ('debido a que').", "clean_target": clean_for_ime("学校から駅は近いですが家から遠いので電車に乗ります")},
    {"id": "sent_15", "chapter": 2, "japanese": "駅への道は長いです。", "translation_es": "El camino hacia la estación es largo.", "grammar_note": "Partícula compuesta への une dirección y sustantivo destino.", "clean_target": clean_for_ime("駅への道は長いです")},
    {"id": "sent_16", "chapter": 2, "japanese": "道に大きい木と美しい花があります。", "translation_es": "En el camino hay árboles grandes y hermosas flores.", "grammar_note": "があります expresa existencia de elementos inanimados en una localización espacial (に).", "clean_target": clean_for_ime("道に大きい木と美しい花があります")},
    {"id": "sent_17", "chapter": 2, "japanese": "木の下に、男の子と女の子が立っています。", "translation_es": "Bajo el árbol, están de pie un niño y una niña.", "grammar_note": "Forma ている (立っている) expresa el resultado de una acción postural en curso.", "clean_target": clean_for_ime("木の下に男の子と女の子が立っています")},
    {"id": "sent_18", "chapter": 2, "japanese": "右と左に古い店や新しい小さい店が見えます。", "translation_es": "A la derecha y a la izquierda se ven tiendas viejas y tiendas pequeñas nuevas.", "grammar_note": "Partícula や lista ejemplos no exhaustivos. が見える denota percepción visual espontánea.", "clean_target": clean_for_ime("右と左に古い店や新しい小さい店が見えます")},
    {"id": "sent_19", "chapter": 2, "japanese": "駅の前に、大勢の人がいます。", "translation_es": "Frente a la estación hay una multitud de personas.", "grammar_note": "います denota existencia de seres animados (personas y animales).", "clean_target": clean_for_ime("駅の前に大勢の人がいます")},
    {"id": "sent_20", "chapter": 2, "japanese": "電車は速いですが、いつも人が多いです。", "translation_es": "El tren es rápido, pero siempre hay mucha gente.", "grammar_note": "速い (rápido) contrasta mediante が con la congestión de pasajeros.", "clean_target": clean_for_ime("電車は速いですがいつも人が多いです")},
    {"id": "sent_21", "chapter": 2, "japanese": "八時に駅を出て、学校へ入ります。", "translation_es": "A las ocho salgo de la estación y entro a la escuela.", "grammar_note": "La partícula を marca el punto físico del que se parte o sale (駅を出る).", "clean_target": clean_for_ime("八時に駅を出て学校へ入ります")},
    {"id": "sent_22", "chapter": 2, "japanese": "学校の南口で友達に会いました。", "translation_es": "En la entrada sur de la escuela me encontré con mi amiga.", "grammar_note": "El interlocutor o persona con quien uno se encuentra se marca con に (友達に会う).", "clean_target": clean_for_ime("学校の南口で友達に会いました")},
    {"id": "sent_23", "chapter": 2, "japanese": "彼女の名前は「みか」です。", "translation_es": "Su nombre es Mika.", "grammar_note": "Cópula cortés です para identificar a la persona.", "clean_target": clean_for_ime("彼女の名前はみかです")},
    {"id": "sent_24", "chapter": 2, "japanese": "「おはよう！元気？」と私が言います。", "translation_es": "'¡Buenos días! ¿Cómo estás?' le digo.", "grammar_note": "La partícula と cita de forma directa las palabras formuladas entre comillas.", "clean_target": clean_for_ime("おはよう元気と私が言います")},
    # Cap 3
    {"id": "sent_25", "chapter": 3, "japanese": "今日は日本語の勉強をします。", "translation_es": "Hoy estudiamos japonés.", "grammar_note": "勉強をする convierte el sustantivo en acción verbal dinámica mediante el verbo する.", "clean_target": clean_for_ime("今日は日本語の勉強をします")},
    {"id": "sent_26", "chapter": 3, "japanese": "先生方はみんな、良い人です。", "translation_es": "Los profesores son todos muy buenas personas.", "grammar_note": "方 (がた) es el sufijo cortés plural para personas de respeto como profesores.", "clean_target": clean_for_ime("先生方はみんな良い人です")},
    {"id": "sent_27", "chapter": 3, "japanese": "かばんの中に本があります。", "translation_es": "Hay libros dentro de la mochila.", "grammar_note": "Ubicación espacial con el sustantivo relacional 中 (adentro) y la partícula に.", "clean_target": clean_for_ime("かばんの中に本があります")},
    {"id": "sent_28", "chapter": 3, "japanese": "机の上に本を出します。", "translation_es": "Saco los libros sobre el escritorio.", "grammar_note": "出します es un verbo transitivo que expresa sacar u ofrecer algo.", "clean_target": clean_for_ime("机の上に本を出します")},
    {"id": "sent_29", "chapter": 3, "japanese": "私たちは先生の話をよく聞いて、本を読みます。", "translation_es": "Escuchamos atentamente las palabras del profesor y leemos el libro.", "grammar_note": "よく como adverbio significa 'atentamente' o 'frecuentemente'.", "clean_target": clean_for_ime("私たちは先生の話をよく聞いて本を読みます")},
    {"id": "sent_30", "chapter": 3, "japanese": "そして、字を書きます。", "translation_es": "Y luego, escribimos caracteres.", "grammar_note": "そして conecta acciones consecutivas en orden cronológico.", "clean_target": clean_for_ime("そして字を書きます")},
    {"id": "sent_31", "chapter": 3, "japanese": "今日のテストはあまり易しくないです。", "translation_es": "El examen de hoy no es muy fácil.", "grammar_note": "あまり con verbo o adjetivo negativo significa 'no muy' o 'apenas'.", "clean_target": clean_for_ime("今日のテストはあまり易しくないです")},
    {"id": "sent_32", "chapter": 3, "japanese": "ちょっと難しいです。", "translation_es": "Es un poco difícil.", "grammar_note": "ちょっと matiza de forma moderada y cortés una dificultad.", "clean_target": clean_for_ime("ちょっと難しいです")},
    {"id": "sent_33", "chapter": 3, "japanese": "私は「この漢字の読み方は何ですか」と先生に聞きます。", "translation_es": "Le pregunto al profesor: '¿Cuál es la lectura de este kanji?'.", "grammar_note": "Verbo raíz + 方 (読み方) indica 'manera o forma de hacer algo'.", "clean_target": clean_for_ime("私はこの漢字の読み方は何ですかと先生に聞きます")},
    {"id": "sent_34", "chapter": 3, "japanese": "授業はつまらないですか？", "translation_es": "¿Es aburrida la clase?", "grammar_note": "Partícula interrogativa か al final de la oración cortés.", "clean_target": clean_for_ime("授業はつまらないですか")},
    {"id": "sent_35", "chapter": 3, "japanese": "いいえ、よく勉強するから、面白いです。", "translation_es": "No, como estudiamos con ganas, es muy entretenida.", "grammar_note": "から pospuesto a la oración aporta la causa o motivo ('porque').", "clean_target": clean_for_ime("いいえよく勉強するから面白いです")},
    {"id": "sent_36", "chapter": 3, "japanese": "休み時間に、私たちは話をします。", "translation_es": "En el recreo, conversamos juntos.", "grammar_note": "休み時間 representa el intervalo de descanso o receso escolar.", "clean_target": clean_for_ime("休み時間に私たちは話をします")},
    # Cap 4
    {"id": "sent_37", "chapter": 4, "japanese": "午後十二時です。", "translation_es": "Son las doce del mediodía.", "grammar_note": "Expresión horaria estándar con 午後 (tarde/mediodía) y 時.", "clean_target": clean_for_ime("午後十二時です")},
    {"id": "sent_38", "chapter": 4, "japanese": "皆で外へ出て、魚を食べます。", "translation_es": "Salimos todos afuera y comemos pescado.", "grammar_note": "皆で expresa acción conjunta en grupo ('entre todos').", "clean_target": clean_for_ime("皆で外へ出て魚を食べます")},
    {"id": "sent_39", "chapter": 4, "japanese": "飲み物も買います。", "translation_es": "También compramos bebidas.", "grammar_note": "Partícula も añade elementos al contexto ('también bebidas').", "clean_target": clean_for_ime("飲み物も買います")},
    {"id": "sent_40", "chapter": 4, "japanese": "お茶は百五十円ぐらいです。", "translation_es": "El té cuesta alrededor de ciento cincuenta yenes.", "grammar_note": "くらい / ぐらい pospuesto a un valor numérico expresa cantidad aproximada.", "clean_target": clean_for_ime("お茶は百五十円ぐらいです")},
    {"id": "sent_41", "chapter": 4, "japanese": "全部で千二百九十八円です。", "translation_es": "En total son mil doscientos noventa y ocho yenes.", "grammar_note": "全部で expresa importe o cómputo total acumulado.", "clean_target": clean_for_ime("全部で千二百九十八円です")},
    {"id": "sent_42", "chapter": 4, "japanese": "安いです。", "translation_es": "Es barato.", "grammar_note": "Adjetivo い 安い (económico, accesible).", "clean_target": clean_for_ime("安いです")},
    {"id": "sent_43", "chapter": 4, "japanese": "私は友達に言います。", "translation_es": "Le digo a mi amiga.", "grammar_note": "El destinatario de la comunicación se señala con la partícula に.", "clean_target": clean_for_ime("私は友達に言います")},
    {"id": "sent_44", "chapter": 4, "japanese": "「今週の土曜日と日曜日に何をしますか？」", "translation_es": "'¿Qué harás el sábado y el domingo de esta semana?'", "grammar_note": "何をしますか es la pregunta cotidiana estándar para consultar planes futuros.", "clean_target": clean_for_ime("今週の土曜日と日曜日に何をしますか")},
    {"id": "sent_45", "chapter": 4, "japanese": "「東の山に行きます。山は高いですか？いいえ、低いですが、空気が良くて楽しいです。」", "translation_es": "'Voy a la montaña del este. ¿Es alta la montaña? No, es baja, pero el aire es puro y es divertido'.", "grammar_note": "Adjetivos opuestos: 高い (alto) vs 低い (bajo).", "clean_target": clean_for_ime("東の山に行きます山は高いですかいいえ低いですが空気が良くて楽しいです")},
    {"id": "sent_46", "chapter": 4, "japanese": "「いいですね。私は西の川に行きます。足を入れると気持ちがいいです。」", "translation_es": "'¡Qué bien! Yo voy al río del oeste. Meter los pies en el agua se siente muy fresco'.", "grammar_note": "Condicional temporal と (入れると) para describir una sensación placentera inmediata.", "clean_target": clean_for_ime("いいですね私は西の川に行きます足を入れると気持ちがいいです")},
    {"id": "sent_47", "chapter": 4, "japanese": "「火曜日、水曜日、木曜日、金曜日は忙しいけど、休みは楽しいです。今年は暑いから、たくさん水を飲んでね。」", "translation_es": "'Los martes, miércoles, jueves y viernes son ocupados, pero el descanso es divertido. Como hace calor, bebe mucha agua'.", "grammar_note": "Días de la semana y recomendación afectuosa con la partícula ね.", "clean_target": clean_for_ime("火曜日水曜日木曜日金曜日は忙しいけど休みは楽しいです今年は暑いからたくさん水を飲んでね")},
    {"id": "sent_48", "chapter": 4, "japanese": "友達のお父さんは三万円で古い車を買いました。", "translation_es": "El padre de mi amiga compró un automóvil viejo por treinta mil yenes.", "grammar_note": "Partícula で marca el precio o coste de adquisición comercial.", "clean_target": clean_for_ime("友達のお父さんは三万円で古い車を買いました")},
    {"id": "sent_49", "chapter": 4, "japanese": "だから、私たちは車で行くかもしれません。", "translation_es": "Por esa razón, tal vez vayamos en automóvil.", "grammar_note": "〜かもしれません expresa probabilidad o posibilidad incierta ('tal vez').", "clean_target": clean_for_ime("だから私たちは車で行くかもしれません")},
    {"id": "sent_50", "chapter": 4, "japanese": "でも、車は遅いから、電車で行く方がいいです。", "translation_es": "Sin embargo, como el auto es lento, es mejor viajar en tren.", "grammar_note": "〜方がいい es la fórmula de recomendación y preferencia comparativa ('es preferible').", "clean_target": clean_for_ime("でも車は遅いから電車で行く方がいいです")},
    {"id": "sent_51", "chapter": 4, "japanese": "北の空が黒いです。", "translation_es": "El cielo del norte está oscuro.", "grammar_note": "Uso descriptivo de puntos cardinales y adjetivos cromáticos.", "clean_target": clean_for_ime("北の空が黒いです")},
    {"id": "sent_52", "chapter": 4, "japanese": "悪い天気になるかもしれません。", "translation_es": "Quizás el tiempo empeore.", "grammar_note": "Adjetivo + になる expresa cambio de estado progresivo.", "clean_target": clean_for_ime("悪い天気になるかもしれません")},
    {"id": "sent_53", "chapter": 4, "japanese": "雨が来るかもしれません。", "translation_es": "Quizás empiece a llover.", "grammar_note": "Expresión figurativa de precipitación climática.", "clean_target": clean_for_ime("雨が来るかもしれません")},
    {"id": "sent_54", "chapter": 4, "japanese": "でも、もちろん行きます。", "translation_es": "Aun así, por supuesto que iremos.", "grammar_note": "もちろん reafirma con convicción la decisión tomada.", "clean_target": clean_for_ime("でももちろん行きます")},
    {"id": "sent_55", "chapter": 4, "japanese": "自分の目と耳と口と手で、大きい山を楽しみます。", "translation_es": "Disfrutaremos de la gran montaña con nuestros propios ojos, oídos, boca y manos.", "grammar_note": "Partes anatómicas sensoriales unidas con la partícula と y el instrumental で.", "clean_target": clean_for_ime("自分の目と耳と口と手で大きい山を楽しみます")},
    {"id": "sent_56", "chapter": 4, "japanese": "あと五分で、時間が来ます。", "translation_es": "En cinco minutos llegará la hora de salida.", "grammar_note": "あと + tiempo expresa el lapso restante antes de un acontecimiento.", "clean_target": clean_for_ime("あと五分で時間が来ます")},
    {"id": "sent_57", "chapter": 4, "japanese": "二、三、四、五、六、七、八、九、十。さあ、行きましょう！", "translation_es": "Dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez. ¡Vamos ya!", "grammar_note": "Forma volitiva cortés 〜ましょう que invita a iniciar una acción compartida.", "clean_target": clean_for_ime("二三四五六七八九十さあ行きましょう")}
]

story_1_questions = [
    {
        "id": "story_1_q1",
        "question": "¿A qué hora se despierta el protagonista todos los días según el relato?",
        "question_jp": "主人公は毎日何時に起きますか？",
        "options": [
            "午前六時半 (6:30 AM)",
            "午前七時 (7:00 AM)",
            "午前八時 (8:00 AM)",
            "午前六時 (6:00 AM)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 1 se menciona explícitamente: «今は午前六時半です。私は毎日、早く起きます» (Ahora son las seis y media de la mañana. Me levanto temprano todos los días)."
    },
    {
        "id": "story_1_q2",
        "question": "¿Dónde y a qué hora se encuentra el protagonista con su amiga Mika?",
        "question_jp": "主人公はどこで友達のみかさんに会いましたか？",
        "options": [
            "学校の南口で八時過ぎ (En la puerta sur de la escuela)",
            "駅のホームで七時 (En el andén de la estación)",
            "教室の中で九時 (Dentro del aula de clase)",
            "スーパーの前で正午 (Frente al supermercado)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 2 se relata: «八時に駅を出て、学校へ入ります。学校の南口で友達に会いました。彼女の名前は「みか」です»."
    },
    {
        "id": "story_1_q3",
        "question": "¿Cuál es el plan de la amiga para el fin de semana y por qué prefiere ir en tren?",
        "question_jp": "週末の予定と電車で行く理由は何ですか？",
        "options": [
            "Ir a la montaña del este; prefiere el tren porque el auto viejo es muy lento.",
            "Ir a pescar al río del oeste en autobús.",
            "Quedarse en casa estudiando kanji con los profesores.",
            "Comprar un automóvil nuevo en el centro de Tokio."
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 4 la amiga planea ir a la montaña del este («東の山に行きます») y concluye que es mejor viajar en tren porque el auto es lento («車は遅いから、電車で行く方がいいです»)."
    }
]

story_1 = {
    "id": "story_1",
    "title": "日本での一日",
    "title_es": "Un día en Japón (私の日本での生活)",
    "title_en": "A Day in Japan",
    "difficulty": "N5",
    "level": "N5",
    "category": "Vida Cotidiana y Rutina",
    "source_modules": [1, 3, 5, 8],
    "description": "Crónica matinal de un estudiante internacional recién llegado a Japón: su despertar, el trayecto escolar en tren, su clase de japonés y la animada charla con su amiga sobre planes de fin de semana.",
    "paragraphs": story_1_paragraphs,
    "sentences": story_1_sentences,
    "comprehension_questions": story_1_questions
}

print("✅ Historia 1 compilada con 57 frases completas y 3 preguntas en español.")

# =============================================================================
# HISTORIA 2: 東京での新しい暮らし (Nueva Vida en Tokio) - JLPT N5
# =============================================================================
story_2_paragraphs = [
    {
        "chapter": 1,
        "title": "シェアハウスでの新しい生活 (Vida en la casa compartida)",
        "japanese": "私は先週から、東京のシェアハウスに住んでいます。リビングルームには大きなテレビとソファがあります。ルームメイトは田中さんとマルシアさんです。田中さんは日本人で、会社員です。マルシアさんはブラジルから来ました。毎日みんなで楽しく話します。",
        "hiragana": "わたしは せんしゅうから、とうきょうの しぇあはうすに すんでいます。りびんぐるーむには おおきな てれびと そふぁーが あります。るーむめいとは たなかさんと まるしあさんです。たなかさんは にほんじんで、かいしゃいんです。まるしあさんは ぶらじるから きました。まいにち みんなで たのしく はなします。",
        "translation_es": "Desde la semana pasada vivo en una casa compartida en Tokio. En la sala de estar hay una televisión grande y un sofá. Mis compañeros de piso son el señor Tanaka y Marcia. El señor Tanaka es japonés y empleado de oficina. Marcia vino de Brasil. Todos los días conversamos alegremente juntos.",
        "rubyDict": {"私": "わたし", "先週": "せんしゅう", "東京": "とうきょう", "住んでいます": "すんでいます", "大きな": "おおきな", "田中": "たなか", "日本人": "にほんじん", "会社員": "かいしゃいん", "来ました": "きました", "毎日": "まいにち", "楽しく": "たのしく", "話します": "はなします"}
    },
    {
        "chapter": 2,
        "title": "スーパーでの買い物と料理 (Compras en el supermercado y cocina)",
        "japanese": "昨日の夕方、駅の近くのスーパーへ行きました。野菜と果物と肉を買いました。日本のスーパーはとても広くて、品物が多いです。会計の時、店員さんが「袋はいりますか」と聞きました。私は「いいえ、袋はいりません」と答えました。夜はみんなでカレーを作って食べました。",
        "hiragana": "きのうの ゆうがた、えきの ちかくの すーぱーへ いきました。やさいと くだものと にくを かいました。にほんの すーぱーは とても ひろくて、しなものが おおいです。かいけいの とき、てんいんさんが「ふくろは いりますか」と ききました。わたしは「いいえ、ふくろは いりません」と こたえました。よるは みんなで かれーを つくって たべました。",
        "translation_es": "Ayer al atardecer fui al supermercado cerca de la estación. Compré verduras, fruta y carne. Los supermercados japoneses son muy amplios y tienen gran variedad de productos. Al pagar, el cajero preguntó: '¿Desea bolsa?'. Respondí: 'No, no necesito bolsa'. Por la noche preparamos curry entre todos y comimos juntos.",
        "rubyDict": {"昨日": "きのう", "夕方": "ゆうがた", "駅": "えき", "近く": "ちかく", "行きました": "いきました", "野菜": "やさい", "果物": "くだもの", "肉": "にく", "買いました": "かいました", "日本": "にほん", "広くて": "ひろくて", "品物": "しなもの", "多い": "おおい", "会計": "かいけい", "時": "とき", "店員": "てんいん", "袋": "ふくろ", "聞きました": "ききました", "答えました": "こたえました", "夜": "よる", "作って": "つくって", "食べました": "たべました"}
    },
    {
        "chapter": 3,
        "title": "地下鉄に乗って秋葉原へ (En metro hacia Akihabara)",
        "japanese": "土曜日に、電車に乗って秋葉原に行きました。新宿駅から黄色い総武線に乗りました。電車の中はとても静かでした。秋葉原の電気街には高いビルがたくさんあります。大きな店で新しいイヤホンを買いました。道に迷いましたが、交番のお巡りさんが親切に教えてくれました。",
        "hiragana": "どようびに、でんしゃに のって あきはばらに いきました。しんじゅくえきから きいろい そうぶせんに のりました。でんしゃの なかは とても しずかでした。あきはばらの でんきがいには たかい びるが たくさん あります。おおきな みせで あたらしい いやほんを かいました。みちに まよいましたが、こうばんの おまわりさんが しんせつに おしえて くれました。",
        "translation_es": "El sábado tomé el tren y fui a Akihabara. Tomé la línea amarilla Sobu desde la estación de Shinjuku. Dentro del tren había mucho silencio. En el barrio tecnológico de Akihabara hay muchísimos edificios altos. Compré unos auriculares nuevos en una tienda grande. Me perdí por el camino, pero el policía del Kōban me indicó amablemente la ruta.",
        "rubyDict": {"土曜日": "どようび", "電車": "でんしゃ", "乗って": "のって", "秋葉原": "あきはばら", "新宿駅": "しんじゅくえき", "黄色い": "きいろい", "総武線": "そうぶせん", "乗りました": "のりました", "中": "なか", "静か": "しずか", "電気街": "でんきがい", "高い": "たかい", "大きな": "おおきな", "店": "みせ", "新しい": "あたらしい", "買いました": "かいました", "道": "みち", "迷いました": "まよいました", "交番": "こうばん", "お巡りさん": "おまわりさん", "親切": "しんせつ", "教えて": "おしえて"}
    },
    {
        "chapter": 4,
        "title": "下町の夏祭りと花火 (El festival de verano y los fuegos artificiales)",
        "japanese": "日曜日には、近くの神社でお祭りがありました。大勢の人が浴衣を着て歩いていました。屋台でたこ焼きと焼きそばを買いました。とても美味しかったです。夜八時になると、空にきれいな花火が上がりました。日本の夏の夜は本当に素晴らしい思い出になりました。",
        "hiragana": "にちようびには、ちかくの じんじゃで おまつりが ありました。おおぜいの ひとが ゆかたを きて あるいていました。やたいで たこやきと やきそばを かいました。とても おいしかったです。よる はちじに なると、そらに きれいな はなびが あがりました。にほんの なつの よるは ほんとうに すばらしい おもいでに なりました。",
        "translation_es": "El domingo hubo un festival en el santuario cercano. Mucha gente caminaba vistiendo yukata. Compré takoyaki y yakisoba en los puestos callejeros. Estaban deliciosos. A las ocho de la noche, hermosos fuegos artificiales se elevaron hacia el cielo. La noche de verano en Japón se convirtió en un recuerdo verdaderamente maravilloso.",
        "rubyDict": {"日曜日": "にちようび", "近く": "ちかく", "神社": "じんじゃ", "お祭り": "おまつり", "大勢": "おおぜい", "人": "ひと", "浴衣": "ゆかた", "着て": "きて", "歩いていました": "あるいていました", "屋台": "やたい", "買いました": "かいました", "美味しかったです": "おいしかったです", "夜": "よる", "八時": "はちじ", "空": "そら", "花火": "はなび", "上がりました": "あがりました", "日本": "にほん", "夏": "なつ", "本当に": "ほんとうに", "素晴らしい": "すばらしい", "思い出": "おもいで"}
    }
]

story_2_sentences = [
    # Cap 1
    {"id": "s2_1", "chapter": 1, "japanese": "私は先週から、東京のシェアハウスに住んでいます。", "translation_es": "Desde la semana pasada vivo en una casa compartida en Tokio.", "grammar_note": "〜から indica punto de partida temporal ('desde'). 〜に住んでいます expresa estado de residencia habitual con forma ている.", "clean_target": clean_for_ime("私は先週から東京のシェアハウスに住んでいます")},
    {"id": "s2_2", "chapter": 1, "japanese": "リビングルームには大きなテレビとソファがあります。", "translation_es": "En la sala de estar hay una televisión grande y un sofá.", "grammar_note": "Partícula と une sustantivos en lista exhaustiva. があります denota existencia de objetos inanimados.", "clean_target": clean_for_ime("リビングルームには大きなテレビとソファがあります")},
    {"id": "s2_3", "chapter": 1, "japanese": "ルームメイトは田中さんとマルシアさんです。", "translation_es": "Mis compañeros de piso son el señor Tanaka y Marcia.", "grammar_note": "Cópula です afirma la identidad cortés de los sujetos.", "clean_target": clean_for_ime("ルームメイトは田中さんとマルシアさんです")},
    {"id": "s2_4", "chapter": 1, "japanese": "田中さんは日本人で、会社員です。", "translation_es": "El señor Tanaka es japonés y es empleado de oficina.", "grammar_note": "La forma て de la cópula (で) enlaza dos oraciones nominales coordinadas.", "clean_target": clean_for_ime("田中さんは日本人で会社員です")},
    {"id": "s2_5", "chapter": 1, "japanese": "マルシアさんはブラジルから来ました。", "translation_es": "Marcia vino de Brasil.", "grammar_note": "Partícula から marca procedencia u origen geográfico con el verbo 来ました.", "clean_target": clean_for_ime("マルシアさんはブラジルから来ました")},
    {"id": "s2_6", "chapter": 1, "japanese": "毎日みんなで楽しく話します。", "translation_es": "Todos los días conversamos alegremente juntos.", "grammar_note": "楽しく es la forma adverbial del adjetivo い 楽しい (divertido/alegre).", "clean_target": clean_for_ime("毎日みんなで楽しく話します")},
    # Cap 2
    {"id": "s2_7", "chapter": 2, "japanese": "昨日の夕方、駅の近くのスーパーへ行きました。", "translation_es": "Ayer al atardecer fui al supermercado cerca de la estación.", "grammar_note": "Partícula へ o に marca la dirección del desplazamiento con verbos de movimiento.", "clean_target": clean_for_ime("昨日の夕方駅の近くのスーパーへ行きました")},
    {"id": "s2_8", "chapter": 2, "japanese": "野菜と果物と肉を買いました。", "translation_es": "Compré verduras, fruta y carne.", "grammar_note": "Partícula acusativa を marca el objeto directo de la compra.", "clean_target": clean_for_ime("野菜と果物と肉を買いました")},
    {"id": "s2_9", "chapter": 2, "japanese": "日本のスーパーはとても広くて、品物が多いです。", "translation_es": "Los supermercados japoneses son muy amplios y tienen gran variedad de productos.", "grammar_note": "Forma て del adjetivo 広い (広くて) conecta dos características descriptivas.", "clean_target": clean_for_ime("日本のスーパーはとても広くて品物が多いです")},
    {"id": "s2_10", "chapter": 2, "japanese": "会計の時、店員さんが「袋はいりますか」と聞きました。", "translation_es": "Al pagar, el dependiente preguntó: '¿Desea bolsa?'.", "grammar_note": "Partícula と cita textualmente la pregunta formulada por el empleado.", "clean_target": clean_for_ime("会計の時店員さんが袋はいりますかと聞きました")},
    {"id": "s2_11", "chapter": 2, "japanese": "私は「いいえ、袋はいりません」と答えました。", "translation_es": "Respondí: 'No, no necesito bolsa'.", "grammar_note": "Expresión canónica cotidiana en cajas de comercios japoneses para cuidar el medio ambiente.", "clean_target": clean_for_ime("私はいいえ袋はいりませんと答えました")},
    {"id": "s2_12", "chapter": 2, "japanese": "夜はみんなでカレーを作って食べました。", "translation_es": "Por la noche preparamos curry entre todos y comimos.", "grammar_note": "Forma て (作って) une acciones en secuencia cronológica inmediata.", "clean_target": clean_for_ime("夜はみんなでカレーを作って食べました")},
    # Cap 3
    {"id": "s2_13", "chapter": 3, "japanese": "土曜日に、電車に乗って秋葉原に行きました。", "translation_es": "El sábado tomé el tren y fui a Akihabara.", "grammar_note": "El medio de transporte que se aborda se marca con la partícula に (電車に乗る).", "clean_target": clean_for_ime("土曜日に電車に乗って秋葉原に行きました")},
    {"id": "s2_14", "chapter": 3, "japanese": "新宿駅から黄色い総武線に乗りました。", "translation_es": "Tomé la línea amarilla Sobu desde la estación de Shinjuku.", "grammar_note": "新宿駅から indica la estación de partida; 黄色い modifica directamente a 総武線.", "clean_target": clean_for_ime("新宿駅から黄色い総武線に乗りました")},
    {"id": "s2_15", "chapter": 3, "japanese": "電車の中はとても静かでした。", "translation_es": "Dentro del tren había mucho silencio.", "grammar_note": "Pasado cortés del adjetivo な 静か (静かでした).", "clean_target": clean_for_ime("電車の中はとても静かでした")},
    {"id": "s2_16", "chapter": 3, "japanese": "秋葉原の電気街には高いビルがたくさんあります。", "translation_es": "En el barrio tecnológico de Akihabara hay muchísimos edificios altos.", "grammar_note": "La partícula には combina localización espacial y énfasis temático.", "clean_target": clean_for_ime("秋葉原の電気街には高いビルがたくさんあります")},
    {"id": "s2_17", "chapter": 3, "japanese": "大きな店で新しいイヤホンを買いました。", "translation_es": "Compré unos auriculares nuevos en una tienda grande.", "grammar_note": "Partícula で marca el establecimiento comercial donde se ejecuta la transacción.", "clean_target": clean_for_ime("大きな店で新しいイヤホンを買いました")},
    {"id": "s2_18", "chapter": 3, "japanese": "道に迷いましたが、交番のお巡りさんが親切に教えてくれました。", "translation_es": "Me perdí por el camino, pero el policía del Kōban me indicó amablemente la ruta.", "grammar_note": "Verbo auxiliar 〜てくれる expresa gratitud por un favor o ayuda recibida de alguien.", "clean_target": clean_for_ime("道に迷いましたが交番のお巡りさんが親切に教えてくれました")},
    # Cap 4
    {"id": "s2_19", "chapter": 4, "japanese": "日曜日には、近くの神社でお祭りがありました。", "translation_es": "El domingo hubo un festival en el santuario cercano.", "grammar_note": "La partícula で marca el lugar donde tiene lugar un evento dinámico (お祭りがある).", "clean_target": clean_for_ime("日曜日には近くの神社でお祭りがありました")},
    {"id": "s2_20", "chapter": 4, "japanese": "大勢の人が浴衣を着て歩いていました。", "translation_es": "Mucha gente caminaba vistiendo yukata.", "grammar_note": "着て (forma て de 着る) unida a 歩いていました describe una acción simultánea en desarrollo.", "clean_target": clean_for_ime("大勢の人が浴衣を着て歩いていました")},
    {"id": "s2_21", "chapter": 4, "japanese": "屋台でたこ焼きと焼きそばを買いました。", "translation_es": "Compré takoyaki y yakisoba en los puestos callejeros.", "grammar_note": "屋台 (yatai) son los puestos ambulantes típicos de festivales.", "clean_target": clean_for_ime("屋台でたこ焼きと焼きそばを買いました")},
    {"id": "s2_22", "chapter": 4, "japanese": "とても美味しかったです。", "translation_es": "Estaban verdaderamente deliciosos.", "grammar_note": "Pasado afirmativo del adjetivo い 美味しい (美味しかったです).", "clean_target": clean_for_ime("とても美味しかったです")},
    {"id": "s2_23", "chapter": 4, "japanese": "夜八時になると、空にきれいな花火が上がりました。", "translation_es": "A las ocho de la noche, hermosos fuegos artificiales se elevaron hacia el cielo.", "grammar_note": "〜になると expresa una consecuencia temporal fija ('al llegar las ocho').", "clean_target": clean_for_ime("夜八時になると空にきれいな花火が上がりました")},
    {"id": "s2_24", "chapter": 4, "japanese": "日本の夏の夜は本当に素晴らしい思い出になりました。", "translation_es": "La noche de verano en Japón se convirtió en un recuerdo verdaderamente maravilloso.", "grammar_note": "〜になる con sustantivos expresa cambio de condición ('se convirtió en un recuerdo').", "clean_target": clean_for_ime("日本の夏の夜は本当に素晴らしい思い出になりました")}
]

story_2_questions = [
    {
        "id": "story_2_q1",
        "question": "¿Quiénes son los compañeros de piso del protagonista en la casa compartida?",
        "question_jp": "主人公のルームメイトは誰ですか？",
        "options": [
            "田中さん (un japonés asalariado) y マルシアさん (una chica de Brasil)",
            "鈴木さん y un estudiante estadounidense",
            "Mika y un profesor de japonés de la escuela",
            "Dos policías del Kōban de Shinjuku"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 1 se menciona: «ルームメイトは田中さんとマルシアさんです。田中さんは日本人で、会社員です。マルシアさんはブラジルから来ました»."
    },
    {
        "id": "story_2_q2",
        "question": "¿Qué respondió el protagonista cuando el cajero del supermercado le preguntó por la bolsa de plástico?",
        "question_jp": "店員が「袋はいりますか」と聞いた時、主人公はどう答えましたか？",
        "options": [
            "«いいえ、袋はいりません» (No, no necesito bolsa)",
            "«はい、袋を二枚ください» (Sí, deme dos bolsas)",
            "«いくらですか» (¿Cuánto cuesta?)",
            "«カレーを温めてください» (Por favor caliente el curry)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 2 el texto indica literalmente: «店員さんが「袋はいりますか」と聞きました。私は「いいえ、袋はいりません」と答えました»."
    },
    {
        "id": "story_2_q3",
        "question": "¿Quién ayudó al protagonista cuando se perdió camino a Akihabara?",
        "question_jp": "秋葉原で道に迷った時、誰が道を教えてくれましたか？",
        "options": [
            "交番のお巡りさん (El policía del puesto Kōban)",
            "駅の改札の駅員さん (El encargado de los torniquetes de la estación)",
            "田中さん por llamada telefónica",
            "Un dependiente de la tienda de auriculares"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 3 se relata: «道に迷いましたが、交番のお巡りさんが親切に教えてくれました»."
    }
]

story_2 = {
    "id": "story_2",
    "title": "東京での新しい暮らし",
    "title_es": "Nueva Vida en Tokio (Compartir piso, compras y festivales)",
    "title_en": "New Life in Tokyo",
    "difficulty": "N5",
    "level": "N5",
    "category": "Vida Urbana y Adaptación",
    "source_modules": [4, 6, 12, 13, 14, 15],
    "description": "Crónica entrañable sobre la llegada a una casa compartida en Tokio, la compra de alimentos en supermercados y combinis, la orientación en el metro y la mágica noche de un festival de verano.",
    "paragraphs": story_2_paragraphs,
    "sentences": story_2_sentences,
    "comprehension_questions": story_2_questions
}

print("✅ Historia 2 compilada con 24 frases completas y 3 preguntas en español.")

# =============================================================================
# HISTORIA 3: 日本での挑戦と発見 (Desafíos y Descubrimientos) - JLPT N4
# =============================================================================
story_3_paragraphs = [
    {
        "chapter": 1,
        "title": "日本に来たばかりの日々と電器屋 (Recién llegado y la tienda de electrónica)",
        "japanese": "日本に来たばかりの時は、右も左も分からなくて大変でした。アパートに必要な掃除機を買いに家電量販店へ行きました。店員さんが「この掃除機は軽くて動かしやすいですよ」と勧めてくれました。ポイントカードを出すのを忘れましたが、少し安くしてもらえて嬉しかったです。",
        "hiragana": "にほんに きたばかりの ときは、みぎも ひだりも わからなくて たいへんでした。あぱーとに ひつような そうじきを かいに かでんりょうはんてんへ いきました。てんいんさんが「この そうじきは かるくて うごかしやすいですよ」と すすめて くれました。ぽいんとかーどを だすのを わすれましたが、すこし やすく してもらえて うれしかったです。",
        "translation_es": "Cuando recién acababa de llegar a Japón, no entendía ni la derecha ni la izquierda y fue bastante duro. Fui a una gran tienda de electrodomésticos a comprar una aspiradora necesaria para mi apartamento. El dependiente me recomendó: 'Esta aspiradora es ligera y fácil de mover'. Aunque olvidé presentar la tarjeta de puntos, me alegré mucho de que me hicieran una rebaja.",
        "rubyDict": {"日本": "にほん", "来たばかり": "きたばかり", "時": "とき", "右": "みぎ", "左": "ひだり", "分からなくて": "わからなくて", "大変": "たいへん", "必要": "ひつよう", "掃除機": "そうじき", "買いに": "かいに", "家電量販店": "かでんりょうはんてん", "店員": "てんいん", "軽くて": "かるくて", "動かしやすい": "うごかしやすい", "勧めて": "すすめて", "忘れました": "わすれました", "少し": "すこし", "安く": "やすく", "嬉しかった": "うれしかった"}
    },
    {
        "chapter": 2,
        "title": "ラーメン屋での注文とアレルギー (Pedidos en la taberna y alergias)",
        "japanese": "同僚と人気のラーメン屋に行きました。私はエビアレルギーがあるので、海鮮スープのラーメンは食べられないんです。店員さんに相談すると、「こちらは豚骨ベースなので大丈夫ですよ」と教えてくれました。「わさび抜きで」と頼む必要もなく、安心して美味しく食べられました。",
        "hiragana": "どうりょうと にんきの らーめんやに いきました。わたしは えびあれるぎーが あるので、かいせんすーぷの らーめんは たべられないんです。てんいんさんに そうだんすると、「こちらは とんこつべーすなので だいじょうぶですよ」と おしえて くれました。「わさびぬきで」と たのむ ひつようもなく、あんしんして おいしく たべられました。",
        "translation_es": "Fui con un compañero de trabajo a una famosa taberna de ramen. Como tengo alergia a los camarones, no puedo tomar ramen con sopa de mariscos. Al consultarle al mesero, me explicó: 'Este tiene base de caldo de cerdo, así que no hay ningún problema'. No tuve necesidad de pedir 'sin wasabi' y pude comer con tranquilidad y mucho gusto.",
        "rubyDict": {"同僚": "どうりょう", "人気": "にんき", "海鮮": "かいせん", "食べられない": "たべられない", "相談": "そうだん", "豚骨": "とんこつ", "大丈夫": "だいじょうぶ", "教えて": "おしえて", "抜き": "ぬき", "頼む": "たのむ", "必要": "ひつよう", "安心": "あんしん", "美味しく": "おいしく"}
    },
    {
        "chapter": 3,
        "title": "突然の雨と地域のお祭り (Lluvia imprevista y el festival de barrio)",
        "japanese": "町内の夏祭り当日、午後から雲行きが怪しくなりました。「雨が降ったら中止になりますか」と係の人に聞くと、「小雨なら体育館で行いますよ」と答えてくれました。夕方から雨が降り出しましたが、屋台が体育館の前に移動して、みんなで盆踊りを楽しむことができました。",
        "hiragana": "ちょうないの なつまつり とうじつ、ごごから くもゆきが あやしくなりました。「あめが ふったら ちゅうしに なりますか」と かかりの ひとに きくと、「こあめなら たいいくかんで おこないますよ」と こたえて くれました。ゆうがたから あめが ふりだしましたが、やたいが たいいくかんの まえに いどうして、みんなで ぼんおどりを たのしむことが できました。",
        "translation_es": "El día del festival de verano de nuestro barrio, el cielo se puso amenazante desde la tarde. Cuando pregunté al encargado: 'Si llueve, ¿se cancelará?', me respondió: 'Si es llovizna suave, lo haremos en el gimnasio cubierto'. Al atardecer empezó a llover, pero los puestos se trasladaron frente al gimnasio y pudimos disfrutar juntos del baile Bon Odori.",
        "rubyDict": {"町内": "ちょうない", "夏祭り": "なつまつり", "当日": "とうじつ", "雲行き": "くもゆき", "怪しく": "あやしく", "雨": "あめ", "降ったら": "ふったら", "中止": "ちゅうし", "係": "かかり", "小雨": "こあめ", "体育館": "たいいくかん", "行います": "おこないます", "降り出し": "ふりだし", "屋台": "やたい", "移動": "いどう", "盆踊り": "ぼんおどり", "楽しむ": "たのしむ"}
    },
    {
        "chapter": 4,
        "title": "美容院と不在票の連絡 (La peluquería y el aviso del cartero)",
        "japanese": "週末、日本の美容院で初めて髪を切りました。「前髪をもう少し短く切ってもらえますか」と希望を伝えると、美容師さんはとても丁寧にカットしてくれました。家に帰るとポストに不在票が入っていたので、ネットですぐに再配達をお願いしました。",
        "hiragana": "しゅうまつ、にほんの びよういんで はじめて かみを きりました。「まえがみを もうすこし みじかく きってもらえますか」と きぼうを つたえると、びようしさんは とても ていねいに かっと して くれました。いえに かえると ぽすとに ふざいひょうが はいっていたので、ねっとで すぐに さいはいたつを おねがいしました。",
        "translation_es": "El fin de semana me corté el pelo por primera vez en una peluquería japonesa. Cuando le transmití mi deseo: '¿Podría cortarme el flequillo un poco más corto?', el estilista me cortó el cabello con gran esmero. Al regresar a casa encontré un aviso de entrega fallida en el buzón, así que solicité de inmediato la reentrega por internet.",
        "rubyDict": {"週末": "しゅうまつ", "美容院": "びよういん", "初めて": "はじめて", "髪": "かみ", "切りました": "きりました", "前髪": "まえがみ", "短く": "みじかく", "希望": "きぼう", "伝える": "つたえる", "美容師": "びようし", "丁寧": "ていねい", "帰る": "かえる", "不在票": "ふざいひょう", "再配達": "さいはいたつ", "お願い": "おねがい"}
    },
    {
        "chapter": 5,
        "title": "緊急地震速報と将来の夢 (Alerta sísmica y proyectos a futuro)",
        "japanese": "ある日の午後、スマートフォンからけたたましい緊急地震速報が鳴り響きました。私は慌てず机の下に入って頭を守りました。揺れが収まった後、同僚たちが声をかけ合って無事を確認しました。日本の安全への配慮に深く感銘を受け、将来はこの国で自分の会社を作ろうと思っています。",
        "hiragana": "あるひの ごご、すまーとふぉんから けたたましい きんきゅうじしんそくほう が なりひびきました。わたしは あわてず つくえの したに はいって あたまを まもりました。ゆれが おさまった のち、どうりょうたちが こえを かけあって ぶじを かくにんしました。にほんの あんぜんへの はいりょに ふかく かんめいを受け、しょうらいは このくにで じぶんの かいしゃを つくろうと おもっています。",
        "translation_es": "Una tarde, una estridente alerta sísmica temprana sonó en mi teléfono. Sin entrar en pánico, me metí debajo de la mesa protegiéndome la cabeza. Una vez que cesó el temblor, los compañeros nos llamamos unos a otros confirmando que todos estábamos a salvo. Quedé profundamente impresionado por la cultura de seguridad de Japón, y en el futuro pienso crear mi propia empresa en este país.",
        "rubyDict": {"午後": "ごご", "緊急地震速報": "きんきゅうじしんそくほう", "鳴り響き": "なりひびき", "慌てず": "あわてず", "机": "つくえ", "下": "した", "頭": "あたま", "守りました": "まもりました", "揺れ": "ゆれ", "収まった": "おさまった", "同僚": "どうりょう", "声": "こえ", "無事": "ぶじ", "確認": "かくにん", "安全": "あんぜん", "配慮": "はいりょ", "感銘": "かんめい", "将来": "しょうらい", "国": "くに", "自分": "じぶん", "会社": "かいしゃ", "作ろう": "つくろう"}
    }
]

story_3_sentences = [
    # Cap 1
    {"id": "s3_1", "chapter": 1, "japanese": "日本に来たばかりの時は、右も左も分からなくて大変でした。", "translation_es": "Cuando recién acababa de llegar a Japón, no entendía nada y fue muy duro.", "grammar_note": "〜たばかり expresa pasado inmediato subjetivo ('acabar de llegar'). 右も左も分からない es una locución para desorientación total.", "clean_target": clean_for_ime("日本に来たばかりの時は右も左も分からなくて大変でした")},
    {"id": "s3_2", "chapter": 1, "japanese": "アパートに必要な掃除機を買いに家電量販店へ行きました。", "translation_es": "Fui a una gran tienda de electrodomésticos a comprar una aspiradora necesaria para mi apartamento.", "grammar_note": "Verbo raíz + に行く expresa el propósito de un desplazamiento.", "clean_target": clean_for_ime("アパートに必要な掃除機を買いに家電量販店へ行きました")},
    {"id": "s3_3", "chapter": 1, "japanese": "店員さんが「この掃除機は軽くて動かしやすいですよ」と勧めてくれました。", "translation_es": "El empleado me recomendó: 'Esta aspiradora es ligera y fácil de mover'.", "grammar_note": "動かす (mover) en raíz ます + やすい = 動かしやすい (fácil de operar). 〜てくれる expresa agradecimiento.", "clean_target": clean_for_ime("店員さんがこの掃除機は軽くて動かしやすいですよと勧めてくれました")},
    {"id": "s3_4", "chapter": 1, "japanese": "ポイントカードを出すのを忘れましたが、少し安くしてもらえて嬉しかったです。", "translation_es": "Olvidé sacar la tarjeta de puntos, pero me hicieron una rebaja y me alegré.", "grammar_note": "Verbo diccionario + のを忘れる sustantiva la acción olvidada. 〜てもらえる indica recibir un favor.", "clean_target": clean_for_ime("ポイントカードを出すのを忘れましたが少し安くしてもらえて嬉しかったです")},
    # Cap 2
    {"id": "s3_5", "chapter": 2, "japanese": "同僚と人気のラーメン屋に行きました。", "translation_es": "Fui con un compañero de trabajo a una famosa taberna de ramen.", "grammar_note": "Partícula と marca la compañía. 人気の modifica a ラーメン屋 como atributo apreciativo.", "clean_target": clean_for_ime("同僚と人気のラーメン屋に行きました")},
    {"id": "s3_6", "chapter": 2, "japanese": "私はエビアレルギーがあるので、海鮮スープのラーメンは食べられないんです。", "translation_es": "Como tengo alergia a los camarones, no puedo tomar ramen con sopa de mariscos.", "grammar_note": "〜ので aporta justificación causal objetiva. 食べられない es la forma potencial negativa de 食べる.", "clean_target": clean_for_ime("私はエビアレルギーがあるので海鮮スープのラーメンは食べられないんです")},
    {"id": "s3_7", "chapter": 2, "japanese": "店員さんに相談すると、「こちらは豚骨ベースなので大丈夫ですよ」と教えてくれました。", "translation_es": "Al consultar al camarero, me explicó: 'Este tiene base de cerdo, así que no hay problema'.", "grammar_note": "Condicional 〜と indica que al realizar una acción se descubrió inmediatamente una respuesta.", "clean_target": clean_for_ime("店員さんに相談するとこちらは豚骨ベースなので大丈夫ですよと教えてくれました")},
    {"id": "s3_8", "chapter": 2, "japanese": "「わさび抜きで」と頼む必要もなく、安心して美味しく食べられました。", "translation_es": "No tuve necesidad de pedir 'sin wasabi' y pude comer con tranquilidad y gusto.", "grammar_note": "〜抜きで expresa 'sin' o 'excluyendo'. 食べられた es el potencial afirmativo pasado.", "clean_target": clean_for_ime("わさび抜きでと頼む必要もなく安心して美味しく食べられました")},
    # Cap 3
    {"id": "s3_9", "chapter": 3, "japanese": "町内の夏祭り当日、午後から雲行きが怪しくなりました。", "translation_es": "El día del festival de verano del barrio, el cielo se puso amenazante desde la tarde.", "grammar_note": "雲行きが怪しくなる es una expresión idiomática sobre deterioro meteorológico inminente.", "clean_target": clean_for_ime("町内の夏祭り当日午後から雲行きが怪しくなりました")},
    {"id": "s3_10", "chapter": 3, "japanese": "「雨が降ったら中止になりますか」と係の人に聞くと、「小雨なら体育館で行いますよ」と答えてくれました。", "translation_es": "Cuando pregunté al encargado: 'Si llueve, ¿se suspende?', me respondió: 'Si es llovizna suave, se hará en el gimnasio'.", "grammar_note": "Condicional 〜たら (降ったら) e hipótesis con sustantivos 〜なら (小雨なら).", "clean_target": clean_for_ime("雨が降ったら中止になりますかと係の人に聞くと小雨なら体育館で行いますよと答えてくれました")},
    {"id": "s3_11", "chapter": 3, "japanese": "夕方から雨が降り出しましたが、屋台が体育館の前に移動して、みんなで盆踊りを楽しむことができました。", "translation_es": "Al atardecer empezó a llover, pero los puestos se movieron frente al gimnasio y disfrutamos del baile Bon Odori.", "grammar_note": "Verbo raíz + 出す (降り出す) denota el comienzo repentino de una acción natural.", "clean_target": clean_for_ime("夕方から雨が降り出しましたが屋台が体育館の前に移動してみんなで盆踊りを楽しむことができました")},
    # Cap 4
    {"id": "s3_12", "chapter": 4, "japanese": "週末、日本の美容院で初めて髪を切りました。", "translation_es": "El fin de semana me corté el pelo por primera vez en una peluquería japonesa.", "grammar_note": "初めて funciona adverbialmente para denotar una experiencia inaugural.", "clean_target": clean_for_ime("週末日本の美容院で初めて髪を切りました")},
    {"id": "s3_13", "chapter": 4, "japanese": "「前髪をもう少し短く切ってもらえますか」と希望を伝えると、美容師さんはとても丁寧にカットしてくれました。", "translation_es": "Cuando pedí: '¿Podría cortarme el flequillo un poco más corto?', el peluquero cortó con esmero.", "grammar_note": "〜てもらえますか formula una petición de servicio educada pero cercana.", "clean_target": clean_for_ime("前髪をもう少し短く切ってもらえますかと希望を伝えると美容師さんはとても丁寧にカットしてくれました")},
    {"id": "s3_14", "chapter": 4, "japanese": "家に帰るとポストに不在票が入っていたので、ネットですぐに再配達をお願いしました。", "translation_es": "Al llegar a casa había un aviso de entrega fallida en el buzón, así que pedí la reentrega por internet.", "grammar_note": "不在票 (nota de ausencia). 再配達をお願いする es la fórmula estándar para solicitar un segundo reparto.", "clean_target": clean_for_ime("家に帰るとポストに不在票が入っていたのでネットですぐに再配達をお願いしました")},
    # Cap 5
    {"id": "s3_15", "chapter": 5, "japanese": "ある日の午後、スマートフォンからけたたましい緊急地震速報が鳴り響きました。", "translation_es": "Una tarde sonó una estridente alerta sísmica en mi teléfono móvil.", "grammar_note": "鳴り響く es un verbo compuesto que intensifica el sonido resonante en un espacio.", "clean_target": clean_for_ime("ある日の午後スマートフォンからけたたましい緊急地震速報が鳴り響きました")},
    {"id": "s3_16", "chapter": 5, "japanese": "私は慌てず机の下に入って頭を守りました。", "translation_es": "Sin entrar en pánico, me metí bajo la mesa y me protegí la cabeza.", "grammar_note": "慌てず es la forma formal negativa arcaica equivalente a 慌てないで (sin apresurarse/asustarse).", "clean_target": clean_for_ime("私は慌てず机の下に入って頭を守りました")},
    {"id": "s3_17", "chapter": 5, "japanese": "揺れが収まった後、同僚たちが声をかけ合って無事を確認しました。", "translation_es": "Tras calmarse el temblor, los colegas nos llamamos unos a otros confirmando que estábamos bien.", "grammar_note": "Verbo raíz + 合う (声をかけ合う) expresa acción recíproca mutua ('llamarse unos a otros').", "clean_target": clean_for_ime("揺れが収まった後同僚たちが声をかけ合って無事を確認しました")},
    {"id": "s3_18", "chapter": 5, "japanese": "日本の安全への配慮に深く感銘を受け、将来はこの国で自分の会社を作ろうと思っています。", "translation_es": "Quedé profundamente conmovido por la seguridad japonesa, y en el futuro pienso crear mi empresa aquí.", "grammar_note": "Forma volitiva 作ろう + と思っている expresa propósitos firmes proyectados al mediano y largo plazo.", "clean_target": clean_for_ime("日本の安全への配慮に深く感銘を受け将来はこの国で自分の会社を作ろうと思っています")}
]

story_3_questions = [
    {
        "id": "story_3_q1",
        "question": "¿Por qué el protagonista no podía comer ramen de sopa de mariscos en la taberna?",
        "question_jp": "主人公が海鮮スープのラーメンを食べられない理由は何ですか？",
        "options": [
            "エビアレルギーがあるから (Porque tiene alergia a los camarones)",
            "値段が高すぎるから (Porque era demasiado caro)",
            "豚骨スープが嫌いだから (Porque le disgusta el caldo de cerdo)",
            "宗教上の理由があるから (Por motivos religiosos)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 2 el texto declara explícitamente: «私はエビアレルギーがあるので、海鮮スープのラーメンは食べられないんです»."
    },
    {
        "id": "story_3_q2",
        "question": "¿Qué decisión tomó la organización del festival de barrio cuando comenzó a llover?",
        "question_jp": "雨が降り出した時、祭りの主催者はどう対応しましたか？",
        "options": [
            "屋台を体育館の前に移動して、盆踊りを楽しんだ (Trasladaron los puestos frente al gimnasio y bailaron Bon Odori)",
            "お祭りを完全に中止して全員帰宅させた (Cancelaron el festival por completo)",
            "神社の中で傘を配って外で続行した (Repartieron paraguas y continuaron afuera)",
            "翌週の日曜日に延期した (Lo aplazaron para el domingo siguiente)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 3 se relata: «夕方から雨が降り出しましたが、屋台が体育館の前に移動して、みんなで盆踊りを楽しむことができました»."
    },
    {
        "id": "story_3_q3",
        "question": "¿Cómo reaccionó el protagonista al sonar la alerta sísmica en su teléfono?",
        "question_jp": "緊急地震速報が鳴った時、主人公はどう行動しましたか？",
        "options": [
            "慌てず机の下に入って頭を守った (Sin entrar en pánico, se metió bajo la mesa y se protegió la cabeza)",
            "外へ走って逃げ出した (Salió corriendo al exterior)",
            "すぐに警察に電話をかけた (Llamó inmediatamente a la policía)",
            "非常口のドアを壊した (Rompió la puerta de emergencia)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 5 se indica: «私は慌てず机の下に入って頭を守りました»."
    }
]

story_3 = {
    "id": "story_3",
    "title": "日本での挑戦と発見",
    "title_es": "Desafíos y Descubrimientos (Irodori Elementary 2 · JLPT N4)",
    "title_en": "Challenges and Discoveries in Japan",
    "difficulty": "N4",
    "level": "N4",
    "category": "Autonomía y Convivencia",
    "source_modules": [20, 21, 22, 23, 25, 26, 27, 28],
    "description": "Relato centrado en la independencia cotidiana en Japón: elegir electrodomésticos, gestionar alergias alimentarias, pedir cortes en la peluquería, afrontar un sismo con serenidad y proyectar metas empresariales.",
    "paragraphs": story_3_paragraphs,
    "sentences": story_3_sentences,
    "comprehension_questions": story_3_questions
}

print("✅ Historia 3 compilada con 18 frases completas y 3 preguntas en español.")

# =============================================================================
# HISTORIA 4: 日本社会で生きる：夢への架け橋 (Vivir en Japón) - JLPT N3
# =============================================================================
story_4_paragraphs = [
    {
        "chapter": 1,
        "title": "アパートの契約と引越し (Contrato del piso y mudanza)",
        "japanese": "日本での生活も三年目に入り、念願の一人暮らしを始めることにしました。不動産屋で敷金と礼金が不要な物件を紹介してもらいました。入居した翌日、エアコンのリモコンが故障したみたいで動かなかったのですが、管理会社に連絡したところ、親切に修理業者を手配していただけました。",
        "hiragana": "にほんでの せいかつも さんねんめに はいり、ねんがんの ひとりぐらしを はじめることに しました。ふどうさんやで しききんと れいきんが ふような ぶっけんを しょうかいして もらいました。にゅうきょした よくじつ、えあこんの りもこんが こしょうしたみたいで うごかなかったのですが、かんりがいしゃに れんらくしたところ、しんせつに しゅうりぎょうしゃを てはいして いただけました。",
        "translation_es": "Mi vida en Japón entró en su tercer año y decidí empezar mi anhelada vida independiente. En la inmobiliaria me presentaron un piso que no requería ni fianza ni gratificación al casero (敷金・礼金). Al día siguiente de mudarme, parecía que el mando del aire acondicionado estaba estropeado y no funcionaba, pero al comunicarme con la administración tuvieron la amabilidad de enviarme un técnico de reparaciones.",
        "rubyDict": {"生活": "せいかつ", "三年目": "さんねんめ", "念願": "ねんがん", "一人暮らし": "ひとりぐらし", "始める": "はじめる", "不動産屋": "ふどうさんや", "敷金": "しききん", "礼金": "れいきん", "不要": "ふよう", "物件": "ぶっけん", "紹介": "しょうかい", "入居": "にゅうきょ", "翌日": "よくじつ", "故障": "こしょう", "管理会社": "かんりがいしゃ", "連絡": "れんらく", "親切": "しんせつ", "修理業者": "しゅうりぎょうしゃ", "手配": "てはい"}
    },
    {
        "chapter": 2,
        "title": "毎日の自炊と健康管理 (Cocina casera diaria y salud)",
        "japanese": "自立した生活を送るため、毎日の食事は栄養のバランスを考えて自炊するようにしています。仕事で疲れた夜は電子レンジを活用した時短料理を作ります。スーパーで知り合った近所のおばあちゃんから、地元の郷土料理である芋煮の作り方を教えてもらい、日本の伝統の味を実感しました。",
        "hiragana": "じりつした せいかつを おくるため、まいにちの しょくじは えいようの ばらんすを かんがえて じすいするように しています。しごとで つかれた よるは でんしれんじを かつようした じたんりょうりを つくります。すーぱーで しりあった きんじょの おばあちゃんから、じもとの きょうどりょうりである いもにの つくりかたを おしえてもらい、にほんの でんとうの あじを じっかんしました。",
        "translation_es": "Para llevar una vida independiente, me esfuerzo por cocinarme a diario pensando en el equilibrio nutricional. Las noches que llego cansado del trabajo preparo platos rápidos aprovechando el microondas. Una anciana vecina que conocí en el supermercado me enseñó a preparar Imoni, un plato tradicional regional, y experimenté el verdadero sabor tradicional de Japón.",
        "rubyDict": {"自立": "じりつ", "生活": "せいかつ", "送る": "おくる", "食事": "しょくじ", "栄養": "えいよう", "自炊": "じすい", "仕事": "しごと", "疲れた": "つかれた", "活用": "かつよう", "時短料理": "じたんりょうり", "知り合った": "しりあった", "近所": "きんじょ", "地元": "じもと", "郷土料理": "きょうどりょうり", "芋煮": "いもに", "作り方": "つくりかた", "伝統": "でんとう", "実感": "じっかん"}
    },
    {
        "chapter": 3,
        "title": "カフェでのオタク談義と友情 (Tertulias de anime y amistad en el café)",
        "japanese": "休日は趣味のサークル仲間とカフェで語り合います。「新作のアニメ映画って、もう観たんだっけ？」と尋ねると、友人が「戦闘シーンの作画が本当に鳥肌が立つほど凄かったよ」と熱く語ってくれました。お互いの価値観を認め合える親友になれたらいいなと心から願っています。",
        "hiragana": "きゅうじつは しゅみの さーくるなかまと かふぇで かたりあいます。「しんさくの あにめえいがって、もう みたんだっけ？」と たずねると、ゆうじんが「せんとうしーんの さくがが ほんとうに とりはだが たつほど すごかったよ」と あつく かたって くれました。おたがいの かちかんを みとめあえる しんゆうに なれたらいいなと こころから ねがっています。",
        "translation_es": "Los días libres me reúno a conversar en una cafetería con compañeros de mi club de aficiones. Cuando pregunté: 'Oye, ¿ya habías visto la nueva película de anime?', mi amigo relató con entusiasmo: 'La animación de las escenas de combate fue tan impresionante que de verdad se me puso la piel de gallina'. Deseo de corazón que podamos ser amigos entrañables que respeten mutuamente sus valores.",
        "rubyDict": {"休日": "きゅうじつ", "趣味": "しゅみ", "仲間": "なかま", "語り合います": "かたりあいます", "新作": "しんさく", "映画": "えいが", "観た": "みた", "尋ねる": "たずねる", "友人": "ゆうじん", "戦闘": "せんとう", "作画": "さくが", "鳥肌": "とりはだ", "熱く": "あつく", "お互い": "おたがい", "価値観": "かちかん", "認め合える": "みとめあえる", "親友": "しんゆう", "心から": "こころから", "願って": "ねがって"}
    },
    {
        "chapter": 4,
        "title": "九州・桜島への一人旅 (Viaje en solitario a Kyushu y Sakurajima)",
        "japanese": "有給休暇を取って、ずっと憧れていた鹿児島県へ一人旅に出かけました。フェリーから雄大な活火山である桜島を自分の目で見た時は、言葉を失うほどの迫力でした。温泉街の旅館では女将さんに温かくもてなしていただき、素晴らしい旅の思い出をカメラにたくさん収めました。",
        "hiragana": "ゆうきゅうきゅうかを とって、ずっと あこがれていた かごしまけんへ ひとりたびに でかけました。ふぇりーから ゆうだいな かつかざんである さくらじまを じぶんのめで みたときは、ことばを うしなうほどの はくりょくでした。おんせんがいの りょかんでは おかみさんに あたたかく もてなしていただき、すばらしい たびの おもいでを かめらに たくさん おさめました。",
        "translation_es": "Tomé vacaciones retribuidas y salí de viaje en solitario hacia la prefectura de Kagoshima, a la que tanto anhelaba ir. Cuando contemplé con mis propios ojos desde el ferry el majestuoso volcán activo Sakurajima, su imponente presencia me dejó sin palabras. En la posada tradicional de la villa termal la dueña me brindó una cálida hospitalidad, y capturé muchísimos recuerdos maravillosos con mi cámara.",
        "rubyDict": {"有給休暇": "ゆうきゅうきゅうか", "憧れて": "あこがれて", "鹿児島県": "かごしまけん", "一人旅": "ひとりたび", "出かけました": "でかけました", "雄大": "ゆうだい", "活火山": "かつかざん", "桜島": "さくらじま", "目": "め", "言葉": "ことば", "失う": "うしなう", "迫力": "はくりょく", "温泉街": "おんせんがい", "旅館": "りょかん", "女将": "おかみ", "温かく": "あたたかく", "素晴らしい": "すばらしい", "思い出": "おもいで", "収めました": "おさめました"}
    },
    {
        "chapter": 5,
        "title": "運命の採用面接とこれからの私 (La entrevista laboral formal con Keigo)",
        "japanese": "そして今日、志望していた日系グローバル企業の採用面接に臨みました。緊張しましたが、背筋を伸ばし「これまでの実務経験を活かし、貴社の国際事業に貢献させていただければ幸いです」と堂々と伝えました。面接官の温かい笑顔を見て、これまでの努力が報われたと確信しました。",
        "hiragana": "そして きょう、しぼうしていた にっけい ぐろーばるきぎょうの さいようめんせつに のぞみました。きんちょうしましたが、せすじを のばし「これまでの じつむけいけんを いかし、きしゃの こくさいじぎょうに こうけんさせていただければ さいわいです」と どうどうと つたえました。めんせつかんの あたたかい えがおを みて、これまでの どりょくが むくわれたと かくしんしました。",
        "translation_es": "Y hoy afronté la entrevista de selección en la empresa global japonesa a la que aspiraba ingresar. Estaba nervioso, pero erguí la espalda y transmití con aplomo: 'Aprovechando mi experiencia profesional previa, sería un inmenso honor si me permiten contribuir al área de negocios internacionales de su distinguida empresa'. Al ver la cálida sonrisa del entrevistador, tuve la certeza de que todo mi esfuerzo previo había valido la pena.",
        "rubyDict": {"志望": "しぼう", "企業": "きぎょう", "採用面接": "さいようめんせつ", "臨みました": "のぞみました", "緊張": "きんちょう", "背筋": "せすじ", "実務経験": "じつむけいけん", "活かし": "いかし", "貴社": "きしゃ", "国際事業": "こくさいじぎょう", "貢献": "こうけん", "幸い": "さいわい", "堂々と": "どうどうと", "面接官": "めんせつかん", "笑顔": "えがお", "努力": "どりょく", "報われた": "むくわれた", "確信": "かくしん"}
    }
]

story_4_sentences = [
    # Cap 1
    {"id": "s4_1", "chapter": 1, "japanese": "日本での生活も三年目に入り、念願の一人暮らしを始めることにしました。", "translation_es": "Mi vida en Japón entró en su tercer año y decidí empezar mi anhelada vida independiente.", "grammar_note": "〜ことにする expresa una decisión deliberada personal tomada por el hablante.", "clean_target": clean_for_ime("日本での生活も三年目に入り念願の一人暮らしを始めることにしました")},
    {"id": "s4_2", "chapter": 1, "japanese": "不動産屋で敷金と礼金が不要な物件を紹介してもらいました。", "translation_es": "En la inmobiliaria me presentaron un piso que no requería ni fianza ni gratificación al casero.", "grammar_note": "敷金 (fianza) y 礼金 (reikin). 〜てもらう expresa recibir un servicio o favor agradecido.", "clean_target": clean_for_ime("不動産屋で敷金と礼金が不要な物件を紹介してもらいました")},
    {"id": "s4_3", "chapter": 1, "japanese": "入居した翌日、エアコンのリモコンが故障したみたいで動かなかったのですが、管理会社に連絡したところ、親切に修理業者を手配していただけました。", "translation_es": "Al día siguiente el mando del aire no iba, pero al llamar a administración enviaron un técnico.", "grammar_note": "〜たところ expresa resultado inmediato tras realizar una gestión. 〜ていただく es el keigo humilde de 〜てもらう.", "clean_target": clean_for_ime("入居した翌日エアコンのリモコンが故障したみたいで動かなかったのですが管理会社に連絡したところ親切に修理業者を手配していただけました")},
    # Cap 2
    {"id": "s4_4", "chapter": 2, "japanese": "自立した生活を送るため、毎日の食事は栄養のバランスを考えて自炊するようにしています。", "translation_es": "Para llevar una vida independiente, procuro cocinarme a diario pensando en el equilibrio nutricional.", "grammar_note": "〜ようにしている denota esfuerzo deliberado y continuo por mantener un buen hábito.", "clean_target": clean_for_ime("自立した生活を送るため毎日の食事は栄養のバランスを考えて自炊するようにしています")},
    {"id": "s4_5", "chapter": 2, "japanese": "仕事で疲れた夜は電子レンジを活用した時短料理を作ります。", "translation_es": "Las noches de cansancio preparo platos rápidos aprovechando el microondas.", "grammar_note": "時短料理 (cocina eficiente/rápida). 活用する significa aplicar o sacar provecho de algo.", "clean_target": clean_for_ime("仕事で疲れた夜は電子レンジを活用した時短料理を作ります")},
    {"id": "s4_6", "chapter": 2, "japanese": "スーパーで知り合った近所のおばあちゃんから、地元の郷土料理である芋煮の作り方を教えてもらい、日本の伝統の味を実感しました。", "translation_es": "Una anciana vecina me enseñó a preparar Imoni, y experimenté el verdadero sabor tradicional.", "grammar_note": "〜である equivale formalmente a la cópula です/だ. 作り方 (método de elaboración).", "clean_target": clean_for_ime("スーパーで知り合った近所のおばあちゃんから地元の郷土料理である芋煮の作り方を教えてもらい日本の伝統の味を実感しました")},
    # Cap 3
    {"id": "s4_7", "chapter": 3, "japanese": "休日は趣味のサークル仲間とカフェで語り合います。", "translation_es": "Los días libres me reúno a dialogar en una cafetería con compañeros de aficiones.", "grammar_note": "語り合う combina 語る con 合う para significar dialogar en profundidad mutuamente.", "clean_target": clean_for_ime("休日は趣味のサークル仲間とカフェで語り合います")},
    {"id": "s4_8", "chapter": 3, "japanese": "「新作のアニメ映画って、もう観たんだっけ？」と尋ねると、友人が「戦闘シーンの作画が本当に鳥肌が立つほど凄かったよ」と熱く語ってくれました。", "translation_es": "Al preguntar si ya había visto la nueva película, mi amigo relató con emoción que la animación ponía la piel de gallina.", "grammar_note": "鳥肌が立つほど (hasta erizarse la piel). 〜んだっけ busca confirmar un recuerdo coloquial.", "clean_target": clean_for_ime("新作のアニメ映画ってもう観たんだっけと尋ねると友人が戦闘シーンの作画が本当に鳥肌が立つほど凄かったよと熱く語ってくれました")},
    {"id": "s4_9", "chapter": 3, "japanese": "お互いの価値観を認め合える親友になれたらいいなと心から願っています。", "translation_es": "Deseo de corazón que podamos ser amigos íntimos capaces de respetar los valores mutuos.", "grammar_note": "〜たらいいな expresa un anhelo sincero. 認め合える es el potencial de 認め合う.", "clean_target": clean_for_ime("お互いの価値観を認め合える親友になれたらいいなと心から願っています")},
    # Cap 4
    {"id": "s4_10", "chapter": 4, "japanese": "有給休暇を取って、ずっと憧れていた鹿児島県へ一人旅に出かけました。", "translation_es": "Tomé vacaciones retribuidas y salí de viaje en solitario hacia Kagoshima.", "grammar_note": "〜に憧れていた indica anhelo prolongado en el tiempo hacia un destino soñado.", "clean_target": clean_for_ime("有給休暇を取ってずっと憧れていた鹿児島県へ一人旅に出かけました")},
    {"id": "s4_11", "chapter": 4, "japanese": "フェリーから雄大な活火山である桜島を自分の目で見た時は、言葉を失うほどの迫力でした。", "translation_es": "Al contemplar desde el ferry el majestuoso volcán Sakurajima, su imponente fuerza me dejó sin palabras.", "grammar_note": "言葉を失うほど es una expresión enfática que indica que algo excede la descripción verbal.", "clean_target": clean_for_ime("フェリーから雄大な活火山である桜島を自分の目で見た時は言葉を失うほどの迫力でした")},
    {"id": "s4_12", "chapter": 4, "japanese": "温泉街の旅館では女将さんに温かくもてなしていただき、素晴らしい旅の思い出をカメラにたくさん収めました。", "translation_es": "En la posada termal la dueña me agasajó calurosamente y guardé preciosos recuerdos en mi cámara.", "grammar_note": "もてなしていただく es la cortesía reverencial de la hospitalidad tradicional (おもてなし).", "clean_target": clean_for_ime("温泉街の旅館では女将さんに温かくもてなしていただき素晴らしい旅の思い出をカメラにたくさん収めました")},
    # Cap 5
    {"id": "s4_13", "chapter": 5, "japanese": "そして今日、志望していた日系グローバル企業の採用面接に臨みました。", "translation_es": "Y hoy afronté la entrevista de contratación en la empresa global japonesa deseada.", "grammar_note": "面接に臨む (afrontar o acudir solemnemente a una entrevista o cita decisiva).", "clean_target": clean_for_ime("そして今日志望していた日系グローバル企業の採用面接に臨みました")},
    {"id": "s4_14", "chapter": 5, "japanese": "緊張しましたが、背筋を伸ばし「これまでの実務経験を活かし、貴社の国際事業に貢献させていただければ幸いです」と堂々と伝えました。", "translation_es": "Aunque nervioso, erguí la espalda y transmití con aplomo: 'Sería un honor si me permiten contribuir a su empresa'.", "grammar_note": "〜させていただければ幸いです es la cúspide del keigo formal de petición en entrevistas.", "clean_target": clean_for_ime("緊張しましたが背筋を伸ばしこれまでの実務経験を活かし貴社の国際事業に貢献させていただければ幸いですと堂々と伝えました")},
    {"id": "s4_15", "chapter": 5, "japanese": "面接官の温かい笑顔を見て、これまでの努力が報われたと確信しました。", "translation_es": "Al ver la cálida sonrisa del entrevistador, tuve la certeza de que mi esfuerzo había valido la pena.", "grammar_note": "努力が報われる es la locución para 'verse recompensado el esfuerzo realizado'.", "clean_target": clean_for_ime("面接官の温かい笑顔を見てこれまでの努力が報われたと確信しました")}
]

story_4_questions = [
    {
        "id": "story_4_q1",
        "question": "¿Qué condición ventajosa tenía el apartamento elegido en la inmobiliaria?",
        "question_jp": "主人公が選んだアパートの特徴は何ですか？",
        "options": [
            "敷金と礼金が不要な物件だった (No requería ni fianza ni gratificación al arrendador)",
            "家賃が東京で一番安かった (Era el piso más barato de todo Tokio)",
            "駅から徒歩三十秒だった (Estaba a 30 segundos a pie de la estación)",
            "家具と家電がすべて無料だった (Todos los muebles y aparatos eran gratuitos)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 1 se menciona: «不動産屋で敷金と礼金が不要な物件を紹介してもらいました»."
    },
    {
        "id": "story_4_q2",
        "question": "¿Qué plato tradicional regional aprendió a preparar el protagonista y de quién lo aprendió?",
        "question_jp": "主人公が作り方を教わった郷土料理は何ですか？",
        "options": [
            "地元の郷土料理である芋煮を近所のおばあちゃんから教わった (El guiso Imoni, de una anciana vecina)",
            "本場の豚骨ラーメンを飲食店の店長から教わった (Ramen de cerdo, del dueño de un restaurante)",
            "お好み焼きをシェアハウスの同僚から教わった (Okonomiyaki, de su compañero de piso)",
            "鹿児島名物の黒豚料理を旅館の女将から教わった (Plato de cerdo negro, de la posadera)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 2 se indica: «近所のおばあちゃんから、地元の郷土料理である芋煮の作り方を教えてもらい、日本の伝統の味を実感しました»."
    },
    {
        "id": "story_4_q3",
        "question": "¿Qué frase formal de Keigo utilizó el protagonista en la entrevista laboral?",
        "question_jp": "採用面接で主人公が伝えた敬語の表現は何ですか？",
        "options": [
            "«貴社の国際事業に貢献させていただければ幸いです» (Sería un inmenso honor si me permiten contribuir)",
            "«給料をたくさんいただければ嬉しいです» (Me alegraría ganar un buen sueldo)",
            "«英語も日本語も完璧に話せます» (Hablo inglés y japonés con perfección)",
            "«すぐに一人暮らしを始めたいです» (Deseo empezar a vivir solo de inmediato)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 5 se cita textualmente: «これまでの実務経験を活かし、貴社の国際事業に貢献させていただければ幸いです»."
    }
]

story_4 = {
    "id": "story_4",
    "title": "日本社会で生きる：夢への架け橋",
    "title_es": "Vivir en la Sociedad Japonesa (Irodori Pre-Intermediate · JLPT N3)",
    "title_en": "Living in Japanese Society: Bridge to Dreams",
    "difficulty": "N3",
    "level": "N3",
    "category": "Inmersión Profesional e Intercultural",
    "source_modules": [29, 30, 31, 32, 35, 36, 37],
    "description": "Crónica intermedia sobre la madurez comunicativa: alquilar piso sin comisiones, preparar cocina tradicional casera, tertulias con amigos de aficiones, viaje a volcanes en Kyushu y entrevista laboral formal con Keigo.",
    "paragraphs": story_4_paragraphs,
    "sentences": story_4_sentences,
    "comprehension_questions": story_4_questions
}

print("✅ Historia 4 compilada con 15 frases completas y 3 preguntas en español.")

# =============================================================================
# HISTORIA 5: アンナの東京キャンパス日記 (Diario universitario de Anna) - JLPT N5
# =============================================================================
story_5_paragraphs = [
    {
        "chapter": 1,
        "title": "大学での出会いと自己紹介 (Encuentros en la universidad)",
        "japanese": "初めまして、私はアンナです。タイから日本の大学に留学に来ました。今日、留学生センターでさくらさんに会いました。さくらさんは「困ったことがあったら、何でも聞いてね」と優しく言ってくれました。私たちはすぐに友達になりました。",
        "hiragana": "はじめまして、わたしは あんなです。たいから にほんの だいがくに りゅうがくに きました。きょう、りゅうがくせいせんたーで さくらさんに あいました。さくらさんは「こまったことが あったら、なんでも きいてね」と やさしく いって くれました。わたしたちは すぐに ともだちに なりました。",
        "translation_es": "Mucho gusto, soy Anna. Vine de Tailandia a estudiar en una universidad japonesa. Hoy conocí a Sakura en el centro de estudiantes internacionales. Sakura me dijo amablemente: 'Si tienes cualquier problema, pregúntame lo que sea'. Nos hicimos amigas de inmediato.",
        "rubyDict": {"初めまして": "はじめまして", "私": "わたし", "日本": "にほん", "大学": "だいがく", "留学": "りゅうがく", "来ました": "きました", "今日": "きょう", "留学生": "りゅうがくせい", "会いました": "あいました", "困ったこと": "こまったこと", "何でも": "なんでも", "聞いて": "きいて", "優しく": "やさしく", "言って": "いって", "友達": "ともだち", "なりました": "なりました"}
    },
    {
        "chapter": 2,
        "title": "キャンパスの案内と教室 (Orientación en el campus y aulas)",
        "japanese": "キャンパスはとても広くてきれいです。本館の一階に事務室と食堂があります。二階には広い講義室とパソコン室があります。「私の教室はどこですか」と案内所で聞きました。親切な係の人が地図を渡して場所を教えてくれました。",
        "hiragana": "きゃんぱすは とても ひろくて きれいです。ほんかんの いっかいに じむしつと しょくどうが あります。にかいには ひろい こうぎしつと ぱそこんしつが あります。「わたしの きょうしつは どこですか」と あんないじょで ききました。しんせつな かかりの ひとが ちずを わたして ばしょを おしえて くれました。",
        "translation_es": "El campus universitario es muy amplio y bonito. En la primera planta del edificio principal están la secretaría y el comedor. En el segundo piso hay aulas de clase grandes y una sala de ordenadores. Pregunté en el puesto de información: '¿Dónde está mi aula?'. El amable encargado me dio un mapa y me indicó el lugar.",
        "rubyDict": {"広くて": "ひろくて", "本館": "ほんかん", "一階": "いっかい", "事務室": "じむしつ", "食堂": "しょくどう", "二階": "にかい", "講義室": "こうぎしつ", "案内所": "あんないじょ", "親切": "しんせつ", "係": "かかり", "地図": "ちず", "場所": "ばしょ", "教えて": "おしえて"}
    },
    {
        "chapter": 3,
        "title": "アルバイトの面接と職場ルール (Entrevista para trabajo a tiempo parcial)",
        "japanese": "午後は大学の近くのカフェでアルバイトの面接を受けました。店長さんに「週に何日働けますか」と質問されました。私は「火曜日と木曜日の夕方に働けます」と答えました。店長さんは「時間は必ず守ってくださいね」と仕事のルールを教えてくれました。",
        "hiragana": "ごごは だいがくの ちかくの かふぇで あるばいとの めんせつを うけました。てんちょうさんに「しゅうに なんにち はたらけますか」と しつもん されました。わたしは「かようびと もくようびの ゆうがたに はたらけます」と こたえました。てんちょうさんは「じかんは かならず まもって くださいね」と しごとの るーるを おしえて くれました。",
        "translation_es": "Por la tarde hice una entrevista de trabajo en una cafetería cercana a la universidad. El gerente me preguntó: '¿Cuántos días a la semana puedes trabajar?'. Respondí: 'Puedo trabajar los martes y jueves por la tarde'. El gerente me explicó las normas laborales: 'Por favor, sé siempre puntual con los horarios'.",
        "rubyDict": {"午後": "ごご", "大学": "だいがく", "近く": "ちかく", "面接": "めんせつ", "受けました": "うけました", "店長": "てんちょう", "週": "しゅう", "何日": "なんにち", "働けます": "はたらけます", "質問": "しつもん", "火曜日": "かようび", "木曜日": "もくようび", "夕方": "ゆうがた", "答えました": "こたえました", "時間": "じかん", "必ず": "かならず", "守って": "まもって", "仕事": "しごと"}
    },
    {
        "chapter": 4,
        "title": "図書館での質問と日本語の勉強 (Estudio de japonés en la biblioteca)",
        "japanese": "夕方に大学の中央図書館へ行きました。静かな席で今日の授業の復習をしました。辞書の使い方を図書館の人に丁寧に質問しました。「この本は二週間借りることができますよ」と言われました。私は毎日少しずつ日本語を頑張ろうと心に決めました。",
        "hiragana": "ゆうがたに だいがくの ちゅうおう としょかんへ いきました。しずかな せきで きょうの じゅぎょうの ふくしゅうを しました。じしょの つかいかたを としょかんの ひとに ていねいに しつもん しました。「この ほんは にしゅうかん かりることが できますよ」と いわれました。わたしは まいにち すこしずつ にほんごを がんばろうと こころに きめました。",
        "translation_es": "Al caer la tarde fui a la biblioteca central de la universidad. Repasé la lección de hoy en un asiento tranquilo. Pregunté con educación al bibliotecario cómo utilizar el diccionario. Me dijo: 'Puedes tomar prestado este libro durante dos semanas'. Me propuse en el corazón esforzarme cada día un poco más con el idioma japonés.",
        "rubyDict": {"夕方": "ゆうがた", "中央": "ちゅうおう", "図書館": "としょかん", "静か": "しずか", "席": "せき", "復習": "ふくしゅう", "辞書": "じしょ", "使い方": "つかいかた", "丁寧": "ていねい", "二週間": "にしゅうかん", "借りる": "かりる", "毎日": "まいにち", "頑張ろう": "がんばろう", "心": "こころ", "決めました": "きめました"}
    }
]

story_5_sentences = [
    # Cap 1
    {"id": "s5_1", "chapter": 1, "japanese": "初めまして、私はアンナです。", "translation_es": "Mucho gusto, soy Anna.", "grammar_note": "Fórmula canónica de saludo inicial seguida de la presentación del nombre.", "clean_target": clean_for_ime("初めまして私はアンナです")},
    {"id": "s5_2", "chapter": 1, "japanese": "タイから日本の大学に留学に来ました。", "translation_es": "Vine de Tailandia a estudiar en una universidad japonesa.", "grammar_note": "から (origen geográfico) y に来ました (propósito del desplazamiento).", "clean_target": clean_for_ime("タイから日本の大学に留学に来ました")},
    {"id": "s5_3", "chapter": 1, "japanese": "今日、留学生センターでさくらさんに会いました。", "translation_es": "Hoy conocí a Sakura en el centro de estudiantes internacionales.", "grammar_note": "Partícula で marca la localización del encuentro; に marca la persona interlocutora.", "clean_target": clean_for_ime("今日留学生センターでさくらさんに会いました")},
    {"id": "s5_4", "chapter": 1, "japanese": "さくらさんは「困ったことがあったら、何でも聞いてね」と優しく言ってくれました。", "translation_es": "Sakura me dijo amablemente: 'Si tienes cualquier problema, pregúntame lo que sea'.", "grammar_note": "〜たら condicional ('si surge algún problema') y verbo benefactor 〜てくれる.", "clean_target": clean_for_ime("さくらさんは困ったことがあったら何でも聞いてねと優しく言ってくれました")},
    # Cap 2
    {"id": "s5_5", "chapter": 2, "japanese": "キャンパスはとても広くてきれいです。", "translation_es": "El campus universitario es muy amplio y bonito.", "grammar_note": "Forma て de 広くて uniendo dos atributos descriptivos continuos.", "clean_target": clean_for_ime("キャンパスはとても広くてきれいです")},
    {"id": "s5_6", "chapter": 2, "japanese": "本館の一階に事務室と食堂があります。", "translation_es": "En la primera planta del edificio principal están la secretaría y el comedor.", "grammar_note": "Localización espacial de dependencias institucionales con に y la existencia con あります.", "clean_target": clean_for_ime("本館の一階に事務室と食堂があります")},
    {"id": "s5_7", "chapter": 2, "japanese": "二階には広い講義室とパソコン室があります。", "translation_es": "En el segundo piso hay aulas grandes y una sala de ordenadores.", "grammar_note": "Partícula には para enfatizar temáticamente el piso superior.", "clean_target": clean_for_ime("二階には広い講義室とパソコン室があります")},
    {"id": "s5_8", "chapter": 2, "japanese": "親切な係の人が地図を渡して場所を教えてくれました。", "translation_es": "El amable encargado me entregó un mapa y me indicó el lugar.", "grammar_note": "Secuencia temporal con forma て (渡して) y gratitud por la indicación recibida (教えてくれた).", "clean_target": clean_for_ime("親切な係の人が地図を渡して場所を教えてくれました")},
    # Cap 3
    {"id": "s5_9", "chapter": 3, "japanese": "午後は大学の近くのカフェでアルバイトの面接を受けました。", "translation_es": "Por la tarde hice una entrevista de trabajo en un café cercano a la universidad.", "grammar_note": "面接を受ける es la colocación verbal fija para 'presentarse a una entrevista'.", "clean_target": clean_for_ime("午後は大学の近くのカフェでアルバイトの面接を受けました")},
    {"id": "s5_10", "chapter": 3, "japanese": "店長さんに「週に何日働けますか」と質問されました。", "translation_es": "El gerente me preguntó: '¿Cuántos días a la semana puedes trabajar?'.", "grammar_note": "Forma potencial 働けます (poder trabajar) dentro de la frecuencia temporal 週に何日.", "clean_target": clean_for_ime("店長さんに週に何日働けますかと質問されました")},
    {"id": "s5_11", "chapter": 3, "japanese": "私は「火曜日と木曜日の夕方に働けます」と答えました。", "translation_es": "Respondí: 'Puedo trabajar los martes y jueves por la tarde'.", "grammar_note": "Especificación de días y franjas horarias con potencial afirmativo.", "clean_target": clean_for_ime("私は火曜日と木曜日の夕方に働けますと答えました")},
    {"id": "s5_12", "chapter": 3, "japanese": "店長さんは「時間は必ず守ってくださいね」と仕事のルールを教えてくれました。", "translation_es": "El gerente me instruyó: 'Por favor, sé puntual con los horarios'.", "grammar_note": "必ず守る (cumplir sin falta) con la petición cortés 〜てください.", "clean_target": clean_for_ime("店長さんは時間は必ず守ってくださいねと仕事のルールを教えてくれました")},
    # Cap 4
    {"id": "s5_13", "chapter": 4, "japanese": "夕方に大学の中央図書館へ行きました。", "translation_es": "Al caer la tarde fui a la biblioteca central de la universidad.", "grammar_note": "Desplazamiento hacia una instalación de estudio con la partícula へ.", "clean_target": clean_for_ime("夕方に大学の中央図書館へ行きました")},
    {"id": "s5_14", "chapter": 4, "japanese": "静かな席で今日の授業の復習をしました。", "translation_es": "Repasé la lección de hoy en un asiento silencioso y tranquilo.", "grammar_note": "復習をする significa repasar activamente los contenidos aprendidos.", "clean_target": clean_for_ime("静かな席で今日の授業の復習をしました")},
    {"id": "s5_15", "chapter": 4, "japanese": "「この本は二週間借りることができますよ」と言われました。", "translation_es": "Me dijeron: 'Puedes tomar prestado este libro durante dos semanas'.", "grammar_note": "Verbo diccionario + ことができる expresa posibilidad o permiso reglamentario.", "clean_target": clean_for_ime("この本は二週間借りることができますよと言われました")},
    {"id": "s5_16", "chapter": 4, "japanese": "私は毎日少しずつ日本語を頑張ろうと心に決めました。", "translation_es": "Me propuse en el corazón esforzarme a diario con el japonés paso a paso.", "grammar_note": "少しずつ (poco a poco) y volitivo 頑張ろう + と心に決める (decidir con convicción interior).", "clean_target": clean_for_ime("私は毎日少しずつ日本語を頑張ろうと心に決めました")}
]

story_5_questions = [
    {
        "id": "story_5_q1",
        "question": "¿De qué país vino Anna a estudiar a la universidad japonesa?",
        "question_jp": "アンナさんはどの国から日本に留学に来ましたか？",
        "options": [
            "タイ (Tailandia)",
            "ブラジル (Brasil)",
            "ベトナム (Vietnam)",
            "アメリカ (Estados Unidos)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 1 se menciona: «初めまして、私はアンナです。タイから日本の大学に留学に来ました»."
    },
    {
        "id": "story_5_q2",
        "question": "¿Qué días y momento ofreció Anna para trabajar en la cafetería?",
        "question_jp": "アンナさんはカフェでいつ働けると答えましたか？",
        "options": [
            "火曜日と木曜日の夕方 (Martes y jueves por la tarde)",
            "土曜日と日曜日の朝 (Sábados y domingos por la mañana)",
            "月曜日から金曜日まで毎日 (De lunes a viernes a diario)",
            "水曜日の深夜 (Los miércoles por la noche)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 3 Anna responde textualmente: «火曜日と木曜日の夕方に働けます»."
    },
    {
        "id": "story_5_q3",
        "question": "¿Durante cuánto tiempo puede Anna tomar prestado el libro de la biblioteca?",
        "question_jp": "図書館で本をどのくらいの期間借りることができますか？",
        "options": [
            "二週間 (Dos semanas)",
            "三日間 (Tres días)",
            "一ヶ月 (Un mes)",
            "半年間 (Seis meses)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 4 el bibliotecario le indica: «この本は二週間借りることができますよ»."
    }
]

story_5 = {
    "id": "story_5",
    "title": "アンナの東京キャンパス日記",
    "title_es": "El diario universitario de Anna en Tokio (NHK World · JLPT N5)",
    "title_en": "Anna's Tokyo Campus Diary",
    "difficulty": "N5",
    "level": "N5",
    "category": "Vida Universitaria y Nuevos Comienzos",
    "source_modules": [2, 7, 9],
    "description": "Relato pedagógico basado en las lecciones canónicas de NHK World: la llegada de Anna a Tokio, su recorrido por el campus, su primera entrevista para un trabajo a tiempo parcial y el estudio en la biblioteca.",
    "paragraphs": story_5_paragraphs,
    "sentences": story_5_sentences,
    "comprehension_questions": story_5_questions
}

print("✅ Historia 5 compilada con 16 frases completas y 3 preguntas en español.")

# =============================================================================
# HISTORIA 6: アンナの温泉旅行と日本の伝統 (Viaje a las termas y tradiciones) - JLPT N5
# =============================================================================
story_6_paragraphs = [
    {
        "chapter": 1,
        "title": "箱根への週末旅行の計画 (Planificando el viaje de fin de semana a Hakone)",
        "japanese": "学期末の休みに、さくらさんと一緒に箱根へ旅行することにしました。新宿駅から特急ロマンスカーの切符を二枚予約しました。「富士山がきれいに見えるといいね」と話しました。私たちは駅弁とお茶を買って、楽しみに電車に乗りました。",
        "hiragana": "がっきまつの やすみに、さくらさんと いっしょに はこねへ りょこうすることに しました。しんじゅくえきから とっきゅう ろまんすかーの きっぷを にまい よやくしました。「ふじさんが きれいに みえると いいね」と はなしました。わたしたちは えきべんと おちゃを かって、たのしみに でんしゃに のりました。",
        "translation_es": "Durante las vacaciones de fin de trimestre, decidí viajar a Hakone junto con Sakura. Reservamos dos billetes para el tren expreso Romancecar desde la estación de Shinjuku. Comentamos: 'Ojalá podamos ver el monte Fuji con claridad'. Compramos fiambreras de estación (Ekiben) y té verde, y subimos al tren con gran entusiasmo.",
        "rubyDict": {"学期末": "がっきまつ", "休み": "やすみ", "一緒": "いっしょ", "箱根": "はこね", "旅行": "りょこう", "新宿駅": "しんじゅくえき", "特急": "とっきゅう", "切符": "きっぷ", "二枚": "にまい", "予約": "よやく", "富士山": "ふじさん", "見える": "みえる", "駅弁": "えきべん", "お茶": "おちゃ", "買って": "かって", "電車": "でんしゃ", "乗りました": "のりました"}
    },
    {
        "chapter": 2,
        "title": "温泉宿のルールと露天風呂 (Reglas del Ryokan y el baño termal)",
        "japanese": "箱根の伝統的な温泉旅館に到着しました。女将さんが「お風呂に入る前に、体をきれいに洗ってくださいね」と入浴マナーを丁寧に説明してくれました。夕方に広い露天風呂に入りました。温かいお湯に入ると、旅の疲れがすっかり取れて体が軽くなりました。",
        "hiragana": "はこねの でんとうてきな おんせんりょかんに とうちゃくしました。おかみさんが「おふろに はいるまえに、からだを きれいに あらってくださいね」と にゅうよくまなーを ていねいに せつめいして くれました。ゆうがたに ひろい ろてんぶろに はいりました。あたたかい おゆに はいると、たびの つかれが すっかり とれて からだが かるくなりました。",
        "translation_es": "Llegamos a una posada tradicional con aguas termales en Hakone. La dueña nos explicó con amabilidad las normas del baño: 'Antes de entrar al agua, por favor lávense bien el cuerpo'. Al atardecer entré al baño al aire libre (Rotenburo). Al sumergirme en el agua caliente, el cansancio del viaje desapareció por completo y mi cuerpo se sintió ligero.",
        "rubyDict": {"伝統的": "でんとうてき", "温泉旅館": "おんせんりょかん", "到着": "とうちゃく", "女将": "おかみ", "お風呂": "おふろ", "体": "からだ", "洗って": "あらって", "入浴": "にゅうよく", "丁寧": "ていねい", "説明": "せつめい", "夕方": "ゆうがた", "露天風呂": "ろてんぶろ", "温かい": "あたたかい", "お湯": "おゆ", "旅": "たび", "疲れ": "つかれ", "取れて": "とれて", "軽く": "かるく"}
    },
    {
        "chapter": 3,
        "title": "旅先の風邪と薬局での相談 (Resfriado en el viaje y la farmacia)",
        "japanese": "翌朝、少し喉が痛くて咳が出ました。風邪をひいたみたいなので、駅前の薬局へ行きました。薬剤師さんに「熱はありませんが、喉の薬が欲しいです」と相談しました。薬剤師さんは「食後にこの薬を二錠飲んで、暖かくして寝てくださいね」と親切に教えてくれました。",
        "hiragana": "よくあさ、すこし のどが いたくて せきが でました。かぜを ひいたみたいなので、えきまえの やっきょくへ いきました。やくざいしさんに「ねつは ありませんが、のどの くすりが ほしいです」と そうだんしました。やくざいしさんは「しょくごに この くすりを にじょう のんで、あたたかくして ねてくださいね」と しんせつに おしえて くれました。",
        "translation_es": "A la mañana siguiente, me dolía un poco la garganta y tenía tos. Como parecía que me había resfriado, fui a la farmacia frente a la estación. Le consulté al farmacéutico: 'No tengo fiebre, pero quisiera medicina para la garganta'. El farmacéutico me indicó con amabilidad: 'Tome dos pastillas después de comer, manténgase abrigada y descanse mucho'.",
        "rubyDict": {"翌朝": "よくあさ", "喉": "のど", "痛くて": "いたくて", "咳": "せき", "風邪": "かぜ", "駅前": "えきまえ", "薬局": "やっきょく", "薬剤師": "やくざいし", "熱": "ねつ", "薬": "くすり", "欲しい": "ほしい", "相談": "そうだん", "食後": "しょくご", "二錠": "にじょう", "飲んで": "のんで", "寝て": "ねて", "親切": "しんせつ"}
    },
    {
        "chapter": 4,
        "title": "感謝の手紙と新しい目標 (Carta de gratitud y nuevos objetivos)",
        "japanese": "薬を飲んでゆっくり休んだら、午後はとても元気になりました。旅館を出る時、女将さんに心のこもったお礼の手紙を渡しました。さくらさんにも「素敵な旅行に連れて行ってくれてありがとう」と伝えました。私は日本でさらに多くの文化を体験したいです。",
        "hiragana": "くすりを のんで ゆっくり やすんだら、ごごは とても げんきに なりました。りょかんを でるとき、おかみさんに こころの こもった おれいの てがみを わたらしました。さくらさんにも「すてきな りょこうに つれていってくれて ありがとう」と つたえました。わたしは にほんで さらに おおくの ぶんかを たいけんしたいです。",
        "translation_es": "Tras tomar la medicina y descansar con calma, por la tarde me recuperé por completo. Al dejar la posada, le entregué a la dueña una sentida carta de agradecimiento escrita desde el corazón. A Sakura también le expresé: 'Muchas gracias por traerme a este maravilloso viaje'. Deseo experimentar muchas facetas más de la cultura japonesa.",
        "rubyDict": {"薬": "くすり", "休んだら": "やすんだら", "午後": "ごご", "元気": "げんき", "旅館": "りょかん", "出る時": "でるとき", "女将": "おかみ", "心": "こころ", "お礼": "おれい", "手紙": "てがみ", "素敵": "すてき", "連れて行って": "つれていって", "伝えました": "つたえました", "日本": "にほん", "多く": "おおく", "文化": "ぶんか", "体験したい": "たいけんしたい"}
    }
]

story_6_sentences = [
    # Cap 1
    {"id": "s6_1", "chapter": 1, "japanese": "学期末の休みに、さくらさんと一緒に箱根へ旅行することにしました。", "translation_es": "En las vacaciones de fin de curso decidí viajar a Hakone con Sakura.", "grammar_note": "〜ことにする para formalizar planes deliberados y 一緒に para acción compartida.", "clean_target": clean_for_ime("学期末の休みにさくらさんと一緒に箱根へ旅行することにしました")},
    {"id": "s6_2", "chapter": 1, "japanese": "新宿駅から特急ロマンスカーの切符を二枚予約しました。", "translation_es": "Reservamos dos billetes del expreso Romancecar desde la estación de Shinjuku.", "grammar_note": "Contador 枚 (まい) para objetos planos y delgados como billetes o tickets.", "clean_target": clean_for_ime("新宿駅から特急ロマンスカーの切符を二枚予約しました")},
    {"id": "s6_3", "chapter": 1, "japanese": "「富士山がきれいに見えるといいね」と話しました。", "translation_es": "Comentamos: 'Ojalá podamos ver el monte Fuji con claridad'.", "grammar_note": "〜といいね formula un deseo positivo espontáneo para el viaje.", "clean_target": clean_for_ime("富士山がきれいに見えるといいねと話しました")},
    {"id": "s6_4", "chapter": 1, "japanese": "私たちは駅弁とお茶を買って、楽しみに電車に乗りました。", "translation_es": "Compramos fiambreras y té, y subimos al tren ilusionadas.", "grammar_note": "楽しみに adverbializado para denotar anticipación feliz de un evento.", "clean_target": clean_for_ime("私たちは駅弁とお茶を買って楽しみに電車に乗りました")},
    # Cap 2
    {"id": "s6_5", "chapter": 2, "japanese": "箱根の伝統的な温泉旅館に到着しました。", "translation_es": "Llegamos a una posada tradicional con aguas termales en Hakone.", "grammar_note": "到着する se marca con la partícula に para indicar destino alcanzado.", "clean_target": clean_for_ime("箱根の伝統的な温泉旅館に到着しました")},
    {"id": "s6_6", "chapter": 2, "japanese": "女将さんが「お風呂に入る前に、体をきれいに洗ってくださいね」と入浴マナーを丁寧に説明してくれました。", "translation_es": "La posadera nos explicó el protocolo del baño: 'Lávense el cuerpo antes de entrar al agua'.", "grammar_note": "Verbo diccionario + 前に (antes de hacer algo) y cortesía instructiva 〜てください.", "clean_target": clean_for_ime("女将さんがお風呂に入る前に体をきれいに洗ってくださいねと入浴マナーを丁寧に説明してくれました")},
    {"id": "s6_7", "chapter": 2, "japanese": "夕方に広い露天風呂に入りました。", "translation_es": "Al atardecer entré al amplio baño al aire libre.", "grammar_note": "風呂に入る es la expresión idiomática natural para tomar un baño.", "clean_target": clean_for_ime("夕方に広い露天風呂に入りました")},
    {"id": "s6_8", "chapter": 2, "japanese": "温かいお湯に入ると、旅の疲れがすっかり取れて体が軽くなりました。", "translation_es": "Al entrar al agua caliente, el cansancio se fue por completo y sentí mi cuerpo ligero.", "grammar_note": "疲れが取れる (desaparecer el cansancio) y 軽くなる (hacerse ligero).", "clean_target": clean_for_ime("温かいお湯に入ると旅の疲れがすっかり取れて体が軽くなりました")},
    # Cap 3
    {"id": "s6_9", "chapter": 3, "japanese": "翌朝、少し喉が痛くて咳が出ました。", "translation_es": "A la mañana siguiente me dolía la garganta y tenía tos.", "grammar_note": "Expresión de síntomas físicos: dolor con adjetivo 痛い y 咳が出る (tener tos).", "clean_target": clean_for_ime("翌朝少し喉が痛くて咳が出ました")},
    {"id": "s6_10", "chapter": 3, "japanese": "風邪をひいたみたいなので、駅前の薬局へ行きました。", "translation_es": "Como parecía que me había resfriado, fui a la farmacia frente a la estación.", "grammar_note": "〜みたいなので aporta conjetura sintomática como causa del desplazamiento.", "clean_target": clean_for_ime("風邪をひいたみたいなので駅前の薬局へ行きました")},
    {"id": "s6_11", "chapter": 3, "japanese": "薬剤師さんに「熱はありませんが、喉の薬が欲しいです」と相談しました。", "translation_es": "Le consulté al boticario: 'No tengo fiebre, pero deseo medicina para la garganta'.", "grammar_note": "〜が欲しい expresa el deseo cortés de obtener un objeto concreto.", "clean_target": clean_for_ime("薬剤師さんに熱はありませんが喉の薬が欲しいですと相談しました")},
    {"id": "s6_12", "chapter": 3, "japanese": "薬剤師さんは「食後にこの薬を二錠飲んで、暖かくして寝てくださいね」と親切に教えてくれました。", "translation_es": "El farmacéutico me indicó: 'Tome dos pastillas tras comer y descanse abrigada'.", "grammar_note": "食後に (tras las comidas). Contador 錠 (じょう) para píldoras o pastillas.", "clean_target": clean_for_ime("薬剤師さんは食後にこの薬を二錠飲んで暖かくして寝てくださいねと親切に教えてくれました")},
    # Cap 4
    {"id": "s6_13", "chapter": 4, "japanese": "薬を飲んでゆっくり休んだら、午後はとても元気になりました。", "translation_es": "Al tomar la medicina y descansar con calma, por la tarde me sentí muy bien.", "grammar_note": "Condicional temporal 〜たら para expresar una mejoría derivada del descanso.", "clean_target": clean_for_ime("薬を飲んでゆっくり休んだら午後はとても元気になりました")},
    {"id": "s6_14", "chapter": 4, "japanese": "旅館を出る時、女将さんに心のこもったお礼の手紙を渡しました。", "translation_es": "Al dejar la posada, le entregué a la dueña una sentida carta de agradecimiento.", "grammar_note": "心のこもった es una frase hecha que significa 'hecho con todo el corazón/afecto'.", "clean_target": clean_for_ime("旅館を出る時女将さんに心のこもったお礼の手紙を渡しました")},
    {"id": "s6_15", "chapter": 4, "japanese": "さくらさんにも「素敵な旅行に連れて行ってくれてありがとう」と伝えました。", "translation_es": "A Sakura le agradecí: 'Gracias por traerme a este viaje maravilloso'.", "grammar_note": "〜てくれてありがとう expresa gratitud directa por una acción benefactora.", "clean_target": clean_for_ime("さくらさんにも素敵な旅行に連れて行ってくれてありがとうと伝えました")},
    {"id": "s6_16", "chapter": 4, "japanese": "私は日本でさらに多くの文化を体験したいです。", "translation_es": "Deseo experimentar aún más aspectos de la cultura en Japón.", "grammar_note": "Verbo raíz + たい expresa el anhelo en primera persona de vivir experiencias.", "clean_target": clean_for_ime("私は日本でさらに多くの文化を体験したいです")}
]

story_6_questions = [
    {
        "id": "story_6_q1",
        "question": "¿Qué regla esencial de cortesía y etiqueta de baño explicó la posadera en el Ryokan?",
        "question_jp": "女将さんが説明した温泉の入浴マナーは何ですか？",
        "options": [
            "お風呂に入る前に、体をきれいに洗うこと (Lavarse bien el cuerpo antes de entrar al agua)",
            "お風呂に水着を着て入ること (Entrar vistiendo traje de baño)",
            "温泉の中で泳ぐこと (Nadar en las aguas termales)",
            "お湯の中にタオルを入れること (Meter la toalla dentro del agua)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 2 la dueña explica: «お風呂に入る前に、体をきれいに洗ってくださいね»."
    },
    {
        "id": "story_6_q2",
        "question": "¿Qué síntomas presentaba Anna a la mañana siguiente de llegar a Hakone?",
        "question_jp": "翌朝、アンナさんにはどんな風邪の症状がありましたか？",
        "options": [
            "喉が痛くて咳が出たが、熱はなかった (Le dolía la garganta y tenía tos, pero sin fiebre)",
            "高い熱が出て頭が激しく痛んだ (Tenía fiebre alta y fuerte dolor de cabeza)",
            "お腹が痛くて動けなかった (Dolor de estómago incapacitante)",
            "足の骨を折って歩けなかった (Una fractura en el pie)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 3 se indica: «少し喉が痛くて咳が出ました» y al farmacéutico le aclara: «熱はありませんが、喉の薬が欲しいです»."
    },
    {
        "id": "story_6_q3",
        "question": "¿Qué detalle de gratitud entregó Anna a la dueña del Ryokan al marcharse?",
        "question_jp": "旅館を出る時、アンナさんは女将さんに何を渡しましたか？",
        "options": [
            "心のこもったお礼の手紙 (Una sentida carta de agradecimiento)",
            "タイの高級なお菓子 (Dulces de lujo de Tailandia)",
            "箱根の伝統的な寄木細工 (Una artesanía de madera local)",
            "露天風呂の写真 (Una fotografía del baño al aire libre)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 4 se señala: «旅館を出る時、女将さんに心のこもったお礼の手紙を渡しました»."
    }
]

story_6 = {
    "id": "story_6",
    "title": "アンナの温泉旅行と日本の伝統",
    "title_es": "Viaje a las aguas termales y tradiciones con Anna (JLPT N5)",
    "title_en": "Anna's Onsen Trip and Japanese Traditions",
    "difficulty": "N5",
    "level": "N5",
    "category": "Viajes y Cultura Tradicional",
    "source_modules": [16, 17, 18, 19],
    "description": "Aventura turística y cultural en Hakone: viajar en el tren Romancecar, aprender el protocolo de las aguas termales japonesas (onsen), consultar a un farmacéutico y redactar una carta de agradecimiento.",
    "paragraphs": story_6_paragraphs,
    "sentences": story_6_sentences,
    "comprehension_questions": story_6_questions
}

print("✅ Historia 6 compilada con 16 frases completas y 3 preguntas en español.")

# =============================================================================
# HISTORIA 7: 昔話：桃太郎の冒険 (Cuento de Momotaro) - JLPT N4
# =============================================================================
story_7_paragraphs = [
    {
        "chapter": 1,
        "title": "川から流れてきた大きな桃 (El melocotón gigante que flotaba en el río)",
        "japanese": "むかしむかし、ある所におじいさんとおばあさんが住んでいました。おじいさんは山へ柴刈りに、おばあさんは川へ洗濯に行きました。おばあさんが川で洗濯をしていると、川上から大きな桃がどんぶらこと流れてきました。おばあさんは驚きましたが、その桃を家に持って帰りました。桃を切ると、中から元気な男の赤ちゃんが生まれ、二人は「桃太郎」と名付けました。",
        "hiragana": "むかしむかし、ある ところに おじいさんと おばあさんが すんでいました。おじいさんは やまへ しばかりに、おばあさんは かわへ せんたくに いきました。おばあさんが かわで せんたくを していると、かわかみから おおきな ももが どんぶらこと ながれて きました。おばあさんは おどろきましたが、その ももを いえに もって かえりました。ももを きると、なかから げんきな おとこの あかちゃんが うまれ、ふたりは「ももたろう」と なづけました。",
        "translation_es": "Hace mucho, mucho tiempo, vivían en un lugar un anciano y una anciana. El anciano fue a la montaña a recoger leña, y la anciana fue al río a lavar la ropa. Mientras la anciana lavaba en el río, un enorme melocotón bajó flotando meciéndose en el agua. La anciana se sorprendió, pero llevó el melocotón a su casa. Al abrir el melocotón, nació de su interior un niño fuerte y sano, y los dos lo llamaron 'Momotaro'.",
        "rubyDict": {"昔": "むかし", "所": "ところ", "住んでいました": "すんでいました", "山": "やま", "川": "かわ", "洗濯": "せんたく", "川上": "かわかみ", "大きな": "おおきな", "桃": "もも", "流れて": "ながれて", "驚きました": "おどろきました", "家": "いえ", "持って帰りました": "もってかえりました", "切る": "きる", "中": "なか", "元気": "げんき", "男": "おとこ", "赤ちゃん": "あかちゃん", "生まれ": "うまれ", "二人": "ふたり", "名付けました": "なづけました"}
    },
    {
        "chapter": 2,
        "title": "鬼ヶ島への旅立ちときび団子 (La partida hacia Onigashima y los kibidango)",
        "japanese": "桃太郎はすくすくと育ち、とても力持ちで優しい若者になりました。ある日、村の人々を苦しめている鬼の噂を聞きました。「私が鬼ヶ島へ行って、悪い鬼たちを退治してきます」と桃太郎は言いました。おばあさんは日本一美味しいきび団子をたくさん作って、桃太郎の腰の袋に入れて持たせてくれました。",
        "hiragana": "ももたろうは すくすくと そだち、とても ちからもちで やさしい わかものに なりました。あるひ、むらの ひとびとを くるしめている おにの うわさを ききました。「わたしが おにがしまへ いって、わるい おにたちを たいじして きます」と ももたろうは いいました。おばあさんは にほんいち おいしい きびだんごを たくさん つくって、ももたろうの こしの ふくろに いれて もたせて くれました。",
        "translation_es": "Momotaro creció con rapidez y se convirtió en un joven muy fuerte y bondadoso. Un día escuchó rumores sobre ogros que atormentaban a los aldeanos. 'Iré a la isla de los ogros y derrotaré a los malvados', declaró Momotaro. La anciana preparó los mejores buñuelos de mijo (kibidango) de todo Japón y se los entregó guardados en la bolsa de su cinto.",
        "rubyDict": {"育ち": "そだち", "力持ち": "ちからもち", "優しい": "やさしい", "若者": "わかもの", "村": "むら", "人々": "ひとびと", "苦しめて": "くるしめて", "鬼": "おに", "噂": "うわさ", "鬼ヶ島": "おにがしま", "悪い": "わるい", "退治": "たいじ", "日本一": "にほんいち", "美味しい": "おいしい", "団子": "だんご", "腰": "こし", "袋": "ふくろ", "持たせて": "もたせて"}
    },
    {
        "chapter": 3,
        "title": "仲間たちとの出会いと協力 (El encuentro y la cooperación con los compañeros)",
        "japanese": "桃太郎が鬼ヶ島を目指して歩いていると、犬がやって来ました。「その日本一のきび団子を一つくだされば、お供になりましょう」と犬は言いました。桃太郎が団子をあげると、犬は喜んで家来になりました。道を進むと、賢い猿と空を飛べる雉も仲間になり、四人は力を合わせて海を渡りました。",
        "hiragana": "ももたろうが おにがしまを めざして あるいていると、いぬが やって きました。「その にほんいちの きびだんごを ひとつ くだされば、おともに なりましょう」と いぬは いいました。ももたろうが だんごを あげると、いぬは よろこんで けらいに なりました。みちを すすむと、かしこい さると そらを とべる きじも なかまに なり、よにんは ちからを あわせて うみを わたりました。",
        "translation_es": "Mientras Momotaro caminaba rumbo a la isla de los ogros, se le acercó un perro. 'Si me das uno de esos mejores buñuelos de mijo de Japón, te acompañaré como fiel servidor', propuso el perro. Cuando Momotaro le dio el kibidango, el perro se convirtió gustosamente en su aliado. Siguiendo el camino, un sabio mono y un faisán capaz de volar alto se unieron también, y los cuatro unieron sus fuerzas para cruzar el mar.",
        "rubyDict": {"目指して": "めざして", "歩いて": "あるいて", "犬": "いぬ", "一つ": "ひとつ", "くだされば": "くだされば", "お供": "おとも", "喜んで": "よろこんで", "家来": "けらい", "進む": "すすむ", "賢い": "かしこい", "猿": "さる", "飛べる": "とべる", "雉": "きじ", "仲間": "なかま", "四人": "よにん", "力": "ちから", "合わせて": "あわせて", "海": "うみ", "渡りました": "わたりました"}
    },
    {
        "chapter": 4,
        "title": "鬼退治と村への帰還 (La victoria sobre los ogros y el regreso)",
        "japanese": "鬼ヶ島に着くと、大きな黒い門がそびえ立っていました。雉が空から門を開け、猿が鍵を外し、犬と桃太郎が勇気を出して突入しました。鬼たちは降参し、「もう二度と悪さはしません」と宝物をすべて返しました。桃太郎たちはたくさんの宝物を持って村へ帰り、おじいさんとおばあさんと幸せに暮らしました。",
        "hiragana": "おにがしまに つくと、おおきな くろい もんが そびえたっていました。きじが そらから もんを あけ、さるが かぎを はずし、いぬと ももたろうが ゆうきを だして とつにゅう しました。おにたちは こうさんし、「もう にどと わるさは しません」と たからものを すべて かえしました。ももたろうたちは たくさんの たからものを もって むらへ かえり、おじいさんと おばあさんと しあわせに くらしました。",
        "translation_es": "Al llegar a la isla de los ogros, un gran portón negro se alzaba ante ellos. El faisán abrió la puerta desde las alturas, el mono quitó el cerrojo, y el perro y Momotaro irrumpieron con gran valentía. Los ogros se rindieron prometiendo no volver a cometer fechorías jamás y devolvieron todos los tesoros. Momotaro y sus compañeros regresaron a la aldea con los tesoros y vivieron muy felices junto a los ancianos.",
        "rubyDict": {"門": "もん", "開け": "あけ", "鍵": "かぎ", "外し": "はずし", "勇気": "ゆうき", "降参": "こうさん", "二度と": "にどと", "宝物": "たからもの", "返しました": "かえしました", "帰り": "かえり", "幸せ": "しあわせ", "暮らしました": "くらしました"}
    }
]

story_7_sentences = [
    # Cap 1
    {"id": "s7_1", "chapter": 1, "japanese": "むかしむかし、ある所におじいさんとおばあさんが住んでいました。", "translation_es": "Érase una vez, en un lugar lejano vivían un anciano y una anciana.", "grammar_note": "Apertura arquetípica de cuentos tradicionales con tiempo pasado continuo 住んでいた.", "clean_target": clean_for_ime("むかしむかしある所におじいさんとおばあさんが住んでいました")},
    {"id": "s7_2", "chapter": 1, "japanese": "おじいさんは山へ柴刈りに、おばあさんは川へ洗濯に行きました。", "translation_es": "El anciano fue a la montaña a recoger leña, y la anciana al río a lavar.", "grammar_note": "Estructura de propósito: Sustantivo/Raíz + に行く con paralelismo coordinado.", "clean_target": clean_for_ime("おじいさんは山へ柴刈りにおばあさんは川へ洗濯に行きました")},
    {"id": "s7_3", "chapter": 1, "japanese": "おばあさんが川で洗濯をしていると、川上から大きな桃がどんぶらこと流れてきました。", "translation_es": "Mientras lavaba en el río, un melocotón flotó corriente abajo meciéndose.", "grammar_note": "〜ていると indica que durante una acción en curso sobrevino un hecho imprevisto. どんぶらこ es onomatopeya flotante.", "clean_target": clean_for_ime("おばあさんが川で洗濯をしていると川上から大きな桃がどんぶらこと流れてきました")},
    {"id": "s7_4", "chapter": 1, "japanese": "桃を切ると、中から元気な男の赤ちゃんが生まれ、二人は「桃太郎」と名付けました。", "translation_es": "Al cortar el melocotón, nació un niño enérgico y lo llamaron Momotaro.", "grammar_note": "〜と名付ける (bautizar o nombrar como). 生まれる (nacer) en forma conjuntiva.", "clean_target": clean_for_ime("桃を切ると中から元気な男の赤ちゃんが生まれ二人は桃太郎と名付けました")},
    # Cap 2
    {"id": "s7_5", "chapter": 2, "japanese": "桃太郎はすくすくと育ち、とても力持ちで優しい若者になりました。", "translation_es": "Momotaro creció rápido y se volvió un joven fuerte y noble.", "grammar_note": "すくすくと (onomatopeya de crecimiento vigoroso y saludable).", "clean_target": clean_for_ime("桃太郎はすくすくと育ちとても力持ちで優しい若者になりました")},
    {"id": "s7_6", "chapter": 2, "japanese": "ある日、村の人々を苦しめている鬼の噂を聞きました。", "translation_es": "Un día oyó rumores de unos ogros que hacían sufrir a la gente del pueblo.", "grammar_note": "Forma causativa/transitiva 苦しめる (hacer sufrir, atormentar).", "clean_target": clean_for_ime("ある日村の人々を苦しめている鬼の噂を聞きました")},
    {"id": "s7_7", "chapter": 2, "japanese": "「私が鬼ヶ島へ行って、悪い鬼たちを退治してきます」と桃太郎は言いました。", "translation_es": "Momotaro afirmó: 'Iré a la isla de los ogros y los derrotaré'.", "grammar_note": "〜てくる (退治してくる) expresa ir a completar una misión y retornar victorioso.", "clean_target": clean_for_ime("私が鬼ヶ島へ行って悪い鬼たちを退治してきますと桃太郎は言いました")},
    {"id": "s7_8", "chapter": 2, "japanese": "おばあさんは日本一美味しいきび団子をたくさん作って、桃太郎の腰の袋に入れて持たせてくれました。", "translation_es": "La anciana preparó buñuelos de mijo y se los dio guardados en su cinto.", "grammar_note": "Forma causativa 持たせる (hacer que lleve consigo) con 〜てくれる.", "clean_target": clean_for_ime("おばあさんは日本一美味しいきび団子をたくさん作って桃太郎の腰の袋に入れて持たせてくれました")},
    # Cap 3
    {"id": "s7_9", "chapter": 3, "japanese": "桃太郎が鬼ヶ島を目指して歩いていると、犬がやって来ました。", "translation_es": "Mientras caminaba hacia la isla, se le acercó un perro.", "grammar_note": "〜を目指して (con rumbo o dirección hacia un objetivo geográfico).", "clean_target": clean_for_ime("桃太郎が鬼ヶ島を目指して歩いていると犬がやって来ました")},
    {"id": "s7_10", "chapter": 3, "japanese": "「その日本一のきび団子を一つくだされば、お供になりましょう」と犬は言いました。", "translation_es": "El perro dijo: 'Si me das un buñuelo, seré tu fiel compañero'.", "grammar_note": "Condicional formal honorífico 〜ば (くだされば) y volitivo 〜ましょう.", "clean_target": clean_for_ime("その日本一のきび団子を一つくださればお供になりましょうと犬は言いました")},
    {"id": "s7_11", "chapter": 3, "japanese": "桃太郎が団子をあげると、犬は喜んで家来になりました。", "translation_es": "Al darle el buñuelo, el perro se volvió su sirviente con alegría.", "grammar_note": "Verbo あげる (entregar) y 喜んで (gustosamente, con complacencia).", "clean_target": clean_for_ime("桃太郎が団子をあげると犬は喜んで家来になりました")},
    {"id": "s7_12", "chapter": 3, "japanese": "道を進むと、賢い猿と空を飛べる雉も仲間になり、四人は力を合わせて海を渡りました。", "translation_es": "En el camino, un mono y un faisán se unieron y los cuatro cruzaron el mar.", "grammar_note": "Potencial 飛べる (capaz de volar) y expresión 力を合わせる (unir fuerzas).", "clean_target": clean_for_ime("道を進むと賢い猿と空を飛べる雉も仲間になり四人は力を合わせて海を渡りました")},
    # Cap 4
    {"id": "s7_13", "chapter": 4, "japanese": "鬼ヶ島に着くと、大きな黒い門がそびえ立っていました。", "translation_es": "Al llegar a la isla, un gran portón negro se erguía ante ellos.", "grammar_note": "そびえ立つ (alzarse imponente en las alturas).", "clean_target": clean_for_ime("鬼ヶ島に着くと大きな黒い門がそびえ立っていました")},
    {"id": "s7_14", "chapter": 4, "japanese": "雉が空から門を開け、猿が鍵を外し、犬と桃太郎が勇気を出して突入しました。", "translation_es": "El faisán abrió desde el aire, el mono quitó el cerrojo y entraron con valentía.", "grammar_note": "División táctica de tareas coordinadas mediante formas conjuntivas.", "clean_target": clean_for_ime("雉が空から門を開け猿が鍵を外し犬と桃太郎が勇気を出して突入しました")},
    {"id": "s7_15", "chapter": 4, "japanese": "鬼たちは降参し、「もう二度と悪さはしません」と宝物をすべて返しました。", "translation_es": "Los ogros se rindieron y devolvieron todos los tesoros robados.", "grammar_note": "二度と + verbo negativo (二度としません) expresa nunca jamás en el futuro.", "clean_target": clean_for_ime("鬼たちは降参しもう二度と悪さはしませんと宝物をすべて返しました")},
    {"id": "s7_16", "chapter": 4, "japanese": "桃太郎たちはたくさんの宝物を持って村へ帰り、おじいさんとおばあさんと幸せに暮らしました。", "translation_es": "Regresaron con los tesoros y vivieron felices con los ancianos.", "grammar_note": "Adverbialización con に: 幸せに暮らす (vivir en felicidad).", "clean_target": clean_for_ime("桃太郎たちはたくさんの宝物を持って村へ帰りおじいさんとおばあさんと幸せに暮らしました")}
]

story_7_questions = [
    {
        "id": "story_7_q1",
        "question": "¿De dónde apareció el gran melocotón del que nació Momotaro?",
        "question_jp": "桃太郎が生まれた大きな桃はどこから来ましたか？",
        "options": [
            "おばあさんが洗濯していた川の上流から流れてきた (Bajó flotando desde la parte alta del río)",
            "おじいさんが登った高い山の木の上になっていた (Creció en un árbol de la montaña)",
            "村の神社の前に置いてあった (Estaba depositado en el santuario)",
            "海から船で運ばれてきた (Fue traído por barco desde el mar)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 1 se señala: «おばあさんが川で洗濯をしていると、川上から大きな桃がどんぶらこと流れてきました»."
    },
    {
        "id": "story_7_q2",
        "question": "¿Qué animales se convirtieron en compañeros de Momotaro a cambio de los kibidango?",
        "question_jp": "きび団子をもらって桃太郎の仲間になった動物は何ですか？",
        "options": [
            "犬（いぬ）、猿（さる）、雉（きじ） (Un perro, un mono y un faisán)",
            "猫（ねこ）、熊（くま）、虎（とら） (Un gato, un oso y un tigre)",
            "馬（うま）、鹿（しか）、鶴（つる） (Un caballo, un ciervo y una grulla)",
            "狐（きつね）、狸（たぬき）、狼（おおかみ） (Un zorro, un tanuki y un lobo)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 3 se presentan en orden el perro («犬»), el mono («猿») y el faisán («雉»)."
    },
    {
        "id": "story_7_q3",
        "question": "¿Qué prometieron los ogros tras ser vencidos en Onigashima?",
        "question_jp": "退治された鬼たちは何と約束しましたか？",
        "options": [
            "«もう二度と悪さはしません» (No volveremos a hacer maldades jamás)",
            "«毎年きび団子を作ります» (Prepararemos kibidango todos los años)",
            "«村の畑を耕します» (Cultivaremos los campos del pueblo)",
            "«人間には話しかけません» (No volveremos a hablarle a los humanos)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 4 se afirma: «鬼たちは降参し、「もう二度と悪さはしません」と宝物をすべて返しました»."
    }
]

story_7 = {
    "id": "story_7",
    "title": "昔話：桃太郎の冒険",
    "title_es": "Cuento tradicional: La aventura de Momotaro (JLPT N4)",
    "title_en": "Folktale: The Adventure of Momotaro",
    "difficulty": "N4",
    "level": "N4",
    "category": "Folclore y Cuentos Tradicionales",
    "source_modules": [20, 24, 25],
    "description": "La leyenda más célebre de Japón adaptada a nivel JLPT N4: el nacimiento de Momotaro dentro de un melocotón gigante, la entrega de los kibidango, la lealtad de sus compañeros animales y la derrota de los ogros.",
    "paragraphs": story_7_paragraphs,
    "sentences": story_7_sentences,
    "comprehension_questions": story_7_questions
}

print("✅ Historia 7 compilada con 16 frases completas y 3 preguntas en español.")

# =============================================================================
# HISTORIA 8: 昔話：鶴の恩返し (La gratitud de la grulla) - JLPT N4
# =============================================================================
story_8_paragraphs = [
    {
        "chapter": 1,
        "title": "雪の日の罠と優しい若者 (La trampa en la nieve y el joven compasivo)",
        "japanese": "雪が深く積もったある冬の日、心優しい若者が山道を歩いていました。すると、狩人の罠にかかって苦しそうにもがいている一羽の白い鶴を見つけました。若者は「可哀そうに、今助けてあげるからね」と優しく声をかけ、罠を外してあげました。鶴は若者に深く頭を下げるように見つめた後、大空へ元気に飛び去っていきました。",
        "hiragana": "ゆきが ふかく つもった ある ふゆのひ、こころやさしい わかものが やまみちを あるいていました。すると、かりうどの わなに かかって くるしそうに もがいている いちわの しろい つるを みつけました。わかものは「かわいそうに、いま たすけて あげるからね」と やさしく こえを かけ、わなを はずして あげました。つるは わかものに ふかく あたまを さげるように みつめた のち、おおぞらへ げんきに とびさって いきました。",
        "translation_es": "Un día de invierno en que la nieve caía profundamente, un joven bondadoso caminaba por el sendero de la montaña. De repente, encontró una grulla blanca atrapada en el lazo de un cazador, forcejeando con gran sufrimiento. El joven le habló con ternura: 'Pobrecilla, ahora mismo te voy a ayudar', y le retiró la trampa. La grulla pareció hacerle una profunda reverencia y luego alzó el vuelo vigorosa hacia el cielo.",
        "rubyDict": {"雪": "ゆき", "深く": "ふかく", "積もった": "つもった", "冬": "ふゆ", "日": "ひ", "心優しい": "こころやさしい", "若者": "わかもの", "山道": "やまみち", "罠": "わな", "苦しそうに": "くるしそうに", "一羽": "いちわ", "白い": "しろい", "鶴": "つる", "見つけました": "みつけました", "助けて": "たすけて", "外して": "はずして", "頭": "あたま", "下げる": "さげる", "大空": "おおぞら", "飛び去って": "とびさって"}
    },
    {
        "chapter": 2,
        "title": "吹雪の夜の美しい客 (La hermosa visitante en la noche de ventisca)",
        "japanese": "その日の夜、激しい吹雪の中で誰かが家の戸を叩きました。若者が戸を開けると、息を呑むほど美しい娘が立っていました。「道に迷って凍えそうです。どうか一晩泊めていただけませんか」と娘は頼みました。若者は快く招き入れ、温かいお粥を作って娘をもてなしました。娘は喜び、若者の妻となって一緒に暮らすことになりました。",
        "hiragana": "そのひの よる、はげしい ふぶきの なかで だれかが いえの とを たたきました。わかものが とを あけると、いきをのむほど うつくしい むすめが たっていました。「みちに まよって こごえそうです。どうか ひとばん とめて いただけませんか」と むすめは たのみました。わかものは こころよく まねきいれ、あたたかい おかゆを つくって むすめを もてなしました。むすめは よろこび、わかものの つまと なって いっしょに くらすことに なりました。",
        "translation_es": "Esa misma noche, en medio de una violenta tormenta de nieve, alguien llamó a la puerta de la casa. Al abrir, había una muchacha de una belleza deslumbrante. 'Me he perdido por el camino y estoy a punto de congelarme. ¿Tendría la bondad de alojarme por una noche?', suplicó. El joven la invitó a pasar de buen grado, preparó gachas calientes y la atendió. Con el tiempo, la joven se convirtió en su esposa y comenzaron a vivir juntos.",
        "rubyDict": {"激しい": "はげしい", "吹雪": "ふぶき", "戸": "と", "叩きました": "たたきました", "娘": "むすめ", "凍えそう": "こごえそう", "一晩": "ひとばん", "泊めて": "とめて", "頼みました": "たのみました", "快く": "こころよく", "招き入れ": "まねきいれ", "お粥": "おかゆ", "妻": "つま", "暮らす": "くらす"}
    },
    {
        "chapter": 3,
        "title": "決して見てはいけない部屋 (La habitación que jamás debe ser mirada)",
        "japanese": "ある日、妻は「私は奥の部屋で布を織ります。織り終わるまで、決して部屋の中を覗かないでください」と約束させました。部屋からは毎日「トントンからり」と機織りの音が聞こえました。数日後、妻が織り上げた布は光り輝くほど見事で、町でとても高く売れました。しかし、妻は日に日に痩せて青白い顔になっていきました。",
        "hiragana": "あるひ、つまは「わたしは おくの へやで ぬのをおります。おりおわるまで、けっして へやの なかを のぞかないで ください」と やくそく させました。へやからは まいにち「とんとんからり」と はたおりの おとが きこえました。すうじつご、つまが おりあげた ぬのは ひかりかがやくほど みごとで、まちで とても たかく うれました。しかし、つまは ひにひに やせて あおじろい かおに なっていきました。",
        "translation_es": "Un día, la esposa le pidió una promesa solemne: 'Tejeré una tela en la habitación del fondo. Hasta que termine de tejer, por favor, jamás mires dentro de la habitación'. Desde la habitación se escuchaba todos los días el rítmico traqueteo del telar. Días después, la tela tejida era tan deslumbrante que se vendió a un altísimo precio en el pueblo. No obstante, la esposa enflaquecía día tras día y su rostro palidecía.",
        "rubyDict": {"奥": "おく", "布": "ぬの", "織ります": "おります", "織り終わる": "おりおわる", "決して": "けっして", "覗かないで": "のぞかないで", "約束": "やくそく", "機織り": "はたおり", "音": "おと", "聞こえました": "きこえました", "数日後": "すうじつご", "輝く": "かがやく", "見事": "みごと", "売れました": "うれました", "痩せて": "やせて", "青白い": "あおじろい"}
    },
    {
        "chapter": 4,
        "title": "別れの朝と空への羽ばたき (La mañana de la despedida y el vuelo)",
        "japanese": "若者は心配のあまり、とうとう約束を破って障子の隙間から部屋を覗いてしまいました。そこにいたのは人間の娘ではなく、自分の白い羽を一本ずつ抜いて布を織る鶴の姿でした。正体を知られた鶴は「助けていただいた恩返しをしたかったのですが、見られてしまったのでもうここにはいられません」と涙を流し、大空へ飛んでいきました。",
        "hiragana": "わかものは しんぱいのあまり、とうとう やくそくを やぶって しょうじの すきまから へやを のぞいて しまいました。そこに いたのは にんげんの むすめではなく、じぶんの しろい はねを いっぽんずつ ぬいて ぬのを おる つるの すがたでした。しょうたいを しられた つるは「たすけていただいた おんがえしを したかったのですが、みられてしまったので もう ここには いられません」と なみだを ながし、おおぞらへ とんでいきました。",
        "translation_es": "Abrumado por la preocupación, el joven terminó rompiendo su promesa y espió la habitación por la rendija del biombo (shōji). Quien estaba allí no era una mujer humana, sino una grulla que arrancaba una a una sus plumas blancas para tejer la tela. Al ser descubierta, la grulla lloró diciendo: 'Quería devolverle el favor de salvarme, pero al haberme visto ya no puedo quedarme aquí', y voló hacia el firmamento para no volver jamás.",
        "rubyDict": {"心配": "しんぱい", "破って": "やぶって", "障子": "しょうじ", "隙間": "すきま", "人間": "にんげん", "羽": "はね", "抜いて": "ぬいて", "姿": "すがた", "正体": "しょうたい", "恩返し": "おんがえし", "涙": "なみだ", "流し": "ながし", "大空": "おおぞら"}
    }
]

story_8_sentences = [
    # Cap 1
    {"id": "s8_1", "chapter": 1, "japanese": "雪が深く積もったある冬の日、心優しい若者が山道を歩いていました。", "translation_es": "Un día de invierno con profunda nieve, un joven caminaba por la montaña.", "grammar_note": "深く積もる (acumularse copiosamente la nieve).", "clean_target": clean_for_ime("雪が深く積もったある冬の日心優しい若者が山道を歩いていました")},
    {"id": "s8_2", "chapter": 1, "japanese": "狩人の罠にかかって苦しそうにもがいている一羽の白い鶴を見つけました。", "translation_es": "Encontró una grulla blanca atrapada en una trampa que forcejeaba.", "grammar_note": "罠にかかる (caer preso en una trampa). 〜そうに indica apariencia visible.", "clean_target": clean_for_ime("狩人の罠にかかって苦しそうにもがいている一羽の白い鶴を見つけました")},
    {"id": "s8_3", "chapter": 1, "japanese": "若者は「可哀そうに、今助けてあげるからね」と優しく声をかけ、罠を外してあげました。", "translation_es": "El joven le dijo con piedad: 'Ahora te ayudo', y le soltó el lazo.", "grammar_note": "〜てあげる expresa realizar una acción benefactora desinteresada.", "clean_target": clean_for_ime("若者は可哀そうに今助けてあげるからねと優しく声をかけ罠を外してあげました")},
    {"id": "s8_4", "chapter": 1, "japanese": "鶴は若者に深く頭を下げるように見つめた後、大空へ元気に飛び去っていきました。", "translation_es": "La grulla inclinó la cabeza hacia el joven y alzó el vuelo con energía.", "grammar_note": "〜ように (como si hiciera una reverencia) y 飛び去っていく (alejarse volando).", "clean_target": clean_for_ime("鶴は若者に深く頭を下げるように見つめた後大空へ元気に飛び去っていきました")},
    # Cap 2
    {"id": "s8_5", "chapter": 2, "japanese": "その日の夜、激しい吹雪の中で誰かが家の戸を叩きました。", "translation_es": "Esa noche, en medio de la ventisca, alguien golpeó la puerta de la casa.", "grammar_note": "誰か (alguien indeterminado) y 戸を叩く (tocar a la puerta).", "clean_target": clean_for_ime("その日の夜激しい吹雪の中で誰かが家の戸を叩きました")},
    {"id": "s8_6", "chapter": 2, "japanese": "若者が戸を開けると、息を呑むほど美しい娘が立っていました。", "translation_es": "Al abrir la puerta, había una joven deslumbrantemente hermosa.", "grammar_note": "息を呑むほど (tanto que corta la respiración, de belleza asombrosa).", "clean_target": clean_for_ime("若者が戸を開けると息を呑むほど美しい娘が立っていました")},
    {"id": "s8_7", "chapter": 2, "japanese": "「道に迷って凍えそうです。どうか一晩泊めていただけませんか」と娘は頼みました。", "translation_es": "'Estoy a punto de congelarme. ¿Podría darme cobijo por una noche?', suplicó.", "grammar_note": "〜ていただけませんか es la forma honorífica más cortés para solicitar asilo.", "clean_target": clean_for_ime("道に迷って凍えそうですどうか一晩泊めていただけませんかと娘は頼みました")},
    {"id": "s8_8", "chapter": 2, "japanese": "娘は喜び、若者の妻となって一緒に暮らすことになりました。", "translation_es": "La joven aceptó con gozo, se hizo su esposa y comenzaron a convivir.", "grammar_note": "〜ことになる denota un desenlace natural al que arriba una situación.", "clean_target": clean_for_ime("娘は喜び若者の妻となって一緒に暮らすことになりました")},
    # Cap 3
    {"id": "s8_9", "chapter": 3, "japanese": "妻は「織り終わるまで、決して部屋の中を覗かないでください」と約束させました。", "translation_es": "La esposa le advirtió: 'Jamás mires dentro de la habitación hasta terminar'.", "grammar_note": "決して〜ないでください (fórmula imperativa de prohibición terminante).", "clean_target": clean_for_ime("妻は織り終わるまで決して部屋の中を覗かないでくださいと約束させました")},
    {"id": "s8_10", "chapter": 3, "japanese": "部屋からは毎日「トントンからり」と機織りの音が聞こえました。", "translation_es": "Desde el cuarto se oía a diario el traqueteo del telar.", "grammar_note": "トントンからり es la onomatopeya clásica japonesa del tejido tradicional.", "clean_target": clean_for_ime("部屋からは毎日トントンからりと機織りの音が聞こえました")},
    {"id": "s8_11", "chapter": 3, "japanese": "妻が織り上げた布は光り輝くほど見事で、町でとても高く売れました。", "translation_es": "La tela tejida resplandecía tanto que se vendió a alto precio en el pueblo.", "grammar_note": "Verbo compuesto 織り上げる (completar o culminar el tejido).", "clean_target": clean_for_ime("妻が織り上げた布は光り輝くほど見事で町でとても高く売れました")},
    {"id": "s8_12", "chapter": 3, "japanese": "しかし、妻は日に日に痩せて青白い顔になっていきました。", "translation_es": "Sin embargo, la esposa enflaquecía y palidecía cada día que pasaba.", "grammar_note": "日に日に (día tras día progresivamente). 〜ていく expresa transformación continua.", "clean_target": clean_for_ime("しかし妻は日に日に痩せて青白い顔になっていきました")},
    # Cap 4
    {"id": "s8_13", "chapter": 4, "japanese": "若者は心配のあまり、とうとう約束を破って障子の隙間から部屋を覗いてしまいました。", "translation_es": "Por la gran preocupación, el joven rompió la promesa y miró por la rendija.", "grammar_note": "〜のあまり (por exceso de emoción). 〜てしまう denota una acción imprudente irreparable.", "clean_target": clean_for_ime("若者は心配のあまりとうとう約束を破って障子の隙間から部屋を覗いてしまいました")},
    {"id": "s8_14", "chapter": 4, "japanese": "そこにいたのは人間の娘ではなく、自分の白い羽を一本ずつ抜いて布を織る鶴の姿でした。", "translation_es": "Allí no había una mujer, sino una grulla arrancando sus plumas para tejer.", "grammar_note": "一本ずつ (de una en una). Sustantivo A ではなく Sustantivo B.", "clean_target": clean_for_ime("そこにいたのは人間の娘ではなく自分の白い羽を一本ずつ抜いて布を織る鶴の姿でした")},
    {"id": "s8_15", "chapter": 4, "japanese": "正体を知られた鶴は「助けていただいた恩返しをしたかったのですが、見られてしまったのでもうここにはいられません」と涙を流しました。", "translation_es": "La grulla lloró: 'Quería agradecer su rescate, pero al ser descubierta no puedo quedarme'.", "grammar_note": "Voz pasiva (知られた, 見られてしまった) y potencial negativo いられない.", "clean_target": clean_for_ime("正体を知られた鶴は助けていただいた恩返しをしたかったのですが見られてしまったのでもうここにはいられませんと涙を流しました")},
    {"id": "s8_16", "chapter": 4, "japanese": "鶴は名残惜しそうに若者を見つめ、大空へ飛んでいきました。", "translation_es": "La grulla miró al joven con honda nostalgia y partió volando al cielo.", "grammar_note": "名残惜しそうに (con pesar y añoranza por una despedida obligada).", "clean_target": clean_for_ime("鶴は名残惜しそうに若者を見つめ大空へ飛んでいきました")}
]

story_8_questions = [
    {
        "id": "story_8_q1",
        "question": "¿Qué favor crucial hizo el joven compasivo por la grulla al inicio del relato?",
        "question_jp": "物語の冒頭で、優しい若者は鶴にどんな恩恵を与えましたか？",
        "options": [
            "狩人の罠を外して命を救ってあげた (Le retiró la trampa del cazador y le salvó la vida)",
            "怪我をした羽に温かい包帯を巻いてあげた (Le vendó un ala herida)",
            "雪山の中で美味しい魚を分け与えた (Le compartió pescado en la montaña)",
            "猟師から金貨を払って買い取った (La compró con monedas de oro al cazador)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 1 se describe: «狩人の罠にかかって苦しそうにもがいている一羽の白い鶴を見つけました。若者は(...)罠を外してあげました»."
    },
    {
        "id": "story_8_q2",
        "question": "¿Cuál fue la condición inquebrantable que la esposa le pidió cumplir mientras tejía?",
        "question_jp": "妻が布を織る際、若者に求めた絶対の約束は何ですか？",
        "options": [
            "織り終わるまで、決して部屋の中を覗かないこと (Jamás mirar dentro de la habitación hasta que terminara)",
            "織った布を安い値段で売らないこと (No vender la tela a bajo precio)",
            "夜の機織りの音を近所に聞かせないこと (No dejar que los vecinos oyeran el telar)",
            "三日間食事を部屋に運ばないこと (No llevar comida al cuarto durante tres días)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 3 se indica: «織り終わるまで、決して部屋の中を覗かないでくださいと約束させました»."
    },
    {
        "id": "story_8_q3",
        "question": "¿Cuál era el doloroso secreto detrás de la maravillosa tela tejida por la grulla?",
        "question_jp": "光り輝く美しい布が織られていた本当の理由は何でしたか？",
        "options": [
            "鶴が自分の白い羽を一本ずつ抜いて織り込んでいたから (La grulla arrancaba sus propias plumas una a una para tejerlas)",
            "月の光を糸に変える魔法を使っていたから (Usaba magia para convertir la luz lunar en hilo)",
            "町で買った最高級の生糸を隠していたから (Ocultaba seda fina comprada en el pueblo)",
            "神様から授かった黄金の糸を使っていたから (Utilizaba hilos de oro bendecidos)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 4 se revela: «自分の白い羽を一本ずつ抜いて布を織る鶴の姿でした»."
    }
]

story_8 = {
    "id": "story_8",
    "title": "昔話：鶴の恩返し",
    "title_es": "Cuento tradicional: La gratitud de la grulla (JLPT N4)",
    "title_en": "Folktale: The Crane's Return of Favor",
    "difficulty": "N4",
    "level": "N4",
    "category": "Folclore y Gratitud Moral",
    "source_modules": [21, 26, 27],
    "description": "El conmovedor cuento folclórico japonés adaptado a nivel JLPT N4: el rescate en la nieve, la bella muchacha tejedora, el juramento de no mirar la habitación y la emotiva despedida de la grulla.",
    "paragraphs": story_8_paragraphs,
    "sentences": story_8_sentences,
    "comprehension_questions": story_8_questions
}

print("✅ Historia 8 compilada con 16 frases completas y 3 preguntas en español.")

# =============================================================================
# HISTORIA 9: 職場の変革と未来の架け橋 (Transformación laboral en Tokio) - JLPT N2
# =============================================================================
story_9_paragraphs = [
    {
        "chapter": 1,
        "title": "テレワーク導入と新たな課題 (Teletrabajo y nuevos retos de comunicación)",
        "japanese": "近年の社会情勢の変化に伴い、弊社の東京本社でも本格的なテレワークが導入されることになりました。柔軟な働き方が可能になった反面、画面越しのやり取りだけでは細やかなニュアンスが伝わりにくいという課題も浮き彫りになりつつあります。特に新入社員の孤立を防ぐため、オンライン上での気軽な雑談タイムを設けるなど、職場環境の改善に向けた試行錯誤が続いています。",
        "hiragana": "きんねんの しゃかいじょうせいの へんかに ともない、へいしゃの とうきょうほんしゃでも ほんかくてきな てれわーくが どうにゅう されることに なりました。じゅうなんな はたらきかたが かのうに なった はんめん、がめんごしの やりとりだけでは こまやかな にゅあんすが つたわりにくいという かだいも うきぼりに なりつつあります。とくに しんにゅうしゃいんの こりつを ふせぐため、おんらいんじょうでの きがるな ざつだんたいむを もうけるなど、しょくばかんきょうの かいぜんに むけた しこうさくごが つづいています。",
        "translation_es": "A raíz de las transformaciones sociolaborales de los últimos años, en la sede central de Tokio de nuestra empresa se implementó el teletrabajo a gran escala. Si bien permitió una notable flexibilidad laboral, por otra parte se hizo patente la dificultad de transmitir matices comunicativos sutiles exclusivamente a través de la pantalla. En particular, para prevenir el aislamiento de los empleados recién incorporados, prosigue un proceso de ensayo y error destinado a mejorar el clima laboral, incorporando pausas informales de charla distendida por videoconferencia.",
        "rubyDict": {"近年": "きんねん", "社会情勢": "しゃかいじょうせい", "変化": "へんか", "伴い": "ともない", "弊社": "へいしゃ", "東京本社": "とうきょうほんしゃ", "本格的": "ほんかくてき", "導入": "どうにゅう", "柔軟": "じゅうなん", "反面": "はんめん", "画面越し": "がめんごし", "細やか": "こまやか", "伝わりにくい": "つたわりにくい", "課題": "かだい", "浮き彫り": "うきぼり", "新入社員": "しんにゅうしゃいん", "孤立": "こりつ", "防ぐ": "ふせぐ", "雑談": "ざつだん", "設ける": "もうける", "職場環境": "しょくばかんきょう", "改善": "かいぜん", "試行錯誤": "しこうさくご"}
    },
    {
        "chapter": 2,
        "title": "多文化共生プロジェクトの提案 (Propuesta de convivencia multicultural)",
        "japanese": "国籍の異なるメンバーが共に成果を出すためには、互いの文化的背景を尊重し合う姿勢が欠かせません。私は業務改善提案制度を活用し、「異文化理解ワークショップ」の定期開催をマネジメント層にプレゼンしました。社内規定や業務フローを多言語化するのみならず、言葉の壁を越えて信頼関係を深められる仕組み作りを熱心に訴えかけました。",
        "hiragana": "こくせきの ことなる めんばーが ともに せいかを だすためには、たがいの ぶんかてきはいけいを そんちょうしあう しせいが かかせません。わたしは ぎょうむかいぜんていあんせいどを かつようし、「いぶんかりかい わーくしょっぷ」の ていきかいさいを まねじめんとそうに ぷれぜんしました。しゃないきていや ぎょうむふろーを たげんごか するのみならず、ことばのかべを こえて しんらいかんけいを ふかめられる しくみづくりを ねっしんに うったえかけました。",
        "translation_es": "Para que colaboradores de diversas nacionalidades generen resultados extraordinarios juntos, resulta indispensable una actitud de respeto mutuo hacia sus bagajes culturales. Aprovechando el sistema interno de sugerencias de mejora operativa, presenté ante la dirección la celebración periódica de talleres de entendimiento intercultural. No me limité a plantear la traducción multilingüe de normativas y protocolos de trabajo, sino que propugné con ahínco la creación de mecanismos orientados a forjar lazos de confianza recíproca más allá de las barreras idiomáticas.",
        "rubyDict": {"国籍": "こくせき", "異なる": "ことなる", "共に": "ともに", "成果": "せいか", "背景": "はいけい", "尊重": "そんちょう", "姿勢": "しせい", "欠かせません": "かかせません", "業務改善": "ぎょうむかいぜん", "異文化理解": "いぶんかりかい", "定期開催": "ていきかいさい", "社内規定": "しゃないきてい", "多言語化": "たげんごか", "言葉の壁": "ことばのかべ", "信頼関係": "しんらいかんけい", "仕組み": "しくみ", "訴えかけました": "うったえかけました"}
    },
    {
        "chapter": 3,
        "title": "失敗を乗り越えるチームの結束 (Superar los contratiempos con cohesión)",
        "japanese": "プロジェクトの初期段階では、スケジュール管理の認識の相違から思わぬトラブルが発生してしまいました。しかし、誰かを一方的に責めるのではなく、根本的な原因を冷静に分析し、全員で解決策を模索しました。困難に直面したからこそチームの結束力が高まり、メンバー一人ひとりの責任感も強固なものへと成長していったのです。",
        "hiragana": "ぷろじぇくとの しょきだんかいでは、すけじゅーるかんりの にんしきの そういから おもわぬ とらぶるが はっせい してしまいました。しかし、だれかを いっぽうてきに せめるのではなく、こんぽんてきな げんいんを れいせいに ぶんせきし、ぜんいんで かいけつさくを もさくしました。こんなんに ちょくめんしたからこそ ちーむの けっそくりょくが たかまり、めんばー ひとりひとりの せきにんかんも きょうこなものへと せいちょうしていったのです。",
        "translation_es": "En la etapa inicial del proyecto surgieron contratiempos imprevistos debido a discrepancias en la comprensión de los plazos y el cronograma. No obstante, lejos de culpar a nadie de forma unilateral, analizamos las causas profundas con total serenidad y exploramos soluciones de manera colectiva. Precisamente por haber afrontado esta dificultad, la cohesión del equipo se fortaleció notablemente y el sentido de responsabilidad individual maduró hacia un compromiso inquebrantable.",
        "rubyDict": {"初期段階": "しょきだんかい", "認識": "にんしき", "相違": "そうい", "思わぬ": "おもわぬ", "発生": "はっせい", "一方的": "いっぽうてき", "責める": "せめる", "根本的": "こんぽんてき", "原因": "げんいん", "冷静": "れいせい", "分析": "ぶんせき", "解決策": "かいけつさく", "模索": "もさく", "困難": "こんなん", "直面": "ちょくめん", "結束力": "けっそくりょく", "強固": "きょうこ", "責任感": "せきにんかん"}
    },
    {
        "chapter": 4,
        "title": "成果の共有とグローバルな展望 (Compartir logros y visión global)",
        "japanese": "半年間にわたる取り組みの結果、部署内の業務効率は二十パーセント向上し、社員満足度も大幅に改善されました。全社総会において私たちの取り組みが年間イノベーション賞を受賞し、壇上でチームを代表してスピーチを行いました。多様性を受け入れ、協働を通じて新しい価値を創出することの大切さを、私は身をもって学びました。",
        "hiragana": "はんねんかんに わたる とりくみの けっか、ぶしょないの ぎょうむこうりつは にじゅっ ぱーせんと こうじょうし、しゃいんまんぞくども おおはばに かいぜん されました。ぜんしゃそうかいに おいて わたしたちの とりくみが ねんかん いのべーしょんしょうを じゅしょうし、だんじょうで ちーむを だいひょうして すぴーちを おこないました。たようせいを うけいれ、きょうどうを つうじて あたらしい かちを そうしゅつすることの たいせつさを、わたしは みをもって まなびました。",
        "translation_es": "Como fruto de esta iniciativa prolongada a lo largo de seis meses, la eficiencia operativa del departamento creció un 20% y la satisfacción del personal mejoró sustancialmente. En la asamblea general de la empresa nuestro proyecto fue galardonado con el Premio Anual de Innovación, y subí al estrado a brindar el discurso en representación del equipo. Aprendí en carne propia la trascendencia de abrazar la diversidad y forjar un valor diferencial mediante la colaboración colectiva.",
        "rubyDict": {"半年間": "はんねんかん", "取り組み": "とりくみ", "結果": "けっか", "部署内": "ぶしょない", "業務効率": "ぎょうむこうりつ", "向上": "こうじょう", "社員満足度": "しゃいんまんぞくど", "大幅": "おおはば", "全社総会": "ぜんしゃそうかい", "受賞": "じゅしょう", "壇上": "だんじょう", "代表": "だいひょう", "多様性": "たようせい", "協働": "きょうどう", "価値": "かち", "創出": "そうしゅつ", "身をもって": "みをもって"}
    }
]

story_9_sentences = [
    # Cap 1
    {"id": "s9_1", "chapter": 1, "japanese": "近年の社会情勢の変化に伴い、弊社の東京本社でも本格的なテレワークが導入されることになりました。", "translation_es": "Conforme a los cambios sociales, en la sede de Tokio se implementó el teletrabajo formal.", "grammar_note": "〜に伴い (en consonancia con, a raíz de). 導入される es voz pasiva formal corporativa.", "clean_target": clean_for_ime("近年の社会情勢の変化に伴い弊社の東京本社でも本格的なテレワークが導入されることになりました")},
    {"id": "s9_2", "chapter": 1, "japanese": "柔軟な働き方が可能になった反面、画面越しのやり取りだけでは細やかなニュアンスが伝わりにくいという課題も浮き彫りになりつつあります。", "translation_es": "Permitió flexibilidad, pero por otra parte visibilizó la dificultad de transmitir matices sutiles en pantalla.", "grammar_note": "〜反面 (por otra parte / en contraste). 〜つつある expresa un proceso en curso continuo.", "clean_target": clean_for_ime("柔軟な働き方が可能になった反面画面越しのやり取りだけでは細やかなニュアンスが伝わりにくいという課題も浮き彫りになりつつあります")},
    {"id": "s9_3", "chapter": 1, "japanese": "特に新入社員の孤立を防ぐため、オンライン上での気軽な雑談タイムを設けるなど、職場環境の改善に向けた試行錯誤が続いています。", "translation_es": "Para evitar el aislamiento, prosiguen ensayos y errores creando pausas de charla distendida.", "grammar_note": "〜に向けた (enfocado o destinado hacia un fin superior de mejora institucional).", "clean_target": clean_for_ime("特に新入社員の孤立を防ぐためオンライン上での気軽な雑談タイムを設けるなど職場環境の改善に向けた試行錯誤が続いています")},
    {"id": "s9_4", "chapter": 1, "japanese": "働き方改革の推進は、単なるツールの導入にとどまらず、社員同士の心理的安全性をいかに確保するかが問われています。", "translation_es": "La reforma laboral no se reduce a herramientas, sino a garantizar la seguridad psicológica mutua.", "grammar_note": "〜にとどまらず (no limitándose a). 〜かが問われている plantea la cuestión de fondo.", "clean_target": clean_for_ime("働き方改革の推進は単なるツールの導入にとどまらず社員同士の心理的安全性をいかに確保するかが問われています")},
    # Cap 2
    {"id": "s9_5", "chapter": 2, "japanese": "国籍の異なるメンバーが共に成果を出すためには、互いの文化的背景を尊重し合う姿勢が欠かせません。", "translation_es": "Para lograr éxitos entre diversas nacionalidades, es imprescindible el respeto mutuo a su cultura.", "grammar_note": "〜が欠かせない (es estrictamente indispensable). 尊重し合う (respetarse mutuamente).", "clean_target": clean_for_ime("国籍の異なるメンバーが共に成果を出すためには互いの文化的背景を尊重し合う姿勢が欠かせません")},
    {"id": "s9_6", "chapter": 2, "japanese": "私は業務改善提案制度を活用し、「異文化理解ワークショップ」の定期開催をマネジメント層にプレゼンしました。", "translation_es": "Aprovechando las sugerencias operativas, expuse ante la gerencia celebrar talleres interculturales.", "grammar_note": "業務改善提案制度を活用し (utilizando institucionalmente las vías de propuesta corporativa).", "clean_target": clean_for_ime("私は業務改善提案制度を活用し異文化理解ワークショップの定期開催をマネジメント層にプレゼンしました")},
    {"id": "s9_7", "chapter": 2, "japanese": "社内規定や業務フローを多言語化するのみならず、言葉の壁を越えて信頼関係を深められる仕組み作りを熱心に訴えかけました。", "translation_es": "No solo planteé traducir normas, sino crear mecanismos para consolidar confianza más allá de idiomas.", "grammar_note": "〜のみならず (no solo... sino también, estructura formal escrita de JLPT N2).", "clean_target": clean_for_ime("社内規定や業務フローを多言語化するのみならず言葉の壁を越えて信頼関係を深められる仕組み作りを熱心に訴えかけました")},
    {"id": "s9_8", "chapter": 2, "japanese": "多様性を単なる理想論で終わらせず、具体的な業務プロセスへ落とし込むことの重要性を説きました。", "translation_es": "Insistí en no dejar la diversidad en mera teoría y aterrizarla en procesos operativos concretos.", "grammar_note": "〜で終わらせず (sin dejar que concluya meramente en). 落とし込む (aterrizar o plasmar en la práctica).", "clean_target": clean_for_ime("多様性を単なる理想論で終わらせず具体的な業務プロセスへ落とし込むことの重要性を説きました")},
    # Cap 3
    {"id": "s9_9", "chapter": 3, "japanese": "プロジェクトの初期段階では、スケジュール管理の認識の相違から思わぬトラブルが発生してしまいました。", "translation_es": "Al inicio surgieron tropiezos imprevistos por discrepancias de criterio en los plazos.", "grammar_note": "思わぬ (inesperado/imprevisto). 〜てしまう para percances lamentables.", "clean_target": clean_for_ime("プロジェクトの初期段階ではスケジュール管理の認識の相違から思わぬトラブルが発生してしまいました")},
    {"id": "s9_10", "chapter": 3, "japanese": "しかし、誰かを一方的に責めるのではなく、根本的な原因を冷静に分析し、全員で解決策を模索しました。", "translation_es": "Sin culpar a nadie de forma unilateral, analizamos causas con calma y buscamos soluciones juntos.", "grammar_note": "〜のではなく (en vez de hacer A, se hace B). 模索する (explorar o sondear vías viables).", "clean_target": clean_for_ime("しかし誰かを一方的に責めるのではなく根本的な原因を冷静に分析し全員で解決策を模索しました")},
    {"id": "s9_11", "chapter": 3, "japanese": "困難に直面したからこそチームの結束力が高まり、メンバー一人ひとりの責任感も強固なものへと成長していったのです。", "translation_es": "Precisamente por afrontar dificultades, la cohesión se fortaleció y la responsabilidad creció.", "grammar_note": "〜からこそ (precisamente debido a esa dificultad). 強固なものへと (hacia algo inquebrantable).", "clean_target": clean_for_ime("困難に直面したからこそチームの結束力が高まりメンバー一人ひとりの責任感も強固なものへと成長していったのです")},
    {"id": "s9_12", "chapter": 3, "japanese": "互いの弱みを補い合える関係性を築けたことこそが、最大の収穫であったと言えます。", "translation_es": "Haber forjado una relación donde compensar las debilidades mutuas fue la mayor ganancia lograda.", "grammar_note": "弱みを補い合う (compensar mutuamente los flancos débiles). 〜と言える (se puede afirmar que).", "clean_target": clean_for_ime("互いの弱みを補い合える関係性を築けたことこそが最大の収穫であったと言えます")},
    # Cap 4
    {"id": "s9_13", "chapter": 4, "japanese": "半年間にわたる取り組みの結果、部署内の業務効率は二十パーセント向上し、社員満足度も大幅に改善されました。", "translation_es": "Tras medio año de trabajo, la productividad subió un 20% y el clima laboral mejoró sensiblemente.", "grammar_note": "〜にわたる (prolongado a lo largo de un período continuo de tiempo).", "clean_target": clean_for_ime("半年間にわたる取り組みの結果部署内の業務効率は二十パーセント向上し社員満足度も大幅に改善されました")},
    {"id": "s9_14", "chapter": 4, "japanese": "全社総会において私たちの取り組みが年間イノベーション賞を受賞し、壇上でチームを代表してスピーチを行いました。", "translation_es": "En la convención general recibimos el Premio a la Innovación y di el discurso en el estrado.", "grammar_note": "〜において (en el marco formal de un evento). 〜を代表して (en representación de).", "clean_target": clean_for_ime("全社総会において私たちの取り組みが年間イノベーション賞を受賞し壇上でチームを代表してスピーチを行いました")},
    {"id": "s9_15", "chapter": 4, "japanese": "多様性を受け入れ、協働を通じて新しい価値を創出することの大切さを、私は身をもって学びました。", "translation_es": "Aprendí en carne propia el valor de abrazar la diversidad y crear riqueza a través de la cooperación.", "grammar_note": "〜を通じて (a través o por mediación de). 身をもって学ぶ (aprender por propia vivencia).", "clean_target": clean_for_ime("多様性を受け入れ協働を通じて新しい価値を創出することの大切さを私は身をもって学びました")},
    {"id": "s9_16", "chapter": 4, "japanese": "これからも国境を越えて人々をつなぐ架け橋として、邁進していきたいと考えております。", "translation_es": "Pienso seguir avanzando con firmeza como un puente que conecte a las personas más allá de fronteras.", "grammar_note": "〜として (en calidad de puente). 〜ていきたいと考えております (keigo formal humilde de intención futura).", "clean_target": clean_for_ime("これからも国境を越えて人々をつなぐ架け橋として邁進していきたいと考えております")}
]

story_9_questions = [
    {
        "id": "story_9_q1",
        "question": "¿Qué problema comunicativo surgió con la instauración masiva del teletrabajo según el relato?",
        "question_jp": "テレワークの導入に伴って顕在化したコミュニケーションの課題は何ですか？",
        "options": [
            "画面越しのやり取りだけでは、細やかなニュアンスが伝わりにくいこと (Dificultad de transmitir matices sutiles en pantalla)",
            "通信回線が不安定でオンライン会議が全く繋がらないこと (Conexión inestable a internet)",
            "社員全員が対面での会議を頑なに拒否したこと (Rechazo a reuniones presenciales)",
            "残業時間が前年の二倍に急増したこと (Duplicación de horas extras)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 1 se señala: «画面越しのやり取りだけでは細やかなニュアンスが伝わりにくいという課題も浮き彫りになりつつあります»."
    },
    {
        "id": "story_9_q2",
        "question": "¿Cómo afrontó el equipo el contratiempo derivado de las discrepancias en el cronograma?",
        "question_jp": "スケジュールの認識の相違によるトラブルに、チームはどう対処しましたか？",
        "options": [
            "誰かを一方的に責めず、根本原因を冷静に分析して全員で解決策を模索した (Sin culpar a nadie, analizaron causas con calma y buscaron soluciones juntos)",
            "責任者をプロジェクトから即座に外した (Destituyeron de inmediato al líder)",
            "すべての多言語化業務を外部のコンサルティング会社に丸投げした (Externalizaron todo el trabajo)",
            "プロジェクト自体を白紙撤回した (Cancelaron el proyecto por completo)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 3 se precisa: «誰かを一方的に責めるのではなく、根本的な原因を冷静に分析し、全員で解決策を模索しました»."
    },
    {
        "id": "story_9_q3",
        "question": "¿Qué reconocimiento obtuvo el proyecto en la asamblea general de la empresa?",
        "question_jp": "全社総会において、この取り組みはどんな評価を受けましたか？",
        "options": [
            "年間イノベーション賞を受賞した (Fue galardonado con el Premio Anual de Innovación)",
            "社長から口頭で厳重注意を受けた (Recibió una amonestación verbal)",
            "他部署への配置転換を命じられた (Se ordenó la reasignación a otro departamento)",
            "予算を半減された (Se recortó su presupuesto a la mitad)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 4 se relata con orgullo: «全社総会において私たちの取り組みが年間イノベーション賞を受賞し、壇上でチームを代表してスピーチを行いました»."
    }
]

story_9 = {
    "id": "story_9",
    "title": "職場の変革と未来の架け橋",
    "title_es": "Transformación laboral, trabajo remoto y sociedad en Tokio (JLPT N2)",
    "title_en": "Workplace Transformation: Bridge to the Future",
    "difficulty": "N2",
    "level": "N2",
    "category": "Negocios Contemporáneos y Diversidad",
    "source_modules": [33, 34, 37],
    "description": "Crónica empresarial de nivel JLPT N2: la adopción del teletrabajo en una corporación de Tokio, la creación de talleres de convivencia multicultural, la superación de crisis de comunicación y la consecución del premio anual de innovación.",
    "paragraphs": story_9_paragraphs,
    "sentences": story_9_sentences,
    "comprehension_questions": story_9_questions
}

print("✅ Historia 9 compilada con 16 frases completas y 3 preguntas en español.")

# =============================================================================
# HISTORIA 10: 京都の町家と伝統の継承：木を紡ぐ匠の哲学 - JLPT N1
# =============================================================================
story_10_paragraphs = [
    {
        "chapter": 1,
        "title": "千年の都に息づく木造建築の美 (La belleza de la arquitectura en madera milenaria)",
        "japanese": "千年の歴史を誇る古都・京都の路地に佇む京町家は、単なる住居の枠を越え、日本人の自然観と美意識が凝縮された空間芸術にほかならない。釘を一本も使わずに木と木を噛み合わせる伝統的な「木組み工法」は、地震の揺れをしなやかに逃がす先人の英知の結晶である。格子窓から差し込む陰影の移ろいや庭に打ち水がされた石畳の佇まいには、時の流れと共に深まる美しさが宿っている。",
        "hiragana": "せんねんの れきしを ほこる こと・きょうとの ろじに たたずむ きょうまちやは、たんなる じゅうきょの わくを こえ、にほんじんの しぜんかんと びいしきが ぎょうしゅく された くうかんげいじゅつに ほかならない。くぎを いっぽんも つかわずに きと きを かみあわせる でんとうてきな「きぐみこうほう」は、じしんの ゆれを しなやかに にがす せんじんの えいちの けっしょうである。こうしまどから さしこむ いんえいの うつろいや にわに うちみずが された いしだたみの たたずまいには、ときの ながれと ともに ふかまる うつくしさが やどっている。",
        "translation_es": "Las tradicionales casas urbanas (Kyōmachiya) emplazadas en las callejuelas de Kioto trascienden la noción de una simple morada; encarnan un arte espacial donde confluyen la visión de la naturaleza y la estética japonesa. La técnica de ensamblaje en madera sin clavos (Kigumi) constituye la cúspide de la sabiduría ancestral, capaz de disipar con flexibilidad los embates sísmicos. En las sutiles sombras que tamizan las celosías y en los adoquines humedecidos con Uchimizu habita una belleza serena que madura con el transcurso del tiempo.",
        "rubyDict": {"千年": "せんねん", "歴史": "れきし", "誇る": "ほこる", "古都": "こと", "京都": "きょうと", "路地": "ろじ", "佇む": "たたずむ", "京町家": "きょうまちや", "住居": "じゅうきょ", "自然観": "しぜんかん", "美意識": "びいしき", "凝縮": "ぎょうしゅく", "空間芸術": "くうかんげいじゅつ", "釘": "くぎ", "木組み": "きぐみ", "工法": "こうほう", "先人": "せんじん", "英知": "えいち", "結晶": "けっしょう", "格子窓": "こうしまど", "陰影": "いんえい", "打ち水": "うちみず", "石畳": "いしだたみ"}
    },
    {
        "chapter": 2,
        "title": "匠の技と世代を超えた対話 (La maestría del artesano y el diálogo generacional)",
        "japanese": "この道五十年の宮大工・西村師匠のもとで、若き職人たちが鉋（かんな）の刃を研ぎ澄ます姿には、崇高なまでの緊張感が漂っている。「木には命がある。反りや縮みといった木の癖をねじ伏せるのではなく、木の声に耳を澄ませて適材適所に配することこそが肝要だ」と師匠は説く。師の言葉を全身で受け止めながら、弟子たちは日々の鍛錬を通じて、言葉では伝えきれない身体感覚の知恵を継承している。",
        "hiragana": "このみち ごじゅうねんの みやだいく・にしむらししょうの もとで、わかき しょくにんたちが かんなの はを とぎすます すがたには、すうこうなまでの きんちょうかんが ただよっている。「きには いのちが ある。そりや ちぢみといった きのくせを ねじふせるのではなく、きのこえに みみを すませて てきざいてきしょに はいすることこそが かんようだ」と ししょうは とく。しの ことばを ぜんしんで うけとめながら、でしたちは ひびの たんれんを つうじて、ことばでは つたえきれない しんたいかんかくの ちえを けいしょうしている。",
        "translation_es": "Bajo la tutela del maestro Nishimura, maestro carpintero de templos con cincuenta años de oficio, la estampa de los jóvenes artesanos afilando con mimo las cuchillas del cepillo irradia una tensión casi solemne. 'La madera tiene vida. Lejos de someter a la fuerza sus desviaciones y contracciones, lo esencial radica en afinar el oído a su voz para asignar cada pieza a su función idónea', predica el maestro. Interiorizando su palabra, los aprendices asimilan mediante el adiestramiento cotidiano un saber intuitivo y corpóreo inabarcable en meras explicaciones.",
        "rubyDict": {"宮大工": "みやだいく", "師匠": "ししょう", "職人": "しょくにん", "研ぎ澄ます": "とぎすます", "崇高": "すうこう", "緊張感": "きんちょうかん", "漂う": "ただよう", "癖": "くせ", "適材適所": "てきざいてきしょ", "肝要": "かんよう", "弟子": "でし", "鍛錬": "たんれん", "身体感覚": "しんたいかんかく", "知恵": "ちえ", "継承": "けいしょう"}
    },
    {
        "chapter": 3,
        "title": "侘び寂びの美学と持続可能な未来 (La estética Wabi-Sabi y la sostenibilidad)",
        "japanese": "現代社会において効率や利便性が至上命題とされる中にあって、町家の修復はスクラップ・アンド・ビルドの消費社会に対する静かな警鐘と言える。歳月を経て黒ずんだ柱や擦り切れた敷居は、朽ち果てていく不完全さの中に美を見出す「侘び寂び」の精神を雄弁に物語っている。傷んだ部材のみを丹念に削り取り、新しい木を継ぎ足す技術は、資源を循環させる持続可能な建築思想の原点に位置づけられる。",
        "hiragana": "げんだいしゃかいに おいて こうりつや りべんせいが しじょうめいだいに されるなかにあって、まちやの しゅうふくは すくらっぷ・あんど・びるどの しょうひしゃかいに たいする しずかな けいしょうと いえる。さいげつを へて くろずんだ はしらや すりきれた しきいは、くちはてていく ふかんぜんさの なかに びを みいだす「わびさび」の せいしんを ゆうべんに ものがたっている。いたんだ ぶざいのみを たんねんに けずりとり、あたらしい きを つぎたす ぎじゅつは、しげんを じゅんかんさせる じぞくかのうな けんちくしそうの げんてんに いちづけられる。",
        "translation_es": "En una sociedad contemporánea donde la eficiencia y la conveniencia económica suelen erigirse en dogmas absolutos, la restauración de las Machiya constituye una advertencia silenciosa frente a la cultura de derribo y consumo indiscriminado. Los pilares oscurecidos por el paso de las décadas y los umbrales gastados expresan con elocuencia el espíritu de 'Wabi-Sabi', que vislumbra la belleza en la imperfección y la finitud. La técnica de sanear con primor las piezas deterioradas insertando madera nueva sin alterar el conjunto encarna la cuna de una arquitectura verdaderamente circular y sostenible.",
        "rubyDict": {"現代社会": "げんだいしゃかい", "効率": "こうりつ", "利便性": "りべんせい", "至上命題": "しじょうめいだい", "修復": "しゅうふく", "警鐘": "けいしょう", "歳月": "さいげつ", "柱": "はしら", "敷居": "しきい", "不完全": "ふかんぜん", "侘び寂び": "わびさび", "精神": "せいしん", "雄弁": "ゆうべん", "丹念": "たんねん", "循環": "じゅんかん", "持続可能": "じぞくかのう", "原点": "げんてん"}
    },
    {
        "chapter": 4,
        "title": "時を超えて受け継がれる魂 (El alma viva que trasciende el tiempo)",
        "japanese": "町家を次世代へと引き継ぐことは、単に古い建物を保存することにとどまらず、そこに育まれた暮らしの作法や精神風土を守り抜くことにほかならない。木を慈しみ、自然の移ろいと共生する匠の哲学は、物質的な豊かさに溺れがちな現代人に対し、真の豊かさとは何かを静かに問いかけている。伝統とは過去の遺物を愛でることではなく、現在という瞬間において未来への火を灯し続ける不断の営みなのだ。",
        "hiragana": "まちやを じせだいへと ひきつぐことは、たんに ふるい たてものを ほぞんすることに とどまらず、そこに はぐくまれた くらしの さほうや せいしんふうどを まもりぬくことに ほかならない。きを いつくしみ、しぜんの うつろいと きょうせいする たくみの てつがくは、ぶっしつてきな ゆたかさに おぼれがちな げんだいじんに たいし、しんの ゆたかさとは なにかを しずかに といかけている。でんとうとは かこの いぶつを めでることではなく、げんざいという しゅんかんに おいて みらいへの ひを ともしつづける ふだんの いとなみなのだ。",
        "translation_es": "Legar las casas urbanas tradicionales a las generaciones venideras trasciende la mera conservación arquitectónica; equivale a preservar las pautas de cortesía, convivencia comunitaria y atmósfera cultural allí cultivadas. La filosofía artesanal que ama la madera y convive en armonía con los ciclos naturales interpela a la sociedad actual sobre el significado de la verdadera plenitud espiritual. La tradición viva no estriba en contemplar reliquias del ayer, sino en alimentar de forma ininterrumpida la llama creadora hacia el porvenir.",
        "rubyDict": {"次世代": "じせだい", "引き継ぐ": "ひきつぐ", "保存": "ほぞん", "作法": "さほう", "精神風土": "せいしんふうど", "守り抜く": "まもりぬく", "慈しみ": "いつくしみ", "共生": "きょうせい", "哲学": "てつがく", "物質的": "ぶっしつてき", "問いかけている": "といかけている", "遺物": "いぶつ", "愛でる": "めでる", "瞬間": "しゅんかん", "不断": "ふだん", "営み": "いとなみ"}
    }
]

story_10_sentences = [
    # Cap 1
    {"id": "s10_1", "chapter": 1, "japanese": "千年の歴史を誇る古都・京都の路地に佇む京町家は、単なる住居の枠を越え、日本人の自然観と美意識が凝縮された空間芸術にほかならない。", "translation_es": "Las Machiya de Kioto trascienden la vivienda; son arte espacial donde se condensa la estética japonesa.", "grammar_note": "〜にほかならない (no es otra cosa que / es indudablemente, estructura JLPT N1 formal).", "clean_target": clean_for_ime("千年の歴史を誇る古都京都の路地に佇む京町家は単なる住居の枠を越え日本人の自然観と美意識が凝縮された空間芸術にほかならない")},
    {"id": "s10_2", "chapter": 1, "japanese": "釘を一本も使わずに木と木を噛み合わせる伝統的な「木組み工法」は、地震の揺れをしなやかに逃がす先人の英知の結晶である。", "translation_es": "El ensamble de madera sin clavos es la cumbre de la sabiduría ancestral para disipar sismos.", "grammar_note": "〜ずに (sin hacer algo, forma formal arcaica de 〜ないで). 〜の結晶である (frase formal predicativa).", "clean_target": clean_for_ime("釘を一本も使わずに木と木を噛み合わせる伝統的な木組み工法は地震の揺れをしなやかに逃がす先人の英知の結晶である")},
    {"id": "s10_3", "chapter": 1, "japanese": "格子窓から差し込む陰影の移ろいや庭に打ち水がされた石畳の佇まいには、時の流れと共に深まる美しさが宿っている。", "translation_es": "En la sombra tras las celosías y en los adoquines húmedos habita una belleza que madura con el tiempo.", "grammar_note": "〜と共に (junto con / a medida que). 宿る (morar o residir espiritualmente).", "clean_target": clean_for_ime("格子窓から差し込む陰影の移ろいや庭に打ち水がされた石畳の佇まいには時の流れと共に深まる美しさが宿っている")},
    {"id": "s10_4", "chapter": 1, "japanese": "風土に根ざした素材を選び抜き、気候の厳しさを心地よさへと転化させる技術が息づいています。", "translation_es": "Respira una técnica que selecciona materiales nativos y transmuta la crudeza climática en sosiego.", "grammar_note": "選び抜く (seleccionar tras depurada deliberación). 〜へと転化させる (transformar hacia).", "clean_target": clean_for_ime("風土に根ざした素材を選び抜き気候の厳しさを心地よさへと転化させる技術が息づいています")},
    # Cap 2
    {"id": "s10_5", "chapter": 2, "japanese": "この道五十年の宮大工・西村師匠のもとで、若き職人たちが鉋の刃を研ぎ澄ます姿には、崇高なまでの緊張感が漂っている。", "translation_es": "Bajo el maestro Nishimura, ver a los jóvenes afilar los cepillos destila una tensión casi sagrada.", "grammar_note": "〜のもとで (bajo la tutela de). 〜に至るまでの (hasta un grado extremo/sublime).", "clean_target": clean_for_ime("この道五十年の宮大工西村師匠のもとで若き職人たちが鉋の刃を研ぎ澄ます姿には崇高なまでの緊張感が漂っている")},
    {"id": "s10_6", "chapter": 2, "japanese": "「木には命がある。反りや縮みといった木の癖をねじ伏せるのではなく、木の声に耳を澄ませて適材適所に配することこそが肝要だ」と師匠は説く。", "translation_es": "'Lo vital no es doblegar la madera, sino escuchar su voz y ubicar cada pieza donde le corresponde'.", "grammar_note": "〜こそが肝要だ (es precisamente lo primordial). 耳を澄ませる (afinar el oído con atención pura).", "clean_target": clean_for_ime("木には命がある反りや縮みといった木の癖をねじ伏せるのではなく木の声に耳を澄ませて適材適所に配することこそが肝要だと師匠は説く")},
    {"id": "s10_7", "chapter": 2, "japanese": "師の言葉を全身で受け止めながら、弟子たちは日々の鍛錬を通じて、言葉では伝えきれない身体感覚の知恵を継承している。", "translation_es": "Los aprendices heredan una sabiduría sensorial que las palabras no alcanzan a agotar.", "grammar_note": "〜きれない (incapaz de abarcar o agotar por completo, JLPT N1).", "clean_target": clean_for_ime("師の言葉を全身で受け止めながら弟子たちは日々の鍛錬を通じて言葉では伝えきれない身体感覚の知恵を継承している")},
    {"id": "s10_8", "chapter": 2, "japanese": "身体で覚えた技術こそが、いかなる時代の荒波にも揺らぐことのない確固たる支柱となるのです。", "translation_es": "El oficio grabado en el cuerpo es el pilar inmutable ante los vaivenes de cualquier época.", "grammar_note": "いかなる〜も (cualquiera que sea). 〜ことのない (sin jamás experimentar).", "clean_target": clean_for_ime("身体で覚えた技術こそがいかなる時代の荒波にも揺らぐことのない確固たる支柱となるのです")},
    # Cap 3
    {"id": "s10_9", "chapter": 3, "japanese": "現代社会において効率や利便性が至上命題とされる中にあって、町家の修復は消費社会に対する静かな警鐘と言える。", "translation_es": "En medio del auge del pragmatismo, restaurar las casas es una serena advertencia al consumismo.", "grammar_note": "〜にあって (en la coyuntura crítica de, patrón culto formal de JLPT N1).", "clean_target": clean_for_ime("現代社会において効率や利便性が至上命題とされる中にあって町家の修復は消費社会に対する静かな警鐘と言える")},
    {"id": "s10_10", "chapter": 3, "japanese": "歳月を経て黒ずんだ柱や擦り切れた敷居は、朽ち果てていく不完全さの中に美を見出す「侘び寂び」の精神を雄弁に物語っている。", "translation_es": "Las vigas oscurecidas y umbrales gastados narran el alma del Wabi-Sabi en lo imperfecto y caduco.", "grammar_note": "〜を雄弁に物語る (expresar o atestiguar con profunda elocuencia).", "clean_target": clean_for_ime("歳月を経て黒ずんだ柱や擦り切れた敷居は朽ち果てていく不完全さの中に美を見出す侘び寂びの精神を雄弁に物語っている")},
    {"id": "s10_11", "chapter": 3, "japanese": "傷んだ部材のみを丹念に削り取り、新しい木を継ぎ足す技術は、資源を循環させる持続可能な建築思想の原点に位置づけられる。", "translation_es": "Sanear solo lo dañado injertando madera nueva es el origen de la arquitectura sostenible.", "grammar_note": "〜に位置づけられる (quedar catalogado o emplazado formalmente como).", "clean_target": clean_for_ime("傷んだ部材のみを丹念に削り取り新しい木を継ぎ足す技術は資源を循環させる持続可能な建築思想の原点に位置づけられる")},
    {"id": "s10_12", "chapter": 3, "japanese": "ものを慈しみ最後まで生かし切る姿勢は、真の持続可能性を体現していると言っても過言ではない。", "translation_es": "Aprovechar con veneración un recurso hasta el final encarna la auténtica sostenibilidad.", "grammar_note": "〜と言っても過言ではない (no es una exageración afirmar que, giro retórico formal).", "clean_target": clean_for_ime("ものを慈しみ最後まで生かし切る姿勢は真の持続可能性を体現していると言っても過言ではない")},
    # Cap 4
    {"id": "s10_13", "chapter": 4, "japanese": "町家を次世代へと引き継ぐことは、単に古い建物を保存することにとどまらず、そこに育まれた暮らしの作法を守り抜くことにほかならない。", "translation_es": "Legar las Machiya es salvaguardar las costumbres de vida allí forjadas, no solo edificios.", "grammar_note": "〜にとどまらず (no restringiéndose a). 〜を守り抜く (preservar hasta las últimas consecuencias).", "clean_target": clean_for_ime("町家を次世代へと引き継ぐことは単に古い建物を保存することにとどまらずそこに育まれた暮らしの作法を守り抜くことにほかならない")},
    {"id": "s10_14", "chapter": 4, "japanese": "木を慈しみ、自然の移ろいと共生する匠の哲学は、物質的な豊かさに溺れがちな現代人に対し、真の豊かさとは何かを静かに問いかけている。", "translation_es": "La filosofía del artesano interroga a la sociedad consumista sobre la verdadera plenitud humana.", "grammar_note": "〜に溺れがちな (con tendencia funesta a perderse en). 問いかける (lanzar una pregunta reflexiva).", "clean_target": clean_for_ime("木を慈しみ自然の移ろいと共生する匠の哲学は物質的な豊かさに溺れがちな現代人に対し真の豊かさとは何かを静かに問いかけている")},
    {"id": "s10_15", "chapter": 4, "japanese": "伝統とは過去の遺物を愛でることではなく、現在という瞬間において未来への火を灯し続ける不断の営みなのだ。", "translation_es": "La tradición no es adorar reliquias, sino mantener encendida la llama del porvenir en el presente.", "grammar_note": "〜愛でる (apreciar con deleite estético). 不断の営み (esfuerzo o labor ininterrumpida).", "clean_target": clean_for_ime("伝統とは過去の遺物を愛でることではなく現在という瞬間において未来への火を灯し続ける不断の営みなのだ")},
    {"id": "s10_16", "chapter": 4, "japanese": "幾世代にもわたり受け継がれた匠たちの魂は、今日という日にも確かに息づいているのである。", "translation_es": "El espíritu artesanal transmitido por generaciones respira con certeza inmutable en el presente.", "grammar_note": "幾世代にもわたり (a lo largo de incontables generaciones). のである (aserción conclusiva rotunda).", "clean_target": clean_for_ime("幾世代にもわたり受け継がれた匠たちの魂は今日という日にも確かに息づいているのである")}
]

story_10_questions = [
    {
        "id": "story_10_q1",
        "question": "¿Cuál es la función arquitectónica primordial de la técnica tradicional «木組み» (Kigumi) descrita en el ensayo?",
        "question_jp": "釘を用いない「木組み工法」の構造的な最大の特徴は何ですか？",
        "options": [
            "地震の揺れをしなやかに逃がす免震的な英知の結晶であること (Disipar con elasticidad y flexibilidad los embates sísmicos)",
            "建物を二日間で解体して移動できるようにすること (Poder desmontar el edificio en dos días)",
            "木材の費用を鉄骨の十分の一に抑えること (Abaratar los costes a una décima parte del acero)",
            "雨水を屋根裏に貯水して防火に役立てること (Almacenar agua de lluvia en el ático)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 1 se describe: «釘を一本も使わずに木と木を噛み合わせる伝統的な「木組み工法」は、地震の揺れをしなやかに逃がす先人の英知の結晶である»."
    },
    {
        "id": "story_10_q2",
        "question": "¿En qué consiste el principio medular del maestro Nishimura al trabajar la madera?",
        "question_jp": "西村師匠が説く、木と向き合う上で最も肝要な姿勢とは何ですか？",
        "options": [
            "木の癖をねじ伏せず、木の声に耳を澄ませて適材適所に配すること (No forzar las desviaciones de la madera, sino escuchar su voz y ubicarla donde corresponda)",
            "曲がった木はすべて燃料として焼き捨てること (Desechar y quemar cualquier tronco curvado)",
            "最新の電動機械を用いて寸法を狂いなく切り揃えること (Cortar con máquinas eléctricas)",
            "最も硬い木材だけを選別して柱にすること (Usar únicamente las maderas más duras)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 2 el maestro sentencia: «反りや縮みといった木の癖をねじ伏せるのではなく、木の声に耳を澄ませて適材適所に配することこそが肝要だ»."
    },
    {
        "id": "story_10_q3",
        "question": "¿Cuál es la reflexión conclusiva del ensayo acerca de lo que verdaderamente constituye la «tradición»?",
        "question_jp": "筆者が論じる「真の伝統」の定義とは何ですか？",
        "options": [
            "過去の遺物を愛でるのではなく、未来への火を灯し続ける不断の営み (No adorar reliquias del pasado, sino mantener encendida la llama hacia el futuro)",
            "古い書物に書かれた儀式を一言一句違わずに復元すること (Reproducir rituales antiguos al pie de la letra)",
            "海外からの観光客向けに町家をカフェやホテルに改装すること (Convertir las casas en hoteles turísticos)",
            "伝統工芸品を美術館の中に厳重に密閉保管すること (Guardar las artesanías en vitrinas herméticas)"
        ],
        "correct_index": 0,
        "explanation": "En el capítulo 4 se concluye solemnemente: «伝統とは過去の遺物を愛でることではなく、現在という瞬間において未来への火を灯し続ける不断の営みなのだ»."
    }
]

story_10 = {
    "id": "story_10",
    "title": "京都の町家と伝統の継承：木を紡ぐ匠の哲学",
    "title_es": "Artesanía tradicional, Wabi-Sabi y sostenibilidad en Kioto (JLPT N1)",
    "title_en": "Kyoto Machiya and Tradition: Philosophy of Master Woodcraft",
    "difficulty": "N1",
    "level": "N1",
    "category": "Filosofía Estética y Cultura Clásica",
    "source_modules": [35, 36, 37],
    "description": "Ensayo literario y arquitectónico de alta exigencia (JLPT N1): las técnicas de carpintería tradicional (Kigumi) en Kioto, el diálogo entre maestros y aprendices, la filosofía del Wabi-Sabi frente al consumismo y la transmisión viva de la tradición.",
    "paragraphs": story_10_paragraphs,
    "sentences": story_10_sentences,
    "comprehension_questions": story_10_questions
}

print("✅ Historias 9 y 10 compiladas con éxito.")

# =============================================================================
# CONSOLIDACIÓN Y ESCRITURA EN DISCO (data/stories.json)
# =============================================================================
all_stories = [
    story_1, story_2, story_3, story_4, story_5,
    story_6, story_7, story_8, story_9, story_10
]

with open("data/stories.json", "w", encoding="utf-8") as f:
    json.dump(all_stories, f, ensure_ascii=False, indent=2)

print(f"\n🎉 data/stories.json guardado con éxito. Total: {len(all_stories)} historias canónicas.")

# =============================================================================
# ENLACE INTEGRAL EN CURRICULUM.JSON (MÓDULOS 1 AL 37)
# =============================================================================
with open("data/curriculum.json", "r", encoding="utf-8") as f:
    curriculum = json.load(f)

story_mapping = {
    1: [{"id": "story_1", "chapter": 1, "title": "朝の始まり (Comienza la mañana)", "story_title": "日本での一日", "level": "N5", "link_url": "/story?id=story_1&chapter=1"}],
    2: [{"id": "story_5", "chapter": 1, "title": "大学での出会いと自己紹介", "story_title": "アンナの東京キャンパス日記", "level": "N5", "link_url": "/story?id=story_5&chapter=1"}],
    3: [{"id": "story_1", "chapter": 2, "title": "学校への道と友達", "story_title": "日本での一日", "level": "N5", "link_url": "/story?id=story_1&chapter=2"}],
    4: [{"id": "story_2", "chapter": 2, "title": "スーパーでの買い物と料理", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=2"}],
    5: [{"id": "story_1", "chapter": 4, "title": "昼休みと週末の計画", "story_title": "日本での一日", "level": "N5", "link_url": "/story?id=story_1&chapter=4"}],
    6: [{"id": "story_2", "chapter": 3, "title": "地下鉄に乗って秋葉原へ", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=3"}],
    7: [{"id": "story_5", "chapter": 2, "title": "キャンパスの案内と教室", "story_title": "アンナの東京キャンパス日記", "level": "N5", "link_url": "/story?id=story_5&chapter=2"}],
    8: [{"id": "story_1", "chapter": 3, "title": "日本語の授業", "story_title": "日本での一日", "level": "N5", "link_url": "/story?id=story_1&chapter=3"}],
    9: [{"id": "story_5", "chapter": 3, "title": "アルバイトの面接と職場ルール", "story_title": "アンナの東京キャンパス日記", "level": "N5", "link_url": "/story?id=story_5&chapter=3"}],
    10: [{"id": "story_2", "chapter": 1, "title": "シェアハウスでの新しい生活", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=1"}],
    11: [{"id": "story_2", "chapter": 1, "title": "シェアハウスでの新しい生活", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=1"}],
    12: [{"id": "story_2", "chapter": 2, "title": "スーパーでの買い物と料理", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=2"}],
    13: [{"id": "story_2", "chapter": 3, "title": "地下鉄に乗って秋葉原へ", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=3"}],
    14: [{"id": "story_2", "chapter": 4, "title": "下町の夏祭りと花火", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=4"}],
    15: [{"id": "story_2", "chapter": 4, "title": "下町の夏祭りと花火", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=4"}],
    16: [{"id": "story_6", "chapter": 1, "title": "箱根への週末旅行の計画", "story_title": "アンナの温泉旅行と日本の伝統", "level": "N5", "link_url": "/story?id=story_6&chapter=1"}],
    17: [{"id": "story_6", "chapter": 2, "title": "温泉宿のルールと露天風呂", "story_title": "アンナの温泉旅行と日本の伝統", "level": "N5", "link_url": "/story?id=story_6&chapter=2"}],
    18: [{"id": "story_6", "chapter": 3, "title": "旅先の風邪と薬局での相談", "story_title": "アンナの温泉旅行と日本の伝統", "level": "N5", "link_url": "/story?id=story_6&chapter=3"}],
    19: [{"id": "story_6", "chapter": 4, "title": "感謝の手紙と新しい目標", "story_title": "アンナの温泉旅行と日本の伝統", "level": "N5", "link_url": "/story?id=story_6&chapter=4"}],
    20: [{"id": "story_7", "chapter": 1, "title": "川から流れてきた大きな桃", "story_title": "昔話：桃太郎の冒険", "level": "N4", "link_url": "/story?id=story_7&chapter=1"}],
    21: [{"id": "story_8", "chapter": 1, "title": "雪の日の罠と優しい若者", "story_title": "昔話：鶴の恩返し", "level": "N4", "link_url": "/story?id=story_8&chapter=1"}],
    22: [{"id": "story_3", "chapter": 1, "title": "日本に来たばかりの日々と電器屋", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=1"}],
    23: [{"id": "story_3", "chapter": 2, "title": "ラーメン屋での注文とアレルギー", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=2"}],
    24: [{"id": "story_7", "chapter": 2, "title": "鬼ヶ島への旅立ちときび団子", "story_title": "昔話：桃太郎の冒険", "level": "N4", "link_url": "/story?id=story_7&chapter=2"}],
    25: [{"id": "story_7", "chapter": 3, "title": "仲間たちとの出会いと協力", "story_title": "昔話：桃太郎の冒険", "level": "N4", "link_url": "/story?id=story_7&chapter=3"}],
    26: [{"id": "story_8", "chapter": 2, "title": "吹雪の夜の美しい客", "story_title": "昔話：鶴の恩返し", "level": "N4", "link_url": "/story?id=story_8&chapter=2"}],
    27: [{"id": "story_8", "chapter": 3, "title": "決して見てはいけない部屋", "story_title": "昔話：鶴の恩返し", "level": "N4", "link_url": "/story?id=story_8&chapter=3"}],
    28: [{"id": "story_3", "chapter": 5, "title": "緊急地震速報と将来の夢", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=5"}],
    29: [{"id": "story_4", "chapter": 1, "title": "アパートの契約と引越し", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=1"}],
    30: [{"id": "story_4", "chapter": 2, "title": "毎日の自炊と健康管理", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=2"}],
    31: [{"id": "story_4", "chapter": 3, "title": "カフェでのオタク談義と友情", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=3"}],
    32: [{"id": "story_4", "chapter": 4, "title": "九州・桜島への一人旅", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=4"}],
    33: [{"id": "story_9", "chapter": 1, "title": "テレワーク導入と新たな課題", "story_title": "職場の変革と未来の架け橋", "level": "N2", "link_url": "/story?id=story_9&chapter=1"}],
    34: [{"id": "story_9", "chapter": 2, "title": "多文化共生プロジェクトの提案", "story_title": "職場の変革と未来の架け橋", "level": "N2", "link_url": "/story?id=story_9&chapter=2"}],
    35: [{"id": "story_10", "chapter": 1, "title": "千年の都に息づく木造建築の美", "story_title": "京都の町家と伝統の継承", "level": "N1", "link_url": "/story?id=story_10&chapter=1"}],
    36: [{"id": "story_10", "chapter": 2, "title": "匠の技と世代を超えた対話", "story_title": "京都の町家と伝統の継承", "level": "N1", "link_url": "/story?id=story_10&chapter=2"}],
    37: [{"id": "story_4", "chapter": 5, "title": "運命の採用面接とこれからの私", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=5"}]
}

for m in curriculum:
    step = m["step"]
    if step in story_mapping:
        m["related_stories"] = story_mapping[step]

with open("data/curriculum.json", "w", encoding="utf-8") as f:
    json.dump(curriculum, f, ensure_ascii=False, indent=2)

print(f"✅ data/curriculum.json actualizado: ¡El 100% de los 37 módulos ahora cuentan con historias vinculadas!")
