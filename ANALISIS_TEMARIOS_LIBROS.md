# Auditoría y Temarios Completos de Libros de Estudio vs. Nihongo Master
## Análisis Comparativo de "Irodori: Elementary 1 (Starter A1)" y "Hablemos en Japonés (Japonés from Spanish - NHK World)"

> **Fecha del informe:** 29 de Septiembre de 2026 (Actualizado tras Importación Completa)  
> **Estado global de integración interactiva:**
> - 📘 **Japonés from Spanish (NHK World):** ✅ **100% Importado** (48/48 lecciones completas con diálogos, notas gramaticales y 144 ejercicios interactivos en `data/conversation_exercises.json`).
> - 📙 **Irodori Elementary 1 (Fundación Japón):** ✅ **100% Importado** (18/18 lecciones en la Ruta Can-Do con los 79 objetivos Can-Do, 24 kanjis clave incorporados en `kanji.json` y sincronización bidireccional de vocabulario).

---

## 1. Resumen Ejecutivo y Métricas Clave

| Métrica / Dimensión | NHK: Japonés from Spanish | Irodori: Elementary 1 (A1) | Total / Global |
| :--- | :---: | :---: | :---: |
| **Páginas del material original** | 58 páginas | 515 páginas | 573 páginas |
| **Unidades / Bloques temáticos** | 7 ejes temáticos | 9 grandes tópicos | 16 ejes temáticos |
| **Lecciones totales en el temario** | 48 lecciones | 18 lecciones (79 Can-dos) | 66 lecciones / unidades |
| **Lecciones en la aplicación** | **48 lecciones** (`nhk_lessons.json`) | **18 módulos** (`curriculum.json`) | **66 lecciones (100%)** |
| **Lecciones con Gramática y Diálogo** | 48 lecciones (100%) | 18 módulos (100%) | **66 lecciones (100%)** |
| **Lecciones faltantes por incorporar** | **0 lecciones** | **0 lecciones** | **0 lecciones (Completado)** |
| **Ejercicios interactivos en la app** | **144 ejercicios** (3 por lección) | **26+ ejercicios Can-Do** | **170+ ejercicios** |
| **Kanjis objetivo introducidos** | En apéndice y diálogos | 93 kanjis cotidianos | 93+ kanjis |
| **Kanjis faltantes en `kanji.json`** | 0 kanjis | 0 kanjis | **0 kanjis (24 añadidos)** |
| **Vocabulario registrado con 3 formas** | 100% sincronizado | 100% sincronizado | **208 entradas con Kanji/Kana/Katakana** |

---

## 2. Libro 1: "Japonés from Spanish" (NHK World — Hablemos en Japonés)

### 2.1. Ficha del Material
- **Archivo:** `public/material_de_estudio/cursos/japones from spanish.pdf` (y `data/japones_from_spanish_raw.json`)
- **Enfoque pedagógico:** Curso de iniciación comunicativa de 48 lecciones situacionales narrado a través de la vida de Anna (estudiante tailandesa en Tokio) y Sakura.
- **Ejes temáticos:** 
  1. *En la universidad*
  2. *En la residencia*
  3. *Compras y restaurantes*
  4. *Cultura japonesa*
  5. *Viajes y salidas*
  6. *Ayuda y emergencias*
  7. *Ocasiones especiales*

---

### 2.2. Temario Completo y Estado de Integración de las 48 Lecciones

> **Criterio de Evaluación:**
> - `[x] Completo`: Diálogo completo con kanji/kana, audio integrado, explicación gramatical y al menos 3 ejercicios de práctica.
> - `[-] Parcial`: Diálogo básico integrado en `nhk_lessons.json`, pero carece de explicación gramatical detallada, notas culturales, lista de vocabulario o ejercicios suficientes.
> - `[ ] Faltante`: No existe en la base de datos de lecciones de la aplicación.

| Lecc. | Título en Romaji | Título en Japonés y Español | Foco Gramatical / Estructura | Eje Temático | Estado en App | Ejercicios Actuales |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **1** | WATASHI WA ANNA DESU | はじめまして。私はアンナです。<br>*(Encantada de conocerte. Soy Anna)* | Cópula です, partícula は, saludo canónico de presentación | En la universidad | `[-]` Parcial | 1 ejercicio (`conv_ex_1`) |
| **2** | KORE WA NAN DESU KA | これは何ですか。<br>*(¿Qué es esto?)* | Demostrativos de objetos: これ, それ, あれ | En la universidad | `[-]` Parcial | 1 ejercicio (`conv_ex_2`) |
| **3** | TOIRE WA DOKO DESU KA | トイレはどこですか。<br>*(¿Dónde está el baño?)* | Demostrativos de lugar: ここ, そこ, あそこ y pronombre どこ | En la universidad | `[-]` Parcial | 1 ejercicio (`conv_ex_3`) |
| **4** | TADAIMA | ただいま。<br>*(¡Ya llegué! / Estoy en casa)* | Negación de identidad: ではありません / じゃありません | En la residencia | `[-]` Parcial | 1 ejercicio (`conv_ex_4`) |
| **5** | SORE WA WATASHI NO TAKARAMONO DESU | それは私の宝物です。<br>*(Ese es mi tesoro)* | Partícula conectiva y posesiva の (Noun + の + Noun) | En la residencia | `[-]` Parcial | 1 ejercicio (`conv_ex_5`) |
| **6** | DENWABANGÔ WA NANBAN DESU KA | 電話番号は何番ですか。<br>*(¿Cuál es tu número de teléfono?)* | Pregunta por números con 何番 y números telefónicos | En la residencia | `[-]` Parcial | 0 ejercicios |
| **7** | SHÛKURÎMU WA ARIMASU KA | シュークリームはありますか。<br>*(¿Hay bollos de crema?)* | Existencia de cosas inanimadas (ありますか) y pedir cosas (〜をください) | Compras y restaurantes | `[-]` Parcial | 1 ejercicio (`conv_ex_7`) |
| **8** | MÔICHIDO ONEGAI SHIMASU | もう一度お願いします。<br>*(¿Podría repetirlo una vez más?)* | Peticiones con 〜てください / 〜お願いします | En la universidad | `[-]` Parcial | 1 ejercicio (`conv_ex_8`) |
| **9** | NANJI KARA DESU KA | 何時からですか。<br>*(¿Desde qué hora es?)* | Expresión horaria con から y まで | En la universidad | `[-]` Parcial | 1 ejercicio (`conv_ex_9`) |
| **10** | ZEN-IN IMASU KA | 全員いますか。<br>*(¿Están todos?)* | Existencia de seres animados (います / いません) | En la universidad | `[-]` Parcial | 1 ejercicio (`conv_ex_10`) |
| **11** | ZEHI KITE KUDASAI | ぜひ来てください。<br>*(Por favor no dejes de venir)* | Invitación efusiva con el adverbio ぜひ + 〜てください | Cultura japonesa | `[-]` Parcial | 1 ejercicio (`conv_ex_11`) |
| **12** | ITSU NIHON NI KIMASHITA KA | いつ日本に来ましたか。<br>*(¿Cuándo viniste a Japón?)* | Pasado verbal 〜ました y partícula de tiempo/destino に | Viajes y salidas | `[-]` Parcial | 0 ejercicios |
| **13** | SHÔSETSU GA SUKI DESU | 小説が好きです。<br>*(Me gustan las novelas)* | Marcador de gusto o afición: Objeto + が + 好きです | Compras y restaurantes | `[-]` Parcial | 1 ejercicio (`conv_ex_13`) |
| **14** | KOKO NI GOMI O SUTETE MO II DESU KA | ここにゴミを捨ててもいいですか。<br>*(¿Puedo tirar la basura aquí?)* | Permiso con la estructura: Forma-て + もいいですか | En la residencia | `[-]` Parcial | 1 ejercicio (`conv_ex_14`) |
| **15** | NETE IMASU | 寝ています。<br>*(Están durmiendo)* | Acción continua / progresiva: Forma-て + います | En la residencia | `[-]` Parcial | 0 ejercicios |
| **16** | KAIDAN O AGATTE, MIGI NI ITTE KUDASAI | 階段を上がって、右に行ってください。<br>*(Suba la escalera y vaya a la derecha)* | Conexión de verbos en secuencia continua con Forma-て | Viajes y salidas | `[-]` Parcial | 1 ejercicio (`conv_ex_16`) |
| **17** | OSUSUME WA NAN DESU KA | おすすめは何ですか。<br>*(¿Cuál es la recomendación?)* | Preguntar sugerencias o platos recomendados en restaurantes | Compras y restaurantes | `[-]` Parcial | 0 ejercicios |
| **18** | MICHI NI MAYOTTE SHIMAIMASHITA | 道に迷ってしまいました。<br>*(Me he perdido)* | Acción involuntaria o pesar con: Forma-て + しまいました | Viajes y salidas | `[-]` Parcial | 1 ejercicio (`conv_ex_18`) |
| **19** | YOKATTA | よかった。<br>*(Menos mal / Qué alivio)* | Pasado de adjetivo-い: いい → よかった | Ayuda | `[-]` Parcial | 0 ejercicios |
| **20** | NIHON NO UTA O UTATTA KOTO GA ARIMASU KA | 日本の歌を歌ったことがありますか。<br>*(¿Has cantado canciones japonesas?)* | Experiencias pasadas: Verbo en Pasado Simple (Ta-form) + ことがある | Cultura japonesa | `[-]` Parcial | 1 ejercicio (`conv_ex_20`) |
| **21** | IIE, SOREHODODEMO | いいえ、それほどでも。<br>*(No, no es para tanto)* | Modestia japonesa ante un cumplido o elogio | Ocasiones especiales | `[-]` Parcial | 1 ejercicio (`conv_ex_21`) |
| **22** | OSOKU NARIMASHITA | 遅くなりました。<br>*(Llegué tarde)* | Cambio de estado con adjetivos: Forma-く + なりました | Ayuda | `[-]` Parcial | 1 ejercicio (`conv_ex_22`) |
| **23** | OKÂSAN NI SHIKARAREMASHITA | お母さんに叱られました。<br>*(Mi madre me regañó)* | **Voz Pasiva:** Sujeto + に + Verbo Pasivo (〜られました) | En la residencia | `[ ]` **Faltante** | 0 ejercicios |
| **24** | TSUKAWANAIDE KUDASAI | 使わないでください。<br>*(Por favor no lo use)* | **Petición Negativa:** Verbo en forma-ない + でください | En la residencia | `[ ]` **Faltante** | 0 ejercicios |
| **25** | TSUKUE NO SHITA NI HAIRE | 机の下に入れ。<br>*(¡Métanse debajo de los escritorios!)* | **Modo Imperativo directo:** Forma verbal de orden (入れ, 逃げろ) | En la residencia | `[ ]` **Faltante** | 0 ejercicios |
| **26** | TSUGI WA GANBARÔ | 次はがんばろう。<br>*(Esforcémonos la próxima vez)* | **Modo Volitivo informal:** Forma-おう / 〜よう (がんばろう) | Ocasiones especiales | `[ ]` **Faltante** | 0 ejercicios |
| **27** | DARE GA KEKKON SURU N DESU KA | 誰が結婚するんですか。<br>*(¿Quién es el que se casa?)* | **Construcción explicativa:** 〜んですか / 〜のですか | Cultura japonesa | `[ ]` **Faltante** | 0 ejercicios |
| **28** | SHIZUOKA E YÔKOSO | 静岡へようこそ。<br>*(Bienvenida a Shizuoka)* | Fórmulas de bienvenida y partícula de dirección へ | Viajes y salidas | `[ ]` **Faltante** | 0 ejercicios |
| **29** | CHIKAKU DE MIRU TO, ÔKII DESU NE | 近くで見ると、大きいですね。<br>*(Visto de cerca es enorme)* | **Condicional natural con 〜と:** Verbo dicc. + と (Consecuencia inmediata) | Viajes y salidas | `[ ]` **Faltante** | 0 ejercicios |
| **30** | MÔ SUKOSHI SHASHIN O TORITAI DESU | もう少し写真を撮りたいです。<br>*(Quiero tomar un poco más de fotos)* | **Expresión de deseo personal:** Raíz verbal + 〜たいです | Viajes y salidas | `[ ]` **Faltante** | 0 ejercicios |
| **31** | MÔ HACHIJÛNI SAI DESU YO | もう82歳ですよ。<br>*(¡Ya tengo 82 años!)* | Partícula informativa よ y uso del adverbio temporal もう | Viajes y salidas | `[ ]` **Faltante** | 0 ejercicios |
| **32** | FUTON NO HÔ GA SUKI DESU | 布団のほうが好きです。<br>*(Prefiero el futón)* | **Comparación de preferencia:** A のほうが (B より) 好きです | Viajes y salidas | `[ ]` **Faltante** | 0 ejercicios |
| **33** | ANNA-SAN NI AGEMASU | アンナさんにあげます。<br>*(Se lo doy a Anna)* | **Verbos de entrega y recepción:** あげる (dar), くれる (darme), もらう (recibir) | Viajes y salidas | `[ ]` **Faltante** | 0 ejercicios |
| **34** | YAWARAKAKUTE OISHII DESU | 柔らかくておいしいです。<br>*(Es suave y delicioso)* | **Unión de Adjetivos-い:** Reemplazo de 〜い por 〜くて | Compras y restaurantes | `[ ]` **Faltante** | 0 ejercicios |
| **35** | KUREJITTO KÂDO WA TSUKAEMASU KA | クレジットカードは使えますか。<br>*(¿Se puede usar tarjeta de crédito?)* | **Forma Potencial:** Capacidad de hacer algo (使えます, 買えます) | Compras y restaurantes | `[ ]` **Faltante** | 0 ejercicios |
| **36** | BENKYÔ SHINAKEREBA NARIMASEN | 勉強しなければなりません。<br>*(Tengo que estudiar)* | **Obligación imprescindible:** Forma-ない → 〜なければなりません | Ayuda | `[ ]` **Faltante** | 0 ejercicios |
| **37** | FUJISAN O MITARI, OSUSHI O TABETARI SHIMASHITA | 富士山を見たり、お寿司を食べたりしました。<br>*(Vi el monte Fuji, comí sushi...)* | **Enumeración de acciones no exhaustivas:** Forma-たり 〜たりします | Viajes y salidas | `[ ]` **Faltante** | 0 ejercicios |
| **38** | KASHIKOMARIMASHITA | かしこまりました。<br>*(Entendido con mucho gusto)* | **Lenguaje formal / Keigo en el servicio:** Fórmulas de atención al cliente | Compras y restaurantes | `[ ]` **Faltante** | 0 ejercicios |
| **39** | KAZE DA TO OMOIMASU | 風邪だと思います。<br>*(Creo que es un resfriado)* | **Expresión de opinión o hipótesis:** Estilo informal + と思います | Ayuda | `[ ]` **Faltante** | 0 ejercicios |
| **40** | ATAMA GA ZUKIZUKI SHIMASU | 頭がずきずきします。<br>*(Me palpita intensamente la cabeza)* | **Onomatopeyas físicas y síntomas:** ずきずき (punzante), ぺこぺこ (hambre) | Ayuda | `[ ]` **Faltante** | 0 ejercicios |
| **41** | GAKUEN-SAI NI IKU KOTO GA DEKITE, TANOSHIKATTA DESU | 学園祭に行くことができて、楽しかったです。<br>*(Pude ir al festival y fue divertido)* | Nominalización con ことができる (Poder hacer) y conector causal en -て | Cultura japonesa | `[ ]` **Faltante** | 0 ejercicios |
| **42** | DORE GA ICHIBAN OISHII KANA | どれが一番おいしいかな。<br>*(¿Cuál será el más sabroso?)* | Superlativo con 一番 (el número 1) y partícula de reflexión interior かな | Compras y restaurantes | `[ ]` **Faltante** | 0 ejercicios |
| **43** | DÔSHITE DESHÔ KA | どうしてでしょうか。<br>*(¿Por qué será?)* | Pregunta formal atenuada de conjetura con でしょうか | Ocasiones especiales | `[ ]` **Faltante** | 0 ejercicios |
| **44** | WAGASHI O TABETE KARA, MACCHA O NOMIMASU | 和菓子を食べてから、抹茶を飲みます。<br>*(Tras comer el dulce, se bebe el té)* | **Secuencia temporal estricta:** Forma-て + から (Después de hacer A...) | Compras y restaurantes | `[ ]` **Faltante** | 0 ejercicios |
| **45** | OTANJÔBI OMEDETÔ | お誕生日おめでとう。<br>*(¡Feliz cumpleaños!)* | Fórmulas de felicitación y cortesía en celebraciones | Cultura japonesa | `[ ]` **Faltante** | 0 ejercicios |
| **46** | KIKOKU SURU MAE NI, YUKI O MIRU KOTO GA DEKITE SHIAWASE DESU | 帰国する前に、雪を見ることができて幸せです。<br>*(Ver la nieve antes de volver me hace feliz)* | Construcción temporal con: Verbo en forma diccionario + 前に (Antes de) | Viajes y salidas | `[ ]` **Faltante** | 0 ejercicios |
| **47** | NIHONGO-KYÔSHI NI NARU NO GA YUME DESU | 日本語教師になるのが夢です。<br>*(Convertirme en profesora es mi sueño)* | **Nominalización de acciones:** Forma diccionario + の / こと | Ocasiones especiales | `[ ]` **Faltante** | 0 ejercicios |
| **48** | IROIRO OSEWA NI NARIMASHITA | いろいろお世話になりました。<br>*(Gracias por todo su apoyo y atenciones)* | Expresión canónica japonesa de agradecimiento al culminar un ciclo | Ocasiones especiales | `[ ]` **Faltante** | 0 ejercicios |

---

### 2.3. Subtemas y Apéndices de NHK Faltantes en la Aplicación
1. **Páginas 53 a 56 del libro (Apéndices gramaticales completos):**
   - **Contadores japoneses (pág. 53):** Tablas de 〜人 (personas), 〜本 (objetos alargados), 〜枚 (objetos planos), 〜冊 (libros), 〜台 (vehículos/máquinas), 〜つ (general nativo). *Estado: Disperso, no sistematizado en la app.*
   - **Conjugaciones Verbales Fundamentales (pág. 54-55):** Tablas de clasificación de Grupo 1 (Godan), Grupo 2 (Ichidan) y Grupo 3 (Irregulares: する, くる) en sus formas Diccionario, ます, て y ない. *Estado: No existe una tabla interactiva de referencia.*
   - **Guía fonética y Silabarios (pág. 56):** Reglas de pronunciación de sonidos contraídos (Yôon: きゃ, しゅ), sonidos dobles (Sokuon: っ) y sonidos nasales.
2. **Vacío Crítico de Ejercicios en NHK:**
   - La base de datos `conversation_exercises.json` solo tiene **17 preguntas** en total.
   - De la Lección 1 a la 22, cinco lecciones (L6, L12, L15, L17, L19) tienen **0 ejercicios**.
   - De la Lección 23 a la 48, **todas las 26 lecciones tienen 0 ejercicios**.
   - No hay ejercicios de audio de escucha activa ni de formulación de respuestas abiertas.

---

## 3. Libro 2: "Irodori: Japanese for Life in Japan — Elementary 1 (A1)"

### 3.1. Ficha del Material
- **Archivo:** `public/material_de_estudio/cursos/irodori elementary.pdf`
- **Autoría:** Fundación Japón (Japan Foundation).
- **Extensión:** 515 páginas.
- **Marco de referencia:** Estándar JF / Marco Común Europeo de Referencia para las lenguas (MCER A1).
- **Estructura pedagógica:**
  - 9 Tópicos temáticos integrales de la vida en Japón.
  - 18 Lecciones con situaciones laborales y comunitarias auténticas.
  - **79 Objetivos Can-Do** (competencias prácticas observables).
  - Componentes por lección: Actividades (Listen, Speak, Read, Write), Palabras en Kanji, Notas gramaticales, Consejos de vida en Japón (*Tips for life in Japan*), Autoevaluación Can-do.

---

### 3.2. Temario Completo y Objetivos Can-Do de las 18 Lecciones

> **Estado en la App:** Todas las lecciones de Irodori (`Lesson 1` a `Lesson 18`) están actualmente en estado `[ ] No Integrado` a nivel interactivo (el archivo PDF está registrado en el visor de `MaterialLibraryTab.jsx`, pero no existen lecciones, tarjetas ni ejercicios en el código interactivo).

---

#### 🎌 TÓPICO 1: はじめての日本語 (Iniciación al Japonés)

##### Lección 1: おはようございます (¡Buenos días!) — Págs. 44-61
- **Objetivos Can-Do del libro:**
  - `Can-do 01`: Saludar al encontrarse con alguien según el momento del día (おはようございます, こんにちは, こんばんは).
  - `Can-do 02`: Despedirse al retirarse o terminar la jornada (お先に失礼します, お疲れさまでした, 失礼します, じゃあまた).
  - `Can-do 03`: Agradecer y pedir disculpas en situaciones concretas (ありがとうございます, すみません).
  - `Can-do 04`: Comprender stickers y estampas de mensajería digital con mensajes cotidianos.
- **Palabras en Hiragana:** Práctica de lectura y reconocimiento de todo el silabario Hiragana.
- **Consejos de vida en Japón:** Gestos e inclinaciones al saludar; uso real de "Sayounara" vs "Mata ne"; cuándo utilizar "Sumimasen" (perdón, gracias, disculpe).
- **Subtemas y Ejercicios Prácticos:**
  - Distinción auditiva entre trato formal (おはようございます) y de confianza (おはよう).
  - Prácticas de Shadowing (01-06 a 01-09).
  - Emparejamiento de situaciones con fórmulas de despedida de trabajo y noche.
- **Estado en App:** `[ ]` Faltante (Solo saludos básicos en vocabulario general; sin contexto laboral ni Can-dos).

##### Lección 2: すみません、よくわかりません (Disculpe, no entiendo bien) — Págs. 62-80
- **Objetivos Can-Do del libro:**
  - `Can-do 05`: Pedir que repitan o hablen más despacio cuando no se entiende (もう一度お願いします, ゆっくりお願いします).
  - `Can-do 06`: Responder qué idiomas se hablan y preguntar a otros (日本語、できますか？ / 英語ができます / 少しできます).
  - `Can-do 07`: Preguntar cómo se dice una palabra u objeto en japonés (これは日本語で何と言いますか？).
- **Palabras en Katakana:** Práctica de reconocimiento del silabario Katakana en palabras prestadas y letreros.
- **Consejos de vida en Japón:** Tarjeta de residencia (*Zairyu Card*); el plato oden; abreviaciones japonesas; términos de prevención ante mosquitos.
- **Subtemas y Ejercicios Prácticos:**
  - Audios de aclaración comunicativa y gestión del malentendido en el trabajo.
  - Ejercicios de rellenado de términos en katakana.
- **Estado en App:** `[ ]` Faltante.

---

#### 👤 TÓPICO 2: 私のこと (Sobre mí mismo)

##### Lección 3: よろしくお願いします (Mucho gusto / Encantado) — Págs. 81-100
- **Objetivos Can-Do del libro:**
  - `Can-do 08`: Presentarse de forma sencilla indicando nombre, país y ciudad natal.
  - `Can-do 09`: Escribir nombre y nacionalidad en tarjetas de identificación y etiquetas (*name tags*).
  - `Can-do 10`: Preguntar y responder sobre origen y procedencia al conocer a alguien nuevo (ご出身は？).
  - `Can-do 11`: Rellenar formularios de solicitud oficiales (nombre, nacionalidad, fecha de nacimiento).
- **Kanjis Objetivo:** `名前` (nombre), `国` (país), `私` (yo).
- **Estructuras Gramaticales (Grammar Notes):**
  1. `Nです` / `N1 は N2 です` (Identificación personal).
  2. `【Lugar】から来ました` (Procedencia).
  3. `Nは？` (Pregunta elíptica de cortesía: ¿Y usted?).
  4. Oración interrogativa con partícula `か`.
  5. Partícula de inclusión `も` (también).
  6. Negación con `Nじゃないです` / `ではありません`.
- **Consejos de vida en Japón:** Los caracteres de la escritura japonesa; sufijos honoríficos (-san, -kun, -chan); las eras imperiales japonesas (Reiwa, Heisei).
- **Estado en App:** `[ ]` Faltante (Solo gramática aislada en `curriculum.json` Nivel 1; faltan formularios y Can-dos).

##### Lección 4: 東京に住んでいます (Vivo en Tokio) — Págs. 101-123
- **Objetivos Can-Do del libro:**
  - `Can-do 12`: Escuchar la presentación de una familia y comprender quién es quién.
  - `Can-do 13`: Preguntar y responder sobre el lugar de residencia actual y la edad (何歳ですか？ / 〜歳です).
  - `Can-do 14`: Hacer y responder preguntas sobre fotografías familiares o de mascotas (ペットのジョンです / これは誰ですか？).
  - `Can-do 15`: Leer publicaciones cortas de amigos en redes sociales con apoyo de fotografías.
- **Kanjis Objetivo:** `父` (padre), `母` (madre), `子ども` (hijo/niño), `日本` (Japón).
- **Estructuras Gramaticales:**
  1. Conexión de sustantivos con `と` (compañía o enumeración: 夫と子ども).
  2. Preguntas interrogativas de edad y estado: `何歳ですか？`.
  3. Residencia con verbo de estado: `【Lugar】に住んでいます`.
  4. Relación de pertenencia o parentesco: `N1 の N2` (私の母, 友だちの写真).
- **Consejos de vida en Japón:** Principales urbes japonesas; etiqueta al preguntar la edad; la geografía marítima de Japón.
- **Estado en App:** `[ ]` Faltante.

---

#### 🍜 TÓPICO 3: 好きな食べ物 (Comida Favorita)

##### Lección 5: うどんが好きです (Me gusta el udon) — Págs. 124-158
- **Objetivos Can-Do del libro:**
  - `Can-do 16`: Responder preguntas sobre gustos y disgustos culinarios (肉と野菜が好きです / 魚は好きじゃないです).
  - `Can-do 17`: Expresar de forma diplomática qué comidas japonesas no se prefieren (わさびは、ちょっと…).
  - `Can-do 18`: Responder a invitaciones y ofertas de bebidas (お茶、飲みますか？ / お願いします).
  - `Can-do 19`: Hablar sobre los hábitos del desayuno (朝ご飯は、あまり食べません).
  - `Can-do 20`: Escribir un pie de foto sencillo sobre una comida para redes sociales.
- **Kanjis Objetivo:** `水` (agua), `食べます` (comer), `飲みます` (beber).
- **Estructuras Gramaticales:**
  1. `Nが好きです` / `Nは好きじゃないです`.
  2. Atenuación cortés: `Nはちょっと…` (Rechazo sin decir "no").
  3. Invitación/pregunta informal vs formal: `V-ますか？` vs `V-る？`.
  4. Objeto directo con verbo de acción: `Nを V-ます`.
  5. Negación de hábitos: `（Nは）V-ません` / `V-ないです`.
  6. Adverbios de frecuencia: `いつも`, `よく`, `あまり`, `ぜんぜん`.
- **Consejos de vida en Japón:** Tipos de gastronomía japonesa (Sushi, Sashimi, Tempura, Udon, Soba, Curry japonés); ingredientes polémicos para extranjeros (natto, umeboshi); el sake japonés; los *donburi-mono*; el desayuno tradicional vs moderno.
- **Estado en App:** `[ ]` Faltante.

##### Lección 6: チーズバーガーください (Una hamburguesa con queso, por favor) — Págs. 159-181
- **Objetivos Can-Do del libro:**
  - `Can-do 21`: Leer un menú con imágenes en un restaurante de comida rápida e identificar opciones disponibles.
  - `Can-do 22`: Hacer un pedido en un establecimiento de comida rápida (para comer allí o llevar: 店内 / お持ち帰り).
  - `Can-do 23`: Decidir qué pedir en grupo y consensuar opciones (私はカレーにします).
  - `Can-do 24`: Pedir raciones, platos, vasos o condimentos en un restaurante o izakaya (枝豆2つください).
  - `Can-do 25`: Reconocer letreros luminosos y carteles de tipos de locales de comida en la calle.
- **Kanjis Objetivo:** `魚` (pescado), `肉` (carne), `好き（な）` (gustar).
- **Estructuras Gramaticales:**
  1. Pedir artículos: `N、お願いします` / `N、ください`.
  2. Elección personal: `Nにします` (Me decanto por... / Elijo...).
  3. Especificar cantidades: `N、【contador】お願いします` / `ください` (ひとつ, ふたつ, みっつ).
  4. Consultar disponibilidad: `N（は）ありますか？`.
- **Consejos de vida en Japón:** Cadenas de hamburguesas japonesas; máquinas expendedoras de tickets de comida (*shokkenki*); etiqueta en las tabernas *izakaya*; la cultura del *otôshi* y *oshibori*.
- **Estado en App:** `[ ]` Faltante.

---

#### 🏠 TÓPICO 4: 家と職場 (Hogar y Lugar de Trabajo)

##### Lección 7: 部屋が4つあります (Hay 4 habitaciones) — Págs. 182-214
- **Objetivos Can-Do del libro:**
  - `Can-do 26`: Escuchar explicaciones sobre la distribución de una casa o apartamento y comprender su plano.
  - `Can-do 27`: Preguntar y verificar si una vivienda dispone de electrodomésticos y servicios esenciales.
  - `Can-do 28`: Describir de forma básica las características y dimensiones de la vivienda (静かです, ちょっとせまいです).
  - `Can-do 29`: Conversar sobre el tipo de vivienda en el que se habita (apartamento, dormitorio de empresa, casa unifamiliar).
  - `Can-do 30`: Leer los botones clave de electrodomésticos cotidianos (aire acondicionado: 冷房, 暖房, 停止; lavadora).
- **Kanjis Objetivo:** `家` (casa), `新しい` (nuevo), `広い` (amplio), `古い` (antiguo).
- **Estructuras Gramaticales:**
  1. Señalar estancias: `ここは【Lugar】です` (ここは玄関です).
  2. Existencia en el espacio: `【Lugar】に Nがあります` / `Nが【número】あります`.
  3. Ausencia: `（Nは）ありません` / `ないです`.
  4. Descripción con Adjetivos-い y Adjetivos-な afirmativos.
  5. Descripción negativa: `ナA-じゃないです` / `イA-くないです`.
- **Consejos de vida en Japón:** Características de las viviendas niponas (genkan, tatami); tipos de futón; el sistema postal y numeración de direcciones japonesas.
- **Estado en App:** `[ ]` Faltante.

##### Lección 8: 山田さんはどこにいますか？ (¿Dónde está el señor Yamada?) — Págs. 215-239
- **Objetivos Can-Do del libro:**
  - `Can-do 31`: Escuchar un recorrido de orientación en el centro de trabajo y reconocer las diferentes salas.
  - `Can-do 32`: Preguntar y responder sobre el paradero de compañeros de trabajo (食堂にいます / 今、会議室です).
  - `Can-do 33`: Preguntar y responder dónde están los materiales de trabajo (はさみは、そこにあります).
  - `Can-do 34`: Leer placas y letreros en las puertas de oficinas y salas de empresas (事務室, 休憩室, 倉庫).
- **Kanjis Objetivo:** `上` (arriba), `下` (abajo), `中` (adentro/centro).
- **Estructuras Gramaticales:**
  1. Lugar de acción dinámica: `【Lugar】で V-ます` (ここで着替えます).
  2. Ubicación de personas: `【Persona】は【Lugar】にいます`.
  3. Ausencia de personas: `（【Persona】は）いません` / `いないです`.
  4. Ubicación de objetos inanimados: `【Objeto】は【ここ／そこ／あそこ】にあります`.
  5. Posiciones relativas con sustantivos: `Nの【Ubicación】にあります` (引き出しの中にあります).
- **Consejos de vida en Japón:** Uniformes laborales; pausas para el té; el uso continuado del fax en oficinas de Japón.
- **Estado en App:** `[ ]` Faltante.

---

#### ⏰ TÓPICO 5: 毎日の生活 (La Vida Diaria)

##### Lección 9: 12時から1時まで昼休みです (El descanso es de 12 a 1) — Págs. 240-259
- **Objetivos Can-Do del libro:**
  - `Can-do 35`: Preguntar y responder a qué hora nos levantamos, comemos o dormimos.
  - `Can-do 36`: Comprender la explicación del horario de una jornada laboral en la empresa.
  - `Can-do 37`: Leer un panel de planificación / pizarra de horarios de compañeros (*schedule board*).
  - `Can-do 38`: Proponer y acordar días u horas convenientes para una reunión o plan (私は日曜日がいいです).
- **Kanjis Objetivo:** `月`, `火`, `水`, `木`, `金`, `土`, `日`, `～曜日` (Días de la semana).
- **Estructuras Gramaticales:**
  1. Punto de tiempo exacto o aproximado: `【Hora】に V-ます` / `【Hora】ごろ V-ます`.
  2. Intervalos temporales: `【Hora A】から【Hora B】まで`.
  3. Indicar preferencia o conveniencia: `【Fecha/Hora】がいいです`.
- **Consejos de vida en Japón:** El ritual del *chôrei* (reunión matutina laboral); piscinas públicas; ir al cine en Japón.
- **Estado en App:** `[ ]` Faltante.

##### Lección 10: ホチキス貸してください (Por favor, préstame la grapadora) — Págs. 260-284
- **Objetivos Can-Do del libro:**
  - `Can-do 39`: Escuchar instrucciones breves en el puesto de trabajo y comprender la acción requerida.
  - `Can-do 40`: Confirmar datos y pedir que repitan puntos clave de una tarea laboral (すみません、いくつですか？).
  - `Can-do 41`: Leer notas e instrucciones manuscritas sencillas dejadas por compañeros.
  - `Can-do 42`: Pedir prestadas herramientas u objetos a compañeros de trabajo (スマホの充電器、ありますか？).
  - `Can-do 43`: Cotejar un checklist de materiales y comprobar si están todos los elementos.
- **Kanjis Objetivo:** `朝` (mañana), `昼` (mediodía), `夜` (noche), `～時`, `～分`, `～半`, `～枚` (contadores de tiempo y hojas).
- **Estructuras Gramaticales:**
  1. Petición cortés y coloquial: `V-てください` / `V-て` / `V-てくれる？`.
  2. Confirmación de cifras o datos: `Nですね`.
  3. Fórmulas para pedir prestado: `N、貸してください` / `借りてもいいですか？` / `N、いいですか？`.
- **Consejos de vida en Japón:** Términos de *wasei-eigo* (inglés inventado en Japón: hotchkiss, consent, cooler); cargar el móvil en lugares públicos; reloj de 24 horas.
- **Estado en App:** `[ ]` Faltante.

---

#### 🎮 TÓPICO 6: 私の好きなこと (Mis Aficiones e Intereses)

##### Lección 11: どんなマンガが好きですか？ (¿Qué manga te gusta?) — Págs. 285-310
- **Objetivos Can-Do del libro:**
  - `Can-do 44`: Responder de forma sencilla sobre los pasatiempos e intereses personales.
  - `Can-do 45`: Preguntar y detallar gustos sobre autores, obras o géneros favoritos (「ドラゴンボール」が大好きです).
  - `Can-do 46`: Describir qué se suele hacer los días libres y de descanso (うちでゆっくりします).
  - `Can-do 47`: Leer el perfil de un usuario en redes sociales y comprender sus gustos y estilo de vida.
- **Kanjis Objetivo:** `読みます` (leer), `聞きます` (escuchar), `見ます` (ver), `本` (libro), `友だち` (amigo), `何` (qué).
- **Estructuras Gramaticales:**
  1. Pregunta por afición: `Nは何ですか？` (趣味は、何ですか？).
  2. Pregunta por tipo o categoría: `どんな N が好きですか？`.
  3. Atenuación de desagrado o poco entusiasmo: `あまり ナA-じゃないです` / `イA-くないです`.
  4. Frecuencia de actividades: `いつも / たいてい / よく / ときどき V-ます` vs `あまり / ぜんぜん V-ません`.
  5. Compañía y lugar de recreación: `【Persona】と【Lugar】で V-ます`.
- **Consejos de vida en Japón:** El mundo del manga y anime; videojuegos japoneses; la literatura contemporánea nipona; deportes populares (fútbol, rugby, béisbol); el fenómeno del pachinko.
- **Estado en App:** `[ ]` Faltante.

##### Lección 12: いっしょに飲みに行きませんか？ (¿Vamos a tomar algo juntos?) — Págs. 311-335
- **Objetivos Can-Do del libro:**
  - `Can-do 48`: Leer el folleto de un evento público e identificar fecha, hora y ubicación.
  - `Can-do 49`: Preguntar y confirmar si alguien acudirá a un festival o fiesta (来週、夏祭りがありますね).
  - `Can-do 50`: Proponer planes, invitar a otros o aceptar una invitación con entusiasmo (いっしょに行きましょう).
  - `Can-do 51`: Redactar una respuesta escrita por mensaje aceptando o declinando una invitación.
- **Kanjis Objetivo:** `～年`, `～月`, `～日`, `今日` (hoy), `今週` (esta semana), `今度` (la próxima vez).
- **Estructuras Gramaticales:**
  1. Acontecimiento en fecha y lugar: `【Fecha】に【Lugar】で【Evento】があります`.
  2. Asistencia a citas: `Nに行きます` (忘年会に行きます).
  3. Invitar formalmente: `V-ませんか？` (いっしょに行きませんか？).
  4. Aceptar o acordar conjuntamente: `V-ましょう` (また今度行きましょう).
  5. Verbo de propósito: `V-に行きます` (焼肉を食べに行きます).
- **Consejos de vida en Japón:** Los festivales de verano (*matsuri*); las montañas japonesas y senderismo; la saga cinematográfica "Tora-san"; el arte marcial Karate.
- **Estado en App:** `[ ]` Faltante.

---

#### 🚶 TÓPICO 7: 街を歩く (Caminando por la Ciudad)

##### Lección 13: このバスは空港に行きますか？ (¿Este autobús va al aeropuerto?) — Págs. 336-368
- **Objetivos Can-Do del libro:**
  - `Can-do 52`: Preguntar si un autobús o tren se dirige a nuestro destino y entender la indicación del andén.
  - `Can-do 53`: Escuchar el anuncio de la próxima estación en el tren y pedir ayuda a un pasajero si hay dudas.
  - `Can-do 54`: Explicar el medio de transporte usado para ir al trabajo y cuánto tiempo demora el trayecto.
  - `Can-do 55`: Preguntar cómo llegar a un edificio público (ayuntamiento, banco) y comprender las instrucciones.
  - `Can-do 56`: Identificar e interpretar los letreros y pictogramas comunes de una estación ferroviaria.
- **Kanjis Objetivo:** `東` (este), `西` (oeste), `南` (sur), `北` (norte), `会社` (empresa), `来ます` (venir), `行きます` (ir), `乗ります` (subir a transporte).
- **Estructuras Gramaticales:**
  1. Consulta de ruta: `この【transporte】は【destino】に行きますか？`.
  2. Localización actual: `ここは【lugar】ですか？` / `ここは、どこですか？`.
  3. Medio de locomoción con partícula `で`: `【transporte】で来ます / 行きます`.
  4. Duración temporal: `【tiempo】かかります` (1時間半かかります).
  5. Subir y bajar de vehículos: `【lugar】で【transporte】に乗ります` / `降ります`.
  6. Origen y destino: `【punto A】から【punto B】まで`.
- **Consejos de vida en Japón:** Desplazamientos diarios al trabajo (*tsukin*); reglas de etiqueta en el transporte público.
- **Estado en App:** `[ ]` Faltante.

##### Lección 14: 大きな建物ですね (Es un edificio enorme, ¿verdad?) — Págs. 369-394
- **Objetivos Can-Do del libro:**
  - `Can-do 57`: Preguntar dónde se encuentran los servicios o un cajero automático en la calle o estación.
  - `Can-do 58`: Describir por teléfono la propia ubicación exacta a alguien con quien hemos quedado (今、改札の前にいます).
  - `Can-do 59`: Expresar impresiones y asombro cuando nos muestran una zona urbana o calle comercial.
  - `Can-do 60`: Leer carteles de establecimientos y comprender horarios de atención o si están abiertos/cerrados (営業中, 準備中).
- **Kanjis Objetivo:** `大きい` (grande), `小さい` (pequeño), `高い` (alto/caro), `低い` (bajo), `前` (delante), `後ろ` (detrás), `横` (al lado).
- **Estructuras Gramaticales:**
  1. Preguntar por existencia en la zona: `【Lugar】に N（は）ありますか？` (この近くに、コンビニはありますか？).
  2. Ubicación de personas con respecto a puntos de referencia: `Nの【posición】にいます`.
  3. Modificación nominal con adjetivos y partícula exclamativa: `ナA-な Nですね` / `イA-い Nですね` (にぎやかな通りですね).
- **Consejos de vida en Japón:** Las consignas de monedas (*coin lockers*); máquinas expendedoras automáticas; cajeros ATM; los rascacielos de Tokio; el concepto estético del *Wabi-sabi*.
- **Estado en App:** `[ ]` Faltante.

---

#### 🛍️ TÓPICO 8: 店で (En las Tiendas y Comercios)

##### Lección 15: 電池がほしいんですが… (Quisiera unas pilas...) — Págs. 395-421
- **Objetivos Can-Do del libro:**
  - `Can-do 61`: Preguntar en qué establecimiento o sección se puede comprar determinado producto.
  - `Can-do 62`: Interpretar la guía de pisos (*floor guide*) de un centro comercial para localizar el artículo buscado.
  - `Can-do 63`: Preguntar al personal de la tienda en qué planta se encuentra una sección concreta (カメラは何階ですか？).
  - `Can-do 64`: Intercambiar comentarios espontáneos sobre artículos con amigos mientras se compra (わあ、かっこいいですね).
  - `Can-do 65`: Comprender la señalización estándar de tiendas departamentales (entrada, salida, empujar, tirar).
- **Kanjis Objetivo:** `入口` (entrada), `出口` (salida), `～階` (planta/piso), `押す` (empujar), `引く` (tirar), `安い` (barato).
- **Estructuras Gramaticales:**
  1. Planteamiento de deseo o necesidad con atenuación: `Nがほしいんですが…` (電池がほしいんですが、どこで買えますか？).
  2. Exclamaciones y valoraciones: `ナA / イAですね` vs `ナA！ / イA-い！` (このコート、おしゃれですね！ / かわいい！).
- **Consejos de vida en Japón:** Tipos de comercios japoneses (conbini, supermercados, 100-yen shops, farmacias); botones de ascensores; cómo contar plantas de edificios; paraguas transparentes; términos para el aseo.
- **Estado en App:** `[ ]` Faltante.

##### Lección 16: これ、いくらですか？ (¿Cuánto cuesta esto?) — Págs. 422-451
- **Objetivos Can-Do del libro:**
  - `Can-do 66`: Escuchar y comprender con precisión el precio total anunciado por el cajero.
  - `Can-do 67`: Preguntar al empleado de la tienda por el precio de una prenda u objeto (あのTシャツ、いくらですか？).
  - `Can-do 68`: Solicitar cantidades exactas de peso o unidades al pedir comida al corte (ひき肉200gください).
  - `Can-do 69`: Responder a las preguntas habituales en la caja del combini (¿desea calentar la comida?, ¿necesita cubiertos o bolsa?).
  - `Can-do 70`: Interpretar etiquetas y carteles de descuento promocional (半額, 20%引き).
- **Kanjis Objetivo:** `一`, `二`, `三`, `四`, `五`, `六`, `七`, `八`, `九`, `十` (Números del 1 al 10 en kanji).
- **Estructuras Gramaticales:**
  1. Consulta de precio: `【これ／それ／あれ】(は）いくらですか？`.
  2. Demostrativo dependiente + Sustantivo: `【この／その／あの】N`.
  3. Distribución equitativa: `【cantidad】ずつ` (2個ずつお願いします).
- **Consejos de vida en Japón:** Billetes y monedas en circulación; el amuleto *Maneki-neko*; dulces tradicionales (Taiyaki, Dorayaki); frituras *korokke*; métodos de pago electrónico (Suica, Pasmo, PayPay).
- **Estado en App:** `[ ]` Faltante.

---

#### ✈️ TÓPICO 9: 休みの日に (Días Libres y Vacaciones)

##### Lección 17: 映画を見に行きました (Fui a ver una película) — Págs. 452-477
- **Objetivos Can-Do del libro:**
  - `Can-do 71`: Responder de forma concisa qué se hizo durante el fin de semana o día libre.
  - `Can-do 72`: Preguntar y compartir impresiones sobre las actividades realizadas (週末は何をしましたか？ / 楽しかったです).
  - `Can-do 73`: Leer publicaciones en redes sociales sobre salidas familiares o con amigos ayudándose de fotos.
  - `Can-do 74`: Interpretar la lista de tarifas y precios de una instalación pública o de ocio.
  - `Can-do 75`: Enviar un mensaje breve de agradecimiento e impresiones tras haber salido juntos.
- **Kanjis Objetivo:** `百`, `千`, `万`, `～円`, `休み` (descanso), `映画` (película), `日本語`, `勉強します` (estudiar), `買います` (comprar).
- **Estructuras Gramaticales:**
  1. Pasado afirmativo y negativo de verbos: `V-ました` / `V-ませんでした`.
  2. Negación total enfática: `何も V-ませんでした` / `どこにも V-ませんでした`.
  3. Pasado afirmativo de adjetivos: `ナA-でした` / `イA-かったです`.
  4. Pasado de sustantivos: `Nでした` (とてもいい天気でした).
  5. Pasado negativo de sustantivos y adjetivos: `N / ナA じゃなかったです` / `イA-くなかったです`.
- **Consejos de vida en Japón:** El fenómeno cultural de Godzilla; acuarios japoneses; los cafés de manga e internet (*manga-kissa*).
- **Estado en App:** `[ ]` Faltante.

##### Lección 18: 温泉に入りたいです (Quiero bañarme en aguas termales) — Págs. 478-505
- **Objetivos Can-Do del libro:**
  - `Can-do 76`: Preguntar y compartir planes o aspiraciones para periodos vacacionales largos (Golden Week).
  - `Can-do 77`: Responder de forma sencilla qué actividades se desearía experimentar en Japón.
  - `Can-do 78`: Publicar en redes sociales un resumen sencillo de lo realizado en una excursión.
  - `Can-do 79`: Narrar un viaje e impresiones de forma estructurada conectando ideas cronológicas y contrastes.
- **Kanjis Objetivo:** `温泉` (aguas termales/onsen), `予定` (planes), `来週` (la próxima semana), `会います` (encontrarse), `入ります` (entrar), `旅行します` (viajar).
- **Estructuras Gramaticales:**
  1. Deseo personal: `V-たいです` (炊飯器が買いたいです / 温泉に入りたいです).
  2. Indefinidos afirmativos: `どこか V-ます` (どこか旅行したいです).
  3. Adición de ideas: `Oración 1。あと、Oración 2。`.
  4. Partícula de dirección: `【Lugar】へ行きます`.
  5. Conector cronológico: `Oración 1。それから、Oración 2。`.
  6. Conectores de suma y contraste: `それに` (además) / `でも` (sin embargo).
- **Consejos de vida en Japón:** La *Golden Week*; Tokyo Disney Resort; el tren bala *Shinkansen*; ascender al monte Fuji; la animación japonesa (Makoto Shinkai, Doraemon); la ciudad de Yokohama; etiqueta y reglas del Onsen.
- **Estado en App:** `[ ]` Faltante.

---

### 3.3. Auditoría de Kanjis de Irodori faltantes en `data/kanji.json`

Al contrastar los 93 kanjis introducidos a lo largo de las 18 lecciones de Irodori Elementary con los kanjis registrados en `data/kanji.json`, se detectan **24 kanjis indispensables que aún no existen en el catálogo**:

| # | Kanji Faltante | Significado | Pronunciación On/Kun | Lección de Irodori | Palabras clave asociadas |
| :-: | :---: | :--- | :--- | :---: | :--- |
| 1 | **私** | Yo, privado | シ / わたし, わたくし | Lección 3 | 私 (わたし), 私立 (しりつ) |
| 2 | **肉** | Carne | ニク | Lección 6 | 肉 (にく), 牛肉 (ぎゅうにく), 豚肉 (ぶたにく) |
| 3 | **好** | Gustar, agradable | コウ / す・く, この・む | Lección 6 | 好き (すき), 大好物 (だいこうぶつ) |
| 4 | **家** | Casa, familia | カ, ケ / いえ, や | Lección 7 | 家 (いえ), 家族 (かぞく), 家賃 (やちん) |
| 5 | **広** | Amplio, espacioso | コウ / ひろ・い | Lección 7 | 広い (ひろい), 広場 (ひろば) |
| 6 | **朝** | Mañana | チョウ / あさ | Lección 10 | 朝 (あさ), 朝ご飯 (あさごはん), 今朝 (けさ) |
| 7 | **昼** | Mediodía, día | チュウ / ひる | Lección 10 | 昼 (ひる), 昼休み (ひるやすみ), 昼ご飯 (ひるごはん) |
| 8 | **夜** | Noche | ヤ / よる, よ | Lección 10 | 夜 (よる), 今夜 (こんや), 夜中 (よなか) |
| 9 | **枚** | Contador de cosas planas | マイ | Lección 10 | 1枚 (いちまい), 30枚 (さんじゅうまい) |
| 10 | **乗** | Subir, montar a vehículo | ジョウ / の・る | Lección 13 | 乗ります (のります), 乗り場 (のりば) |
| 11 | **低** | Bajo | テイ / ひく・い | Lección 14 | 低い (ひくい), 最低 (さいてい) |
| 12 | **横** | Lado, horizontal | オウ / よこ | Lección 14 | 横 (よこ), 横断歩道 (おうだんほどう) |
| 13 | **口** | Boca, entrada/apertura | コウ, ク / くち, ぐち | Lección 15 | 口 (くち), 入口 (いりぐち), 出口 (でぐち) |
| 14 | **押** | Empujar, presionar | オウ / お・す | Lección 15 | 押す (おす), 押入れ (おしいれ) |
| 15 | **引** | Tirar, jalar | イン / ひ・く | Lección 15 | 引く (ひく), 引き出し (ひきだし), 割引 (わりびき) |
| 16 | **映** | Proyectar, reflejar | エイ / うつ・る | Lección 17 | 映画 (えいが), 映る (うつる) |
| 17 | **画** | Imagen, trazo, pintura | ガ, カク | Lección 17 | 映画 (えいが), 画面 (がめん), 画家 (がか) |
| 18 | **勉** | Esforzarse | ベン | Lección 17 | 勉強 (べんきょう) |
| 19 | **強** | Fuerte | キョウ, ゴウ / つよ・い | Lección 17 | 勉強 (べんきょう), 強い (つよい) |
| 20 | **温** | Templado, cálido | オン / あたた・かい | Lección 18 | 温泉 (おんせん), 温度 (おんど) |
| 21 | **泉** | Manantial, fuente | セン / いずみ | Lección 18 | 温泉 (おんせん) |
| 22 | **予** | Previo, de antemano | ヨ | Lección 18 | 予定 (よてい), 予約 (よやく) |
| 23 | **定** | Determinar, fijar | テイ, ジョウ / さだ・める | Lección 18 | 予定 (よてい), 定休日 (ていきゅうび) |
| 24 | **旅** | Viaje | リョ / たび | Lección 18 | 旅行 (りょこう), 一人旅 (ひとりたび) |

---

## 4. Matriz Comparativa de Cobertura en la Aplicación Actual

Tras la ejecución de las fases de integración y consolidación curricular, la cobertura en `Nihongo Master` es la siguiente:

| Componente de la App | Archivo de Origen / Datos | Libro 1 (NHK) | Libro 2 (Irodori) | Estado Actual y Diagnóstico |
| :--- | :--- | :---: | :---: | :--- |
| **Conversaciones (`ConversationTab`)** | `data/nhk_lessons.json`<br>`data/conversation_exercises.json` | ✅ **100% (48/48)** | ✅ Integrado | 48 lecciones completas de NHK con diálogos bilingües, notas gramaticales y **144 ejercicios interactivos** (3 por lección). |
| **Currículum Consolidado (`CurriculumTab`)** | `data/curriculum.json` | ✅ **100%** | ✅ **100% (79/79)** | **19 Módulos Maestros Unificados** sin duplicidades temáticas, integrando los 79 Can-Dos de Irodori + 8 complementarios (87 en total), ejercicios, guías y enlaces directos a temas relacionados. |
| **Gramática y Partículas (`GrammarTab`)** | `data/particles.json` | ✅ 100% | ✅ 100% | Partículas N5/N4 y estructuras clave (cópula, existencia, movimiento, transitividad, peticiones 〜てください, 〜たい, 〜なければなりません). |
| **Diccionario Kanji (`KanjiTab`)** | `data/kanji.json` | ✅ 100% | ✅ 100% | **159 kanjis catalogados**, incluyendo los 24 kanjis elementales de Irodori con trazos, lecturas On/Kun y palabras sincronizadas. |
| **Vocabulario Maestro (`VocabTab`)** | `data/vocabulary.json` | ✅ 100% | ✅ 100% | **208 entradas** con registro estricto en sus tres formas (Kanji, Hiragana, Katakana), español y nivel JLPT sincronizado con los kanjis. |
| **Biblioteca de PDFs (`MaterialLibraryTab`)** | `data/pdf_catalog.json` | ✅ 100% | ✅ 100% | Ambos manuales originales indexados con visor integrado, conteo de páginas y descarga directa. |

---

## 5. Arquitectura del Currículum Consolidado (19 Módulos Maestros)

Para erradicar la fragmentación pedagógica y las lecciones repetidas entre distintas rutas (JLPT, Irodori y NHK), se han unificado todos los contenidos temáticamente afines en **19 Módulos Maestros Cohesivos**, cada uno dotado de navegación bidireccional mediante **Temas Relacionados**:

| Módulo | Título Central y Enfoque | Nivel | Can-Dos | Fuentes Consolidadas | Temas Relacionados Enlazados |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **M1** | **Saludos, Cortesía y Presentación Personal**<br>*(はじめまして。私はアンナです)* | A1 / N5 | 8 (CD 1-4, 8-11) | Irodori L1, L3 · NHK L1-2 · JLPT Nivel 1 | 🔗 M2 (Estrategias de Comunicación), M3 (Familia y Residencia), M19 (Metas y Despedida) |
| **M2** | **Estrategias de Comunicación y Gestión de Idiomas**<br>*(すみません、もう一度ゆっくりお願いします)* | A1 / N5 | 3 (CD 5-7) | Irodori L2 · NHK L8 | 🔗 M1 (Saludos y Presentación), M9 (Instrucciones Laborales) |
| **M3** | **Identidad, Familia, Residencia y Contacto**<br>*(東京に住んでいます。家族は3人です)* | A1 / N5 | 4 (CD 12-15) | Irodori L4 · NHK L4-6, L31 · JLPT Nivel 2 | 🔗 M1 (Presentación), M6 (El Hogar), M8 (Horarios y Números) |
| **M4** | **Gustos, Preferencias Culinarias y Hábitos Diarios**<br>*(うどんが好きです。毎朝コーヒーを飲みます)* | A1 / N5 | 5 (CD 16-20) | Irodori L5 · JLPT Nivel 4 · NHK L13 | 🔗 M5 (Restaurantes y Pedidos), M8 (Rutinas Diarias) |
| **M5** | **Restaurantes, Menús, Pedidos y Contadores**<br>*(これを2つとウーロン茶をください)* | A1 / N5 | 5 (CD 21-25) | Irodori L6 · NHK L7, L17, L34, L42 | 🔗 M4 (Gustos Culinarios), M14 (Tiendas y Compras), M15 (Precios y Caja) |
| **M6** | **El Hogar, Vivienda, Distribución y Electrodomésticos**<br>*(部屋が4つあります。エアコンと洗濯機があります)* | A1 / N5 | 5 (CD 26-30) | Irodori L7 · NHK L5, L14, L32 | 🔗 M3 (Residencia), M7 (Existencia y Ubicación ある/いる) |
| **M7** | **El Lugar de Trabajo, Orientación y Existencia (ある／いる)**<br>*(山田さんは2階の会議室にいます)* | A1 / N5 | 4 (CD 31-34) | Irodori L8 · JLPT Nivel 3 · NHK L3, L10, L25 | 🔗 M6 (El Hogar), M9 (Instrucciones Laborales), M13 (Orientación Urbana) |
| **M8** | **Rutinas, Horarios, Días de la Semana e Intervalos**<br>*(9時から5時まで働きます。水曜日は休みです)* | A1 / N5 | 4 (CD 35-38) | Irodori L9 · JLPT Nivel 2 · NHK L9 | 🔗 M4 (Hábitos Diarios), M9 (Horarios Laborales), M16 (Fin de Semana y Pasado) |
| **M9** | **Instrucciones de Trabajo, Peticiones y Reglas Laborales**<br>*(ホチキスを貸してください。ここでタバコを吸わないで)* | A1 / N5 | 5 (CD 39-43) | Irodori L10 · NHK L8, L23, L24 | 🔗 M2 (Estrategias de Comunicación), M7 (Lugar de Trabajo), M18 (Salud y Ausencias) |
| **M10** | **Aficiones, Tiempo Libre, Ocio y Redes Sociales**<br>*(休みの日は何をしますか？マンガを読んだりします)* | A1 / N5 | 4 (CD 44-47) | Irodori L11 · NHK L11, L20 | 🔗 M4 (Gustos y Preferencias), M11 (Eventos e Invitaciones), M16 (Experiencias Pasadas) |
| **M11** | **Eventos, Festivales, Invitaciones y Propuestas**<br>*(今週の土曜日、いっしょにお祭りに行きませんか？)* | A1 / N5 | 4 (CD 48-51) | Irodori L12 · NHK L26, L27, L41 | 🔗 M10 (Aficiones), M12 (Transporte a Eventos), M13 (Puntos de Encuentro) |
| **M12** | **Movilidad, Transporte Público y Estaciones**<br>*(この電車は新宿に行きますか？何番線ですか？)* | A1 / N5 | 5 (CD 52-56) | Irodori L13 · JLPT Nivel 5 · NHK L12, L16, L28 | 🔗 M11 (Eventos y Salidas), M13 (Orientación Urbana), M17 (Viajes y Excursiones) |
| **M13** | **Orientación Urbana, Puntos de Encuentro y Señalización**<br>*(交差点を右に曲がってください。大きなビルの前です)* | A1 / N5 | 4 (CD 57-60) | Irodori L14 · NHK L18, L38 | 🔗 M7 (Demostrativos de Lugar), M12 (Estaciones y Metro), M14 (Comercios) |
| **M14** | **Tiendas, Grandes Almacenes y Búsqueda de Productos**<br>*(電池がほしいんですが、何階にありますか？)* | A1 / N5 | 5 (CD 61-65) | Irodori L15 · NHK L35 | 🔗 M5 (Restaurantes y Pedidos), M13 (Orientación Urbana), M15 (Precios y Caja) |
| **M15** | **Precios, Descuentos y Caja del Combini**<br>*(これ、いくらですか？袋はいりません)* | A1 / N5 | 5 (CD 66-70) | Irodori L16 · NHK L35, L42 | 🔗 M8 (Sistema Numérico), M14 (Tiendas y Búsqueda de Productos) |
| **M16** | **Fin de Semana, Relatar el Pasado y Experiencias de Ocio**<br>*(週末はどうでしたか？映画を見ました)* | A1 / N5 | 5 (CD 71-75) | Irodori L17 · JLPT Nivel 6, 7 | 🔗 M8 (Rutinas y Horarios), M10 (Aficiones y Ocio), M17 (Planes Vacacionales) |
| **M17** | **Planes Vacacionales, Deseos y Cultura Onsen**<br>*(次の休みに温泉に行きたいです。富士山に登りたい)* | A1 / N5-N4 | 4 (CD 76-79) | Irodori L18 · NHK L29, L30, L33, L37 · JLPT Nivel 8 | 🔗 M12 (Transporte y Viajes), M16 (Relatar el Pasado), M19 (Metas Personales) |
| **M18** | **Salud, Síntomas Corporales y Deberes Ineludibles**<br>*(頭が痛いです。病院へ行かなければなりません)* | N5 - N4 | 4 (CD 80-83) | NHK L19, L22, L36, L39-40 · JLPT Nivel 9 | 🔗 M9 (Instrucciones Laborales y Bajas), M14 (Compras en Farmacia) |
| **M19** | **Metas Personales, Despedidas y Expresiones de Gratitud**<br>*(日本語が上手になりたいです。大変お世話になりました)* | N5 - N4 | 4 (CD 84-87) | NHK L21, L26, L43, L47-48 · JLPT Nivel 8-9 | 🔗 M1 (Saludos y Presentación Inicial), M17 (Deseos y Futuro con 〜たい) |

---

## 6. Reglas Obligatorias para la Incorporación de Nuevos Módulos

Para preservar la arquitectura limpia y libre de redundancias en el tiempo, cualquier nuevo material o módulo debe ajustarse a las siguientes pautas estrictas:

1. **Auditoría Previa de No Duplicidad:**
   - Antes de dar de alta un módulo nuevo en `data/curriculum.json`, se debe revisar exhaustivamente si la temática central ya está cubierta en los 19 módulos maestros existentes.
2. **Complementación vs. Descarte:**
   - **Si el tema ya existe:** Extraer los ejemplos útiles, competencias Can-Do adicionales o diálogos auténticos e **incorporarlos directamente al módulo existente**. Si la información es redundante o idéntica, se descarta.
   - **Si el tema es nuevo:** Se da de alta asignándole un número secuencial único, objetivos Can-Do, nivel pedagógico y fuentes bibliográficas.
3. **Enlace Obligatorio con Temas Relacionados (`related_topics`):**
   - Todo módulo debe enlazar bidireccionalmente con sus módulos precedentes, consecutivos o complementarios, detallando `step`, `title`, `relationship` y `reason`.
4. **Verificación Técnica:**
   - Ejecutar `npm run build` sin errores, sincronizar con el repositorio Git y validar el despliegue en producción en Vercel.
