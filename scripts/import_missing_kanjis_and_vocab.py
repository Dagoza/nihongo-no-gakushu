import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

kanji_path = os.path.join(DATA_DIR, "kanji.json")
vocab_path = os.path.join(DATA_DIR, "vocabulary.json")

kanji_list = json.load(open(kanji_path, encoding="utf-8"))
vocab_list = json.load(open(vocab_path, encoding="utf-8"))

existing_kanji_set = {k["kanji"]: k for k in kanji_list}
existing_vocab_set = {v.get("kanji") or v.get("hiragana"): v for v in vocab_list}

# 24 essential kanjis from Irodori
irodori_kanjis = [
    {
        "kanji": "私",
        "level": "N5",
        "meaning_es": "yo / privado",
        "meaning_en": "I / private / self",
        "pronunciation": "わたし, わたくし, し",
        "strokes": 7,
        "onyomi": "SHI [し]",
        "kunyomi": "watashi, watakushi [わたし, わたくし]",
        "mnemonic": "Un grano de trigo (禾) al lado de un signo personal (厶) representa lo propio, la propia cosecha o uno mismo.",
        "words": [
            {"word": "私", "reading": "わたし", "meaning": "yo"},
            {"word": "私たち", "reading": "わたしたち", "meaning": "nosotros"},
            {"word": "私立", "reading": "しりつ", "meaning": "privado (colegio/universidad)"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "肉",
        "level": "N5",
        "meaning_es": "carne",
        "meaning_en": "meat",
        "pronunciation": "にく",
        "strokes": 6,
        "onyomi": "NIKU [にく]",
        "kunyomi": "shishi [しし]",
        "mnemonic": "Muestra un corte de costillar con las vetas y fibras musculares de la carne.",
        "words": [
            {"word": "肉", "reading": "にく", "meaning": "carne"},
            {"word": "牛肉", "reading": "ぎゅうにく", "meaning": "carne de vacuno"},
            {"word": "豚肉", "reading": "ぶたにく", "meaning": "carne de cerdo"},
            {"word": "鳥肉", "reading": "とりにく", "meaning": "carne de pollo"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "好",
        "level": "N5",
        "meaning_es": "gustar / agradable",
        "meaning_en": "like / fond of / pleasant",
        "pronunciation": "す, こう, この",
        "strokes": 6,
        "onyomi": "KOU [こう]",
        "kunyomi": "su(ki), kono(mu) [す(き), この(む)]",
        "mnemonic": "Una mujer (女) abrazando a su hijo pequeño (子), representando el afecto, el agrado y el amor incondicional.",
        "words": [
            {"word": "好き", "reading": "すき", "meaning": "gustar / preferido"},
            {"word": "大好き", "reading": "だいすき", "meaning": "encantar / gustar mucho"},
            {"word": "好物", "reading": "こうぶつ", "meaning": "plato favorito"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "家",
        "level": "N5",
        "meaning_es": "casa / hogar / familia",
        "meaning_en": "house / home / family",
        "pronunciation": "いえ, や, か, け",
        "strokes": 10,
        "onyomi": "KA, KE [か, け]",
        "kunyomi": "ie, ya [いえ, や]",
        "mnemonic": "Bajo el techo de una vivienda (宀) se resguarda el cerdo doméstico (豕), símbolo tradicional de sustento del hogar.",
        "words": [
            {"word": "家", "reading": "いえ", "meaning": "casa / hogar"},
            {"word": "家族", "reading": "かぞく", "meaning": "familia"},
            {"word": "家賃", "reading": "やちん", "meaning": "alquiler de vivienda"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "広",
        "level": "N5",
        "meaning_es": "amplio / espacioso",
        "meaning_en": "spacious / wide",
        "pronunciation": "ひろ, こう",
        "strokes": 5,
        "onyomi": "KOU [こう]",
        "kunyomi": "hiro(i) [ひろ(い)]",
        "mnemonic": "Un edificio sobre una ladera (广) con espacio despejado (厶) en su interior.",
        "words": [
            {"word": "広い", "reading": "ひろい", "meaning": "amplio / espacioso"},
            {"word": "広場", "reading": "ひろば", "meaning": "plaza pública"},
            {"word": "広島", "reading": "ひろしま", "meaning": "Hiroshima"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "朝",
        "level": "N5",
        "meaning_es": "mañana / alba",
        "meaning_en": "morning",
        "pronunciation": "あさ, ちょう",
        "strokes": 12,
        "onyomi": "CHOU [ちょう]",
        "kunyomi": "asa [あさ]",
        "mnemonic": "El sol que se alza entre la hierba alta por la mañana mientras la luna (月) aún se desvanece.",
        "words": [
            {"word": "朝", "reading": "あさ", "meaning": "mañana / alba"},
            {"word": "朝ご飯", "reading": "あさごはん", "meaning": "desayuno"},
            {"word": "今朝", "reading": "けさ", "meaning": "esta mañana"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "昼",
        "level": "N5",
        "meaning_es": "mediodía / día",
        "meaning_en": "noon / daytime",
        "pronunciation": "ひる, ちゅう",
        "strokes": 9,
        "onyomi": "CHUU [ちゅう]",
        "kunyomi": "hiru [ひる]",
        "mnemonic": "La luz solar (日) marcando las horas más brillantes del día bajo el cielo.",
        "words": [
            {"word": "昼", "reading": "ひる", "meaning": "mediodía"},
            {"word": "昼休み", "reading": "ひるやすみ", "meaning": "descanso de mediodía"},
            {"word": "昼ご飯", "reading": "ひるごはん", "meaning": "almuerzo"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "夜",
        "level": "N5",
        "meaning_es": "noche",
        "meaning_en": "night / evening",
        "pronunciation": "よる, よ, や",
        "strokes": 8,
        "onyomi": "YA [や]",
        "kunyomi": "yoru, yo [よる, よ]",
        "mnemonic": "Una persona descansando bajo el dosel de la noche con la luna oculta.",
        "words": [
            {"word": "夜", "reading": "よる", "meaning": "noche"},
            {"word": "今夜", "reading": "こんや", "meaning": "esta noche"},
            {"word": "夜中", "reading": "よなか", "meaning": "medianoche"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "枚",
        "level": "N5",
        "meaning_es": "contador de hojas o cosas planas",
        "meaning_en": "counter for flat objects/sheets",
        "pronunciation": "まい",
        "strokes": 8,
        "onyomi": "MAI [まい]",
        "kunyomi": "",
        "mnemonic": "Un árbol (木) del que se extraen finas tablas o láminas de madera para escribir (攵).",
        "words": [
            {"word": "一枚", "reading": "いちまい", "meaning": "una hoja / una lámina"},
            {"word": "何枚", "reading": "なんまい", "meaning": "¿cuántas hojas?"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "乗",
        "level": "N5",
        "meaning_es": "subir a vehículo / montar",
        "meaning_en": "ride / get on",
        "pronunciation": "の, じょう",
        "strokes": 9,
        "onyomi": "JOU [じょう]",
        "kunyomi": "no(ru) [の(る)]",
        "mnemonic": "Una persona sentada en lo alto de un árbol o carruaje para desplazarse.",
        "words": [
            {"word": "乗る", "reading": "のる", "meaning": "subir a un vehículo"},
            {"word": "乗り場", "reading": "のりば", "meaning": "andén / parada de transporte"},
            {"word": "乗客", "reading": "じょうきゃく", "meaning": "pasajero"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "低",
        "level": "N5",
        "meaning_es": "bajo (altura / nivel)",
        "meaning_en": "low",
        "pronunciation": "ひく, てい",
        "strokes": 7,
        "onyomi": "TEI [てい]",
        "kunyomi": "hiku(i) [ひく(い)]",
        "mnemonic": "Una persona (亻) que se inclina hacia el suelo para tocar la base (氐).",
        "words": [
            {"word": "低い", "reading": "ひくい", "meaning": "bajo de estatura o altura"},
            {"word": "最低", "reading": "さいてい", "meaning": "lo más bajo / pésimo"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "横",
        "level": "N5",
        "meaning_es": "lado / costado / horizontal",
        "meaning_en": "side / horizontal / beside",
        "pronunciation": "よこ, おう",
        "strokes": 15,
        "onyomi": "OU [おう]",
        "kunyomi": "yoko [よこ]",
        "mnemonic": "Madera (木) colocada horizontalmente o a lo ancho con color amarillo brillante (黄).",
        "words": [
            {"word": "横", "reading": "よこ", "meaning": "lado / costado"},
            {"word": "横浜", "reading": "よこはま", "meaning": "Yokohama"},
            {"word": "横断歩道", "reading": "おうだんほどう", "meaning": "paso de peatones"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "口",
        "level": "N5",
        "meaning_es": "boca / abertura / entrada",
        "meaning_en": "mouth / entrance",
        "pronunciation": "くち, ぐち, こう",
        "strokes": 3,
        "onyomi": "KOU, KU [こう, く]",
        "kunyomi": "kuchi, guchi [くち, ぐち]",
        "mnemonic": "Dibujo pictográfico de una boca abierta o una abertura de entrada.",
        "words": [
            {"word": "口", "reading": "くち", "meaning": "boca"},
            {"word": "入口", "reading": "いりぐち", "meaning": "entrada"},
            {"word": "出口", "reading": "でぐち", "meaning": "salida"},
            {"word": "改札口", "reading": "かいさつぐち", "meaning": "torno de billetes / barrera"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "押",
        "level": "N5",
        "meaning_es": "empujar / presionar",
        "meaning_en": "push / press",
        "pronunciation": "お, おう",
        "strokes": 8,
        "onyomi": "OU [おう]",
        "kunyomi": "o(su) [お(す)]",
        "mnemonic": "Una mano (扌) empujando con fuerza hacia adelante (甲).",
        "words": [
            {"word": "押す", "reading": "おす", "meaning": "empujar / pulsar botón"},
            {"word": "押入れ", "reading": "おしいれ", "meaning": "armario empotrado tradicional"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "引",
        "level": "N5",
        "meaning_es": "tirar / jalar / descontar",
        "meaning_en": "pull / draw / subtract",
        "pronunciation": "ひ, いん",
        "strokes": 4,
        "onyomi": "IN [いん]",
        "kunyomi": "hi(ku) [ひ(く)]",
        "mnemonic": "Tensar la cuerda de un arco (弓) jalándola hacia atrás con una línea (丨).",
        "words": [
            {"word": "引く", "reading": "ひく", "meaning": "tirar / jalar"},
            {"word": "引き出し", "reading": "ひきだし", "meaning": "cajón"},
            {"word": "割引", "reading": "わりびき", "meaning": "descuento comercial"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "映",
        "level": "N5",
        "meaning_es": "reflejar / proyectar",
        "meaning_en": "reflect / project",
        "pronunciation": "うつ, えい",
        "strokes": 9,
        "onyomi": "EI [えい]",
        "kunyomi": "utsu(ru) [うつ(る)]",
        "mnemonic": "La luz solar (日) proyectando el reflejo central (央) sobre una superficie.",
        "words": [
            {"word": "映画", "reading": "えいが", "meaning": "película / cine"},
            {"word": "映る", "reading": "うつる", "meaning": "reflejarse"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "画",
        "level": "N5",
        "meaning_es": "dibujo / imagen / pintura",
        "meaning_en": "picture / painting / stroke",
        "pronunciation": "が, かく",
        "strokes": 8,
        "onyomi": "GA, KAKU [が, かく]",
        "kunyomi": "ega(ku) [えが(く)]",
        "mnemonic": "Un pincel delimitando con trazos el perímetro de los campos de cultivo.",
        "words": [
            {"word": "映画", "reading": "えいが", "meaning": "película / cine"},
            {"word": "計画", "reading": "けいかく", "meaning": "plan / proyecto"},
            {"word": "画面", "reading": "がめん", "meaning": "pantalla"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "勉",
        "level": "N5",
        "meaning_es": "esforzarse / empeñarse",
        "meaning_en": "endeavor / exert",
        "pronunciation": "べん",
        "strokes": 10,
        "onyomi": "BEN [べん]",
        "kunyomi": "tsuto(meru) [つと(める)]",
        "mnemonic": "Aplicar la propia fuerza (力) para superar un desafío intelectual o físico.",
        "words": [
            {"word": "勉強", "reading": "べんきょう", "meaning": "estudio"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "強",
        "level": "N5",
        "meaning_es": "fuerte / potente",
        "meaning_en": "strong / powerful",
        "pronunciation": "つよ, きょう, ごう",
        "strokes": 11,
        "onyomi": "KYOU, GOU [きょう, ごう]",
        "kunyomi": "tsuyo(i) [つよ(い)]",
        "mnemonic": "Un arco elástico (弓) que impulsa con fuerza a un insecto acorazado (虫).",
        "words": [
            {"word": "強い", "reading": "つよい", "meaning": "fuerte"},
            {"word": "勉強", "reading": "べんきょう", "meaning": "estudio"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "温",
        "level": "N5",
        "meaning_es": "cálido / tibio / templado",
        "meaning_en": "warm / temperate",
        "pronunciation": "あたた, おん",
        "strokes": 12,
        "onyomi": "ON [おん]",
        "kunyomi": "atata(kai) [あたた(かい)]",
        "mnemonic": "Agua (氵) tibia contenida en un cuenco o recipiente para templarse bajo el sol.",
        "words": [
            {"word": "温泉", "reading": "おんせん", "meaning": "aguas termales / onsen"},
            {"word": "温かい", "reading": "あたたかい", "meaning": "cálido (al tacto o bebida)"},
            {"word": "温度", "reading": "おんど", "meaning": "temperatura"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "泉",
        "level": "N5",
        "meaning_es": "manantial / fuente natural",
        "meaning_en": "spring / fountain",
        "pronunciation": "いずみ, せん",
        "strokes": 9,
        "onyomi": "SEN [せん]",
        "kunyomi": "izumi [いずみ]",
        "mnemonic": "Agua pura y transparente (白) brotando directamente de una corriente fluvial (水).",
        "words": [
            {"word": "温泉", "reading": "おんせん", "meaning": "aguas termales / onsen"},
            {"word": "泉", "reading": "いずみ", "meaning": "manantial natural"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "予",
        "level": "N5",
        "meaning_es": "previo / con antelación",
        "meaning_en": "beforehand / previous",
        "pronunciation": "よ",
        "strokes": 4,
        "onyomi": "YO [よ]",
        "kunyomi": "arakaji(me) [あらかじ(め)]",
        "mnemonic": "Preparar con anticipación una lanzadera de tejer antes de iniciar la labor.",
        "words": [
            {"word": "予定", "reading": "よてい", "meaning": "plan / programa"},
            {"word": "予約", "reading": "よやく", "meaning": "reserva"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "定",
        "level": "N5",
        "meaning_es": "determinar / fijar / estable",
        "meaning_en": "determine / fix / establish",
        "pronunciation": "さだ, てい, じょう",
        "strokes": 8,
        "onyomi": "TEI, JOU [てい, じょう]",
        "kunyomi": "sada(meru) [さだ(める)]",
        "mnemonic": "Bajo un techo seguro (宀), una persona apoya el pie firmemente en el suelo (疋).",
        "words": [
            {"word": "予定", "reading": "よてい", "meaning": "plan / programa previsto"},
            {"word": "定休日", "reading": "ていきゅうび", "meaning": "día de cierre regular"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    },
    {
        "kanji": "旅",
        "level": "N5",
        "meaning_es": "viaje / viajar",
        "meaning_en": "trip / travel",
        "pronunciation": "たび, りょ",
        "strokes": 10,
        "onyomi": "RYO [りょ]",
        "kunyomi": "tabi [たび]",
        "mnemonic": "Personas congregadas bajo un estandarte o bandera (方) para emprender una expedición o viaje.",
        "words": [
            {"word": "旅行", "reading": "りょこう", "meaning": "viaje / viajar"},
            {"word": "旅", "reading": "たび", "meaning": "viaje / periplo"},
            {"word": "旅館", "reading": "りょかん", "meaning": "posada tradicional japonesa"}
        ],
        "source": "Irodori Elementary / JLPT N5"
    }
]

# Add missing kanjis
added_kanjis_count = 0
for ik in irodori_kanjis:
    k_char = ik["kanji"]
    if k_char not in existing_kanji_set:
        kanji_list.append(ik)
        existing_kanji_set[k_char] = ik
        added_kanjis_count += 1
    else:
        # Merge words if missing
        curr = existing_kanji_set[k_char]
        curr_words = {w["word"]: w for w in curr.get("words", [])}
        for w in ik.get("words", []):
            if w["word"] not in curr_words:
                curr.setdefault("words", []).append(w)

print(f"Added {added_kanjis_count} new kanjis. Total kanjis now: {len(kanji_list)}")

# Now add missing Irodori vocabulary
# Must fulfill: kanji, hiragana, katakana, kana, meaning_es, meaning_en, category, level
new_vocab_items = [
    {
        "kanji": "私",
        "hiragana": "わたし",
        "katakana": "ワタシ",
        "kana": "わたし",
        "meaning_es": "Yo / Primera persona",
        "meaning_en": "I / me",
        "category": "Personas y Pronombres",
        "level": "N5"
    },
    {
        "kanji": "肉",
        "hiragana": "にく",
        "katakana": "ニク",
        "kana": "にく",
        "meaning_es": "Carne",
        "meaning_en": "Meat",
        "category": "Comida y Bebida",
        "level": "N5"
    },
    {
        "kanji": "好き",
        "hiragana": "すき",
        "katakana": "スキ",
        "kana": "すき",
        "meaning_es": "Gustar / Favorito",
        "meaning_en": "Like / Favorite",
        "category": "Adjetivos y Emociones",
        "level": "N5"
    },
    {
        "kanji": "家",
        "hiragana": "いえ",
        "katakana": "イエ",
        "kana": "いえ",
        "meaning_es": "Casa / Hogar",
        "meaning_en": "House / Home",
        "category": "Hogar y Vivienda",
        "level": "N5"
    },
    {
        "kanji": "広い",
        "hiragana": "ひろい",
        "katakana": "ヒロイ",
        "kana": "ひろい",
        "meaning_es": "Amplio / Espacioso",
        "meaning_en": "Spacious / Wide",
        "category": "Adjetivos",
        "level": "N5"
    },
    {
        "kanji": "朝",
        "hiragana": "あさ",
        "katakana": "アサ",
        "kana": "あさ",
        "meaning_es": "Mañana / Madrugada",
        "meaning_en": "Morning",
        "category": "Tiempo y Fechas",
        "level": "N5"
    },
    {
        "kanji": "昼",
        "hiragana": "ひる",
        "katakana": "ヒル",
        "kana": "ひる",
        "meaning_es": "Mediodía / Día",
        "meaning_en": "Noon / Daytime",
        "category": "Tiempo y Fechas",
        "level": "N5"
    },
    {
        "kanji": "夜",
        "hiragana": "よる",
        "katakana": "ヨル",
        "kana": "よる",
        "meaning_es": "Noche",
        "meaning_en": "Night / Evening",
        "category": "Tiempo y Fechas",
        "level": "N5"
    },
    {
        "kanji": "乗る",
        "hiragana": "のる",
        "katakana": "ノル",
        "kana": "のる",
        "meaning_es": "Subir a un vehículo / Montar",
        "meaning_en": "Ride / Board",
        "category": "Verbos y Transporte",
        "level": "N5"
    },
    {
        "kanji": "低い",
        "hiragana": "ひくい",
        "katakana": "ヒクイ",
        "kana": "ひくい",
        "meaning_es": "Bajo de estatura o nivel",
        "meaning_en": "Low",
        "category": "Adjetivos",
        "level": "N5"
    },
    {
        "kanji": "横",
        "hiragana": "よこ",
        "katakana": "ヨコ",
        "kana": "よこ",
        "meaning_es": "Lado / Costado",
        "meaning_en": "Side / Beside",
        "category": "Espacio y Direcciones",
        "level": "N5"
    },
    {
        "kanji": "入口",
        "hiragana": "いりぐち",
        "katakana": "イリグチ",
        "kana": "いりぐち",
        "meaning_es": "Entrada",
        "meaning_en": "Entrance",
        "category": "Ciudad y Tiendas",
        "level": "N5"
    },
    {
        "kanji": "出口",
        "hiragana": "でぐち",
        "katakana": "デグチ",
        "kana": "でぐち",
        "meaning_es": "Salida",
        "meaning_en": "Exit",
        "category": "Ciudad y Tiendas",
        "level": "N5"
    },
    {
        "kanji": "押す",
        "hiragana": "おす",
        "katakana": "オス",
        "kana": "おす",
        "meaning_es": "Empujar / Pulsar botón",
        "meaning_en": "Push / Press",
        "category": "Verbos y Acciones",
        "level": "N5"
    },
    {
        "kanji": "引く",
        "hiragana": "ひく",
        "katakana": "ヒク",
        "kana": "ひく",
        "meaning_es": "Tirar / Jalar / Descontar",
        "meaning_en": "Pull / Subtract",
        "category": "Verbos y Acciones",
        "level": "N5"
    },
    {
        "kanji": "映画",
        "hiragana": "えいが",
        "katakana": "エイガ",
        "kana": "えいが",
        "meaning_es": "Película / Cine",
        "meaning_en": "Movie / Film",
        "category": "Ocio y Aficiones",
        "level": "N5"
    },
    {
        "kanji": "勉強",
        "hiragana": "べんきょう",
        "katakana": "ベンキョウ",
        "kana": "べんきょう",
        "meaning_es": "Estudio / Estudiar",
        "meaning_en": "Study",
        "category": "Trabajo y Estudio",
        "level": "N5"
    },
    {
        "kanji": "強い",
        "hiragana": "つよい",
        "katakana": "ツヨイ",
        "kana": "つよい",
        "meaning_es": "Fuerte",
        "meaning_en": "Strong",
        "category": "Adjetivos",
        "level": "N5"
    },
    {
        "kanji": "温泉",
        "hiragana": "おんせん",
        "katakana": "オンセン",
        "kana": "おんせん",
        "meaning_es": "Aguas termales / Onsen",
        "meaning_en": "Hot spring / Onsen",
        "category": "Viajes y Cultura",
        "level": "N5"
    },
    {
        "kanji": "予定",
        "hiragana": "よてい",
        "katakana": "ヨテイ",
        "kana": "よてい",
        "meaning_es": "Plan / Agenda prevista",
        "meaning_en": "Plan / Schedule",
        "category": "Vida Diaria",
        "level": "N5"
    },
    {
        "kanji": "旅行",
        "hiragana": "りょこう",
        "katakana": "リョコウ",
        "kana": "りょこう",
        "meaning_es": "Viaje / Viajar",
        "meaning_en": "Trip / Travel",
        "category": "Viajes y Cultura",
        "level": "N5"
    },
    {
        "kanji": "朝ご飯",
        "hiragana": "あさごはん",
        "katakana": "アサゴハン",
        "kana": "あさごはん",
        "meaning_es": "Desayuno",
        "meaning_en": "Breakfast",
        "category": "Comida y Bebida",
        "level": "N5"
    },
    {
        "kanji": "昼休み",
        "hiragana": "ひるやすみ",
        "katakana": "ヒルヤスミ",
        "kana": "ひるやすみ",
        "meaning_es": "Descanso de mediodía / Pausa de almuerzo",
        "meaning_en": "Lunch break",
        "category": "Trabajo y Estudio",
        "level": "N5"
    },
    {
        "kanji": "改札口",
        "hiragana": "かいさつぐち",
        "katakana": "カイサツグチ",
        "kana": "かいさつぐち",
        "meaning_es": "Torno de billetes / Barrera de estación",
        "meaning_en": "Ticket gate",
        "category": "Ciudad y Transporte",
        "level": "N5"
    }
]

added_vocab_count = 0
for nv in new_vocab_items:
    k_key = nv.get("kanji") or nv.get("hiragana")
    if k_key not in existing_vocab_set:
        nv["id"] = f"v_irodori_{len(vocab_list) + 1}"
        vocab_list.append(nv)
        existing_vocab_set[k_key] = nv
        added_vocab_count += 1

print(f"Added {added_vocab_count} new vocabulary entries. Total vocabulary now: {len(vocab_list)}")

# Bidirectional sync: make sure EVERY kanji in kanji_list contains all matching vocabulary in words
kanji_dict = {k["kanji"]: k for k in kanji_list}
sync_additions = 0

for v in vocab_list:
    word_str = v.get("kanji")
    if not word_str:
        continue
    reading = v.get("hiragana") or v.get("kana")
    meaning = v.get("meaning_es")
    
    # check each character of word_str
    for char in word_str:
        if char in kanji_dict:
            k_entry = kanji_dict[char]
            k_entry.setdefault("words", [])
            existing_words = {w["word"] for w in k_entry["words"]}
            if word_str not in existing_words:
                k_entry["words"].append({
                    "word": word_str,
                    "reading": reading,
                    "meaning": meaning
                })
                sync_additions += 1

print(f"Bidirectional synchronization completed! Synced {sync_additions} word-kanji links.")

with open(kanji_path, "w", encoding="utf-8") as f:
    json.dump(kanji_list, f, ensure_ascii=False, indent=2)

with open(vocab_path, "w", encoding="utf-8") as f:
    json.dump(vocab_list, f, ensure_ascii=False, indent=2)

print("Saved kanji.json and vocabulary.json successfully!")
