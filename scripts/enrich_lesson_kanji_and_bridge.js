/**
 * scripts/enrich_lesson_kanji_and_bridge.js
 * Extrae y enriquece exhaustivamente todos los Kanjis/Jukugo y Partículas/Prefijos
 * presentados a lo largo de las 69 lecciones (37 módulos) de Nihongo Master.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CURRICULUM_PATH = path.join(ROOT_DIR, 'data', 'curriculum.json');
const KANJI_PATH = path.join(ROOT_DIR, 'data', 'kanji.json');
const DICT_PATH = path.join(ROOT_DIR, 'data', 'dictionary.json');

const curr = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf8'));
const kanjiList = JSON.parse(fs.readFileSync(KANJI_PATH, 'utf8'));
const dictList = JSON.parse(fs.readFileSync(DICT_PATH, 'utf8'));

const kanjiMap = new Map(kanjiList.map(k => [k.kanji, k]));
const dictMap = new Map(dictList.map(d => [d.kanji, d]));

// Master database of kanji characters readings and mnemonics for lesson ideograms
const EXTRA_KANJI_DB = {
  "失": { onyomi: "SHITSU [しつ]", kunyomi: "ushina(u) [うしな(う)]", meaning: "perder / error / falla", mnemonic: "Una mano que suelta un objeto preciado y se le escapa al suelo." },
  "礼": { onyomi: "REI, RAI [れい, らい]", kunyomi: "rei [れい]", meaning: "cortesía / saludo / gratitud / etiqueta", mnemonic: "El altar sagrado (示) al lado de una persona inclinándose en señal de reverencia." },
  "疲": { onyomi: "HI [ひ]", kunyomi: "tsuka(reru) [つか(れる)]", meaning: "cansancio / fatiga / agotamiento", mnemonic: "La enfermedad (疒) sobre la piel desgastada por el trabajo duro." },
  "会": { onyomi: "KAI, E [かい, え]", kunyomi: "a(u) [あ(う)]", meaning: "reunirse / encuentro / asociación", mnemonic: "Tres personas bajo un mismo techo dialogando en armonía." },
  "社": { onyomi: "SHA [しゃ]", kunyomi: "yashiro [やしろ]", mnemonic: "El altar sagrado del dios del suelo donde se congregaba la comunidad local.", meaning: "sociedad / compañía / santuario" },
  "員": { onyomi: "IN [いん]", kunyomi: "kazu [かず]", meaning: "miembro / empleado / persona del equipo", mnemonic: "Una boca que come y una concha de dinero: un empleado registrado en el censo." },
  "名": { onyomi: "MEI, MYOU [めい, みょう]", kunyomi: "na [な]", meaning: "nombre / fama / reputación", mnemonic: "En la noche (夕) debes decir tu nombre con la boca (口) para que te reconozcan." },
  "前": { onyomi: "ZEN [ぜん]", kunyomi: "mae [まえ]", meaning: "delante / antes / previo", mnemonic: "El barco que avanza hacia el frente guiado por la proa." },
  "国": { onyomi: "KOKU [こく]", kunyomi: "kuni [くに]", meaning: "país / nación / territorio", mnemonic: "Una joya de jade (玉) protegida dentro de cuatro murallas fronterizas (囗)." },
  "英": { onyomi: "EI [えい]", kunyomi: "hanabusa [はなぶさ]", meaning: "Inglaterra / sobresaliente / talento", mnemonic: "Hierba brillante que florece por encima del resto." },
  "語": { onyomi: "GO [ご]", kunyomi: "kata(ru) [かた(る)]", meaning: "idioma / palabra / hablar", mnemonic: "Las palabras (言) de cinco personas (五) con su propia boca (口) forman una lengua." },
  "何": { onyomi: "KA [か]", kunyomi: "nani, nan [なに, なん]", meaning: "qué / cuál / cuántos", mnemonic: "Una persona cargando algo al hombro y preguntando con curiosidad: ¿qué llevas ahí?" },
  "分": { onyomi: "BUN, FUN [ぶん, ふん]", kunyomi: "wa(karu), wa(keru) [わ(かる), わ(ける)]", meaning: "minuto / parte / entender / dividir", mnemonic: "Una espada (刀) que divide en ocho partes (八) para comprender cada detalle." },
  "言": { onyomi: "GEN, GON [げん, ごん]", kunyomi: "i(u), koto [い(う), こと]", meaning: "decir / palabra / discurso", mnemonic: "Cuatro líneas sonoras brotando directamente de la boca humana." },
  "少": { onyomi: "SHOU [しょう]", kunyomi: "suku(nai), suko(shi) [すく(ない), すこ(し)]", meaning: "poco / escaso / pequeña cantidad", mnemonic: "Tres granos pequeños que se reducen con un trazo descendente." },
  "話": { onyomi: "WA [わ]", kunyomi: "hana(su), hanashi [はな(す), はなし]", meaning: "hablar / relato / conversación", mnemonic: "Palabras (言) moduladas con la lengua (舌) para crear una conversación viva." },
  "住": { onyomi: "JUU [じゅう]", kunyomi: "su(mu) [す(む)]", meaning: "vivir / residir / morar", mnemonic: "Una persona (亻) junto a una lámpara o candelero (主): el hogar donde reposa." },
  "所": { onyomi: "SHO [しょ]", kunyomi: "tokoro [ところ]", meaning: "lugar / sitio / espacio", mnemonic: "Una puerta (戸) señalada por un hacha ceremonial (斤): el sitio delimitado." },
  "部": { onyomi: "BU [ぶ]", kunyomi: "he [へ]", meaning: "sección / parte / departamento", mnemonic: "La parte o división asignada a un distrito territorial." },
  "屋": { onyomi: "OKU [おく]", kunyomi: "ya [や]", meaning: "habitación / tienda / tejado / casa", mnemonic: "Un cuerpo (尸) que llega (至) a guarecerse bajo un techo." },
  "京": { onyomi: "KYOU, KEI [きょう, けい]", kunyomi: "miyako [みやこ]", meaning: "capital / metrópoli", mnemonic: "Una alta torre de vigilancia sobre la colina de la ciudad imperial." },
  "都": { onyomi: "TO, TSU [と, つ]", kunyomi: "miyako [みやこ]", meaning: "metrópoli / gran capital", mnemonic: "Una comunidad de personas reunidas en una gran ciudad fortificada." },
  "家": { onyomi: "KA, KE [か, け]", kunyomi: "ie, ya [いえ, や]", meaning: "casa / familia / hogar", mnemonic: "Un techo protector (宀) cobijando a los animales domesticados (豕) de la familia." },
  "族": { onyomi: "ZOKU [ぞく]", kunyomi: "yakara [やから]", meaning: "tribu / clan / familia", mnemonic: "El estandarte ondeante que reúne bajo su flecha a todos los miembros de la familia." },
  "兄": { onyomi: "KEI, KYOU [けい, きょう]", kunyomi: "ani [あに]", meaning: "hermano mayor", mnemonic: "Una gran boca (口) sobre dos piernas (儿): el hermano mayor que aconseja con autoridad." },
  "姉": { onyomi: "SHI [し]", kunyomi: "ane [あね]", meaning: "hermana mayor", mnemonic: "Una mujer (女) del mercado (市) que cuida con sabiduría a sus hermanos menores." },
  "弟": { onyomi: "TEI, DAI [てい, だい]", kunyomi: "otouto [おとうと]", meaning: "hermano menor", mnemonic: "Una cuerda enrollada alrededor de un vástago de bambú: la juventud en desarrollo." },
  "妹": { onyomi: "MAI [まい]", kunyomi: "imouto [いもうと]", meaning: "hermana menor", mnemonic: "Una mujer (女) aún joven que no ha madurado por completo (未)." },
  "子": { onyomi: "SHI, SU [し, す]", kunyomi: "ko [こ]", meaning: "niño / hijo / semilla", mnemonic: "Un bebé con los brazos abiertos extendidos en señal de abrazo." },
  "飯": { onyomi: "HAN [はん]", kunyomi: "meshi [めし]", meaning: "arroz cocido / comida", mnemonic: "El alimento (食) que es opuesto al ayuno y te llena (反) con energía vital." },
  "魚": { onyomi: "GYO [ぎょ]", kunyomi: "sakana, uo [さかな, うお]", meaning: "pez / pescado", mnemonic: "El dibujo estilizado de un pez con su cabeza, escamas y cuatro gotas de agua en la cola." },
  "卵": { onyomi: "RAN [らん]", kunyomi: "tamago [たまご]", meaning: "huevo", mnemonic: "Dos formas gemelas enrolladas que muestran el embrión dentro del cascarón." },
  "茶": { onyomi: "CHA, SA [ちゃ, さ]", kunyomi: "cha [ちゃ]", meaning: "té", mnemonic: "Hojas de hierba (艹) recogidas de un arbusto bajo un techo de madera." },
  "友": { onyomi: "YUU [ゆう]", kunyomi: "tomo [とも]", meaning: "amigo / compañero", mnemonic: "Dos manos derechas que se estrechan en señal de lealtad sincera." },
  "達": { onyomi: "TATSU [たつ]", kunyomi: "tachi [たち]", meaning: "alcanzar / llegar / pluralizador", mnemonic: "Caminar por el sendero (辶) con una oveja dócil hasta alcanzar el destino." },
  "晩": { onyomi: "BAN [ばん]", kunyomi: "kure [くれ]", meaning: "noche / atardecer / tarde", mnemonic: "El sol (日) que se oculta lentamente tras el horizonte." },
  "果": { onyomi: "KA [か]", kunyomi: "hata(su), kudamono [はた(す), くだもの]", meaning: "fruto / resultado / culminar", mnemonic: "Un árbol (木) coronado por una fruta redonda y madura (田)." },
  "肉": { onyomi: "NIKU [にく]", kunyomi: "shishi [しし]", meaning: "carne", mnemonic: "Un corte de costillar con las vetas y fibras musculares visibles." },
  "牛": { onyomi: "GYUU [ぎゅう]", kunyomi: "ushi [うし]", meaning: "vaca / buey / vacuno", mnemonic: "La cabeza de una res con sus cuernos característicos apuntando al cielo." },
  "豚": { onyomi: "TON [とん]", kunyomi: "buta [ぶた]", meaning: "cerdo", mnemonic: "Carne de animal (月) gordo y doméstico (豕) criado en la granja." },
  "店": { onyomi: "TEN [てん]", kunyomi: "mise [みせ]", meaning: "tienda / establecimiento / local", mnemonic: "Un cobertizo o edificio (广) donde se guardan y venden productos (占)." },
  "注": { onyomi: "CHUU [ちゅう]", kunyomi: "soso(gu) [そそ(ぐ)]", meaning: "verter / prestar atención / pedir", mnemonic: "El agua líquida (氵) que fluye hacia el foco principal (主)." },
  "文": { onyomi: "BUN, MON [ぶん, もん]", kunyomi: "fumi, aya [ふみ, あや]", meaning: "texto / frase / literatura / patrón", mnemonic: "Un diseño cruzado o inscripción grabada en una tablilla de arcilla." },
  "台": { onyomi: "DAI, TAI [だい, たい]", kunyomi: "utena [うてな]", meaning: "base / pedestal / soporte / contador", mnemonic: "Una base plana y resistente con una abertura para colocar objetos firmemente." },
  "新": { onyomi: "SHIN [しん]", kunyomi: "atara(shii), ara(ta) [あたら(しい), あら(た)]", meaning: "nuevo / fresco", mnemonic: "Cortar un árbol (木) fresco en la colina (立) con un hacha afilada (斤)." },
  "古": { onyomi: "KO [こ]", kunyomi: "furu(i) [ふる(い)]", meaning: "antiguo / viejo", mnemonic: "Historias que han pasado por diez (十) bocas (口) durante generaciones." },
  "広": { onyomi: "KOU [こう]", kunyomi: "hiro(i) [ひろ(い)]", meaning: "amplio / espacioso", mnemonic: "Un edificio (广) tan grande que abarca todo el espacio privado (厶)." },
  "駅": { onyomi: "EKI [えき]", kunyomi: "eki [えき]", meaning: "estación de tren o transporte", mnemonic: "Caballos (馬) descansando en los puestos de relevo (尺) del camino real." },
  "電": { onyomi: "DEN [でん]", kunyomi: "inazuma [いなずま]", meaning: "electricidad / rayo", mnemonic: "Lluvia de tormenta (雨) acompañada por un relámpago zigzagueante (申)." },
  "車": { onyomi: "SHA [しゃ]", kunyomi: "kuruma [くるま]", meaning: "vehículo / coche / rueda", mnemonic: "La vista superior de una carreta antigua con dos ruedas y su eje central." },
  "道": { onyomi: "DOU, TOU [どう, とう]", kunyomi: "michi [みち]", meaning: "camino / sendero / vía / doctrina", mnemonic: "Caminar con atención (辶) guiando la mente y cabeza (首) hacia adelante." },
  "近": { onyomi: "KIN, KON [きん, こん]", kunyomi: "chika(i) [ちか(い)]", meaning: "cerca / próximo", mnemonic: "El sendero (辶) que está al alcance de un corte de hacha (斤): muy cercano." },
  "遠": { onyomi: "EN, ON [えん, おん]", kunyomi: "too(i) [とお(い)]", meaning: "lejos / distante", mnemonic: "El sendero (辶) que rodea un territorio extenso (袁) perdiéndose en el horizonte." },
  "病": { onyomi: "BYOU, HEI [びょう, へい]", kunyomi: "ya(mu) [や(む)]", meaning: "enfermedad / dolencia", mnemonic: "Un cuerpo encamado enfermo (疒) que siente fuego interior (丙)." },
  "院": { onyomi: "IN [いん]", kunyomi: "in [いん]", meaning: "institución / recinto / templo", mnemonic: "Un muro protector (阝) que rodea un patio seguro (完) para sanar o estudiar." },
  "医": { onyomi: "I [い]", kunyomi: "i(suru) [い(する)]", meaning: "médico / medicina / curar", mnemonic: "Flechas curativas guardadas en un estuche especial de primeros auxilios." },
  "薬": { onyomi: "YAKU [やく]", kunyomi: "kusuri [くすり]", meaning: "medicina / remedio / fármaco", mnemonic: "Hierbas medicinales (艹) que producen placer y alivio (楽) al cuerpo." },
  "旅": { onyomi: "RYO [りょ]", kunyomi: "tabi [たび]", meaning: "viaje / travesía / expedición", mnemonic: "Un grupo de personas marchando juntas bajo su estandarte por tierras lejanas." },
  "行": { onyomi: "KOU, GYOU [こう, ぎょう]", kunyomi: "i(ku), yu(ku), okona(u) [い(く), おこな(う)]", meaning: "ir / viajar / realizar / fila", mnemonic: "Una encrucijada de cuatro esquinas donde la gente camina libremente." },
  "来": { onyomi: "RAI, TAI [らい, たい]", kunyomi: "ku(ru), kita(ru) [く(る), きた(る)]", meaning: "venir / llegar / futuro", mnemonic: "Espigas de trigo maduras que vienen traídas por las estaciones." },
  "帰": { onyomi: "KI [き]", kunyomi: "kae(ru) [かえ(る)]", meaning: "regresar / volver al hogar", mnemonic: "Una persona que limpia el hogar y vuelve a la tranquilidad tras el viaje." },
  "手": { onyomi: "SHU, ZU [しゅ, ず]", kunyomi: "te, ta [て, た]", meaning: "mano / habilidad / medio", mnemonic: "Cinco dedos extendidos mostrando la palma de la mano humana." },
  "紙": { onyomi: "SHI [し]", kunyomi: "kami [かみ]", meaning: "papel", mnemonic: "Fibras de seda (糸) aplanadas sobre una superficie lisa (氏) para escribir." },
  "時": { onyomi: "JI [じ]", kunyomi: "toki [とき]", meaning: "tiempo / hora / ocasión", mnemonic: "El sol (日) iluminando el templo (寺) donde las campanas marcan cada hora." },
  "間": { onyomi: "KAN, KEN [かん, けん]", kunyomi: "aida, ma [あいだ, ま]", meaning: "intervalo / espacio / entre", mnemonic: "La luz del sol (日) asomándose a través del quicio de las puertas cerradas (門)." },
  "今": { onyomi: "KON, KIN [こん, きん]", kunyomi: "ima [いま]", meaning: "ahora / el presente actual", mnemonic: "Un techo que une el pasado y el futuro bajo un solo instante presente." },
  "朝": { onyomi: "CHOU [ちょう]", kunyomi: "asa [あさ]", meaning: "mañana / alba / dinastía", mnemonic: "El sol naciendo entre las hierbas cuando aún se vislumbra la luna en el cielo." },
  "昼": { onyomi: "CHUU [ちゅう]", kunyomi: "hiru [ひる]", meaning: "mediodía / día claro", mnemonic: "El sol en su punto más alto cuando se detiene el trabajo de la mañana." },
  "夜": { onyomi: "YA [や]", kunyomi: "yoru, yo [よる, よ]", meaning: "noche / oscuridad nocturna", mnemonic: "Una persona cobijándose bajo su manta al caer la luna nocturna." },
  "年": { onyomi: "NEN [ねん]", kunyomi: "toshi [とし]", meaning: "año / edad / cosecha", mnemonic: "El ciclo anual de cultivo y siega del grano que mide el paso del tiempo." },
  "月": { onyomi: "GETSU, GATSU [げつ, がつ]", kunyomi: "tsuki [つき]", meaning: "luna / mes", mnemonic: "La luna creciente en el cielo nocturno con sus sombras de luz." },
  "日": { onyomi: "NICHI, JITSU [にち, じつ]", kunyomi: "hi, bi, ka [ひ, び, か]", meaning: "sol / día / Japón", mnemonic: "Un círculo solar con su núcleo energético radiante en el centro." },
  "花": { onyomi: "KA, KE [か, け]", kunyomi: "hana [はな]", meaning: "flor / belleza floral", mnemonic: "Hierba (艹) que se transforma y muta (化) en un brote de colores." },
  "火": { onyomi: "KA [か]", kunyomi: "hi, bi, ho [ひ, び, ほ]", meaning: "fuego / llama", mnemonic: "Chispas y llamaradas ascendiendo hacia el aire en una hoguera." },
  "水": { onyomi: "SUI [すい]", kunyomi: "mizu [みず]", meaning: "agua / líquido", mnemonic: "Un arroyo cristalino con sus corrientes fluyendo suavemente hacia los lados." },
  "木": { onyomi: "MOKU, BOKU [もく, ぼく]", kunyomi: "ki, ko [き, こ]", meaning: "árbol / madera", mnemonic: "Un tronco firme con ramas hacia el cielo y raíces hacia la tierra." },
  "金": { onyomi: "KIN, KON [きん, こん]", kunyomi: "kane, kana [かね, かな]", meaning: "oro / metal / dinero", mnemonic: "Pepitas de oro brillante enterradas bajo la montaña protegida." },
  "土": { onyomi: "DO, TO [ど, と]", kunyomi: "tsuchi [つち]", meaning: "tierra / suelo", mnemonic: "Un brote de vida vegetal emergiendo directamente de la tierra fértil." },
  "大": { onyomi: "DAI, TAI [だい, たい]", kunyomi: "oo(kii) [おお(きい)]", meaning: "grande / enorme / muy", mnemonic: "Una persona extendiendo sus brazos y piernas para ocupar el máximo espacio." },
  "小": { onyomi: "SHOU [しょう]", kunyomi: "chii(sai), ko, o [ちい(さい), こ, お]", meaning: "pequeño / diminuto", mnemonic: "Un objeto dividido en tres fragmentos mínimos y ligeros." },
  "高": { onyomi: "KOU [こう]", kunyomi: "taka(i) [たか(い)]", meaning: "alto / caro / elevado", mnemonic: "Una torre alta con mirador y tejado que se alza sobre la ciudad." },
  "安": { onyomi: "AN [あん]", kunyomi: "yasu(i) [やす(い)]", meaning: "barato / tranquilo / seguro", mnemonic: "Una mujer (女) descansando a salvo bajo el techo de su hogar (宀)." },
  "多": { onyomi: "TA [た]", kunyomi: "oo(i) [おお(い)]", meaning: "mucho / abundante / numeroso", mnemonic: "Dos lunas apiladas una sobre otra: abundancia de noches de celebración." },
  "好": { onyomi: "KOU [こう]", kunyomi: "su(ki), kono(mu) [す(き), この(む)]", meaning: "gustar / agradable / predilecto", mnemonic: "Una madre (女) abrazando tiernamente a su hijo pequeño (子)." },
  "目": { onyomi: "MOKU, BOKU [もく, ぼく]", kunyomi: "me, ma [め, ま]", meaning: "ojo / visión / ordinal", mnemonic: "Las líneas de un ojo con su pupila y párpados delineados." },
  "耳": { onyomi: "JI [じ]", kunyomi: "mimi [みみ]", meaning: "oreja / oído", mnemonic: "El contorno de una oreja humana atenta a captar cada sonido." },
  "口": { onyomi: "KOU, KU [こう, く]", kunyomi: "kuchi [くち]", meaning: "boca / abertura / entrada", mnemonic: "Una boca abierta pronunciando palabras y recibiendo alimento." },
  "心": { onyomi: "SHIN [しん]", kunyomi: "kokoro [こころ]", meaning: "corazón / mente / espíritu", mnemonic: "El corazón humano latiendo con sus cámaras y aurículas conectadas." }
};

// Master dictionary of particle functional components for lessons
const BRIDGE_CATALOG = {
  "wa": {
    item: "は (wa)",
    name: "Marcador de Tema Principal",
    reading: "わ",
    type: "Partícula",
    function_es: "Establece el tema sobre el que se va a predicar ('en cuanto a X, ...')",
    rule: "Se escribe con el hiragana 'は' pero se pronuncia 'wa'. Separa el foco de atención.",
    link_url: "/grammar?filter=particles"
  },
  "desu": {
    item: "です / だ",
    name: "Cópula Asertiva (Formal / Coloquial)",
    reading: "です / だ",
    type: "Cópula",
    function_es: "Afirma la identidad, cualidad o estado ('es / son / soy')",
    rule: "'です' es formal y respetuoso (Teineigo); 'だ' es coloquial y cercano.",
    link_url: "/grammar?filter=particles"
  },
  "dewaarimasen": {
    item: "〜ではありません / じゃありません",
    name: "Cópula Negativa de Identidad",
    reading: "ではありません / じゃありません",
    type: "Cópula",
    function_es: "Niega la identidad o categoría ('no es / no soy')",
    rule: "'ではありません' es formal estándar; 'じゃありません' es habitual en el habla cotidiana.",
    link_url: "/grammar?filter=particles"
  },
  "ka": {
    item: "か (ka)",
    name: "Partícula Interrogativa de Oración",
    reading: "か",
    type: "Partícula",
    function_es: "Convierte cualquier oración en una pregunta cortés sin alterar el orden",
    rule: "Se coloca al final de la frase afirmativa sustituyendo al signo de interrogación.",
    link_url: "/grammar?filter=particles"
  },
  "mo": {
    item: "も (mo)",
    name: "Partícula de Inclusión ('También / Tampoco')",
    reading: "も",
    type: "Partícula",
    function_es: "Sustituye a 'は' o 'が' para incluir un elemento idéntico",
    rule: "Reemplaza directamente a las partículas de foco para denotar 'también'.",
    link_url: "/grammar?filter=particles"
  },
  "no": {
    item: "の (no)",
    name: "Partícula de Conexión Nominal y Posesión",
    reading: "の",
    type: "Partícula",
    function_es: "Conecta dos sustantivos indicando posesión, origen, afiliación o categoría",
    rule: "[Modificador] + の + [Núcleo]: la primera palabra describe o posee a la segunda.",
    link_url: "/grammar?filter=particles"
  },
  "wo": {
    item: "を (wo / o)",
    name: "Marcador de Objeto Directo Acusativo",
    reading: "お",
    type: "Partícula",
    function_es: "Marca el receptor inmediato de la acción de un verbo transitivo",
    rule: "Se escribe con 'を' pero se pronuncia 'o'. Siempre precede a un verbo de acción.",
    link_url: "/grammar?filter=particles"
  },
  "ga": {
    item: "が (ga)",
    name: "Marcador de Sujeto Específico y Deseo/Gusto",
    reading: "が",
    type: "Partícula",
    function_es: "Identifica el sujeto gramatical exacto o el objeto de adjetivos como 好き/上手",
    rule: "A diferencia de 'は' (tema), 'が' pone el foco informativo en la palabra que precede.",
    link_url: "/grammar?filter=particles"
  },
  "ni": {
    item: "に (ni)",
    name: "Partícula de Destino, Tiempo y Existencia",
    reading: "に",
    type: "Partícula",
    function_es: "Marca el punto de llegada, momento exacto o lugar donde reside algo/alguien",
    rule: "Se usa con verbos de movimiento (行く, 来る), de existencia (ある, いる) y horas exactas.",
    link_url: "/grammar?filter=particles"
  },
  "de": {
    item: "で (de)",
    name: "Partícula de Lugar de Acción Dinámica y Medio",
    reading: "で",
    type: "Partícula",
    function_es: "Indica el lugar donde transcurre una acción o el instrumento/medio utilizado",
    rule: "Acompaña a verbos de acción activa (comer, estudiar) o medios (tren, idioma).",
    link_url: "/grammar?filter=particles"
  },
  "to": {
    item: "と (to)",
    name: "Partícula de Compañía ('Con') y Conector Exhaustivo ('Y')",
    reading: "と",
    type: "Partícula",
    function_es: "Conecta sustantivos en lista completa o señala al interlocutor/acompañante",
    rule: "Une sustantivos 'A y B'; o indica con quién se realiza una acción (友達と).",
    link_url: "/grammar?filter=particles"
  },
  "kara": {
    item: "から (kara)",
    name: "Partícula de Origen Temporal/Espacial y Causa",
    reading: "から",
    type: "Partícula",
    function_es: "Indica el punto de partida ('desde') o la justificación/motivo ('porque')",
    rule: "Con lugares/horas marca inicio; al final de una oración predica la razón.",
    link_url: "/grammar?filter=particles"
  },
  "made": {
    item: "まで (made)",
    name: "Partícula de Límite Temporal o Espacial ('Hasta')",
    reading: "まで",
    type: "Partícula",
    function_es: "Marca el término final de un desplazamiento o franja horaria",
    rule: "Frecuentemente emparejada con 'から' para acotar intervalos completos.",
    link_url: "/grammar?filter=particles"
  },
  "o_go_pref": {
    item: "お- / ご-",
    name: "Prefijos de Cortesía y Embellecimiento (Bikougo)",
    reading: "お / ご",
    type: "Prefijo",
    function_es: "Añaden respeto sincero y pulcritud social a los sustantivos",
    rule: "'お-' se usa con palabras nativas (Wago); 'ご-' con palabras sino-japonesas (Kango).",
    link_url: "/grammar?filter=particles"
  },
  "san_suf": {
    item: "〜さん",
    name: "Sufijo de Cortesía Social",
    reading: "さん",
    type: "Sufijo",
    function_es: "Tratamiento honorífico neutro hacia el interlocutor o terceras personas",
    rule: "Posponer siempre al apellido o nombre ajeno; nunca al propio nombre.",
    link_url: "/grammar?filter=particles"
  },
  "jin_suf": {
    item: "〜人 (じん)",
    name: "Sufijo de Nacionalidad y Gentilicio",
    reading: "じん",
    type: "Sufijo",
    function_es: "Transforma el nombre de un país en el gentilicio de sus ciudadanos",
    rule: "Se añade al nombre del país (Japón + 人 → japonés).",
    link_url: "/grammar?filter=particles"
  },
  "go_suf": {
    item: "〜語 (ご)",
    name: "Sufijo de Idioma y Lengua",
    reading: "ご",
    type: "Sufijo",
    function_es: "Denota la lengua o idioma hablado en un país o comunidad",
    rule: "País + 語 (ej. 日本 + 語 = idioma japonés).",
    link_url: "/grammar?filter=particles"
  },
  "te_kudasai": {
    item: "〜てください",
    name: "Sufijo de Solicitud y Petición Cortés",
    reading: "てください",
    type: "Sufijo",
    function_es: "Pide educadamente a alguien que realice una acción favorable",
    rule: "Se une a la forma て (te) del verbo.",
    link_url: "/grammar?filter=particles"
  },
  "tsu_counter": {
    item: "〜つ (tsu)",
    name: "Contador Nativo General de Objetos",
    reading: "つ",
    type: "Contador",
    function_es: "Clasificador universal de objetos inanimados del 1 al 9 (ひとつ, ふたつ...)",
    rule: "Serie nativa japonesa Wago para pedir raciones, artículos o paquetes.",
    link_url: "/grammar?filter=particles"
  },
  "nin_counter": {
    item: "〜人 (にん / り)",
    name: "Contador y Clasificador de Personas",
    reading: "にん / り",
    type: "Contador",
    function_es: "Cuenta seres humanos con irregularidades en 1 (ひとり) y 2 (ふたり)",
    rule: "De 3 en adelante sigue la serie regular numérica + にん.",
    link_url: "/grammar?filter=particles"
  },
  "masen_ka": {
    item: "〜ませんか",
    name: "Sufijo de Invitación y Propuesta Amable",
    reading: "ませんか",
    type: "Sufijo",
    function_es: "Propone realizar una actividad juntos con máxima consideración",
    rule: "Forma cortés negativa con 'か'; no presiona al interlocutor.",
    link_url: "/grammar?filter=particles"
  },
  "mashou": {
    item: "〜ましょう",
    name: "Sufijo de Iniciativa Volitiva ('¡Hagámoslo!')",
    reading: "ましょう",
    type: "Sufijo",
    function_es: "Expresa entusiasmo grupal para actuar o aceptar una invitación",
    rule: "Sustituye a 'ます' en la raíz verbal para animar a la acción.",
    link_url: "/grammar?filter=particles"
  },
  "tai": {
    item: "〜たいです",
    name: "Sufijo de Deseo Personal ('Quiero hacer...')",
    reading: "たいです",
    type: "Sufijo",
    function_es: "Expresa el anhelo del hablante de realizar una acción en primera persona",
    rule: "Se une a la raíz ます del verbo (食べます → 食べたい).",
    link_url: "/grammar?filter=particles"
  },
  "nakereba": {
    item: "〜なければなりません",
    name: "Estructura de Deber y Obligación Ineludible",
    reading: "なければなりません",
    type: "Estructura",
    function_es: "Expresa una necesidad o norma que debe cumplirse inexorablemente",
    rule: "Doble negación literal: 'si no se hace, no resulta admisible'.",
    link_url: "/grammar?filter=particles"
  },
  "hou_ga_ii": {
    item: "〜たほうがいいです",
    name: "Estructura de Consejo y Recomendación Saludable",
    reading: "たほうがいいです",
    type: "Estructura",
    function_es: "Sugiere una alternativa como la opción más prudente o beneficiosa",
    rule: "Se une a la forma pasada た del verbo recomendador.",
    link_url: "/grammar?filter=particles"
  },
  "ba_cond": {
    item: "〜ば",
    name: "Partícula Condicional Lógica y Necesaria",
    reading: "ば",
    type: "Partícula",
    function_es: "Expresa una condición natural, lógica o premisa previa",
    rule: "Se conjuga en la base e-ba de los verbos y adjetivos.",
    link_url: "/grammar?filter=particles"
  },
  "tara_cond": {
    item: "〜たら",
    name: "Partícula Condicional Temporal y Circunstancial ('Si / Cuando')",
    reading: "たら",
    type: "Partícula",
    function_es: "Plantea una hipótesis futura o un resultado condicionado al tiempo",
    rule: "Forma pasada た + ら. Muy versátil y habitual en el diálogo oral.",
    link_url: "/grammar?filter=particles"
  },
  "te_mo": {
    item: "〜ても / 〜でも",
    name: "Partícula Concesiva ('Aunque / Incluso si')",
    reading: "ても / でも",
    type: "Partícula",
    function_es: "Indica que la acción o consecuencia ocurrirá a pesar del obstáculo",
    rule: "Forma て + も.",
    link_url: "/grammar?filter=particles"
  },
  "teki_suf": {
    item: "〜的 (てき)",
    name: "Sufijo Adjetivador Sino-Japonés ('-ico / -al')",
    reading: "てき",
    type: "Sufijo",
    function_es: "Convierte un sustantivo abstracto en adjetivo de cualidad (ej. 文化的, 効率的)",
    rule: "Se sufija al sustantivo Kango y se comporta como adjetivo -na.",
    link_url: "/grammar?filter=particles"
  },
  "sama_suf": {
    item: "〜様 (さま)",
    name: "Sufijo de Máximo Respeto y Reverencia (Sonkeigo)",
    reading: "さま",
    type: "Sufijo",
    function_es: "Tratamiento honorífico supremo hacia clientes, invitados y deidades",
    rule: "Reservado para contextos formales, correspondencia (お客様, 田中様).",
    link_url: "/grammar?filter=particles"
  },
  "tachi_suf": {
    item: "〜たち",
    name: "Sufijo Pluralizador Humano",
    reading: "たち",
    type: "Sufijo",
    function_es: "Convierte una persona o pronombre en grupo humano (私 → 私たち)",
    rule: "Se adhiere a sustantivos de personas para indicar 'y su grupo'.",
    link_url: "/grammar?filter=particles"
  }
};

/**
 * Helper to build rich Kanji card from ideogram/word
 */
function createKanjiCard(charOrWord, fallbackMeaning, fallbackKana, level = 'N5') {
  // Check if single kanji in kanji.json
  if (kanjiMap.has(charOrWord)) {
    const kData = kanjiMap.get(charOrWord);
    return {
      kanji: kData.kanji,
      kana: fallbackKana || (kData.kunyomi ? kData.kunyomi.split('[')[0].trim().split(',')[0].trim() : (kData.pronunciation || '').split(',')[0].trim()),
      meaning: kData.meaning_es,
      onyomi: kData.onyomi || '',
      kunyomi: kData.kunyomi || '',
      type: `Kanji ${kData.level || level}`,
      breakdown: [
        { char: kData.kanji, reading: kData.pronunciation ? kData.pronunciation.split(',')[0].trim() : '', meaning: kData.meaning_es }
      ],
      breakdown_text: `Ideograma ${kData.kanji}: ${kData.meaning_es} (${kData.strokes || 1} trazos)`,
      mnemonic: kData.mnemonic || 'Práctica visual y caligráfica para fijar el ideograma.'
    };
  }

  // Check if in EXTRA_KANJI_DB
  if (EXTRA_KANJI_DB[charOrWord]) {
    const ex = EXTRA_KANJI_DB[charOrWord];
    return {
      kanji: charOrWord,
      kana: fallbackKana || (ex.kunyomi ? ex.kunyomi.split('[')[0].trim().split(',')[0].trim() : (ex.onyomi || '').split('[')[0].trim()),
      meaning: ex.meaning,
      onyomi: ex.onyomi || '',
      kunyomi: ex.kunyomi || '',
      type: `Kanji ${level}`,
      breakdown: [
        { char: charOrWord, reading: (ex.kunyomi || ex.onyomi || '').split('[')[0].trim().split(',')[0].trim(), meaning: ex.meaning }
      ],
      breakdown_text: `Ideograma ${charOrWord}: ${ex.meaning}`,
      mnemonic: ex.mnemonic || 'Observa los trazos característicos para consolidar la memoria visual.'
    };
  }

  // If it's a compound word (Jukugo)
  const chars = [...charOrWord].filter(c => /[\u4E00-\u9FAF]/.test(c));
  const breakdownParts = [];
  chars.forEach(c => {
    let m = 'elemento';
    let r = '';
    if (kanjiMap.has(c)) {
      const kd = kanjiMap.get(c);
      m = kd.meaning_es;
      r = kd.pronunciation ? kd.pronunciation.split(',')[0].trim() : '';
    } else if (EXTRA_KANJI_DB[c]) {
      const ed = EXTRA_KANJI_DB[c];
      m = ed.meaning;
      r = (ed.kunyomi || ed.onyomi || '').split('[')[0].trim().split(',')[0].trim();
    }
    breakdownParts.push({ char: c, reading: r, meaning: m });
  });

  const breakdownSummary = breakdownParts.map(p => `${p.char} (${p.meaning})`).join(' + ');

  return {
    kanji: charOrWord,
    kana: fallbackKana || charOrWord,
    meaning: fallbackMeaning || 'Término de la lección',
    onyomi: breakdownParts.map(p => p.reading).filter(Boolean).join(', ') || '',
    kunyomi: fallbackKana || '',
    type: chars.length > 1 ? 'Jukugo' : `Kanji ${level}`,
    breakdown: breakdownParts.length > 0 ? breakdownParts : [
      { char: charOrWord, reading: fallbackKana || '', meaning: fallbackMeaning || '' }
    ],
    breakdown_text: breakdownParts.length > 1 ? `${breakdownSummary} → "${fallbackMeaning || charOrWord}"` : `Término clave de la lección: ${fallbackMeaning || ''}`,
    mnemonic: breakdownParts.length > 1 
      ? `Combinación morfológica: la unión de ${breakdownParts.map(p => p.char).join(' y ')} sintetiza el concepto.`
      : 'Asocia el ideograma con su contexto habitual en los diálogos del curso.'
  };
}

/**
 * Process all modules
 */
let enrichedKanjiCount = 0;
let enrichedBridgeCount = 0;

curr.forEach((mod) => {
  const modLevel = mod.level || 'N5';
  (mod.sections || []).forEach((sec) => {
    if (sec.is_exercise_step) return;

    // 1. EXTRACT & ENRICH KANJIS / JUKUGO
    const existingKanjis = sec.kanji_jukugo || [];
    const seenKanjiKeys = new Set(existingKanjis.map(k => k.kanji));

    const newKanjiList = [...existingKanjis];

    // Extract all vocabulary terms with kanji in this step
    const vocabWithKanji = (sec.vocab || []).filter(v => /[\u4E00-\u9FAF]/.test(v.kanji));

    // A. Add vocabulary Jukugo compounds
    vocabWithKanji.forEach(v => {
      if (!seenKanjiKeys.has(v.kanji)) {
        seenKanjiKeys.add(v.kanji);
        newKanjiList.push(createKanjiCard(v.kanji, v.meaning, v.kana, modLevel));
      }
    });

    // B. Add individual root kanji characters present in those words
    vocabWithKanji.forEach(v => {
      const chars = [...v.kanji].filter(c => /[\u4E00-\u9FAF]/.test(c));
      chars.forEach(c => {
        if (!seenKanjiKeys.has(c)) {
          seenKanjiKeys.add(c);
          let m = '';
          let r = '';
          if (kanjiMap.has(c)) {
            m = kanjiMap.get(c).meaning_es;
            r = kanjiMap.get(c).pronunciation;
          } else if (EXTRA_KANJI_DB[c]) {
            m = EXTRA_KANJI_DB[c].meaning;
            r = EXTRA_KANJI_DB[c].kunyomi || EXTRA_KANJI_DB[c].onyomi;
          }
          if (m) {
            newKanjiList.push(createKanjiCard(c, m, r, modLevel));
          }
        }
      });
    });

    // Cap between 4 and 8 items per step for clean didactic balance
    // Ensure Jukugo compounds are at front, followed by key root kanjis
    newKanjiList.sort((a, b) => {
      const aIsJukugo = (a.type || '').includes('Jukugo') || a.kanji.length > 1;
      const bIsJukugo = (b.type || '').includes('Jukugo') || b.kanji.length > 1;
      if (aIsJukugo && !bIsJukugo) return -1;
      if (!aIsJukugo && bIsJukugo) return 1;
      return 0;
    });

    const finalKanjiList = newKanjiList.slice(0, 8);
    sec.kanji_jukugo = finalKanjiList;
    enrichedKanjiCount += finalKanjiList.length;

    // 2. EXTRACT & ENRICH FUNCTIONAL BRIDGE (PARTICLES & PREFIXES)
    const existingBridge = sec.functional_bridge || [];
    const seenBridgeItems = new Set(existingBridge.map(b => b.item));

    const newBridgeList = [...existingBridge];

    // Helper to add a bridge element if not present
    function addBridgeIfMissing(catKey, exampleSentence) {
      const cat = BRIDGE_CATALOG[catKey];
      if (cat && !seenBridgeItems.has(cat.item)) {
        seenBridgeItems.add(cat.item);
        const exList = exampleSentence ? [exampleSentence] : [
          { jp: `${cat.item}を使った自然な表現です。`, kana: `${cat.item}をつかったひょうげんです。`, es: `Expresión natural y habitual con ${cat.item}.` }
        ];
        newBridgeList.push({
          item: cat.item,
          name: cat.name,
          reading: cat.reading,
          type: cat.type,
          function_es: cat.function_es,
          rule: cat.rule,
          examples: exList,
          link_url: cat.link_url
        });
      }
    }

    // Inspect grammar points and title for functional patterns
    const allText = [
      sec.title || '',
      sec.objective || '',
      ...(sec.grammar_points || []).map(g => `${g.title} ${g.formula} ${g.explanation}`),
      ...(sec.vocab || []).map(v => `${v.kanji} ${v.kana} ${v.type}`)
    ].join(' ');

    // Match relevant particles and components based on lesson themes
    if (allText.includes('は') && !seenBridgeItems.has('は (wa)')) {
      addBridgeIfMissing('wa', { jp: '私は学生です。', kana: 'わたしはがくせいです。', es: 'Yo soy estudiante.' });
    }
    if ((allText.includes('です') || allText.includes('だ')) && !seenBridgeItems.has('です / だ')) {
      addBridgeIfMissing('desu', { jp: '田中さんです。', kana: 'たなかさんです。', es: 'Es el señor Tanaka.' });
    }
    if ((allText.includes('ではありません') || allText.includes('じゃありません')) && !seenBridgeItems.has('〜ではありません / じゃありません')) {
      addBridgeIfMissing('dewaarimasen', { jp: '学生ではありません。', kana: 'がくせいではありません。', es: 'No soy estudiante.' });
    }
    if (allText.includes('か') && (allText.includes('ですか') || allText.includes('質問') || allText.includes('interrogat')) && !seenBridgeItems.has('か (ka)')) {
      addBridgeIfMissing('ka', { jp: '日本語が分かりますか。', kana: 'にほんごがわかりますか。', es: '¿Entiende japonés?' });
    }
    if ((allText.includes('も') || allText.includes('también') || allText.includes('inclusión')) && !seenBridgeItems.has('も (mo)')) {
      addBridgeIfMissing('mo', { jp: '私も日本人です。', kana: 'わたしもにほんじんです。', es: 'Yo también soy japonés.' });
    }
    if ((allText.includes('の') || allText.includes('posesión') || allText.includes('conexión')) && !seenBridgeItems.has('の (no)')) {
      addBridgeIfMissing('no', { jp: '私の本です。', kana: 'わたしのほんです。', es: 'Es mi libro.' });
    }
    if ((allText.includes('を') || allText.includes('objeto directo')) && !seenBridgeItems.has('を (wo / o)')) {
      addBridgeIfMissing('wo', { jp: '水を飲みます。', kana: 'みずをのみます。', es: 'Bebo agua.' });
    }
    if ((allText.includes('が') || allText.includes('好き') || allText.includes('gusto')) && !seenBridgeItems.has('が (ga)')) {
      addBridgeIfMissing('ga', { jp: '日本料理が好きです。', kana: 'にほんりょうりがすきです。', es: 'Me gusta la comida japonesa.' });
    }
    if ((allText.includes('に') || allText.includes('tiempo') || allText.includes('residencia') || allText.includes('destino')) && !seenBridgeItems.has('に (ni)')) {
      addBridgeIfMissing('ni', { jp: '東京に住んでいます。', kana: 'とうきょうにすんでいます。', es: 'Vivo en Tokio.' });
    }
    if ((allText.includes('で') || allText.includes('lugar') || allText.includes('medio') || allText.includes('idioma')) && !seenBridgeItems.has('で (de)')) {
      addBridgeIfMissing('de', { jp: '電車で行きます。', kana: 'でんしゃでいきます。', es: 'Voy en tren.' });
    }
    if ((allText.includes('と') || allText.includes('compañía') || allText.includes('amigo')) && !seenBridgeItems.has('と (to)')) {
      addBridgeIfMissing('to', { jp: '友達と話します。', kana: 'ともだちとはなします。', es: 'Hablo con un amigo.' });
    }
    if (allText.includes('から') && !seenBridgeItems.has('から (kara)')) {
      addBridgeIfMissing('kara', { jp: '駅から歩きます。', kana: 'えきからあるきます。', es: 'Camino desde la estación.' });
    }
    if (allText.includes('まで') && !seenBridgeItems.has('まで (made)')) {
      addBridgeIfMissing('made', { jp: '五時まで働きます。', kana: 'ごじまではたらきます。', es: 'Trabajo hasta las cinco.' });
    }
    if ((allText.includes('お-') || allText.includes('ご-') || allText.includes('Bikougo') || allText.includes('cortesía')) && !seenBridgeItems.has('お- / ご-')) {
      addBridgeIfMissing('o_go_pref', { jp: 'お茶をどうぞ。', kana: 'おちゃをどうぞ。', es: 'Por favor, tome un té.' });
    }
    if ((allText.includes('さん') || allText.includes('honorífico')) && !seenBridgeItems.has('〜さん')) {
      addBridgeIfMissing('san_suf', { jp: 'こちらはマリアさんです。', kana: 'こちらはまりあさんです。', es: 'Ésta es la señorita María.' });
    }
    if ((allText.includes('じん') || allText.includes('〜人') || allText.includes('nacionalidad')) && !seenBridgeItems.has('〜人 (じん)')) {
      addBridgeIfMissing('jin_suf', { jp: '私はスペイン人です。', kana: 'わたしはすぺいんじんです。', es: 'Soy español/a.' });
    }
    if ((allText.includes('〜語') || allText.includes('idioma')) && !seenBridgeItems.has('〜語 (ご)')) {
      addBridgeIfMissing('go_suf', { jp: '英語が話せます。', kana: 'えいごがはなせます。', es: 'Puedo hablar inglés.' });
    }
    if ((allText.includes('てください') || allText.includes('petición')) && !seenBridgeItems.has('〜てください')) {
      addBridgeIfMissing('te_kudasai', { jp: 'ゆっくり話してください。', kana: 'ゆっくりはなしてください。', es: 'Por favor, hable despacio.' });
    }
    if ((allText.includes('〜つ') || allText.includes('ひとつ') || allText.includes('contador')) && !seenBridgeItems.has('〜つ (tsu)')) {
      addBridgeIfMissing('tsu_counter', { jp: 'これを一つください。', kana: 'これをひとつください。', es: 'Deme uno de estos, por favor.' });
    }
    if ((allText.includes('〜たい') || allText.includes('deseo')) && !seenBridgeItems.has('〜たいです')) {
      addBridgeIfMissing('tai', { jp: '日本へ行きたいです。', kana: 'にほんへいきたいです。', es: 'Quiero ir a Japón.' });
    }
    if ((allText.includes('なければ') || allText.includes('obligación')) && !seenBridgeItems.has('〜なければなりません')) {
      addBridgeIfMissing('nakereba', { jp: '薬を飲まなければなりません。', kana: 'くすりをのまなければなりません。', es: 'Debo tomar la medicina.' });
    }
    if ((allText.includes('たら') || allText.includes('si ')) && !seenBridgeItems.has('〜たら')) {
      addBridgeIfMissing('tara_cond', { jp: '時間があったら、行きましょう。', kana: 'じかんがあったら、いきましょう。', es: 'Si hay tiempo, vamos.' });
    }
    if (allText.includes('様') && !seenBridgeItems.has('〜様 (さま)')) {
      addBridgeIfMissing('sama_suf', { jp: 'お客様、こちらへどうぞ。', kana: 'おきゃくさま、こちらへどうぞ。', es: 'Estimado cliente, por aquí por favor.' });
    }

    // Ensure every step has at least 2 and at most 4 bridge items
    if (newBridgeList.length < 2) {
      addBridgeIfMissing('wa');
      addBridgeIfMissing('desu');
    }

    const finalBridgeList = newBridgeList.slice(0, 4);
    sec.functional_bridge = finalBridgeList;
    enrichedBridgeCount += finalBridgeList.length;
  });
});

fs.writeFileSync(CURRICULUM_PATH, JSON.stringify(curr, null, 2), 'utf8');

console.log('✅ Currículum enriquecido con éxito:');
console.log(`- Total kanjis/jukugo registrados en los 69 pasos: ${enrichedKanjiCount}`);
console.log(`- Total elementos funcionales puente en los 69 pasos: ${enrichedBridgeCount}`);
