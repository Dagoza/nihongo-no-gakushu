import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

def hira_to_kata(s):
    return ''.join(chr(ord(c) + 0x60) if 0x3041 <= ord(c) <= 0x3096 else c for c in s)

# 1. Update nhk_lessons.json and nhk_lessons.js
lessons = [
    {
        "lesson": 1,
        "title_jp": "はじめまして。私はアンナです。",
        "title_es": "Encantada de conocerte. Soy Anna.",
        "topic": "Presentación personal y cortesía básica",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "はじめまして。私はアンナです。", "es": "Mucho gusto. Soy Anna."},
            {"speaker": "Sakura", "jp": "はじめまして。さくらです。", "es": "Mucho gusto. Soy Sakura."},
            {"speaker": "Anna", "jp": "よろしくおねがいします。", "es": "Encantada de conocerte / Cuento contigo."},
            {"speaker": "Sakura", "jp": "こちらこそ。", "es": "El gusto es mío."}
        ],
        "grammar_notes": [
            "は (wa): Se pronuncia 'wa' cuando funciona como partícula de tema.",
            "です (desu): Cópula equivalente a 'ser' en español en tono formal y respetuoso.",
            "はじめまして (Hajimemashite): Saludo usado la primera vez que conoces a alguien."
        ]
    },
    {
        "lesson": 2,
        "title_jp": "これは何ですか。",
        "title_es": "¿Qué es esto?",
        "topic": "Demostrativos de objetos (これ, それ, あれ)",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "さくらさん。はい、どうぞ。", "es": "Sakura. Aquí tienes."},
            {"speaker": "Sakura", "jp": "これは何ですか。", "es": "¿Qué es esto?"},
            {"speaker": "Anna", "jp": "それはタイのお土産です。", "es": "Ese es un recuerdo de Tailandia."},
            {"speaker": "Sakura", "jp": "ありがとうございます。", "es": "Muchas gracias."},
            {"speaker": "Anna", "jp": "どういたしまして。", "es": "De nada."}
        ],
        "grammar_notes": [
            "これ (kore): 'Esto' (cerca del que habla).",
            "それ (sore): 'Eso' (cerca del oyente).",
            "あれ (are): 'Aquello' (lejos de ambos).",
            "か (ka): Partícula final que convierte cualquier oración afirmativa en pregunta."
        ]
    },
    {
        "lesson": 3,
        "title_jp": "トイレはどこですか。",
        "title_es": "¿Dónde está el baño?",
        "topic": "Preguntar ubicaciones (ここ, そこ, あそこ, どこ)",
        "level": "N5",
        "dialogue": [
            {"speaker": "Sakura", "jp": "ここは教室です。", "es": "Aquí está el aula."},
            {"speaker": "Anna", "jp": "わあ、広い。", "es": "¡Guau, qué espaciosa!"},
            {"speaker": "Sakura", "jp": "あそこは図書館。", "es": "Allí está la biblioteca."},
            {"speaker": "Anna", "jp": "トイレはどこですか。", "es": "¿Dónde está el baño?"},
            {"speaker": "Sakura", "jp": "すぐそこです。", "es": "Está justo ahí al lado."}
        ],
        "grammar_notes": [
            "どこ (doko): Interrogativo para 'dónde'.",
            "ここ / そこ / あそこ: Aquí, Ahí, Allí.",
            "Estructura [Lugar] + はどこですか = ¿Dónde está [Lugar]?"
        ]
    },
    {
        "lesson": 4,
        "title_jp": "ただいま。",
        "title_es": "¡Ya llegué!",
        "topic": "Saludos del hogar y partícula も (también)",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "ただいま。", "es": "¡Ya llegué / Estoy en casa!"},
            {"speaker": "Encargada", "jp": "おかえりなさい。", "es": "Bienvenida de vuelta."},
            {"speaker": "Sakura", "jp": "こんにちは。", "es": "Buenas tardes."},
            {"speaker": "Encargada", "jp": "あなたも留学生ですか。", "es": "¿Tú también eres estudiante extranjera?"},
            {"speaker": "Sakura", "jp": "いいえ、留学生ではありません。日本人の学生です。", "es": "No, no soy estudiante extranjera. Soy una estudiante japonesa."}
        ],
        "grammar_notes": [
            "ただいま / おかえりなさい: Saludos tradicionales japoneses al entrar a casa.",
            "も (mo): 'También'. Reemplaza a la partícula は.",
            "ではありません (dewa arimasen): Forma negativa formal de です."
        ]
    },
    {
        "lesson": 5,
        "title_jp": "それは私の宝物です。",
        "title_es": "Ese es mi tesoro.",
        "topic": "Posesión con la partícula の y objeto directo を",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "私の部屋はこちらです。どうぞ。", "es": "Mi habitación está por aquí. Por favor."},
            {"speaker": "Sakura", "jp": "すごい！これは全部マンガ？", "es": "¡Increíble! ¿Estas son todas manga?"},
            {"speaker": "Anna", "jp": "それは私の宝物です。私は毎日マンガを読みます。", "es": "Esos son mis tesoros. Leo manga todos los días."}
        ],
        "grammar_notes": [
            "A の B: Posesión o relación de A con B (mi tesoro = 私の宝物).",
            "を (o): Partícula que marca el objeto directo del verbo (マンガを読みます = leer manga)."
        ]
    },
    {
        "lesson": 6,
        "title_jp": "電話番号は何番ですか。",
        "title_es": "¿Cuál es tu número de teléfono?",
        "topic": "Preguntas con 何番 (nanban) y números de teléfono",
        "level": "N5",
        "dialogue": [
            {"speaker": "Sakura", "jp": "ところでアンナさん。電話番号は何番ですか。", "es": "A propósito, Anna... ¿Cuál es tu número de teléfono?"},
            {"speaker": "Anna", "jp": "えーと。080-1234-...です。", "es": "Eh... Déjame ver... Es el 080-1234-..."},
            {"speaker": "Sakura", "jp": "ありがとう。じゃ、今度、電話をしますね。", "es": "Gracias. Entonces, te llamaré la próxima vez."}
        ],
        "grammar_notes": [
            "何番 (nanban): Pregunta por números específicos o posiciones.",
            "El guión en números de teléfono se pronuncia como の (no).",
            "電話をします (denwa o shimasu): Hacer una llamada telefónica."
        ]
    },
    {
        "lesson": 7,
        "title_jp": "シュークリームはありますか。",
        "title_es": "¿Hay bollos de crema?",
        "topic": "Preguntar existencia en tiendas (〜はありますか) y pedir cosas (〜をください)",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "ケーキがいっぱいありますね。", "es": "Hay muchos pasteles, ¿verdad?"},
            {"speaker": "Sakura", "jp": "すみません、シュークリームはありますか。", "es": "Perdón, ¿hay bollos de crema?"},
            {"speaker": "Vendedora", "jp": "はい、こちらです。", "es": "Sí, por aquí."},
            {"speaker": "Sakura", "jp": "シュークリームを二つください。", "es": "Dos bollos de crema, por favor."}
        ],
        "grammar_notes": [
            "ありますか (arimasu ka): Pregunta si hay algo inanimado.",
            "ひとつ (hitotsu), ふたつ (futatsu): Contadores nativos japoneses de objetos.",
            "[Cosa] を [Cantidad] ください: Fórmula educada para pedir artículos en una tienda o restaurante."
        ]
    },
    {
        "lesson": 8,
        "title_jp": "もう一度お願いします。",
        "title_es": "¿Podría repetirlo una vez más?",
        "topic": "Peticiones con 〜てください y fórmulas en clase",
        "level": "N5",
        "dialogue": [
            {"speaker": "Profesor", "jp": "皆さん、これを覚えてください。試験によく出ます。", "es": "Memoricen esto todos. Aparece a menudo en los exámenes."},
            {"speaker": "Estudiantes", "jp": "えーっ。", "es": "¡Ehh! (expresión de sorpresa/queja)"},
            {"speaker": "Anna", "jp": "先生、もう一度お願いします。", "es": "Profesor, ¿podría repetirlo una vez más, por favor?"}
        ],
        "grammar_notes": [
            "〜てください (-te kudasai): Petición educada (覚えてください = por favor memoricen).",
            "もう一度 (mô ichido): Una vez más.",
            "お願いします (onegaishimasu): Por favor / Solicito su amabilidad."
        ]
    },
    {
        "lesson": 9,
        "title_jp": "何時からですか。",
        "title_es": "¿Desde qué hora es?",
        "topic": "Horarios con から (desde) y まで (hasta)",
        "level": "N5",
        "dialogue": [
            {"speaker": "Profesor", "jp": "明日、健康診断があります。", "es": "Mañana habrá un reconocimiento médico."},
            {"speaker": "Anna", "jp": "何時からですか。", "es": "¿Desde qué hora es?"},
            {"speaker": "Profesor", "jp": "午前九時から十一時までです。ここに八時半に集まってください。", "es": "Desde las nueve hasta las once de la mañana. Reúnanse aquí a las ocho y media."}
        ],
        "grammar_notes": [
            "何時 (nanji): ¿Qué hora?",
            "〜から 〜まで (-kara -made): Desde ... hasta ... (expresa límites de tiempo o espacio).",
            "半 (han): Y media (ocho y media = 八時半)."
        ]
    },
    {
        "lesson": 10,
        "title_jp": "全員いますか。",
        "title_es": "¿Están todos?",
        "topic": "Existencia de personas (います / いません) y verbos en pasado",
        "level": "N5",
        "dialogue": [
            {"speaker": "Profesor", "jp": "初めに身長と体重を測ります。全員いますか。", "es": "Primero vamos a medirles la estatura y el peso. ¿Están todos?"},
            {"speaker": "Rodrigo", "jp": "アンナさんがいません。", "es": "Anna no está."},
            {"speaker": "Anna", "jp": "すみません。遅れました。", "es": "Perdón, llegué tarde."}
        ],
        "grammar_notes": [
            "います / いません: Verbo existir para seres animados (personas y animales).",
            "全員 (zen-in): Todos los miembros presentes.",
            "遅れました (okuremashita): Forma pasada formal del verbo 遅れる (llegar tarde)."
        ]
    },
    {
        "lesson": 11,
        "title_jp": "ぜひ来てください。",
        "title_es": "Por favor no dejes de venir.",
        "topic": "Invitaciones enfáticas (ぜひ) y días de la semana",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "今週の土曜日に寮でパーティーを開きます。さくらさん、ぜひ来てください。", "es": "Este sábado haremos una fiesta en la residencia. Sakura, no dejes de venir."},
            {"speaker": "Sakura", "jp": "わあ、行く行く。今度の土曜日ね。", "es": "¡Guau, voy seguro! Este sábado, ¿verdad?"}
        ],
        "grammar_notes": [
            "ぜひ (zehi): Sin falta / por todos los medios (se usa para reforzar una invitación).",
            "土曜日 (doyôbi): Sábado.",
            "寮 (ryô): Residencia de estudiantes / dormitorio común."
        ]
    },
    {
        "lesson": 12,
        "title_jp": "いつ日本に来ましたか。",
        "title_es": "¿Cuándo viniste a Japón?",
        "topic": "Preguntar fechas con いつ (itsu) y meses del año",
        "level": "N5",
        "dialogue": [
            {"speaker": "Sakura", "jp": "ロドリゴさんはいつ日本に来ましたか。", "es": "Rodrigo, ¿cuándo viniste a Japón?"},
            {"speaker": "Rodrigo", "jp": "三月に来ました。", "es": "Vine en marzo."},
            {"speaker": "Sakura", "jp": "もう日本の生活に慣れた？", "es": "¿Ya te acostumbraste a la vida en Japón?"},
            {"speaker": "Rodrigo", "jp": "ええ、まあ。", "es": "Sí, hasta cierto punto."}
        ],
        "grammar_notes": [
            "いつ (itsu): Interrogativo para tiempo o fecha (¿Cuándo?).",
            "三月 (sangatsu): Mes de marzo (número + 月).",
            "生活に慣れる (seikatsu ni nareru): Acostumbrarse a la vida cotidiana."
        ]
    },
    {
        "lesson": 13,
        "title_jp": "小説が好きです。",
        "title_es": "Me gustan las novelas.",
        "topic": "Gustos con 〜が好きです e invitaciones con 〜ませんか",
        "level": "N5",
        "dialogue": [
            {"speaker": "Sakura", "jp": "ロドリゴさんの趣味は何ですか。", "es": "Rodrigo, ¿cuál es tu pasatiempo?"},
            {"speaker": "Rodrigo", "jp": "読書です。特に歴史小説が好きです。", "es": "Leer libros. Me gustan especialmente las novelas históricas."},
            {"speaker": "Sakura", "jp": "へえ。新宿に新しい本屋ができましたよ。みんなで行きませんか。", "es": "Ajá. Han inaugurado una nueva librería en Shinjuku. ¿Por qué no vamos todos juntos?"}
        ],
        "grammar_notes": [
            "趣味 (shumi): Pasatiempo o hobby.",
            "[Cosa] が好きです (ga suki desu): Me gusta [Cosa]. Se usa が y no を.",
            "〜ませんか (-masen ka): ¿Por qué no...? Invitación educada a realizar una acción juntos."
        ]
    },
    {
        "lesson": 14,
        "title_jp": "ここにゴミを捨ててもいいですか。",
        "title_es": "¿Puedo tirar la basura aquí?",
        "topic": "Permiso con 〜てもいいですか y causa con 〜から",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "お母さん、ここにゴミを捨ててもいいですか。", "es": "Madre, ¿puedo tirar la basura aquí?"},
            {"speaker": "Encargada", "jp": "そうねえ。缶は別の袋に入れてください。資源ですから。", "es": "A ver... Mete las latas en otra bolsa, porque son recursos reciclables."},
            {"speaker": "Anna", "jp": "はい、分かりました。", "es": "Sí, entendido."}
        ],
        "grammar_notes": [
            "〜てもいいですか (-te mo ii desu ka): ¿Puedo hacer...? Estructura para pedir permiso.",
            "〜から (kara al final de oración): Indica causa o justificación (porque...).",
            "ゴミを捨てる (gomi o suteru): Tirar la basura."
        ]
    },
    {
        "lesson": 15,
        "title_jp": "寝ています。",
        "title_es": "Están durmiendo.",
        "topic": "Acción en progreso con 〜ています (gerundio) y sugerencias con 〜ましょう",
        "level": "N5",
        "dialogue": [
            {"speaker": "Sakura", "jp": "次は新宿駅です。さあ、降りましょう。", "es": "La siguiente parada es la estación de Shinjuku. Bueno, bajemos."},
            {"speaker": "Rodrigo", "jp": "あれ。あの人たち、寝ています。", "es": "Vaya, aquellas personas están durmiendo."},
            {"speaker": "Anna", "jp": "大丈夫かな。", "es": "¿Estarán bien?"},
            {"speaker": "Sakura", "jp": "大丈夫、大丈夫。ほら、起きた。", "es": "Están bien, están bien. Mira, se despertaron."}
        ],
        "grammar_notes": [
            "〜ています (-te imasu): Indica una acción continua en progreso (estar haciendo algo).",
            "〜ましょう (-mashô): Sugerencia formal entusiasta (hagamos / bajemos).",
            "ほら (hora): Interjección equivalente a mira o fíjate."
        ]
    },
    {
        "lesson": 16,
        "title_jp": "階段を上がって、右に行ってください。",
        "title_es": "Suba la escalera y vaya a la derecha.",
        "topic": "Conectar acciones en secuencia con la forma 〜て e indicaciones espaciales",
        "level": "N5",
        "dialogue": [
            {"speaker": "Vendedor", "jp": "いらっしゃいませ。", "es": "Bienvenidos."},
            {"speaker": "Anna", "jp": "あのう、マンガ売り場はどこですか。", "es": "Perdón, ¿dónde está la sección de manga?"},
            {"speaker": "Vendedor", "jp": "二階です。階段を上がって、右に行ってください。", "es": "En el segundo piso. Suba la escalera y vaya a la derecha."}
        ],
        "grammar_notes": [
            "Forma 〜て para conectar verbos: 上がって (suba y...) 行ってください (vaya por favor).",
            "売り場 (uriba): Sección de ventas o mostrador.",
            "右 / 左 (migi / hidari): Derecha / Izquierda."
        ]
    },
    {
        "lesson": 17,
        "title_jp": "おすすめは何ですか。",
        "title_es": "¿Cuál me recomiendas?",
        "topic": "Pedir sugerencias (おすすめ) y conjeturas con 〜そう (parece...)",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "あ、この本いいなあ。あれも面白そう。さくらさんのおすすめは何ですか。", "es": "Ah, este libro es bueno. Aquel también parece interesante. ¿Cuál me recomiendas, Sakura?"},
            {"speaker": "Sakura", "jp": "これはどう？", "es": "¿Qué tal este?"},
            {"speaker": "Anna", "jp": "ホラーはちょっと…", "es": "Los de terror son un poco... (no me convencen)"}
        ],
        "grammar_notes": [
            "〜そう (sô): Sufijo de apariencia (面白そう = parece interesante).",
            "おすすめ (osusume): Recomendación o sugerencia personal.",
            "ちょっと… (chotto): Forma cortés y diplomática de rechazar o mostrar duda sin decir un no rotundo."
        ]
    },
    {
        "lesson": 18,
        "title_jp": "道に迷ってしまいました。",
        "title_es": "Me he perdido.",
        "topic": "Acción involuntaria o lamentable con 〜てしまいました",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "もしもし、さくらさん。助けてください。道に迷ってしまいました。", "es": "Hola Sakura. Ayúdame por favor. Me he perdido en el camino."},
            {"speaker": "Sakura", "jp": "今、どこ？", "es": "¿Dónde estás ahora?"},
            {"speaker": "Anna", "jp": "目の前に郵便局があります。", "es": "Frente a mis ojos hay una oficina de correos."},
            {"speaker": "Sakura", "jp": "分かった。そこにいて。", "es": "Ya entiendo. Quédate ahí."}
        ],
        "grammar_notes": [
            "〜てしまう / 〜てしまいました: Indica la conclusión involuntaria de una acción con matiz de pesar o error.",
            "もしもし (moshi moshi): Saludo telefónico japonés (Hola / Aló).",
            "目の前 (me no mae): Justo delante de los ojos o en frente."
        ]
    },
    {
        "lesson": 19,
        "title_jp": "よかった。心配したよ。",
        "title_es": "Menos mal. Me preocupé.",
        "topic": "Causa explicativa con 〜ので e impulsos involuntarios con つい",
        "level": "N5",
        "dialogue": [
            {"speaker": "Rodrigo", "jp": "おーい、アンナさん。", "es": "¡Oye, Anna!"},
            {"speaker": "Anna", "jp": "みんな。", "es": "¡Amigos! (Todos)."},
            {"speaker": "Rodrigo", "jp": "よかった。心配したよ。", "es": "Menos mal. Nos preocupamos."},
            {"speaker": "Anna", "jp": "ごめんなさい。カメラが安かったので、つい見てしまいました。", "es": "Perdónenme. Como las cámaras estaban baratas, sin querer me quedé mirándolas."}
        ],
        "grammar_notes": [
            "〜ので (-node): Expresa razón o causa de manera cortés y natural (porque...).",
            "つい (tsui): Involuntariamente, sin darse cuenta, por impulso.",
            "よかった (yokatta): Pasado de いい (bien/bueno), usado como alivio (¡Menos mal!)."
        ]
    },
    {
        "lesson": 20,
        "title_jp": "日本の歌を歌ったことがありますか。",
        "title_es": "¿Has cantado canciones japonesas alguna vez?",
        "topic": "Experiencias pasadas con 〜たことがありますか y habilidades con 得意 (tokui)",
        "level": "N5",
        "dialogue": [
            {"speaker": "Rodrigo", "jp": "アンナさんは日本の歌を歌ったことがありますか。", "es": "Anna, ¿has cantado canciones japonesas alguna vez?"},
            {"speaker": "Anna", "jp": "はい、あります。", "es": "Sí, alguna vez."},
            {"speaker": "Sakura", "jp": "どんな曲が得意？", "es": "¿Qué tipo de canciones cantas bien?"},
            {"speaker": "Anna", "jp": "アニメの曲です。", "es": "Canciones de anime (dibujos animados)."}
        ],
        "grammar_notes": [
            "Verbo en pasado informal (た) + ことがある: Expresa la experiencia de haber hecho algo alguna vez en la vida.",
            "得意 (tokui): Ser bueno o habilidoso en algo (se usa para uno mismo o con personas de confianza).",
            "どんな (donna): ¿Qué tipo de...?"
        ]
    },
    {
        "lesson": 21,
        "title_jp": "いいえ、それほどでも。",
        "title_es": "No, no es para tanto.",
        "topic": "Modestia japonesa con それほどでも y llegar a tiempo con 間に合う",
        "level": "N5",
        "dialogue": [
            {"speaker": "Sakura", "jp": "アンナ、上手だね。", "es": "Anna, ¡qué bien lo haces!"},
            {"speaker": "Anna", "jp": "いいえ、それほどでも。", "es": "No, no es para tanto (modestia)."},
            {"speaker": "Rodrigo", "jp": "あ、もうこんな時間です。", "es": "¡Ah, ya se ha hecho tan tarde!"},
            {"speaker": "Anna", "jp": "大変。門限に間に合わない。", "es": "¡Qué terrible! No llegaré a tiempo para el toque de queda de la residencia."}
        ],
        "grammar_notes": [
            "それほどでも (sorehodo demo): Expresión típica de modestia ante un cumplido.",
            "門限 (mongen): Toque de queda u hora de cierre del edificio.",
            "間に合わない (maniawanai): Forma negativa informal de 間に合う (llegar a tiempo)."
        ]
    },
    {
        "lesson": 22,
        "title_jp": "遅くなりました。",
        "title_es": "Llegué tarde.",
        "topic": "Prohibición con 〜てはいけません y pedir disculpas",
        "level": "N5",
        "dialogue": [
            {"speaker": "Anna", "jp": "お母さん、ごめんなさい。遅くなりました。", "es": "Madre, perdón. Llegué tarde."},
            {"speaker": "Encargada", "jp": "アンナさん、十分も遅刻です。約束を破ってはいけません。", "es": "Anna, llegas diez minutos tarde. No debes romper las promesas."},
            {"speaker": "Anna", "jp": "すみません。気をつけます。", "es": "Lo siento mucho. Tendré mucho cuidado."}
        ],
        "grammar_notes": [
            "〜てはいけません (-te wa ikemasen): Expresa prohibición estricta (no debes / no se puede).",
            "遅刻 (chikoku): Llegar tarde / retraso.",
            "気をつける (ki o tsukeru): Tener cuidado / prestar atención."
        ]
    }
]

with open(os.path.join(DATA_DIR, "nhk_lessons.json"), "w", encoding="utf-8") as f:
    json.dump(lessons, f, ensure_ascii=False, indent=2)

with open(os.path.join(DATA_DIR, "nhk_lessons.js"), "w", encoding="utf-8") as f:
    f.write("// Auto-generated dataset for Nihongo Master\nwindow.NHK_LESSONS_DATA = ")
    json.dump(lessons, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"Updated nhk_lessons (total {len(lessons)} lessons).")

# 2. Vocabulary to add (following rule: kanji, hiragana, katakana, meaning_es, meaning_en, level, category)
new_vocab_items = [
    {
        "kanji": "土産",
        "hiragana": "みやげ",
        "katakana": "ミヤゲ",
        "kana": "みやげ",
        "meaning_es": "Recuerdo / Souvenir",
        "meaning_en": "Souvenir / Gift",
        "category": "Viajes y Cultura",
        "level": "N5"
    },
    {
        "kanji": "教室",
        "hiragana": "きょうしつ",
        "katakana": "キョウシツ",
        "kana": "きょうしつ",
        "meaning_es": "Aula / Salón de clases",
        "meaning_en": "Classroom",
        "category": "Educación",
        "level": "N5"
    },
    {
        "kanji": "図書館",
        "hiragana": "としょかん",
        "katakana": "トショカン",
        "kana": "としょかん",
        "meaning_es": "Biblioteca",
        "meaning_en": "Library",
        "category": "Educación",
        "level": "N5"
    },
    {
        "kanji": "留学生",
        "hiragana": "りゅうがくせい",
        "katakana": "リュウガクセイ",
        "kana": "りゅうがくせい",
        "meaning_es": "Estudiante extranjero",
        "meaning_en": "International student",
        "category": "Educación",
        "level": "N5"
    },
    {
        "kanji": "宝物",
        "hiragana": "たからもの",
        "katakana": "タカラモノ",
        "kana": "たからもの",
        "meaning_es": "Tesoro / Objeto preciado",
        "meaning_en": "Treasure",
        "category": "Vida Diaria",
        "level": "N5"
    },
    {
        "kanji": "電話番号",
        "hiragana": "でんわばんごう",
        "katakana": "デンワバンゴウ",
        "kana": "でんわばんごう",
        "meaning_es": "Número de teléfono",
        "meaning_en": "Telephone number",
        "category": "Vida Diaria",
        "level": "N5"
    },
    {
        "kanji": "二つ",
        "hiragana": "ふたつ",
        "katakana": "フタツ",
        "kana": "ふたつ",
        "meaning_es": "Dos cosas (contador general)",
        "meaning_en": "Two things",
        "category": "Números y Cantidades",
        "level": "N5"
    },
    {
        "kanji": "試験",
        "hiragana": "しけん",
        "katakana": "シケン",
        "kana": "しけん",
        "meaning_es": "Examen / Prueba",
        "meaning_en": "Exam / Test",
        "category": "Educación",
        "level": "N5"
    },
    {
        "kanji": "一度",
        "hiragana": "いちど",
        "katakana": "イチド",
        "kana": "いちど",
        "meaning_es": "Una vez",
        "meaning_en": "Once / One time",
        "category": "Tiempo",
        "level": "N5"
    },
    {
        "kanji": "健康",
        "hiragana": "けんこう",
        "katakana": "ケンコウ",
        "kana": "けんこう",
        "meaning_es": "Salud",
        "meaning_en": "Health",
        "category": "Salud",
        "level": "N5"
    },
    {
        "kanji": "午前",
        "hiragana": "ごぜん",
        "katakana": "ゴゼン",
        "kana": "ごぜん",
        "meaning_es": "Mañana / A.M.",
        "meaning_en": "Morning / AM",
        "category": "Tiempo",
        "level": "N5"
    },
    {
        "kanji": "全員",
        "hiragana": "ぜんいん",
        "katakana": "ゼンイン",
        "kana": "ぜんいん",
        "meaning_es": "Todos los miembros / Todos",
        "meaning_en": "Everyone / All members",
        "category": "Personas y Profesiones",
        "level": "N5"
    },
    {
        "kanji": "土曜日",
        "hiragana": "どようび",
        "katakana": "ドヨウビ",
        "kana": "どようび",
        "meaning_es": "Sábado",
        "meaning_en": "Saturday",
        "category": "Tiempo",
        "level": "N5"
    },
    {
        "kanji": "読書",
        "hiragana": "どくしょ",
        "katakana": "ドクショ",
        "kana": "どくしょ",
        "meaning_es": "Lectura de libros",
        "meaning_en": "Reading books",
        "category": "Pasatiempos",
        "level": "N5"
    },
    {
        "kanji": "小説",
        "hiragana": "しょうせつ",
        "katakana": "ショウセツ",
        "kana": "しょうせつ",
        "meaning_es": "Novela",
        "meaning_en": "Novel",
        "category": "Pasatiempos",
        "level": "N5"
    },
    {
        "kanji": "階段",
        "hiragana": "かいだん",
        "katakana": "カイダン",
        "kana": "かいだん",
        "meaning_es": "Escalera",
        "meaning_en": "Stairs",
        "category": "Lugares y Ciudad",
        "level": "N5"
    },
    {
        "kanji": "郵便局",
        "hiragana": "ゆうびんきょく",
        "katakana": "ユウビンキョク",
        "kana": "ゆうびんきょく",
        "meaning_es": "Oficina de correos",
        "meaning_en": "Post office",
        "category": "Lugares y Ciudad",
        "level": "N5"
    },
    {
        "kanji": "心配",
        "hiragana": "しんぱい",
        "katakana": "シンパイ",
        "kana": "しんぱい",
        "meaning_es": "Preocupación",
        "meaning_en": "Worry / Concern",
        "category": "Emociones",
        "level": "N5"
    },
    {
        "kanji": "遅刻",
        "hiragana": "ちこく",
        "katakana": "チコク",
        "kana": "ちこく",
        "meaning_es": "Llegada tarde / Retraso",
        "meaning_en": "Lateness / Tardy",
        "category": "Vida Diaria",
        "level": "N5"
    },
    {
        "kanji": "約束",
        "hiragana": "やくそく",
        "katakana": "ヤクソク",
        "kana": "やくそく",
        "meaning_es": "Promesa / Cita pactada",
        "meaning_en": "Promise / Appointment",
        "category": "Vida Diaria",
        "level": "N5"
    }
]

vocab_path = os.path.join(DATA_DIR, "vocabulary.json")
with open(vocab_path, "r", encoding="utf-8") as f:
    vocab_list = json.load(f)

# Also ensure existing vocab items have hiragana and katakana fields
for v in vocab_list:
    hira = v.get("kana") or v.get("hiragana") or v.get("kanji")
    v["hiragana"] = hira
    if not v.get("katakana"):
        v["katakana"] = hira_to_kata(hira)

existing_words = {v["kanji"] for v in vocab_list}
max_id = 0
for v in vocab_list:
    try:
        num = int(v["id"].split("_")[-1])
        if num > max_id:
            max_id = num
    except:
        pass

for item in new_vocab_items:
    if item["kanji"] not in existing_words:
        max_id += 1
        item["id"] = f"v_{max_id}"
        vocab_list.append(item)
        existing_words.add(item["kanji"])

with open(vocab_path, "w", encoding="utf-8") as f:
    json.dump(vocab_list, f, ensure_ascii=False, indent=2)

print(f"Updated vocabulary.json (total {len(vocab_list)} words).")

# 3. Synchronize with kanji.json and kanji.js
kanji_path = os.path.join(DATA_DIR, "kanji.json")
with open(kanji_path, "r", encoding="utf-8") as f:
    kanji_list = json.load(f)

kanji_dict = {k["kanji"]: k for k in kanji_list}

kanji_meta = {
    '便': {'level': 'N4', 'meaning_es': 'correo / conveniencia', 'meaning_en': 'convenience / mail', 'pronunciation': 'べん, びん, たよ・り'},
    '健': {'level': 'N4', 'meaning_es': 'salud / saludable', 'meaning_en': 'healthy / strength', 'pronunciation': 'けん, すこ・やか'},
    '全': {'level': 'N4', 'meaning_es': 'todo / entero', 'meaning_en': 'all / whole', 'pronunciation': 'ぜん, すべ・て'},
    '刻': {'level': 'N4', 'meaning_es': 'grabar / tiempo / tictac', 'meaning_en': 'engrave / time', 'pronunciation': 'こく, きざ・む'},
    '号': {'level': 'N4', 'meaning_es': 'número / señal', 'meaning_en': 'number / item', 'pronunciation': 'ごう'},
    '員': {'level': 'N4', 'meaning_es': 'miembro / empleado', 'meaning_en': 'member / employee', 'pronunciation': 'いん'},
    '図': {'level': 'N4', 'meaning_es': 'dibujo / diagrama / mapa', 'meaning_en': 'drawing / diagram', 'pronunciation': 'ず, と, はか・る'},
    '宝': {'level': 'N4', 'meaning_es': 'tesoro', 'meaning_en': 'treasure', 'pronunciation': 'ほう, たから'},
    '室': {'level': 'N4', 'meaning_es': 'habitación / sala', 'meaning_en': 'room', 'pronunciation': 'しつ, むろ'},
    '局': {'level': 'N4', 'meaning_es': 'oficina / departamento', 'meaning_en': 'bureau / office', 'pronunciation': 'きょく'},
    '度': {'level': 'N4', 'meaning_es': 'grado / vez', 'meaning_en': 'degree / occurrence', 'pronunciation': 'ど, たび'},
    '康': {'level': 'N4', 'meaning_es': 'paz / salud', 'meaning_en': 'ease / health', 'pronunciation': 'こう'},
    '心': {'level': 'N4', 'meaning_es': 'corazón / mente', 'meaning_en': 'heart / mind', 'pronunciation': 'しん, こころ'},
    '教': {'level': 'N5', 'meaning_es': 'enseñar / fe', 'meaning_en': 'teach / faith', 'pronunciation': 'きょう, おし・える'},
    '曜': {'level': 'N5', 'meaning_es': 'día de la semana', 'meaning_en': 'day of the week', 'pronunciation': 'よう'},
    '束': {'level': 'N4', 'meaning_es': 'atado / haz / fardo', 'meaning_en': 'bundle / tie', 'pronunciation': 'そく, たば'},
    '段': {'level': 'N4', 'meaning_es': 'escalón / nivel', 'meaning_en': 'step / grade', 'pronunciation': 'だん'},
    '物': {'level': 'N5', 'meaning_es': 'cosa / objeto', 'meaning_en': 'thing / object', 'pronunciation': 'ぶつ, もの'},
    '産': {'level': 'N4', 'meaning_es': 'dar a luz / producto', 'meaning_en': 'produce / birth', 'pronunciation': 'さん, う・む'},
    '留': {'level': 'N4', 'meaning_es': 'detener / quedarse', 'meaning_en': 'stay / detain', 'pronunciation': 'りゅう, と・める'},
    '番': {'level': 'N5', 'meaning_es': 'número / turno', 'meaning_en': 'number / turn', 'pronunciation': 'ばん'},
    '約': {'level': 'N4', 'meaning_es': 'promesa / aproximadamente', 'meaning_en': 'promise / approximately', 'pronunciation': 'やく'},
    '試': {'level': 'N4', 'meaning_es': 'probar / intentar', 'meaning_en': 'test / try', 'pronunciation': 'し, こころ・みる'},
    '説': {'level': 'N4', 'meaning_es': 'explicar / teoría', 'meaning_en': 'theory / explanation', 'pronunciation': 'せつ, と・く'},
    '遅': {'level': 'N4', 'meaning_es': 'tarde / retraso / lento', 'meaning_en': 'late / slow', 'pronunciation': 'ち, おそ・い, おく・れる'},
    '郵': {'level': 'N4', 'meaning_es': 'correo / correo postal', 'meaning_en': 'mail', 'pronunciation': 'ゆう'},
    '配': {'level': 'N4', 'meaning_es': 'distribuir / repartir', 'meaning_en': 'distribute / deliver', 'pronunciation': 'はい, くば・る'},
    '階': {'level': 'N4', 'meaning_es': 'piso / planta / escalera', 'meaning_en': 'floor / stairs', 'pronunciation': 'かい'},
    '館': {'level': 'N4', 'meaning_es': 'edificio público / palacio', 'meaning_en': 'building / mansion', 'pronunciation': 'かん, やかた'},
    '験': {'level': 'N4', 'meaning_es': 'probar / efecto / examen', 'meaning_en': 'verification / test', 'pronunciation': 'けん, ため・す'}
}

# For every word in new_vocab_items, attach it to each constituent kanji
for item in new_vocab_items:
    word_text = item["kanji"]
    word_reading = item["hiragana"]
    word_meaning = item["meaning_es"]

    for char in word_text:
        # Check if character is a kanji
        if ord(char) >= 0x4e00 and ord(char) <= 0x9faf:
            if char not in kanji_dict:
                meta = kanji_meta.get(char, {
                    "level": "N5",
                    "meaning_es": "carácter kanji",
                    "meaning_en": "kanji character",
                    "pronunciation": word_reading
                })
                new_entry = {
                    "kanji": char,
                    "level": meta["level"],
                    "meaning_en": meta["meaning_en"],
                    "meaning_es": meta["meaning_es"],
                    "pronunciation": meta["pronunciation"],
                    "words": [],
                    "source": "NHK Spanish Lessons / Material de Estudio"
                }
                kanji_list.append(new_entry)
                kanji_dict[char] = new_entry

            # Add word if not already present
            existing_words_in_kanji = {w.get("word") for w in kanji_dict[char].get("words", [])}
            if word_text not in existing_words_in_kanji:
                if "words" not in kanji_dict[char]:
                    kanji_dict[char]["words"] = []
                kanji_dict[char]["words"].append({
                    "word": word_text,
                    "reading": word_reading,
                    "meaning": word_meaning
                })

with open(kanji_path, "w", encoding="utf-8") as f:
    json.dump(kanji_list, f, ensure_ascii=False, indent=2)

with open(os.path.join(DATA_DIR, "kanji.js"), "w", encoding="utf-8") as f:
    f.write("// Auto-generated dataset for Nihongo Master\nwindow.KANJI_DATA = ")
    json.dump(kanji_list, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"Updated kanji.json and kanji.js (total {len(kanji_list)} kanjis).")

# 4. Interactive Conversation Exercises
conversation_exercises = [
    {
        "id": "conv_ex_1",
        "lesson": 1,
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Anna te saluda diciendo: 「はじめまして。アンナです。よろしくおねがいします。」 ¿Cuál es la respuesta cortés más adecuada?",
        "context": "Anna: はじめまして。よろしくおねがいします。\nTú: 【 ？ 】",
        "correct": "こちらこそ。よろしくお願いします。",
        "options": [
            "こちらこそ。よろしくお願いします。",
            "どういたしまして。",
            "いいえ、ちがいます。",
            "さようなら。"
        ],
        "explanation": "「こちらこそ」 significa 'El gusto es mío / Igualmente', la fórmula estándar y educada ante una presentación personal."
    },
    {
        "id": "conv_ex_2",
        "lesson": 2,
        "type": "missing_word",
        "type_label": "¿Qué palabra falta?",
        "prompt_es": "Sakura señala el recuerdo que Anna sostiene en la mano y pregunta qué es. ¿Qué demostrativo debe utilizar?",
        "context": "Sakura: 【 ？ 】 は何ですか。\nAnna: それはタイのお土産です。",
        "correct": "これ",
        "options": ["これ", "それ", "あれ", "どれ"],
        "explanation": "Sakura pregunta por un objeto cercano al hablante ('esto'), por lo que usa これ. Anna responde con それ ('eso')."
    },
    {
        "id": "conv_ex_3",
        "lesson": 3,
        "type": "missing_kanji",
        "type_label": "¿Qué kanji falta?",
        "prompt_es": "Sakura indica el aula de clases. ¿Cuál es el kanji correcto para 'aula' (きょうしつ)?",
        "context": "ここは【 ？ 】です。(きょうしつ)",
        "correct": "教室",
        "options": ["教室", "教員", "室外", "学校"],
        "explanation": "きょうしつ se escribe 教室 (教 enseñar + 室 sala/habitación)."
    },
    {
        "id": "conv_ex_4",
        "lesson": 4,
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Al llegar a casa o a la residencia dices: 「ただいま！」 (¡Ya llegué!). ¿Cómo responde la encargada?",
        "context": "Anna: ただいま！\nEncargada: 【 ？ 】",
        "correct": "おかえりなさい。",
        "options": [
            "おかえりなさい。",
            "いってきます。",
            "いってらっしゃい。",
            "おやすみなさい。"
        ],
        "explanation": "Ante 「ただいま」(estoy en casa), el saludo de bienvenida de vuelta es siempre 「おかえりなさい」."
    },
    {
        "id": "conv_ex_5",
        "lesson": 5,
        "type": "missing_word",
        "type_label": "¿Qué partícula falta?",
        "prompt_es": "Anna expresa que lee mangas todos los días. ¿Qué partícula marca el objeto directo 'manga'?",
        "context": "私は毎日マンガ【 ？ 】読みます。",
        "correct": "を",
        "options": ["を", "は", "が", "に"],
        "explanation": "La partícula を (o) marca el complemento u objeto directo del verbo de acción transitiva (leer manga = マンガを読む)."
    },
    {
        "id": "conv_ex_6",
        "lesson": 7,
        "type": "missing_word",
        "type_label": "¿Qué palabra falta?",
        "prompt_es": "En la panadería quieres pedir dos bollos de crema. ¿Qué contador nativo corresponde a 'dos unidades' (ふたつ)?",
        "context": "シュークリームを【 ？ 】ください。",
        "correct": "二つ (ふたつ)",
        "options": ["二つ (ふたつ)", "一つ (ひとつ)", "三つ (みっつ)", "二人 (ふたり)"],
        "explanation": "Para pedir dos cosas en comercios se utiliza el contador nativo ふたつ (二つ). 二人 (ふたり) es para dos personas."
    },
    {
        "id": "conv_ex_7",
        "lesson": 8,
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "El profesor explicó un punto importante pero no lo escuchaste bien. ¿Cómo pides cortésmente que lo repita?",
        "context": "Profesor: ... (explicó rápido)\nEstudiante: 【 ？ 】",
        "correct": "先生、もう一度お願いします。",
        "options": [
            "先生、もう一度お願いします。",
            "先生、もういいです。",
            "先生、早くしてください。",
            "先生、何もしません。"
        ],
        "explanation": "「もう一度お願いします」(mô ichido onegaishimasu) es la fórmula educada universal en japonés para pedir una repetición."
    },
    {
        "id": "conv_ex_8",
        "lesson": 9,
        "type": "missing_word",
        "type_label": "¿Qué palabra/partícula falta?",
        "prompt_es": "Quieres preguntar el horario de inicio del reconocimiento médico: '¿Desde qué hora es?'.",
        "context": "健康診断は何時【 ？ 】ですか。",
        "correct": "から",
        "options": ["から", "まで", "より", "ほど"],
        "explanation": "〜から indica el punto de origen o partida temporal ('desde')."
    },
    {
        "id": "conv_ex_9",
        "lesson": 10,
        "type": "missing_word",
        "type_label": "¿Qué palabra falta?",
        "prompt_es": "El profesor pasa lista preguntando si están todos los alumnos presentes. ¿Qué palabra significa 'todos los integrantes'?",
        "context": "初めに身長を測ります。【 ？ 】いますか。",
        "correct": "全員 (ぜんいん)",
        "options": ["全員 (ぜんいん)", "全国 (ぜんこく)", "全角 (ぜんかく)", "全然 (ぜんぜん)"],
        "explanation": "全員 (ぜんいん) significa todos los miembros del grupo o personas presentes."
    },
    {
        "id": "conv_ex_10",
        "lesson": 11,
        "type": "missing_word",
        "type_label": "¿Qué palabra falta?",
        "prompt_es": "Anna invita a Sakura a la fiesta y quiere enfatizar 'por favor no dejes de venir / sin falta'. ¿Qué adverbio usa?",
        "context": "さくらさん、【 ？ 】来てください。",
        "correct": "ぜひ",
        "options": ["ぜひ", "たぶん", "ぜんぜん", "あまり"],
        "explanation": "ぜひ (zehi) se coloca antes de una petición o invitación para darle un sentido sincero y entusiasta de 'sin falta'."
    },
    {
        "id": "conv_ex_11",
        "lesson": 13,
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Sakura te pregunta: 「趣味は何ですか。」 (¿Cuál es tu pasatiempo?). ¿Cómo respondes que te gusta leer novelas?",
        "context": "Sakura: 趣味は何ですか。\nRodrigo: 【 ？ 】",
        "correct": "読書です。歴史小説が好きです。",
        "options": [
            "読書です。歴史小説が好きです。",
            "読書です。小説を食べます。",
            "読書ではありません。小説に行きます。",
            "小説は高くありません。"
        ],
        "explanation": "読書 (dokusho - leer) y [Cosa] が好きです (me gusta...) es la construcción idiomática natural para hablar de aficiones."
    },
    {
        "id": "conv_ex_12",
        "lesson": 14,
        "type": "missing_word",
        "type_label": "¿Qué estructura verbal falta?",
        "prompt_es": "Pides permiso para tirar la basura en un recipiente: '¿Puedo tirar la basura aquí?'.",
        "context": "ここにゴミを【 ？ 】いいですか。",
        "correct": "捨てても",
        "options": ["捨てても", "捨てないで", "捨てたら", "捨てれば"],
        "explanation": "Pedir permiso se formula con el verbo en forma 〜て + もいいですか: 捨ててもいいですか."
    },
    {
        "id": "conv_ex_13",
        "lesson": 16,
        "type": "missing_kanji",
        "type_label": "¿Qué kanji falta?",
        "prompt_es": "En la tienda te indican: 'Suba la escalera y vaya a la derecha'. ¿Qué kanji corresponde a 'escalera' (かいだん)?",
        "context": "二階です。【 ？ 】を上がって、右に行ってください。(かいだん)",
        "correct": "階段",
        "options": ["階段", "教室", "図書館", "郵便局"],
        "explanation": "かいだん se escribe 階段 (階 piso + 段 escalón)."
    },
    {
        "id": "conv_ex_14",
        "lesson": 18,
        "type": "missing_kanji",
        "type_label": "¿Qué kanji falta?",
        "prompt_es": "Llamas a tu amiga diciendo que te perdiste y ves enfrente una 'oficina de correos' (ゆうびんきょく). ¿Cuál es?",
        "context": "目の前に【 ？ 】があります。(ゆうびんきょく)",
        "correct": "郵便局",
        "options": ["郵便局", "博物館", "美術館", "大使館"],
        "explanation": "ゆうびんきょく se escribe 郵便局 (oficina postal / correos)."
    },
    {
        "id": "conv_ex_15",
        "lesson": 20,
        "type": "missing_word",
        "type_label": "¿Qué forma verbal falta?",
        "prompt_es": "Preguntas a alguien si alguna vez ha cantado canciones japonesas. ¿Cómo se expresa 'has cantado alguna vez'?",
        "context": "日本の歌を【 ？ 】ことがありますか。",
        "correct": "歌った",
        "options": ["歌った", "歌う", "歌って", "歌わない"],
        "explanation": "La experiencia pasada se forma con verbo en pasado llano (forma た) + ことがある: 歌ったことがある."
    },
    {
        "id": "conv_ex_16",
        "lesson": 21,
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Sakura te dice con admiración: 「アンナ、上手だね！」 (¡Anna, qué bien lo haces!). ¿Cuál es la respuesta japonesa más humilde y natural?",
        "context": "Sakura: 上手だね！\nAnna: 【 ？ 】",
        "correct": "いいえ、それほどでも。",
        "options": [
            "いいえ、それほどでも。",
            "はい、天才ですから。",
            "全然できませんよ、バカ。",
            "お疲れ様でした。"
        ],
        "explanation": "「いいえ、それほどでも」(No, no es para tanto) demuestra humildad ante un elogio, pilar fundamental de la cortesía en Japón."
    },
    {
        "id": "conv_ex_17",
        "lesson": 22,
        "type": "missing_word",
        "type_label": "¿Qué estructura de prohibición falta?",
        "prompt_es": "La encargada advierte con firmeza: 'No debes romper las promesas'. ¿Qué forma prohibitiva completa la frase?",
        "context": "約束を【 ？ 】いけません。",
        "correct": "破っては",
        "options": ["破っては", "破っても", "破るなら", "破ると"],
        "explanation": "La prohibición formal estricta se construye con la forma en 〜て + はいけません: 破ってはいけません."
    }
]

conv_ex_path = os.path.join(DATA_DIR, "conversation_exercises.json")
with open(conv_ex_path, "w", encoding="utf-8") as f:
    json.dump(conversation_exercises, f, ensure_ascii=False, indent=2)

print(f"Created conversation_exercises.json ({len(conversation_exercises)} exercises).")
