const fs = require('fs');
const path = require('path');

const KANJI_JSON_PATH = path.join(__dirname, '..', 'data', 'kanji.json');
const KANJI_JS_PATH = path.join(__dirname, '..', 'data', 'kanji.js');
const VOCABULARY_JSON_PATH = path.join(__dirname, '..', 'data', 'vocabulary.json');

// Canonical master metadata for all kanji in the system
const KANJI_METADATA = {
  "一": {
    strokes: 1,
    level: "N5",
    onyomi: "ICHI, ITSU [いち, いつ]",
    kunyomi: "hito, hito(tsu) [ひと, ひと(つ)]",
    meaning_es: "uno",
    meaning_en: "one",
    pronunciation: "いち, ひと",
    mnemonic: "Un solo trazo horizontal representa el número uno o una sola línea en el horizonte."
  },
  "二": {
    strokes: 2,
    level: "N5",
    onyomi: "NI, JI [に, じ]",
    kunyomi: "futa, futa(tsu) [ふた, ふた(つ)]",
    meaning_es: "dos",
    meaning_en: "two",
    pronunciation: "に, ふた",
    mnemonic: "Dos trazos horizontales paralelos representan el número dos."
  },
  "三": {
    strokes: 3,
    level: "N5",
    onyomi: "SAN [さん]",
    kunyomi: "mi, mi(tsu), mit(tsu) [み, み(つ), みっ(つ)]",
    meaning_es: "tres",
    meaning_en: "three",
    pronunciation: "さん, み",
    mnemonic: "Tres líneas horizontales apiladas forman el número tres."
  },
  "四": {
    strokes: 5,
    level: "N5",
    onyomi: "SHI [し]",
    kunyomi: "yo, yo(tsu), yot(tsu), yon [よ, よ(つ), よっ(つ), よん]",
    meaning_es: "cuatro",
    meaning_en: "four",
    pronunciation: "よん, よ, し",
    mnemonic: "Una ventana o caja con cortinas abiertas mostrando sus cuatro esquinas."
  },
  "五": {
    strokes: 4,
    level: "N5",
    onyomi: "GO [ご]",
    kunyomi: "itsu, itsu(tsu) [いつ, いつ(つ)]",
    meaning_es: "cinco",
    meaning_en: "five",
    pronunciation: "ご, いつ",
    mnemonic: "Cinco trazos entrelazados formando una figura de cinco puntos de apoyo."
  },
  "六": {
    strokes: 4,
    level: "N5",
    onyomi: "ROKU [ろく]",
    kunyomi: "mu, mu(tsu), mut(tsu), mui [む, む(つ), むっ(つ), むい]",
    meaning_es: "seis",
    meaning_en: "six",
    pronunciation: "ろく, む",
    mnemonic: "Una persona con sombrero y piernas abiertas contando seis pasos."
  },
  "七": {
    strokes: 2,
    level: "N5",
    onyomi: "SHICHI [しち]",
    kunyomi: "nana, nana(tsu), nano [なな, なな(つ), なの]",
    meaning_es: "siete",
    meaning_en: "seven",
    pronunciation: "なな, しち",
    mnemonic: "Un número 7 invertido que parece una espada cortando hacia arriba."
  },
  "八": {
    strokes: 2,
    level: "N5",
    onyomi: "HACHI [はち]",
    kunyomi: "ya, ya(tsu), yat(tsu), yō [や, や(つ), やっ(つ), よう]",
    meaning_es: "ocho",
    meaning_en: "eight",
    pronunciation: "はち, や",
    mnemonic: "Dos trazos que se abren hacia abajo como las laderas simétricas del Monte Fuji."
  },
  "九": {
    strokes: 2,
    level: "N5",
    onyomi: "KYUU, KU [きゅう, く]",
    kunyomi: "kokono, kokono(tsu) [ここの, ここの(つ)]",
    meaning_es: "nueve",
    meaning_en: "nine",
    pronunciation: "きゅう, く, ここの",
    mnemonic: "Un brazo doblando el codo y flexionando el músculo con fuerza para llegar al nueve."
  },
  "十": {
    strokes: 2,
    level: "N5",
    onyomi: "JUU, JITSU [じゅう, じつ]",
    kunyomi: "tō, to [とお, と]",
    meaning_es: "diez",
    meaning_en: "ten",
    pronunciation: "じゅう, とお",
    mnemonic: "Una cruz perfecta que une lo vertical y horizontal completando la decena."
  },
  "人": {
    strokes: 2,
    level: "N5",
    onyomi: "JIN, NIN [じん, にん]",
    kunyomi: "hito, -to [ひと, と]",
    meaning_es: "persona",
    meaning_en: "person",
    pronunciation: "ひと, じん, にん",
    mnemonic: "Dos piernas de un ser humano caminando erguido y apoyándose mutuamente."
  },
  "何": {
    strokes: 7,
    level: "N5",
    onyomi: "KA [か]",
    kunyomi: "nani, nan [なに, なん]",
    meaning_es: "qué, cuál",
    meaning_en: "what, which",
    pronunciation: "なに, なん",
    mnemonic: "¿Qué lleva una persona (亻) cargando en el hombro (可)?"
  },
  "今": {
    strokes: 4,
    level: "N5",
    onyomi: "KON, KIN [こん, きん]",
    kunyomi: "ima [いま]",
    meaning_es: "ahora, presente",
    meaning_en: "now, present",
    pronunciation: "いま, こん",
    mnemonic: "Un reloj o techo que atrapa el momento presente: ahora."
  },
  "入": {
    strokes: 2,
    level: "N5",
    onyomi: "NYUU [にゅう]",
    kunyomi: "hai(ru), i(ru), i(reru) [はい(る), い(る), い(れる)]",
    meaning_es: "entrar, meter",
    meaning_en: "to enter, insert",
    pronunciation: "はい, い, にゅう",
    mnemonic: "Una persona inclinándose para entrar por una puerta baja."
  },
  "出": {
    strokes: 5,
    level: "N5",
    onyomi: "SHUTSU, SUI [しゅつ, すい]",
    kunyomi: "de(ru), da(su) [で(る), だ(す)]",
    meaning_es: "salir, sacar",
    meaning_en: "to exit, leave",
    pronunciation: "で, だ, しゅつ",
    mnemonic: "Dos montañas (山) apiladas, una brotando y saliendo de la otra."
  },
  "上": {
    strokes: 3,
    level: "N5",
    onyomi: "JOU, SHOU [じょう, しょう]",
    kunyomi: "ue, uwa-, a(garu), nobo(ru) [うえ, うわ, あ(がる), のぼ(る)]",
    meaning_es: "arriba, encima",
    meaning_en: "above, up",
    pronunciation: "うえ, じょう, あ",
    mnemonic: "Una línea horizontal de base con un trazo vertical apuntando hacia arriba."
  },
  "下": {
    strokes: 3,
    level: "N5",
    onyomi: "KA, GE [か, げ]",
    kunyomi: "shita, shimo, sa(garu), kuda(ru) [した, しも, さ(がる), くだ(る)]",
    meaning_es: "abajo, debajo",
    meaning_en: "below, down",
    pronunciation: "した, か, げ, さ",
    mnemonic: "Una línea horizontal de referencia con una marca que cuelga hacia abajo."
  },
  "中": {
    strokes: 4,
    level: "N5",
    onyomi: "CHUU [ちゅう]",
    kunyomi: "naka [なか]",
    meaning_es: "dentro, en medio, centro",
    meaning_en: "inside, middle, center",
    pronunciation: "なか, ちゅう",
    mnemonic: "Una línea vertical que atraviesa justo por el centro un círculo o rectángulo."
  },
  "右": {
    strokes: 5,
    level: "N5",
    onyomi: "U, YUU [う, ゆう]",
    kunyomi: "migi [みぎ]",
    meaning_es: "derecha",
    meaning_en: "right",
    pronunciation: "みぎ, う, ゆう",
    mnemonic: "La mano (𠂇) que llevas a la boca (口) para comer: la mano derecha."
  },
  "左": {
    strokes: 5,
    level: "N5",
    onyomi: "SA [さ]",
    kunyomi: "hidari [ひだり]",
    meaning_es: "izquierda",
    meaning_en: "left",
    pronunciation: "ひだり, さ",
    mnemonic: "La mano (𠂇) que sostiene una regla de trabajo (工): la mano izquierda."
  },
  "道": {
    strokes: 12,
    level: "N5",
    onyomi: "DOU, TOU [どう, とう]",
    kunyomi: "michi [みち]",
    meaning_es: "camino, vía, sendero",
    meaning_en: "street, road, path",
    pronunciation: "みち, どう",
    mnemonic: "Guiar la cabeza y la mente (首) a lo largo del sendero del movimiento (辶): el camino."
  },
  "北": {
    strokes: 5,
    level: "N5",
    onyomi: "HOKU [ほく]",
    kunyomi: "kita [きた]",
    meaning_es: "norte",
    meaning_en: "north",
    pronunciation: "きた, ほく",
    mnemonic: "Dos personas dándose la espalda para protegerse del viento frío del norte."
  },
  "南": {
    strokes: 9,
    level: "N5",
    onyomi: "NAN, NA [なん, な]",
    kunyomi: "minami [みなみ]",
    meaning_es: "sur",
    meaning_en: "south",
    pronunciation: "みなみ, なん",
    mnemonic: "Una cabaña protegida con vegetación donde brilla el cálido sol del sur."
  },
  "東": {
    strokes: 8,
    level: "N5",
    onyomi: "TOU [とう]",
    kunyomi: "higashi [ひがし]",
    meaning_es: "este, oriente",
    meaning_en: "east",
    pronunciation: "ひがし, とう",
    mnemonic: "El sol (日) asomando por detrás de un árbol (木) en el este al amanecer."
  },
  "西": {
    strokes: 6,
    level: "N5",
    onyomi: "SEI, SAI [せい, さい]",
    kunyomi: "nishi [にし]",
    meaning_es: "oeste, occidente",
    meaning_en: "west",
    pronunciation: "にし, せい, さい",
    mnemonic: "Un pájaro posándose en su nido al caer el sol por el oeste."
  },
  "大": {
    strokes: 3,
    level: "N5",
    onyomi: "DAI, TAI [だい, たい]",
    kunyomi: "oo, oo(kii) [おお, おお(きい)]",
    meaning_es: "grande",
    meaning_en: "big, large",
    pronunciation: "おお, だい, たい",
    mnemonic: "Una persona extendiendo sus brazos y piernas para mostrar cuán grande es algo."
  },
  "小": {
    strokes: 3,
    level: "N5",
    onyomi: "SHOU [しょう]",
    kunyomi: "chii(sai), ko-, o- [ちい(さい), こ, お]",
    meaning_es: "pequeño",
    meaning_en: "small, little",
    pronunciation: "ちい, しょう",
    mnemonic: "Dividir algo por el medio en tres pequeñas gotas o partículas."
  },
  "少": {
    strokes: 4,
    level: "N5",
    onyomi: "SHOU [しょう]",
    kunyomi: "suko(shi), suku(nai) [すこ(し), すく(ない)]",
    meaning_es: "poco, escaso",
    meaning_en: "few, little",
    pronunciation: "すこ, すく, しょう",
    mnemonic: "El kanji de pequeño (小) cortado por un trazo diagonal: queda poco."
  },
  "古": {
    strokes: 5,
    level: "N5",
    onyomi: "KO [こ]",
    kunyomi: "furu(i) [ふる(い)]",
    meaning_es: "viejo, antiguo",
    meaning_en: "old",
    pronunciation: "ふる, こ",
    mnemonic: "Una historia que ha pasado por diez (十) bocas (口) es muy vieja y antigua."
  },
  "新": {
    strokes: 13,
    level: "N5",
    onyomi: "SHIN [しん]",
    kunyomi: "atara(shii), ara(ta) [あたら(しい), あら(た)]",
    meaning_es: "nuevo",
    meaning_en: "new",
    pronunciation: "あたら, しん",
    mnemonic: "Cortar un árbol (木) en pie (立) con un hacha (斤) para construir algo nuevo."
  },
  "週": {
    strokes: 11,
    level: "N5",
    onyomi: "SHUU [しゅう]",
    kunyomi: "shuuri [しゅうり]",
    meaning_es: "semana",
    meaning_en: "week",
    pronunciation: "しゅう",
    mnemonic: "Un ciclo completo (周) de siete días que avanza por el camino del tiempo (辶): una semana."
  },
  "月": {
    strokes: 4,
    level: "N5",
    onyomi: "GETSU, GATSU [げつ, がつ]",
    kunyomi: "tsuki [つき]",
    meaning_es: "luna, mes, lunes",
    meaning_en: "moon, month",
    pronunciation: "つき, げつ, がつ",
    mnemonic: "La silueta de una luna creciente cruzada por dos suaves nubes nocturnas."
  },
  "年": {
    strokes: 6,
    level: "N5",
    onyomi: "NEN [ねん]",
    kunyomi: "toshi [とし]",
    meaning_es: "año",
    meaning_en: "year",
    pronunciation: "とし, ねん",
    mnemonic: "Cosechar las gavillas de grano que tardan las cuatro estaciones de un año en madurar."
  },
  "来": {
    strokes: 7,
    level: "N5",
    onyomi: "RAI, TAI [らい, たい]",
    kunyomi: "ku(ru), kita(ru) [く(る), きた(る)]",
    meaning_es: "venir, llegar",
    meaning_en: "to come, next",
    pronunciation: "く, らい",
    mnemonic: "Una espiga de trigo que crece hacia arriba anunciando la cosecha que viene."
  },
  "食": {
    strokes: 9,
    level: "N5",
    onyomi: "SHOKU, JIKI [しょく, じき]",
    kunyomi: "ta(beru), ku(u) [た(べる), く(う)]",
    meaning_es: "comer, comida",
    meaning_en: "to eat, food",
    pronunciation: "た, しょく",
    mnemonic: "Personas reunidas bajo un techo (𠆢) compartiendo un plato de comida apetitosa (良)."
  },
  "日": {
    strokes: 4,
    level: "N5",
    onyomi: "NICHI, JITSU [にち, じつ]",
    kunyomi: "hi, -bi, -ka [ひ, -び, -か]",
    meaning_es: "sol, día, domingo",
    meaning_en: "sun, day",
    pronunciation: "に, にち, ひ, び",
    mnemonic: "El disco solar en el cielo con un rayo de luz en su interior."
  },
  "本": {
    strokes: 5,
    level: "N5",
    onyomi: "HON [ほん]",
    kunyomi: "moto [もと]",
    meaning_es: "libro, origen, base",
    meaning_en: "book, origin",
    pronunciation: "ほん, ぽん, ぼん, もと",
    mnemonic: "Un árbol (木) con una marca en sus raíces: la base u origen del que se saca pulpa para libros."
  },
  "木": {
    strokes: 4,
    level: "N5",
    onyomi: "BOKU, MOKU [ぼく, もく]",
    kunyomi: "ki, ko- [き, こ]",
    meaning_es: "árbol, madera, jueves",
    meaning_en: "tree, wood",
    pronunciation: "き, もく, ぼく",
    mnemonic: "Un árbol con su tronco vertical, ramas frondosas y raíces firmes en la tierra."
  },
  "車": {
    strokes: 7,
    level: "N5",
    onyomi: "SHA [しゃ]",
    kunyomi: "kuruma [くるま]",
    meaning_es: "coche, auto, vehículo",
    meaning_en: "car, vehicle",
    pronunciation: "くるま, しゃ",
    mnemonic: "Vista aérea de un carro tradicional con dos ruedas, eje central y cabina."
  },
  "魚": {
    strokes: 11,
    level: "N5",
    onyomi: "GYO [ぎょ]",
    kunyomi: "sakana, uo [さかな, うお]",
    meaning_es: "pez, pescado",
    meaning_en: "fish",
    pronunciation: "さかな, ぎょ",
    mnemonic: "La cabeza de un pez (𠂊), su cuerpo con escamas (田) y sus aletas inferiores (灬)."
  },
  "山": {
    strokes: 3,
    level: "N5",
    onyomi: "SAN, ZAN [さん, ざん]",
    kunyomi: "yama [やま]",
    meaning_es: "montaña",
    meaning_en: "mountain",
    pronunciation: "やま, さん",
    mnemonic: "Tres picos montañosos escarpados que se elevan juntos en el horizonte."
  },
  "川": {
    strokes: 3,
    level: "N5",
    onyomi: "SEN [せん]",
    kunyomi: "kawa [かわ]",
    meaning_es: "río",
    meaning_en: "river",
    pronunciation: "かわ, がわ, せん",
    mnemonic: "Tres corrientes de agua que fluyen paralelas por el cauce de un río."
  },
  "雨": {
    strokes: 8,
    level: "N5",
    onyomi: "U [う]",
    kunyomi: "ame, ama- [あめ, あま]",
    meaning_es: "lluvia",
    meaning_en: "rain",
    pronunciation: "あめ, う",
    mnemonic: "Nubes cargadas en el cielo bajo las cuales caen cuatro gotas de lluvia."
  },
  "土": {
    strokes: 3,
    level: "N5",
    onyomi: "DO, TO [ど, と]",
    kunyomi: "tsuchi [つち]",
    meaning_es: "tierra, suelo, sábado",
    meaning_en: "earth, soil, Saturday",
    pronunciation: "つち, ど, と",
    mnemonic: "Un brote de una planta emergiendo de la tierra fértil."
  },
  "天": {
    strokes: 4,
    level: "N5",
    onyomi: "TEN [てん]",
    kunyomi: "ame, ama- [あめ, あま]",
    meaning_es: "cielo, celestial",
    meaning_en: "heaven, sky",
    pronunciation: "てん, あめ",
    mnemonic: "Una línea que se extiende por encima de una persona (大): la inmensidad del cielo."
  },
  "見": {
    strokes: 7,
    level: "N5",
    onyomi: "KEN [けん]",
    kunyomi: "mi(ru), mi(eru), mi(seru) [み(る), み(える), み(せる)]",
    meaning_es: "ver, mirar, mostrar",
    meaning_en: "to see, look, show",
    pronunciation: "み, けん",
    mnemonic: "Un gran ojo (目) sostenido sobre dos piernas humanas (儿) que camina observando todo."
  },
  "言": {
    strokes: 7,
    level: "N5",
    onyomi: "GEN, GON [げん, ごん]",
    kunyomi: "i(u), koto [い(う), こと]",
    meaning_es: "decir, palabra",
    meaning_en: "to say, word",
    pronunciation: "い, げん, ごん",
    mnemonic: "Líneas de sonido y palabras brotando de una boca abierta (口)."
  },
  "話": {
    strokes: 13,
    level: "N5",
    onyomi: "WA [わ]",
    kunyomi: "hana(su), hanashi [はな(す), はなし]",
    meaning_es: "hablar, conversación, historia",
    meaning_en: "to talk, story",
    pronunciation: "はな, わ",
    mnemonic: "Palabras (言) pronunciadas con la lengua (舌) para crear una conversación animada."
  },
  "語": {
    strokes: 14,
    level: "N5",
    onyomi: "GO [ご]",
    kunyomi: "kata(ru) [かた(る)]",
    meaning_es: "idioma, lengua, relatar",
    meaning_en: "language, word",
    pronunciation: "ご, かた",
    mnemonic: "Palabras (言) que yo (吾) utilizo para expresar mi pensamiento en un idioma."
  },
  "読": {
    strokes: 14,
    level: "N5",
    onyomi: "DOKU, TOKU [どく, とく]",
    kunyomi: "yo(mu) [よ(む)]",
    meaning_es: "leer",
    meaning_en: "to read",
    pronunciation: "よ, どく",
    mnemonic: "Palabras (言) impresas que se transmiten o venden (売) al lector en un libro."
  },
  "書": {
    strokes: 10,
    level: "N5",
    onyomi: "SHO [しょ]",
    kunyomi: "ka(ku) [か(く)]",
    meaning_es: "escribir, documento, libro",
    meaning_en: "to write, book",
    pronunciation: "か, しょ",
    mnemonic: "Una mano sosteniendo un pincel (聿) sobre el papel a la luz del sol (日) para escribir."
  },
  "聞": {
    strokes: 14,
    level: "N5",
    onyomi: "BUN, MON [ぶん, もん]",
    kunyomi: "ki(ku), ki(koeru) [き(く), き(こえる)]",
    meaning_es: "escuchar, oír, preguntar",
    meaning_en: "to hear, listen",
    pronunciation: "き, ぶん, もん",
    mnemonic: "Acercar la oreja (耳) a la rendija de la puerta (門) para escuchar lo que dicen."
  },
  "飲": {
    strokes: 12,
    level: "N5",
    onyomi: "IN [いん]",
    kunyomi: "no(mu) [の(む)]",
    meaning_es: "beber, tomar",
    meaning_en: "to drink",
    pronunciation: "の, いん",
    mnemonic: "Estar frente a un vaso o comida (飠) y abrir la boca con sed (欠) para beber."
  },
  "立": {
    strokes: 5,
    level: "N5",
    onyomi: "RITSU, RYUU [りつ, りゅう]",
    kunyomi: "ta(tsu), ta(teru) [た(つ), た(てる)]",
    meaning_es: "levantarse, estar de pie",
    meaning_en: "to stand",
    pronunciation: "た, りつ",
    mnemonic: "Una persona de pie con los brazos abiertos firme sobre la línea del suelo."
  },
  "買": {
    strokes: 12,
    level: "N5",
    onyomi: "BAI [ばい]",
    kunyomi: "ka(u) [か(う)]",
    meaning_es: "comprar",
    meaning_en: "to buy",
    pronunciation: "か, ばい",
    mnemonic: "Una red o cesta (罒) sobre conchas de cauri (貝 - moneda antigua) que se usan para comprar."
  },
  "前": {
    strokes: 9,
    level: "N5",
    onyomi: "ZEN [ぜん]",
    kunyomi: "mae [まえ]",
    meaning_es: "delante, antes",
    meaning_en: "before, in front",
    pronunciation: "まえ, ぜん",
    mnemonic: "Avanzar con decisión y cortar el camino por delante hacia el frente."
  },
  "後": {
    strokes: 9,
    level: "N5",
    onyomi: "GO, KOU [ご, こう]",
    kunyomi: "ushi(ro), ato, nochi [うし(ろ), あと, のち]",
    meaning_es: "detrás, después, tarde",
    meaning_en: "behind, after, later",
    pronunciation: "うし, ご, あと",
    mnemonic: "Caminar paso a paso (彳) siguiendo un hilo (幺) que va rezagado detrás."
  },
  "午": {
    strokes: 4,
    level: "N5",
    onyomi: "GO [ご]",
    kunyomi: "uma [うま]",
    meaning_es: "mediodía",
    meaning_en: "noon",
    pronunciation: "ご",
    mnemonic: "La aguja de un reloj de sol apuntando exactamente a las doce del mediodía."
  },
  "間": {
    strokes: 12,
    level: "N5",
    onyomi: "KAN, KEN [かん, けん]",
    kunyomi: "aida, ma [あいだ, ま]",
    meaning_es: "entre, intervalo, espacio",
    meaning_en: "between, interval, space",
    pronunciation: "あいだ, かん, ま",
    mnemonic: "El sol (日) colándose por el espacio entre las dos hojas de una puerta (門)."
  },
  "毎": {
    strokes: 6,
    level: "N5",
    onyomi: "MAI [まい]",
    kunyomi: "goto(ni) [ごと(に)]",
    meaning_es: "cada, todos",
    meaning_en: "every, each",
    pronunciation: "まい",
    mnemonic: "Una madre (母) con un tocado (𠂉) cuidando a su familia cada uno de los días."
  },
  "白": {
    strokes: 5,
    level: "N5",
    onyomi: "HAKU, BYAKU [はく, びゃく]",
    kunyomi: "shiro, shiro(i) [しろ, しろ(い)]",
    meaning_es: "blanco, puro",
    meaning_en: "white",
    pronunciation: "しろ, はく",
    mnemonic: "Un rayo de sol puro (日 con una gota arriba) resplandeciendo de color blanco."
  },
  "高": {
    strokes: 10,
    level: "N5",
    onyomi: "KOU [こう]",
    kunyomi: "taka(i) [たか(い)]",
    meaning_es: "alto, caro",
    meaning_en: "high, expensive",
    pronunciation: "たか, こう",
    mnemonic: "Una pagoda o castillo tradicional elevado con múltiples plantas y torre alta."
  },
  "安": {
    strokes: 6,
    level: "N5",
    onyomi: "AN [あん]",
    kunyomi: "yasu(i) [やす(い)]",
    meaning_es: "barato, tranquilo, paz",
    meaning_en: "cheap, peaceful, safe",
    pronunciation: "やす, あん",
    mnemonic: "Una mujer (女) descansando en paz y seguridad bajo el techo de su hogar (宀)."
  },
  "長": {
    strokes: 8,
    level: "N5",
    onyomi: "CHOU [ちょう]",
    kunyomi: "naga(i), osa [なが(い), おさ]",
    meaning_es: "largo, líder, jefe",
    meaning_en: "long, leader",
    pronunciation: "なが, ちょう",
    mnemonic: "La larga cabellera de un anciano respetado o líder de una comunidad."
  },
  "多": {
    strokes: 6,
    level: "N5",
    onyomi: "TA [た]",
    kunyomi: "oo(i) [おお(い)]",
    meaning_es: "mucho, numeroso",
    meaning_en: "many, much",
    pronunciation: "おお, た",
    mnemonic: "Dos lunas (夕) apiladas representando el paso de muchas noches: abundancia."
  },
  "父": {
    strokes: 4,
    level: "N5",
    onyomi: "FU [ふ]",
    kunyomi: "chichi, tou [ちち, とう]",
    meaning_es: "padre",
    meaning_en: "father",
    pronunciation: "ちち, とう, ふ",
    mnemonic: "Dos manos cruzadas sosteniendo un báculo con autoridad paterna en el hogar."
  },
  "母": {
    strokes: 5,
    level: "N5",
    onyomi: "BO [ぼ]",
    kunyomi: "haha, kaa [はは, かあ]",
    meaning_es: "madre",
    meaning_en: "mother",
    pronunciation: "はは, かあ, ぼ",
    mnemonic: "Una madre abrazando con ternura y amamantando a su pequeño bebé."
  },
  "男": {
    strokes: 7,
    level: "N5",
    onyomi: "DAN, NAN [だん, なん]",
    kunyomi: "otoko [おとこ]",
    meaning_es: "hombre, varón",
    meaning_en: "man, male",
    pronunciation: "おとこ, だん, なん",
    mnemonic: "La fuerza muscular (力) que trabaja laboriosamente en los campos de arroz (田): el hombre."
  },
  "女": {
    strokes: 3,
    level: "N5",
    onyomi: "JO, NYO [じょ, にょ]",
    kunyomi: "onna, me [おんな, め]",
    meaning_es: "mujer, femenino",
    meaning_en: "woman, female",
    pronunciation: "おんな, じょ",
    mnemonic: "Una figura femenina grácil sentada o arrodillada con brazos cruzados con elegancia."
  },
  "子": {
    strokes: 3,
    level: "N5",
    onyomi: "SHI, SU [し, す]",
    kunyomi: "ko [こ]",
    meaning_es: "niño, hijo",
    meaning_en: "child, kid",
    pronunciation: "こ, し",
    mnemonic: "Un niño pequeño con los brazos extendidos pidiendo que lo abracen."
  },
  "百": {
    strokes: 6,
    level: "N5",
    onyomi: "HYAKU, BYAKU [ひゃく, びゃく]",
    kunyomi: "momo [もも]",
    meaning_es: "cien",
    meaning_en: "hundred",
    pronunciation: "ひゃく, びゃく, ぴゃく",
    mnemonic: "Un trazo (一) sobre el color blanco (白): un centenar de elementos resplandecientes."
  },
  "千": {
    strokes: 3,
    level: "N5",
    onyomi: "SEN [せん]",
    kunyomi: "chi [ち]",
    meaning_es: "mil",
    meaning_en: "thousand",
    pronunciation: "せん, ぜん",
    mnemonic: "Una figura humana (亻) con una banda en el pecho representando un batallón de mil guerreros."
  },
  "万": {
    strokes: 3,
    level: "N5",
    onyomi: "MAN, BAN [まん, ばん]",
    kunyomi: "yorozu [よろず]",
    meaning_es: "diez mil, multitud",
    meaning_en: "ten thousand",
    pronunciation: "まん, ばん",
    mnemonic: "Un número diez mil gigantesco que simboliza una multitud incontable."
  },
  "円": {
    strokes: 4,
    level: "N5",
    onyomi: "EN [えん]",
    kunyomi: "maru(i) [まる(い)]",
    meaning_es: "yen, círculo",
    meaning_en: "yen, circle",
    pronunciation: "えん",
    mnemonic: "Una moneda redonda resguardada dentro del marco de una hucha o caja."
  },
  "金": {
    strokes: 8,
    level: "N5",
    onyomi: "KIN, KON [きん, こん]",
    kunyomi: "kane, kana- [かね, かな]",
    meaning_es: "oro, dinero, viernes",
    meaning_en: "gold, money, Friday",
    pronunciation: "かね, きん",
    mnemonic: "Pepitas de oro brillante encontradas bajo la tierra dentro de una mina."
  },
  "電": {
    strokes: 13,
    level: "N5",
    onyomi: "DEN [でん]",
    kunyomi: "inazuma [いなずま]",
    meaning_es: "electricidad",
    meaning_en: "electricity",
    pronunciation: "でん",
    mnemonic: "Lluvia tormentosa (雨) acompañada de relámpagos con potente energía eléctrica."
  },
  "気": {
    strokes: 6,
    level: "N5",
    onyomi: "KI, KE [き, け]",
    kunyomi: "iki [いき]",
    meaning_es: "espíritu, energía, ánimo",
    meaning_en: "spirit, energy, mind",
    pronunciation: "き, け",
    mnemonic: "El vapor y la energía vital que ascienden de una olla de arroz recién cocido."
  },
  "花": {
    strokes: 7,
    level: "N5",
    onyomi: "KA, KE [か, け]",
    kunyomi: "hana [はな]",
    meaning_es: "flor",
    meaning_en: "flower",
    pronunciation: "はな, か",
    mnemonic: "Brotes vegetales (艹) que se transforman (化) mágicamente en una hermosa flor."
  },
  "水": {
    strokes: 4,
    level: "N5",
    onyomi: "SUI [すい]",
    kunyomi: "mizu [みず]",
    meaning_es: "agua, miércoles",
    meaning_en: "water, Wednesday",
    pronunciation: "みず, すい",
    mnemonic: "Un torrente central de agua pura que salpica gotas cristalinas a los costados."
  },
  "火": {
    strokes: 4,
    level: "N5",
    onyomi: "KA [か]",
    kunyomi: "hi, -bi [ひ, -び]",
    meaning_es: "fuego, martes",
    meaning_en: "fire, Tuesday",
    pronunciation: "ひ, か",
    mnemonic: "Las llamas vivas de una fogata que chisporrotean y despiden chispas al aire."
  },
  "学": {
    strokes: 8,
    level: "N5",
    onyomi: "GAKU [がく]",
    kunyomi: "mana(bu) [まな(ぶ)]",
    meaning_es: "estudiar, aprender",
    meaning_en: "to study, learn",
    pronunciation: "まな, がく, がっ",
    mnemonic: "Un niño (子) bajo el techo del colegio recibiendo chispas de sabiduría."
  },
  "校": {
    strokes: 10,
    level: "N5",
    onyomi: "KOU [こう]",
    kunyomi: "kase [かせ]",
    meaning_es: "escuela, colegio",
    meaning_en: "school",
    pronunciation: "こう",
    mnemonic: "Un edificio de madera (木) donde los estudiantes intercambian (交) ideas: la escuela."
  },
  "先": {
    strokes: 6,
    level: "N5",
    onyomi: "SEN [せん]",
    kunyomi: "saki, ma(zu) [さき, ま(ず)]",
    meaning_es: "anterior, previo, delante",
    meaning_en: "previous, ahead",
    pronunciation: "さき, せん",
    mnemonic: "Una persona que avanza a paso rápido con sus piernas (儿) marchando delante de los demás."
  },
  "生": {
    strokes: 5,
    level: "N5",
    onyomi: "SEI, SHOU [せい, しょう]",
    kunyomi: "i(kiru), u(mareru), nama [い(きる), う(まれる), なま]",
    meaning_es: "nacer, vivir, crudo, vida",
    meaning_en: "to be born, life, raw",
    pronunciation: "う, せい, しょう, なま",
    mnemonic: "Una pequeña planta verde brotando con energía de la tierra viva."
  },
  "友": {
    strokes: 4,
    level: "N5",
    onyomi: "YUU [ゆう]",
    kunyomi: "tomo [とも]",
    meaning_es: "amigo",
    meaning_en: "friend",
    pronunciation: "とも, ゆう",
    mnemonic: "Dos manos (𠂇 y 又) que se estrechan calurosamente sellando un lazo de amistad."
  },
  "名": {
    strokes: 6,
    level: "N5",
    onyomi: "MEI, MYOU [めい, みょう]",
    kunyomi: "na [な]",
    meaning_es: "nombre, fama",
    meaning_en: "name, reputation",
    pronunciation: "な, めい, みょう",
    mnemonic: "En la noche oscura (夕), debes identificarte diciendo tu nombre con la boca (口)."
  },
  "社": {
    strokes: 7,
    level: "N5",
    onyomi: "SHA [しゃ]",
    kunyomi: "yashiro [やしろ]",
    meaning_es: "compañía, empresa, sociedad",
    meaning_en: "company, society, shrine",
    pronunciation: "しゃ, やしろ",
    mnemonic: "Un altar sagrado (礻) construido sobre la tierra (土) donde la comunidad se organiza."
  },
  "会": {
    strokes: 6,
    level: "N5",
    onyomi: "KAI, E [かい, え]",
    kunyomi: "a(u) [あ(う)]",
    meaning_es: "reunirse, encuentro, reunión",
    meaning_en: "to meet, meeting",
    pronunciation: "あ, かい",
    mnemonic: "Varias personas reuniéndose bajo un mismo techo para encontrarse y colaborar."
  },
  "行": {
    strokes: 6,
    level: "N5",
    onyomi: "KOU, GYOU [こう, ぎょう]",
    kunyomi: "i(ku), okona(u) [い(く), おこな(う)]",
    meaning_es: "ir, realizar, fila",
    meaning_en: "to go, conduct",
    pronunciation: "い, こう, ぎょう",
    mnemonic: "Una encrucijada de cuatro caminos por donde las personas viajan y avanzan."
  },
  "休": {
    strokes: 6,
    level: "N5",
    onyomi: "KYUU [きゅう]",
    kunyomi: "yasu(mu) [やす(む)]",
    meaning_es: "descansar, descanso",
    meaning_en: "to rest, day off",
    pronunciation: "やす, きゅう",
    mnemonic: "Una persona (亻) descansando plácidamente recostada a la sombra de un árbol (木)."
  },
  "時": {
    strokes: 10,
    level: "N5",
    onyomi: "JI [じ]",
    kunyomi: "toki [とき]",
    meaning_es: "hora, tiempo, momento",
    meaning_en: "time, hour",
    pronunciation: "とき, じ",
    mnemonic: "El paso del sol (日) marcado por las campanadas rítmicas del templo (寺)."
  },
  "分": {
    strokes: 4,
    level: "N5",
    onyomi: "BUN, FUN [ぶん, ふん]",
    kunyomi: "wa(karu), wa(keru) [わ(かる), わ(ける)]",
    meaning_es: "minuto, parte, entender",
    meaning_en: "minute, part, understand",
    pronunciation: "わ, ふん, ぶん, ぷん",
    mnemonic: "Un cuchillo (刀) dividiendo en partes (八) para comprender cada detalle."
  },
  "半": {
    strokes: 5,
    level: "N5",
    onyomi: "HAN [はん]",
    kunyomi: "naka(ba) [なか(ば)]",
    meaning_es: "mitad, medio",
    meaning_en: "half",
    pronunciation: "はん, なかば",
    mnemonic: "Una línea vertical que corta una figura simétrica exactamente por la mitad."
  },
  "無": {
    strokes: 12,
    level: "N5",
    onyomi: "MU, BU [む, ぶ]",
    kunyomi: "na(i) [な(い)]",
    meaning_es: "nada, sin, inexistente",
    meaning_en: "nothing, without",
    pronunciation: "む, ぶ, な",
    mnemonic: "Un bosque que se consume en las llamas (灬) hasta que no queda absolutamente nada."
  },
  "文": {
    strokes: 4,
    level: "N5",
    onyomi: "BUN, MON [ぶん, もん]",
    kunyomi: "fumi, aya [ふみ, あや]",
    meaning_es: "texto, frase, literatura, cultura",
    meaning_en: "sentence, literature, text",
    pronunciation: "ぶん, もん, ふみ",
    mnemonic: "Un pergamino con trazos entrecruzados que representan la escritura y las bellas letras."
  },
  "店": {
    strokes: 8,
    level: "N5",
    onyomi: "TEN [てん]",
    kunyomi: "mise [みせ]",
    meaning_es: "tienda, negocio, local",
    meaning_en: "shop, store",
    pronunciation: "みせ, てん",
    mnemonic: "Un puesto bajo un cobertizo (广) donde se expende mercancía y se atiende (占) al cliente."
  },
  "外": {
    strokes: 5,
    level: "N5",
    onyomi: "GAI, GE [がい, げ]",
    kunyomi: "soto, hoka [そと, ほか]",
    meaning_es: "fuera, exterior, extranjero",
    meaning_en: "outside, foreign",
    pronunciation: "そと, がい, げ",
    mnemonic: "Al anochecer (夕), la adivinación con huesos (卜) se efectúa afuera al aire libre."
  },
  "国": {
    strokes: 8,
    level: "N5",
    onyomi: "KOKU [こく]",
    kunyomi: "kuni [くに]",
    meaning_es: "país, nación",
    meaning_en: "country, nation",
    pronunciation: "くに, こく",
    mnemonic: "Una joya o tesoro precioso (玉) protegido dentro de las fronteras cuadradas (囗) de un país."
  },
  "発": {
    strokes: 9,
    level: "N5",
    onyomi: "HATSU, HOTSU [はつ, ほつ]",
    kunyomi: "ta(tsu) [た(つ)]",
    meaning_es: "salida, emisión, partida",
    meaning_en: "departure, discharge, emit",
    pronunciation: "はつ, ほつ",
    mnemonic: "Pies listos que tensan la cuerda de un arco para salir disparados a toda velocidad."
  },
  "思": {
    strokes: 9,
    level: "N4",
    onyomi: "SHI [し]",
    kunyomi: "omo(u) [おも(う)]",
    meaning_es: "pensar, sentir, recordar",
    meaning_en: "to think, feel",
    pronunciation: "おも, し",
    mnemonic: "Un campo de arroz (田) fértil sobre un corazón (心): cultivar pensamientos con el corazón."
  },
  "美": {
    strokes: 9,
    level: "N4",
    onyomi: "BI, MI [び, み]",
    kunyomi: "utsuku(shii) [うつく(しい)]",
    meaning_es: "belleza, hermoso",
    meaning_en: "beauty, beautiful",
    pronunciation: "うつく, び, み",
    mnemonic: "Una oveja grande y saludable (羊 + 大): antiguo símbolo oriental de máxima hermosura."
  },
  "君": {
    strokes: 7,
    level: "N5",
    onyomi: "KUN [くん]",
    kunyomi: "kimi [きみ]",
    meaning_es: "tú, sufijo de cortesía, gobernante",
    meaning_en: "you, ruler",
    pronunciation: "きみ, くん",
    mnemonic: "Una mano sosteniendo un cetro con autoridad y dictando directivas con la boca (口)."
  },
  "産": {
    strokes: 11,
    level: "N4",
    onyomi: "SAN [さん]",
    kunyomi: "u(mu), u(mareru) [う(む), う(まれる)]",
    meaning_es: "dar a luz, producir, producto",
    meaning_en: "give birth, produce",
    pronunciation: "う, さん",
    mnemonic: "Dar a luz y hacer brotar vida nueva (生) sobre un pedestal seguro (立 + 厂)."
  },
  "教": {
    strokes: 11,
    level: "N5",
    onyomi: "KYOU [きょう]",
    kunyomi: "oshi(eru), oso(waru) [おし(える), おそ(わる)]",
    meaning_es: "enseñar, doctrina, fe",
    meaning_en: "to teach, faith",
    pronunciation: "おし, きょう",
    mnemonic: "Un niño (子) aprendiendo con atención las lecciones que un profesor señala con su puntero (攵)."
  },
  "室": {
    strokes: 9,
    level: "N4",
    onyomi: "SHITSU [しつ]",
    kunyomi: "muro [むろ]",
    meaning_es: "habitación, sala, cuarto",
    meaning_en: "room",
    pronunciation: "しつ, むろ",
    mnemonic: "Un cuarto bajo techo (宀) donde una flecha llega (至) a posarse en reposo."
  },
  "図": {
    strokes: 7,
    level: "N4",
    onyomi: "ZU, TO [ず, と]",
    kunyomi: "haka(ru) [はか(る)]",
    meaning_es: "dibujo, mapa, plan, diagrama",
    meaning_en: "map, drawing, plan",
    pronunciation: "ず, と, はか",
    mnemonic: "Un plano esquemático o mapa trazado con precisión dentro de un marco cuadrado (囗)."
  },
  "館": {
    strokes: 16,
    level: "N4",
    onyomi: "KAN [かん]",
    kunyomi: "yakata [やかた]",
    meaning_es: "edificio público, palacio, mansión",
    meaning_en: "public building, hall",
    pronunciation: "かん, やかた",
    mnemonic: "Un gran palacio público donde se sirve comida (食) a los visitantes en salones oficiales (官)."
  },
  "留": {
    strokes: 10,
    level: "N4",
    onyomi: "RYUU, RU [りゅう, る]",
    kunyomi: "to(maru), to(meru) [と(まる), と(める)]",
    meaning_es: "detenerse, quedarse, retener",
    meaning_en: "to stay, detain",
    pronunciation: "と, りゅう",
    mnemonic: "Permanecer trabajando en el campo de cultivo (田) sin apartarse del lugar."
  },
  "宝": {
    strokes: 8,
    level: "N4",
    onyomi: "HOU [ほう]",
    kunyomi: "takara [たから]",
    meaning_es: "tesoro, joya valiosa",
    meaning_en: "treasure",
    pronunciation: "たから, ほう",
    mnemonic: "Bajo el techo seguro del palacio (宀) se guardan resplandecientes gemas de jade (玉): un tesoro."
  },
  "物": {
    strokes: 8,
    level: "N5",
    onyomi: "BUTSU, MOTSU [ぶつ, もつ]",
    kunyomi: "mono [もの]",
    meaning_es: "cosa, objeto, materia",
    meaning_en: "thing, object",
    pronunciation: "もの, ぶつ, もつ",
    mnemonic: "Un buey (牛) rodeado de cosas de todas las formas y colores (勿): las cosas del mundo."
  },
  "番": {
    strokes: 12,
    level: "N5",
    onyomi: "BAN [ばん]",
    kunyomi: "tsugai [つがい]",
    meaning_es: "número, turno, orden",
    meaning_en: "number, turn",
    pronunciation: "ばん",
    mnemonic: "Semillas o huellas (釆) contadas en orden por turnos a través del campo (田)."
  },
  "号": {
    strokes: 5,
    level: "N4",
    onyomi: "GOU [ごう]",
    kunyomi: "sake(bu) [さけ(ぶ)]",
    meaning_es: "número, señal, código",
    meaning_en: "number, signal",
    pronunciation: "ごう",
    mnemonic: "Una voz que grita con la boca (口) el número o código identificativo."
  },
  "試": {
    strokes: 13,
    level: "N4",
    onyomi: "SHI [し]",
    kunyomi: "kokoro(miru), tame(su) [こころ(みる), ため(す)]",
    meaning_es: "probar, intentar, examen",
    meaning_en: "test, try",
    pronunciation: "こころ, ため, し",
    mnemonic: "Utilizar palabras (言) para ensayar y probar una regla o estilo (式)."
  },
  "験": {
    strokes: 18,
    level: "N4",
    onyomi: "KEN, GEN [けん, げん]",
    kunyomi: "tameshi [ためし]",
    meaning_es: "prueba, efecto, examen",
    meaning_en: "examination, test",
    pronunciation: "けん, げん",
    mnemonic: "Examinar de cerca las condiciones de un caballo purasangre (馬) para verificar su rendimiento."
  },
  "度": {
    strokes: 9,
    level: "N4",
    onyomi: "DO, TO [ど, と]",
    kunyomi: "tabi [たび]",
    meaning_es: "grado, vez, ocasión, medida",
    meaning_en: "degree, time, occasion",
    pronunciation: "ど, たび",
    mnemonic: "Bajo el alero de una casa (广), una mano mide las dimensiones paso a paso."
  },
  "健": {
    strokes: 11,
    level: "N4",
    onyomi: "KEN [けん]",
    kunyomi: "suko(yaka) [すこ(やか)]",
    meaning_es: "sano, saludable, robusto",
    meaning_en: "healthy, robust",
    pronunciation: "すこ, けん",
    mnemonic: "Una persona (亻) que construye (建) hábitos firmes para mantenerse fuerte y sana."
  },
  "康": {
    strokes: 11,
    level: "N4",
    onyomi: "KOU [こう]",
    kunyomi: "yasuraka [やすらか]",
    meaning_es: "salud, paz, tranquilidad",
    meaning_en: "health, peace",
    pronunciation: "こう",
    mnemonic: "Un hogar colmado de cosechas de grano donde reina la paz, la serenidad y la buena salud."
  },
  "全": {
    strokes: 6,
    level: "N4",
    onyomi: "ZEN [ぜん]",
    kunyomi: "sube(te), matta(ku) [すべ(て), まった(く)]",
    meaning_es: "todo, entero, completo",
    meaning_en: "all, whole",
    pronunciation: "ぜん, すべて",
    mnemonic: "Una joya perfecta de jade (王) completamente cubierta y protegida por un domo (𠆢)."
  },
  "員": {
    strokes: 10,
    level: "N4",
    onyomi: "IN [いん]",
    kunyomi: "kazu [かず]",
    meaning_es: "miembro, empleado, personal",
    meaning_en: "member, staff",
    pronunciation: "いん",
    mnemonic: "Bocas (口) a las que se les paga con conchas/dinero (貝): los empleados de la organización."
  },
  "曜": {
    strokes: 18,
    level: "N5",
    onyomi: "YOU [よう]",
    kunyomi: "hikari [ひかり]",
    meaning_es: "día de la semana, astro brillante",
    meaning_en: "day of week",
    pronunciation: "よう",
    mnemonic: "El sol (日) y las plumas de las aves (羽) brillando intensamente (隹) cada día de la semana."
  },
  "説": {
    strokes: 14,
    level: "N4",
    onyomi: "SETSU, ZEI [せつ, ぜい]",
    kunyomi: "to(ku) [と(く)]",
    meaning_es: "explicar, teoría, opinar",
    meaning_en: "to explain, theory",
    pronunciation: "せつ, と",
    mnemonic: "Palabras (言) que brindan alivio y comprensión luminosa (兑) al ser explicadas con claridad."
  },
  "階": {
    strokes: 12,
    level: "N4",
    onyomi: "KAI [かい]",
    kunyomi: "kizahashi [きざはし]",
    meaning_es: "piso, planta, escalera, nivel",
    meaning_en: "floor, storey",
    pronunciation: "かい",
    mnemonic: "Una colina o escalera (阝) donde las personas suben juntas al mismo nivel (皆)."
  },
  "段": {
    strokes: 9,
    level: "N4",
    onyomi: "DAN, TAN [だん, たん]",
    kunyomi: "kizahashi [きざはし]",
    meaning_es: "escalón, nivel, peldaño",
    meaning_en: "step, rank",
    pronunciation: "だん",
    mnemonic: "Dar pasos firmes con un báculo (殳) ascendiendo de escalón en escalón."
  },
  "郵": {
    strokes: 11,
    level: "N4",
    onyomi: "YUU [ゆう]",
    kunyomi: "post [ぽすと]",
    meaning_es: "correo, servicio postal",
    meaning_en: "mail, postal",
    pronunciation: "ゆう",
    mnemonic: "Un puesto fronterizo oficial (垂) en un poblado (阝) que recibe y distribuye el correo."
  },
  "便": {
    strokes: 9,
    level: "N4",
    onyomi: "BEN, BIN [べん, びん]",
    kunyomi: "tayo(ri) [たよ(り)]",
    meaning_es: "correo, conveniencia, vuelo",
    meaning_en: "convenience, mail",
    pronunciation: "べん, びん, たより",
    mnemonic: "Una persona (亻) que adapta las situaciones (更) para hacerlas cómodas y convenientes."
  },
  "局": {
    strokes: 7,
    level: "N4",
    onyomi: "KYOKU [きょく]",
    kunyomi: "tsubone [つぼね]",
    meaning_es: "oficina, departamento, estación",
    meaning_en: "bureau, department",
    pronunciation: "きょく",
    mnemonic: "Un compartimento oficial o ventanilla administrativa donde se tramitan asuntos públicos."
  },
  "心": {
    strokes: 4,
    level: "N4",
    onyomi: "SHIN [しん]",
    kunyomi: "kokoro [こころ]",
    meaning_es: "corazón, mente, alma",
    meaning_en: "heart, mind",
    pronunciation: "こころ, しん",
    mnemonic: "Las cuatro cámaras y ventrículos de un corazón humano latiendo con emoción y sentimientos."
  },
  "配": {
    strokes: 10,
    level: "N4",
    onyomi: "HAI [はい]",
    kunyomi: "kuba(ru) [くば(る)]",
    meaning_es: "distribuir, repartir, preocuparse",
    meaning_en: "distribute, deliver",
    pronunciation: "はい, くば",
    mnemonic: "Una jarra de vino (酉) repartida equitativamente entre las personas arrodilladas (己)."
  },
  "遅": {
    strokes: 12,
    level: "N4",
    onyomi: "CHI [ち]",
    kunyomi: "oso(i), oku(reru) [おそ(い), おく(れる)]",
    meaning_es: "tarde, lento, retrasarse",
    meaning_en: "late, slow",
    pronunciation: "おそ, おく, ち",
    mnemonic: "Un cordero cansado (羊) caminando lentamente por el sendero (辶): llegar tarde."
  },
  "刻": {
    strokes: 8,
    level: "N4",
    onyomi: "KOKU [こく]",
    kunyomi: "kiza(mu) [きざ(む)]",
    meaning_es: "grabar, hora, tiempo, tictac",
    meaning_en: "engrave, time",
    pronunciation: "きざ, こく",
    mnemonic: "Un cuchillo afilado (刂) grabando incisiones en el reloj de sol para marcar las horas."
  },
  "約": {
    strokes: 9,
    level: "N4",
    onyomi: "YAKU [やく]",
    kunyomi: "tsume(ru) [つめ(る)]",
    meaning_es: "promesa, compromiso, aproximadamente",
    meaning_en: "promise, approximate",
    pronunciation: "やく",
    mnemonic: "Un hilo o cinta (糸) que ata con firmeza un acuerdo sellado (勺): una promesa formal."
  },
  "束": {
    strokes: 7,
    level: "N4",
    onyomi: "SOKU [そく]",
    kunyomi: "taba [たば]",
    meaning_es: "manojo, fardo, atado",
    meaning_en: "bundle, sheaf",
    pronunciation: "たば, そく",
    mnemonic: "Una soga atada fuertemente alrededor de un manojo de leña o maderos (木 + 口)."
  },
  "経": {
    strokes: 11,
    level: "N3",
    onyomi: "KEI, KYOU [けい, きょう]",
    kunyomi: "he(ru) [へ(る)]",
    meaning_es: "pasar, transcurrir, gestionar, experiencia",
    meaning_en: "pass through, experience, manage",
    pronunciation: "へ, けい",
    mnemonic: "Los hilos de urdimbre (糸) que transcurren longitudinalmente a través del telar."
  },
  "駅": {
    strokes: 14,
    level: "N5",
    onyomi: "EKI [えき]",
    kunyomi: "eki [えき]",
    meaning_es: "estación de tren",
    meaning_en: "train station",
    pronunciation: "えき",
    mnemonic: "Un caballo veloz (馬) detenido en el terminal o estación de parada (尺) para el intercambio de viajeros."
  }
};

function main() {
  const currentKanjiList = JSON.parse(fs.readFileSync(KANJI_JSON_PATH, 'utf8'));
  const vocabularyList = JSON.parse(fs.readFileSync(VOCABULARY_JSON_PATH, 'utf8'));

  console.log(`Initial kanji count: ${currentKanjiList.length}`);

  // Create lookup for existing kanji items
  const kanjiMap = new Map();
  currentKanjiList.forEach(k => {
    kanjiMap.set(k.kanji, k);
  });

  // Ensure 駅 is present
  if (!kanjiMap.has("駅")) {
    kanjiMap.set("駅", {
      kanji: "駅",
      level: "N5",
      meaning_en: "train station",
      meaning_es: "estación de tren",
      pronunciation: "えき",
      words: [{ word: "駅", reading: "えき", meaning: "estación" }],
      source: "Vocabulario N5"
    });
  }

  // Common translations for compound words
  const translations = {
    "one": "uno",
    "two": "dos",
    "three": "tres",
    "four": "cuatro",
    "five": "cinco",
    "six": "seis",
    "seven": "siete",
    "eight": "ocho",
    "nine": "nueve",
    "ten": "diez",
    "one person": "una persona",
    "two people": "dos personas",
    "three people": "tres personas",
    "four people": "cuatro personas",
    "mountain": "montaña",
    "river": "río",
    "rain": "lluvia",
    "tree": "árbol",
    "book": "libro",
    "water": "agua",
    "fire": "fuego",
    "car": "auto / coche",
    "fish": "pez / pescado",
    "father": "padre",
    "mother": "madre",
    "man": "hombre",
    "woman": "mujer",
    "child": "niño",
    "to see": "ver",
    "to eat": "comer",
    "to drink": "beber",
    "to read": "leer",
    "to write": "escribir",
    "to listen": "escuchar",
    "to speak": "hablar",
    "to come": "venir",
    "to go": "ir",
    "to buy": "comprar",
    "to stand": "levantarse / estar de pie",
    "to enter": "entrar",
    "to leave": "salir",
    "time": "tiempo / hora",
    "what time": "qué hora",
    "now": "ahora",
    "this week": "esta semana",
    "next week": "la próxima semana",
    "this month": "este mes",
    "next month": "el próximo mes",
    "this year": "este año",
    "next year": "el próximo año",
    "white": "blanco",
    "high, expensive": "alto / caro",
    "cheap": "barato",
    "many": "mucho",
    "old": "viejo / antiguo",
    "new": "nuevo",
    "friend": "amigo",
    "name": "nombre",
    "school": "escuela",
    "teacher": "profesor / maestro",
    "student": "estudiante",
    "company": "empresa / compañía",
    "train": "tren",
    "electricity": "electricidad",
    "station": "estación",
    "shop": "tienda"
  };

  // Build enhanced list
  const updatedList = [];

  for (const [char, meta] of Object.entries(KANJI_METADATA)) {
    let existing = kanjiMap.get(char) || { kanji: char };

    // Merge metadata
    const item = {
      kanji: char,
      level: meta.level || existing.level || "N5",
      meaning_es: meta.meaning_es,
      meaning_en: meta.meaning_en,
      pronunciation: meta.pronunciation || existing.pronunciation,
      strokes: meta.strokes,
      onyomi: meta.onyomi,
      kunyomi: meta.kunyomi,
      mnemonic: meta.mnemonic,
      words: [],
      source: existing.source || "Kanji Book"
    };

    // Clean existing words and translate English meanings
    const wordsMap = new Map();
    if (existing.words && Array.isArray(existing.words)) {
      existing.words.forEach(w => {
        if (!w || !w.word) return;
        let esMean = w.meaning;
        if (translations[esMean?.toLowerCase()?.trim()]) {
          esMean = translations[esMean.toLowerCase().trim()];
        }
        wordsMap.set(w.word, {
          word: w.word,
          reading: w.reading || "",
          meaning: esMean || w.meaning
        });
      });
    }

    // Pull compound words from vocabulary.json that contain this kanji
    vocabularyList.forEach(v => {
      const vWord = v.kanji || v.word;
      if (vWord && vWord.includes(char) && Array.from(vWord).length > 1) {
        if (!wordsMap.has(vWord)) {
          wordsMap.set(vWord, {
            word: vWord,
            reading: v.hiragana || v.kana || "",
            meaning: v.meaning_es || v.meaning_en || ""
          });
        }
      }
    });

    item.words = Array.from(wordsMap.values());
    updatedList.push(item);
  }

  // Preserve any remaining kanjis from original that were not in metadata if any
  for (const [char, existing] of kanjiMap.entries()) {
    if (!KANJI_METADATA[char]) {
      console.warn(`Preserving unmapped kanji: ${char}`);
      updatedList.push(existing);
    }
  }

  // Validate all kanji
  let invalidCount = 0;
  updatedList.forEach(k => {
    if (!k.strokes || typeof k.strokes !== 'number') {
      console.error(`Invalid strokes for ${k.kanji}: ${k.strokes}`);
      invalidCount++;
    }
    if (!k.onyomi || !k.kunyomi || !k.mnemonic || !k.meaning_es) {
      console.error(`Missing info for ${k.kanji}`);
      invalidCount++;
    }
  });

  if (invalidCount > 0) {
    console.error(`Validation failed with ${invalidCount} issues`);
    process.exit(1);
  }

  console.log(`Successfully verified and validated all ${updatedList.length} kanjis!`);

  // Write to kanji.json
  fs.writeFileSync(KANJI_JSON_PATH, JSON.stringify(updatedList, null, 2), 'utf8');
  console.log(`Saved ${KANJI_JSON_PATH}`);

  // Write to kanji.js
  const jsContent = `// Auto-generated dataset for Nihongo Master\nwindow.KANJI_DATA = ${JSON.stringify(updatedList, null, 2)};\n`;
  fs.writeFileSync(KANJI_JS_PATH, jsContent, 'utf8');
  console.log(`Saved ${KANJI_JS_PATH}`);
}

main();
