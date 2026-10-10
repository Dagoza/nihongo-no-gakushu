/**
 * scripts/m1_data/curriculum_vocab_expansion.js
 * Términos contextuales adicionales para enriquecer los 69 pasos de contenido
 * en data/curriculum.json (garantizando 8 a 10 términos por paso, 8 <= len <= 12).
 */

const VOCAB_EXPANSIONS = {
  // === MÓDULO 1 ===
  '1_1': [
    { kanji: 'どうぞ', kana: 'どうぞ', romaji: 'douzo', meaning: 'Por favor / Adelante', type: 'Expresión', category: 'Saludos y Cortesía' },
    { kanji: '失礼します', kana: 'しつれいします', romaji: 'shitsureishimasu', meaning: 'Con permiso / Disculpe', type: 'Expresión', category: 'Saludos y Cortesía' },
    { kanji: 'お疲れさまでした', kana: 'おつかれさまでした', romaji: 'otsukaresamadeshita', meaning: 'Gracias por su esfuerzo / Buen trabajo', type: 'Expresión', category: 'Saludos y Cortesía' },
    { kanji: 'じゃあまた', kana: 'じゃあまた', romaji: 'jaa mata', meaning: 'Hasta luego / Nos vemos', type: 'Expresión', category: 'Saludos y Cortesía' }
  ],
  '1_2': [
    { kanji: '会社員', kana: 'かいしゃいん', romaji: 'kaishain', meaning: 'Empleado de empresa / Oficinista', type: 'Sustantivo', category: 'Personas y Profesiones' },
    { kanji: '日本人', kana: 'にほんじん', romaji: 'nihonjin', meaning: 'Persona japonesa / Japonés', type: 'Sustantivo', category: 'Nacionalidades' },
    { kanji: 'こちら', kana: 'こちら', romaji: 'kochira', meaning: 'Éste / Ésta (presentación de personas)', type: 'Pronombre', category: 'Pronombres' },
    { kanji: '名前', kana: 'なまえ', romaji: 'namae', meaning: 'Nombre', type: 'Sustantivo', category: 'Identidad' },
    { kanji: '国', kana: 'くに', romaji: 'kuni', meaning: 'País / Nación', type: 'Sustantivo', category: 'Lugares' }
  ],
  '1_3': [
    { kanji: 'どこ', kana: 'どこ', romaji: 'doko', meaning: 'Dónde / Qué lugar', type: 'Interrogativo', category: 'Preguntas' },
    { kanji: 'どちら', kana: 'どちら', romaji: 'dochira', meaning: 'Dónde (forma cortés)', type: 'Interrogativo', category: 'Preguntas' },
    { kanji: 'アメリカ', kana: 'あめりか', romaji: 'amerika', meaning: 'Estados Unidos', type: 'Sustantivo', category: 'Países' },
    { kanji: '中国', kana: 'ちゅうごく', romaji: 'chuugoku', meaning: 'China', type: 'Sustantivo', category: 'Países' }
  ],

  // === MÓDULO 2 ===
  '2_1': [
    { kanji: '分かります', kana: 'わかります', romaji: 'wakarimasu', meaning: 'Entender / Comprender', type: 'Verbo', category: 'Comunicación' },
    { kanji: '言います', kana: 'いいます', romaji: 'iimasu', meaning: 'Decir', type: 'Verbo', category: 'Comunicación' },
    { kanji: '少し', kana: 'すこし', romaji: 'sukoshi', meaning: 'Un poco', type: 'Adverbio', category: 'Cantidad' },
    { kanji: '言葉', kana: 'ことば', romaji: 'kotoba', meaning: 'Palabra / Idioma', type: 'Sustantivo', category: 'Comunicación' },
    { kanji: '話します', kana: 'はなします', romaji: 'hanashimasu', meaning: 'Hablar', type: 'Verbo', category: 'Comunicación' }
  ],

  // === MÓDULO 3 ===
  '3_1': [
    { kanji: '住所', kana: 'じゅうしょ', romaji: 'juusho', meaning: 'Dirección / Domicilio', type: 'Sustantivo', category: 'Identidad' },
    { kanji: '部屋', kana: 'へや', romaji: 'heya', meaning: 'Habitación / Cuarto', type: 'Sustantivo', category: 'Vivienda' },
    { kanji: 'アパート', kana: 'あぱーと', romaji: 'apaato', meaning: 'Apartamento', type: 'Sustantivo', category: 'Vivienda' },
    { kanji: '東京', kana: 'とうきょう', romaji: 'toukyou', meaning: 'Tokio', type: 'Sustantivo', category: 'Ciudades' },
    { kanji: '京都', kana: 'きょうと', romaji: 'kyouto', meaning: 'Kioto', type: 'Sustantivo', category: 'Ciudades' },
    { kanji: '家', kana: 'いえ', romaji: 'ie', meaning: 'Casa / Hogar', type: 'Sustantivo', category: 'Vivienda' }
  ],
  '3_2': [
    { kanji: '兄', kana: 'あに', romaji: 'ani', meaning: 'Hermano mayor', type: 'Sustantivo', category: 'Familia' },
    { kanji: '姉', kana: 'あね', romaji: 'ane', meaning: 'Hermana mayor', type: 'Sustantivo', category: 'Familia' },
    { kanji: '弟', kana: 'おとうと', romaji: 'otouto', meaning: 'Hermano menor', type: 'Sustantivo', category: 'Familia' },
    { kanji: '妹', kana: 'いもうと', romaji: 'imouto', meaning: 'Hermana menor', type: 'Sustantivo', category: 'Familia' },
    { kanji: '子ども', kana: 'こども', romaji: 'kodomo', meaning: 'Hijo / Niño', type: 'Sustantivo', category: 'Familia' }
  ],

  // === MÓDULO 4 ===
  '4_1': [
    { kanji: 'パン', kana: 'ぱん', romaji: 'pan', meaning: 'Pan', type: 'Sustantivo', category: 'Comida y Bebida' },
    { kanji: '魚', kana: 'さかな', romaji: 'sakana', meaning: 'Pescado', type: 'Sustantivo', category: 'Comida y Bebida' },
    { kanji: '卵', kana: 'たまご', romaji: 'tamago', meaning: 'Huevo', type: 'Sustantivo', category: 'Comida y Bebida' }
  ],
  '4_2': [
    { kanji: '晩ご飯', kana: 'ばんごはん', romaji: 'bangohan', meaning: 'Cena', type: 'Sustantivo', category: 'Comida y Bebida' },
    { kanji: '果物', kana: 'くだもの', romaji: 'kudamono', meaning: 'Fruta', type: 'Sustantivo', category: 'Comida y Bebida' },
    { kanji: 'いつも', kana: 'いつも', romaji: 'itsumo', meaning: 'Siempre', type: 'Adverbio', category: 'Tiempo' }
  ],

  // === MÓDULO 5 ===
  '5_1': [
    { kanji: 'メニュー', kana: 'めにゅー', romaji: 'menyuu', meaning: 'Menú / Carta', type: 'Sustantivo', category: 'Restaurante' },
    { kanji: '水', kana: 'みず', romaji: 'mizu', meaning: 'Agua', type: 'Sustantivo', category: 'Comida y Bebida' },
    { kanji: 'ビール', kana: 'びーる', romaji: 'biiru', meaning: 'Cerveza', type: 'Sustantivo', category: 'Comida y Bebida' },
    { kanji: 'ラーメン', kana: 'らーめん', romaji: 'raamen', meaning: 'Ramen', type: 'Sustantivo', category: 'Comida y Bebida' },
    { kanji: '店員', kana: 'てんいん', romaji: 'ten\'in', meaning: 'Camarero / Dependiente', type: 'Sustantivo', category: 'Personas y Profesiones' },
    { kanji: '注文', kana: 'ちゅうもん', romaji: 'chuumon', meaning: 'Pedido / Orden', type: 'Sustantivo', category: 'Restaurante' },
    { kanji: 'おすすめ', kana: 'おすすめ', romaji: 'osusume', meaning: 'Recomendación de la casa', type: 'Sustantivo', category: 'Restaurante' }
  ],
  '5_2': [
    { kanji: '三つ', kana: 'みっつ', romaji: 'mittsu', meaning: 'Tres (contador nativo general)', type: 'Contador', category: 'Números y Contadores' },
    { kanji: '四つ', kana: 'よっつ', romaji: 'yottsu', meaning: 'Cuatro (contador nativo general)', type: 'Contador', category: 'Números y Contadores' },
    { kanji: '五つ', kana: 'いつつ', romaji: 'itsutsu', meaning: 'Cinco (contador nativo general)', type: 'Contador', category: 'Números y Contadores' },
    { kanji: '六つ', kana: 'むっつ', romaji: 'muttsu', meaning: 'Seis (contador nativo general)', type: 'Contador', category: 'Números y Contadores' },
    { kanji: '全部', kana: 'ぜんぶ', romaji: 'zenbu', meaning: 'Todo / En conjunto', type: 'Sustantivo', category: 'Cantidad' },
    { kanji: 'お会計', kana: 'おかいけい', romaji: 'okaikei', meaning: 'La cuenta (en restaurante)', type: 'Sustantivo', category: 'Restaurante' },
    { kanji: '別々', kana: 'べつべつ', romaji: 'betsubetsu', meaning: 'Por separado', type: 'Adverbio', category: 'Restaurante' }
  ],

  // === MÓDULO 6 ===
  '6_1': [
    { kanji: '台所', kana: 'だいどころ', romaji: 'daidokoro', meaning: 'Cocina', type: 'Sustantivo', category: 'Vivienda' },
    { kanji: '風呂', kana: 'ふろ', romaji: 'furo', meaning: 'Baño / Tina de baño', type: 'Sustantivo', category: 'Vivienda' },
    { kanji: '冷蔵庫', kana: 'れいぞうこ', romaji: 'reizouko', meaning: 'Nevera / Frigorífico', type: 'Sustantivo', category: 'Electrodomésticos' },
    { kanji: '古い', kana: 'ふるい', romaji: 'furui', meaning: 'Viejo / Antiguo', type: 'Adjetivo -i', category: 'Cualidades' },
    { kanji: '明るい', kana: 'あかるい', romaji: 'akarui', meaning: 'Luminoso / Claro', type: 'Adjetivo -i', category: 'Cualidades' }
  ],

  // === MÓDULO 7 ===
  '7_1': [
    { kanji: '本', kana: 'ほん', romaji: 'hon', meaning: 'Libro', type: 'Sustantivo', category: 'Objetos' },
    { kanji: 'ペン', kana: 'ぺん', romaji: 'pen', meaning: 'Bolígrafo / Pluma', type: 'Sustantivo', category: 'Objetos' },
    { kanji: 'パソコン', kana: 'ぱそこん', romaji: 'pasokon', meaning: 'Ordenador / Computadora', type: 'Sustantivo', category: 'Objetos' },
    { kanji: '下', kana: 'した', romaji: 'shita', meaning: 'Abajo / Debajo', type: 'Sustantivo', category: 'Posición' }
  ],
  '7_2': [
    { kanji: '前', kana: 'まえ', romaji: 'mae', meaning: 'Delante / Frente', type: 'Sustantivo', category: 'Posición' },
    { kanji: '後ろ', kana: 'うしろ', romaji: 'ushiro', meaning: 'Detrás', type: 'Sustantivo', category: 'Posición' },
    { kanji: '近く', kana: 'ちかく', romaji: 'chikaku', meaning: 'Cerca', type: 'Sustantivo', category: 'Posición' }
  ],

  // === MÓDULO 8 ===
  '8_1': [
    { kanji: '何時', kana: 'なんじ', romaji: 'nanji', meaning: 'Qué hora', type: 'Interrogativo', category: 'Tiempo' },
    { kanji: '夜', kana: 'よる', romaji: 'yoru', meaning: 'Noche', type: 'Sustantivo', category: 'Tiempo' }
  ],
  '8_2': [
    { kanji: '火曜日', kana: 'かようび', romaji: 'kayoubi', meaning: 'Martes', type: 'Fecha', category: 'Días de la Semana' },
    { kanji: '水曜日', kana: 'すいようび', romaji: 'suiyoubi', meaning: 'Miércoles', type: 'Fecha', category: 'Días de la Semana' },
    { kanji: '木曜日', kana: 'もくようび', romaji: 'mokuyoubi', meaning: 'Jueves', type: 'Fecha', category: 'Días de la Semana' },
    { kanji: '土曜日', kana: 'どようび', romaji: 'doyoubi', meaning: 'Sábado', type: 'Fecha', category: 'Días de la Semana' }
  ],

  // === MÓDULO 9 ===
  '9_1': [
    { kanji: 'コピー', kana: 'こぴー', romaji: 'kopii', meaning: 'Fotocopia', type: 'Sustantivo', category: 'Trabajo' },
    { kanji: '書類', kana: 'しょるい', romaji: 'shorui', meaning: 'Documento / Papeles', type: 'Sustantivo', category: 'Trabajo' },
    { kanji: 'お願いします', kana: 'おねがいします', romaji: 'onegaishimasu', meaning: 'Por favor', type: 'Expresión', category: 'Saludos y Cortesía' },
    { kanji: '待つ', kana: 'まつ', romaji: 'matsu', meaning: 'Esperar', type: 'Verbo', category: 'Verbos' },
    { kanji: '貸す', kana: 'かす', romaji: 'kasu', meaning: 'Prestar', type: 'Verbo', category: 'Verbos' }
  ],

  // === MÓDULO 10 ===
  '10_1': [
    { kanji: '音楽', kana: 'おんがく', romaji: 'ongaku', meaning: 'Música', type: 'Sustantivo', category: 'Aficiones' },
    { kanji: '本', kana: 'ほん', romaji: 'hon', meaning: 'Libro', type: 'Sustantivo', category: 'Aficiones' },
    { kanji: '写真', kana: 'しゃしん', romaji: 'shashin', meaning: 'Fotografía', type: 'Sustantivo', category: 'Aficiones' },
    { kanji: 'スポーツ', kana: 'すぽーつ', romaji: 'supootsu', meaning: 'Deporte', type: 'Sustantivo', category: 'Aficiones' },
    { kanji: '旅行', kana: 'りょこう', romaji: 'ryokou', meaning: 'Viaje', type: 'Sustantivo', category: 'Aficiones' },
    { kanji: '映画', kana: 'えいが', romaji: 'eiga', meaning: 'Película / Cine', type: 'Sustantivo', category: 'Aficiones' },
    { kanji: '撮ります', kana: 'とります', romaji: 'torimasu', meaning: 'Tomar (fotos) / Grabar', type: 'Verbo', category: 'Verbos' }
  ],
  '10_2': [
    { kanji: '歌', kana: 'うた', romaji: 'uta', meaning: 'Canción', type: 'Sustantivo', category: 'Aficiones' },
    { kanji: '料理', kana: 'りょうり', romaji: 'ryouri', meaning: 'Cocina / Comida preparada', type: 'Sustantivo', category: 'Aficiones' },
    { kanji: 'ゲーム', kana: 'げーむ', romaji: 'geemu', meaning: 'Videojuego / Juego', type: 'Sustantivo', category: 'Aficiones' },
    { kanji: '週末', kana: 'しゅうまつ', romaji: 'shuumatsu', meaning: 'Fin de semana', type: 'Sustantivo', category: 'Tiempo' },
    { kanji: '公園', kana: 'こうえん', romaji: 'kouen', meaning: 'Parque', type: 'Sustantivo', category: 'Lugares' },
    { kanji: 'します', kana: 'します', romaji: 'shimasu', meaning: 'Hacer', type: 'Verbo', category: 'Verbos' },
    { kanji: '遊びます', kana: 'あそびます', romaji: 'asobimasu', meaning: 'Jugar / Divertirse / Pasar el rato', type: 'Verbo', category: 'Verbos' }
  ],

  // === MÓDULO 11 ===
  '11_1': [
    { kanji: '明日', kana: 'あした', romaji: 'ashita', meaning: 'Mañana', type: 'Sustantivo', category: 'Tiempo' },
    { kanji: '昨日', kana: 'きのう', romaji: 'kinou', meaning: 'Ayer', type: 'Sustantivo', category: 'Tiempo' },
    { kanji: '来週', kana: 'らいしゅう', romaji: 'raishuu', meaning: 'La próxima semana', type: 'Sustantivo', category: 'Tiempo' },
    { kanji: '祭り', kana: 'まつり', romaji: 'matsuri', meaning: 'Festival / Fiesta tradicional', type: 'Sustantivo', category: 'Eventos' },
    { kanji: 'コンサート', kana: 'こんさーと', romaji: 'konsaato', meaning: 'Concierto', type: 'Sustantivo', category: 'Eventos' },
    { kanji: 'イベント', kana: 'いべんと', romaji: 'ibento', meaning: 'Evento', type: 'Sustantivo', category: 'Eventos' }
  ],

  // === MÓDULO 12 ===
  '12_1': [
    { kanji: '地下鉄', kana: 'ちかてつ', romaji: 'chikatetsu', meaning: 'Metro / Subterráneo', type: 'Sustantivo', category: 'Transporte' },
    { kanji: '自転車', kana: 'じてんしゃ', romaji: 'jitensha', meaning: 'Bicicleta', type: 'Sustantivo', category: 'Transporte' },
    { kanji: '歩いて', kana: 'あるいて', romaji: 'aruite', meaning: 'A pie / Caminando', type: 'Expresión', category: 'Transporte' },
    { kanji: '駅', kana: 'えき', romaji: 'eki', meaning: 'Estación de tren', type: 'Sustantivo', category: 'Lugares' },
    { kanji: '空港', kana: 'くうこう', romaji: 'kuukou', meaning: 'Aeropuerto', type: 'Sustantivo', category: 'Lugares' }
  ],
  '12_2': [
    { kanji: 'どのくらい', kana: 'どのくらい', romaji: 'dono kurai', meaning: 'Cuánto tiempo (aproximadamente)', type: 'Interrogativo', category: 'Preguntas' },
    { kanji: '遠い', kana: 'とおい', romaji: 'tooi', meaning: 'Lejos / Distante', type: 'Adjetivo -i', category: 'Cualidades' },
    { kanji: '近い', kana: 'ちかい', romaji: 'chikai', meaning: 'Cerca / Cercano', type: 'Adjetivo -i', category: 'Cualidades' },
    { kanji: '東京', kana: 'とうきょう', romaji: 'toukyou', meaning: 'Tokio', type: 'Sustantivo', category: 'Ciudades' }
  ],
  '12_3': [
    { kanji: '改札', kana: 'かいさつ', romaji: 'kaisatsu', meaning: 'Torniquete / Barrera de boletos', type: 'Sustantivo', category: 'Transporte' },
    { kanji: '出口', kana: 'でぐち', romaji: 'deguchi', meaning: 'Salida', type: 'Sustantivo', category: 'Lugares' },
    { kanji: '入口', kana: 'いりぐち', romaji: 'iriguchi', meaning: 'Entrada', type: 'Sustantivo', category: 'Lugares' },
    { kanji: '番線', kana: 'ばんせん', romaji: 'bansen', meaning: 'Vía / Andén número...', type: 'Contador', category: 'Transporte' }
  ],

  // === MÓDULO 13 ===
  '13_1': [
    { kanji: '信号', kana: 'しんごう', romaji: 'shingou', meaning: 'Semáforo', type: 'Sustantivo', category: 'Ciudad' },
    { kanji: '橋', kana: 'はし', romaji: 'hashi', meaning: 'Puente', type: 'Sustantivo', category: 'Ciudad' },
    { kanji: '渡る', kana: 'わたる', romaji: 'wataru', meaning: 'Cruzar (una calle o puente)', type: 'Verbo', category: 'Verbos' }
  ],

  // === MÓDULO 14 ===
  '14_1': [
    { kanji: '服', kana: 'ふく', romaji: 'fuku', meaning: 'Ropa / Vestimenta', type: 'Sustantivo', category: 'Compras' },
    { kanji: '靴', kana: 'くつ', romaji: 'kutsu', meaning: 'Zapatos / Calzado', type: 'Sustantivo', category: 'Compras' },
    { kanji: '鞄', kana: 'かばん', romaji: 'kaban', meaning: 'Bolso / Maletín', type: 'Sustantivo', category: 'Compras' },
    { kanji: '見せてください', kana: 'みせてください', romaji: 'misete kudasai', meaning: 'Muéstreme por favor', type: 'Expresión', category: 'Compras' }
  ],

  // === MÓDULO 15 ===
  '15_1': [
    { kanji: '円', kana: 'えん', romaji: 'en', meaning: 'Yen (moneda japonesa)', type: 'Sustantivo', category: 'Compras' },
    { kanji: 'いくら', kana: 'いくら', romaji: 'ikura', meaning: 'Cuánto cuesta', type: 'Interrogativo', category: 'Preguntas' },
    { kanji: '袋', kana: 'ふくろ', romaji: 'fukuro', meaning: 'Bolsa de plástico / compras', type: 'Sustantivo', category: 'Compras' },
    { kanji: 'レシート', kana: 'れしーと', romaji: 'reshiito', meaning: 'Recibo / Ticket', type: 'Sustantivo', category: 'Compras' },
    { kanji: 'お釣り', kana: 'おつり', romaji: 'otsuri', meaning: 'Cambio / Vuelto', type: 'Sustantivo', category: 'Compras' },
    { kanji: '温める', kana: 'あたためる', romaji: 'atatameru', meaning: 'Calentar (comida en combini)', type: 'Verbo', category: 'Verbos' }
  ],

  // === MÓDULO 16 ===
  '16_1': [
    { kanji: '高かった', kana: 'たかかった', romaji: 'takakatta', meaning: 'Estuvo caro / Fue caro', type: 'Adjetivo -i', category: 'Cualidades' },
    { kanji: '安かった', kana: 'やすかった', romaji: 'yasukatta', meaning: 'Estuvo barato / Fue barato', type: 'Adjetivo -i', category: 'Cualidades' },
    { kanji: '賑やかでした', kana: 'にぎやかでした', romaji: 'nigiyakadeshita', meaning: 'Estuvo animado / concurrido', type: 'Adjetivo -na', category: 'Cualidades' }
  ],
  '16_2': [
    { kanji: '雪', kana: 'ゆき', romaji: 'yuki', meaning: 'Nieve', type: 'Sustantivo', category: 'Clima' },
    { kanji: '曇り', kana: 'くもり', romaji: 'kumori', meaning: 'Nublado', type: 'Sustantivo', category: 'Clima' }
  ],
  '16_3': [
    { kanji: '神社', kana: 'じんじゃ', romaji: 'jinja', meaning: 'Santuario sintoísta', type: 'Sustantivo', category: 'Lugares' },
    { kanji: '散歩', kana: 'さんぽ', romaji: 'sanpo', meaning: 'Paseo / Caminata', type: 'Sustantivo', category: 'Ocio' }
  ],

  // === MÓDULO 17 ===
  '17_1': [
    { kanji: '山', kana: 'やま', romaji: 'yama', meaning: 'Montaña', type: 'Sustantivo', category: 'Naturaleza' },
    { kanji: '川', kana: 'かわ', romaji: 'kawa', meaning: 'Río', type: 'Sustantivo', category: 'Naturaleza' },
    { kanji: '海', kana: 'うみ', romaji: 'umi', meaning: 'Mar / Océano', type: 'Sustantivo', category: 'Naturaleza' },
    { kanji: '景色', kana: 'けしき', romaji: 'keshiki', meaning: 'Paisaje / Vista', type: 'Sustantivo', category: 'Viajes' }
  ],
  '17_2': [
    { kanji: '計画', kana: 'けいかく', romaji: 'keikaku', meaning: 'Plan / Planificación', type: 'Sustantivo', category: 'Viajes' },
    { kanji: '荷物', kana: 'にもつ', romaji: 'nimotsu', meaning: 'Equipaje / Maleta', type: 'Sustantivo', category: 'Viajes' },
    { kanji: '出発', kana: 'しゅっぱつ', romaji: 'shuppatsu', meaning: 'Salida / Partida', type: 'Sustantivo', category: 'Viajes' },
    { kanji: '入る', kana: 'はいる', romaji: 'hairu', meaning: 'Entrar / Bañarse (en aguas termales)', type: 'Verbo', category: 'Verbos' }
  ],

  // === MÓDULO 18 ===
  '18_1': [
    { kanji: 'お腹', kana: 'おなか', romaji: 'onaka', meaning: 'Estómago / Vientre', type: 'Sustantivo', category: 'Cuerpo' },
    { kanji: '喉', kana: 'のど', romaji: 'nodo', meaning: 'Garganta', type: 'Sustantivo', category: 'Cuerpo' },
    { kanji: '薬', kana: 'くすり', romaji: 'kusuri', meaning: 'Medicina / Medicamento', type: 'Sustantivo', category: 'Salud' },
    { kanji: '病院', kana: 'びょういん', romaji: 'byouin', meaning: 'Hospital / Clínica', type: 'Sustantivo', category: 'Lugares' },
    { kanji: '医者', kana: 'いしゃ', romaji: 'isha', meaning: 'Médico / Doctor', type: 'Sustantivo', category: 'Personas y Profesiones' }
  ],
  '18_2': [
    { kanji: '寝る', kana: 'ねる', romaji: 'neru', meaning: 'Dormir / Acostarse', type: 'Verbo', category: 'Verbos' },
    { kanji: '休む', kana: 'やすむ', romaji: 'yasumu', meaning: 'Descansar / Faltar al trabajo', type: 'Verbo', category: 'Verbos' },
    { kanji: '飲む', kana: 'のむ', romaji: 'nomu', meaning: 'Tomar (medicina) / Beber', type: 'Verbo', category: 'Verbos' },
    { kanji: '無理', kana: 'むり', romaji: 'muri', meaning: 'Sobreesfuerzo / Imposible', type: 'Adjetivo -na', category: 'Salud' },
    { kanji: '元気', kana: 'げんき', romaji: 'genki', meaning: 'Sano / Con vitalidad', type: 'Adjetivo -na', category: 'Salud' }
  ],

  // === MÓDULO 19 (10 términos completos) ===
  '19_1': [
    { kanji: '夢', kana: 'ゆめ', romaji: 'yume', meaning: 'Sueño / Aspiración / Meta personal', type: 'Sustantivo', category: 'Vida Diaria' },
    { kanji: '教師', kana: 'きょうし', romaji: 'kyoushi', meaning: 'Profesor / Docente', type: 'Sustantivo', category: 'Personas y Profesiones' },
    { kanji: '上手', kana: 'じょうず', romaji: 'jouzu', meaning: 'Habilidoso / Diestro / Bueno en algo', type: 'Adjetivo -na', category: 'Cualidades' },
    { kanji: '教える', kana: 'おしえる', romaji: 'oshieru', meaning: 'Enseñar / Indicar / Informar', type: 'Verbo Ichidan', category: 'Verbos' },
    { kanji: '連絡先', kana: 'れんらくさき', romaji: 'renrakusaki', meaning: 'Datos de contacto / Información de contacto', type: 'Sustantivo', category: 'Comunicación' },
    { kanji: '送る', kana: 'おくる', romaji: 'okuru', meaning: 'Enviar (mensajes) / Despedir o acompañar', type: 'Verbo Godan', category: 'Verbos' },
    { kanji: '会う', kana: 'あう', romaji: 'au', meaning: 'Encontrarse con / Verse con alguien', type: 'Verbo Godan', category: 'Verbos' },
    { kanji: 'お世話', kana: 'おせわ', romaji: 'osewa', meaning: 'Atenciones / Cuidados / Ayuda recibida', type: 'Expresión / Sustantivo', category: 'Saludos y Cortesía' },
    { kanji: '元気', kana: 'げんき', romaji: 'genki', meaning: 'Sano / Enérgico / Con vitalidad', type: 'Adjetivo -na', category: 'Salud y Estado' },
    { kanji: 'がんばる', kana: 'がんばる', romaji: 'ganbaru', meaning: 'Esforzarse / Dar lo mejor de uno mismo', type: 'Verbo Godan', category: 'Verbos' }
  ],

  // === MÓDULO 20 ===
  '20_1': [
    { kanji: '到着', kana: 'とうちゃく', romaji: 'touchaku', meaning: 'Llegada', type: 'Sustantivo', category: 'Viajes' },
    { kanji: '職場', kana: 'しょくば', romaji: 'shokuba', meaning: 'Lugar de trabajo', type: 'Sustantivo', category: 'Trabajo' },
    { kanji: '同僚', kana: 'どうりょう', romaji: 'douryou', meaning: 'Compañero de trabajo / Colega', type: 'Sustantivo', category: 'Personas' },
    { kanji: '最近', kana: 'さいきん', romaji: 'saikin', meaning: 'Recientemente / Últimamente', type: 'Adverbio', category: 'Tiempo' },
    { kanji: '住む', kana: 'すむ', romaji: 'sumu', meaning: 'Vivir / Residir', type: 'Verbo', category: 'Vida Diaria' }
  ],
  '20_2': [
    { kanji: '印象', kana: 'いんしょう', romaji: 'inshou', meaning: 'Impresión (percepción)', type: 'Sustantivo', category: 'Psicología' },
    { kanji: '親切', kana: 'しんせつ', romaji: 'shinsetsu', meaning: 'Amable / Atento / Servicial', type: 'Adjetivo -na', category: 'Cualidades' },
    { kanji: '静か', kana: 'しずか', romaji: 'shizuka', meaning: 'Tranquilo / Silencioso', type: 'Adjetivo -na', category: 'Cualidades' },
    { kanji: '早い', kana: 'はやい', romaji: 'hayai', meaning: 'Rápido / Veloz', type: 'Adjetivo -i', category: 'Cualidades' },
    { kanji: '働く', kana: 'はたらく', romaji: 'hataraku', meaning: 'Trabajar / Laborar', type: 'Verbo', category: 'Trabajo' }
  ],

  // === MÓDULO 21 ===
  '21_1': [
    { kanji: '牛肉', kana: 'ぎゅうにく', romaji: 'gyuuniku', meaning: 'Carne de vacuno', type: 'Sustantivo', category: 'Comida' },
    { kanji: '魚', kana: 'さかな', romaji: 'sakana', meaning: 'Pescado', type: 'Sustantivo', category: 'Comida' },
    { kanji: '食べられる', kana: 'たべられる', romaji: 'taberareru', meaning: 'Poder comer (forma potencial)', type: 'Verbo', category: 'Comida' },
    { kanji: '確認', kana: 'かくにん', romaji: 'kakunin', meaning: 'Confirmación / Verificación', type: 'Sustantivo', category: 'Comunicación' },
    { kanji: '苦手', kana: 'にがて', romaji: 'nigate', meaning: 'No ser afín a / Darse mal / No tolerar', type: 'Adjetivo -na', category: 'Cualidades' }
  ],
  '21_2': [
    { kanji: '注文', kana: 'ちゅうもん', romaji: 'chuumon', meaning: 'Pedido / Encargo', type: 'Sustantivo', category: 'Restaurante' },
    { kanji: '醤油', kana: 'しょうゆ', romaji: 'shouyu', meaning: 'Salsa de soja', type: 'Sustantivo', category: 'Gastronomía' },
    { kanji: '味', kana: 'あじ', romaji: 'aji', meaning: 'Sabor / Gusto', type: 'Sustantivo', category: 'Gastronomía' },
    { kanji: '召し上がる', kana: 'めしあがる', romaji: 'meshiagaru', meaning: 'Comer / Degustar (lenguaje honorífico)', type: 'Verbo', category: 'Restaurante' },
    { kanji: 'ご飯', kana: 'ごはん', romaji: 'gohan', meaning: 'Arroz / Comida', type: 'Sustantivo', category: 'Comida' }
  ],

  // === MÓDULO 22 ===
  '22_1': [
    { kanji: '新幹線', kana: 'しんかんせん', romaji: 'shinkansen', meaning: 'Tren bala (Shinkansen)', type: 'Sustantivo', category: 'Transporte' },
    { kanji: '切符', kana: 'きっぷ', romaji: 'kippu', meaning: 'Billete / Pasaje', type: 'Sustantivo', category: 'Transporte' },
    { kanji: '出発', kana: 'しゅっぱつ', romaji: 'shuppatsu', meaning: 'Salida / Partida', type: 'Sustantivo', category: 'Viajes' },
    { kanji: 'ホテル', kana: 'ほてる', romaji: 'hoteru', meaning: 'Hotel', type: 'Sustantivo', category: 'Viajes' },
    { kanji: '早く', kana: 'はやく', romaji: 'hayaku', meaning: 'Temprano / Con anticipación', type: 'Adverbio', category: 'Tiempo' }
  ],
  '22_2': [
    { kanji: '地元', kana: 'じもと', romaji: 'jimoto', meaning: 'Local / De la zona', type: 'Sustantivo', category: 'Lugares' },
    { kanji: '思い出', kana: 'おもいで', romaji: 'omoide', meaning: 'Recuerdo / Memoria', type: 'Sustantivo', category: 'Viajes' },
    { kanji: '話す', kana: 'はなす', romaji: 'hanasu', meaning: 'Conversar / Hablar', type: 'Verbo', category: 'Comunicación' },
    { kanji: '満足', kana: 'まんぞく', romaji: 'manzoku', meaning: 'Satisfacción', type: 'Sustantivo', category: 'Sentimientos' },
    { kanji: '経験', kana: 'けいけん', romaji: 'keiken', meaning: 'Experiencia vivencial', type: 'Sustantivo', category: 'Vida Diaria' }
  ],

  // === MÓDULO 23 ===
  '23_1': [
    { kanji: '雨天', kana: 'うてん', romaji: 'uten', meaning: 'Tiempo lluvioso', type: 'Sustantivo', category: 'Clima' },
    { kanji: '延期', kana: 'えんき', romaji: 'enki', meaning: 'Aplazamiento / Postergación', type: 'Sustantivo', category: 'Eventos' },
    { kanji: '集合', kana: 'しゅうごう', romaji: 'shuugou', meaning: 'Reunión / Encuentro', type: 'Sustantivo', category: 'Eventos' },
    { kanji: '場所', kana: 'ばしょ', romaji: 'basho', meaning: 'Lugar / Sitio', type: 'Sustantivo', category: 'Lugares' },
    { kanji: '予定', kana: 'よてい', romaji: 'yotei', meaning: 'Plan / Horario programado', type: 'Sustantivo', category: 'Eventos' }
  ],
  '23_2': [
    { kanji: 'ごみ箱', kana: 'ごみばこ', romaji: 'gomibako', meaning: 'Papelera / Contenedor de basura', type: 'Sustantivo', category: 'Vida Diaria' },
    { kanji: '手伝い', kana: 'てつだい', romaji: 'tetsudai', meaning: 'Ayuda / Asistencia', type: 'Sustantivo', category: 'Sociedad' },
    { kanji: '受付', kana: 'うけつけ', romaji: 'uketsuke', meaning: 'Recepción / Mostrador de entrada', type: 'Sustantivo', category: 'Lugares' },
    { kanji: '無料', kana: 'むりょう', romaji: 'muryou', meaning: 'Gratuito / Sin costo', type: 'Sustantivo', category: 'Economía' },
    { kanji: '探す', kana: 'さがす', romaji: 'sagasu', meaning: 'Buscar', type: 'Verbo', category: 'Acciones' }
  ],

  // === MÓDULO 24 ===
  '24_1': [
    { kanji: 'ネクタイ', kana: 'ねくたい', romaji: 'nekutai', meaning: 'Corbata', type: 'Sustantivo', category: 'Ropa' },
    { kanji: '締める', kana: 'しめる', romaji: 'shimeru', meaning: 'Atar / Ajustarse la corbata', type: 'Verbo', category: 'Acciones' },
    { kanji: '靴', kana: 'くつ', romaji: 'kutsu', meaning: 'Zapatos / Calzado formal', type: 'Sustantivo', category: 'Ropa' },
    { kanji: '礼儀', kana: 'れいぎ', romaji: 'reigi', meaning: 'Cortesía / Etiqueta social', type: 'Sustantivo', category: 'Cultura' },
    { kanji: '特別', kana: 'とくべつ', romaji: 'tokubetsu', meaning: 'Especial / Particular', type: 'Adjetivo -na', category: 'Cualidades' }
  ],
  '24_2': [
    { kanji: '手袋', kana: 'てぶくろ', romaji: 'tebukuro', meaning: 'Guantes', type: 'Sustantivo', category: 'Ropa' },
    { kanji: 'はめる', kana: 'はめる', romaji: 'hameru', meaning: 'Ponerse guantes / anillo', type: 'Verbo', category: 'Acciones' },
    { kanji: '新年', kana: 'しんねん', romaji: 'shinnen', meaning: 'Año Nuevo', type: 'Sustantivo', category: 'Tradición' },
    { kanji: '挨拶', kana: 'あいさつ', romaji: 'aisatsu', meaning: 'Saludo ceremonial', type: 'Sustantivo', category: 'Cortesía' },
    { kanji: '出かける', kana: 'でかける', romaji: 'dekakeru', meaning: 'Salir de casa', type: 'Verbo', category: 'Acciones' }
  ],

  // === MÓDULO 25 ===
  '25_1': [
    { kanji: '靴', kana: 'くつ', romaji: 'kutsu', meaning: 'Zapatos / Calzado', type: 'Sustantivo', category: 'Compras' },
    { kanji: '滑る', kana: 'すべる', romaji: 'suberu', meaning: 'Resbalar / Deslizarse', type: 'Verbo', category: 'Acciones' },
    { kanji: '安全', kana: 'あんぜん', romaji: 'anzen', meaning: 'Seguro / Seguridad', type: 'Adjetivo -na', category: 'Cualidades' },
    { kanji: '値段', kana: 'ねだん', romaji: 'nedan', meaning: 'Precio / Coste', type: 'Sustantivo', category: 'Compras' },
    { kanji: '便利', kana: 'べんり', romaji: 'benri', meaning: 'Cómodo / Práctico', type: 'Adjetivo -na', category: 'Cualidades' }
  ],
  '25_2': [
    { kanji: '鍵', kana: 'かぎ', romaji: 'kagi', meaning: 'Llave / Cerradura', type: 'Sustantivo', category: 'Hogar' },
    { kanji: 'かける', kana: 'かける', romaji: 'kakeru', meaning: 'Echar la llave / Cerrar con llave', type: 'Verbo', category: 'Acciones' },
    { kanji: 'ポイント', kana: 'ぽいんと', romaji: 'pointo', meaning: 'Puntos de fidelidad de compra', type: 'Sustantivo', category: 'Compras' },
    { kanji: 'レジ', kana: 'れじ', romaji: 'reji', meaning: 'Caja registradora', type: 'Sustantivo', category: 'Compras' },
    { kanji: '失くす', kana: 'なくす', romaji: 'nakusu', meaning: 'Extraviar / Perder un objeto', type: 'Verbo', category: 'Acciones' }
  ],

  // === MÓDULO 26 ===
  '26_1': [
    { kanji: '机', kana: 'つくえ', romaji: 'tsukue', meaning: 'Escritorio / Mesa de trabajo', type: 'Sustantivo', category: 'Oficina' },
    { kanji: '資料', kana: 'しりょう', romaji: 'shiryou', meaning: 'Documentos / Material informativo', type: 'Sustantivo', category: 'Oficina' },
    { kanji: '並べる', kana: 'ならべる', romaji: 'naraberu', meaning: 'Ordenar / Disponer en fila', type: 'Verbo', category: 'Acciones' },
    { kanji: '窓口', kana: 'まどぐち', romaji: 'madoguchi', meaning: 'Ventanilla de atención al público', type: 'Sustantivo', category: 'Servicios' },
    { kanji: '提出', kana: 'ていしゅつ', romaji: 'teishutsu', meaning: 'Entrega / Presentación de trámites', type: 'Sustantivo', category: 'Servicios' }
  ],
  '26_2': [
    { kanji: '髪', kana: 'かみ', romaji: 'kami', meaning: 'Cabello / Pelo', type: 'Sustantivo', category: 'Cuerpo' },
    { kanji: '横', kana: 'よこ', romaji: 'yoko', meaning: 'Lado / Costado', type: 'Sustantivo', category: 'Posición' },
    { kanji: 'すく', kana: 'すく', romaji: 'suku', meaning: 'Vaciar / Entresacar cabello', type: 'Verbo', category: 'Estética' },
    { kanji: '希望', kana: 'きぼう', romaji: 'kibou', meaning: 'Preferencia / Deseo', type: 'Sustantivo', category: 'Comunicación' },
    { kanji: '予約', kana: 'よやく', romaji: 'yoyaku', meaning: 'Cita previa / Reserva', type: 'Sustantivo', category: 'Servicios' }
  ],

  // === MÓDULO 27 ===
  '27_1': [
    { kanji: 'ドア', kana: 'どあ', romaji: 'doa', meaning: 'Puerta', type: 'Sustantivo', category: 'Hogar' },
    { kanji: '開ける', kana: 'あける', romaji: 'akeru', meaning: 'Abrir', type: 'Verbo', category: 'Acciones' },
    { kanji: '電気', kana: 'でんき', romaji: 'denki', meaning: 'Electricidad / Luz eléctrica', type: 'Sustantivo', category: 'Hogar' },
    { kanji: '資源', kana: 'しげん', romaji: 'shigen', meaning: 'Recursos naturales / reciclables', type: 'Sustantivo', category: 'Medio Ambiente' },
    { kanji: '節約', kana: 'せつやく', romaji: 'setsuyaku', meaning: 'Ahorro / Consumo moderado', type: 'Sustantivo', category: 'Sostenibilidad' }
  ],
  '27_2': [
    { kanji: '頭', kana: 'あたま', romaji: 'atama', meaning: 'Cabeza', type: 'Sustantivo', category: 'Cuerpo' },
    { kanji: '保護', kana: 'ほご', romaji: 'hogo', meaning: 'Protección / Amparo', type: 'Sustantivo', category: 'Seguridad' },
    { kanji: '収まる', kana: 'おさまる', romaji: 'osamaru', meaning: 'Calmarse / Cesar (un temblor)', type: 'Verbo', category: 'Naturaleza' },
    { kanji: '非常口', kana: 'ひじょうぐち', romaji: 'hijouguchi', meaning: 'Salida de emergencia', type: 'Sustantivo', category: 'Seguridad' },
    { kanji: '安全', kana: 'あんぜん', romaji: 'anzen', meaning: 'Seguridad física', type: 'Adjetivo -na', category: 'Seguridad' }
  ],

  // === MÓDULO 28 ===
  '28_1': [
    { kanji: '習慣', kana: 'しゅうかん', romaji: 'shuukan', meaning: 'Costumbre / Hábito sociocultural', type: 'Sustantivo', category: 'Cultura' },
    { kanji: '理解', kana: 'りかい', romaji: 'rikai', meaning: 'Comprensión / Entendimiento', type: 'Sustantivo', category: 'Mente' },
    { kanji: 'できる', kana: 'できる', romaji: 'dekiru', meaning: 'Ser capaz / Lograr hacer', type: 'Verbo', category: 'Capacidades' },
    { kanji: '独立', kana: 'どくりつ', romaji: 'dokuritsu', meaning: 'Independencia laboral o personal', type: 'Sustantivo', category: 'Metas' },
    { kanji: '努力', kana: 'どりょく', romaji: 'doryoku', meaning: 'Esfuerzo continuado', type: 'Sustantivo', category: 'Metas' }
  ],
  '28_2': [
    { kanji: '来年', kana: 'らいねん', romaji: 'rainen', meaning: 'El año próximo', type: 'Sustantivo', category: 'Tiempo' },
    { kanji: '受験', kana: 'じゅけん', romaji: 'juken', meaning: 'Presentarse a examen oficial', type: 'Sustantivo', category: 'Educación' },
    { kanji: '計画', kana: 'けいかく', romaji: 'keikaku', meaning: 'Plan / Proyecto de vida', type: 'Sustantivo', category: 'Metas' },
    { kanji: '応援', kana: 'おうえん', romaji: 'ouen', meaning: 'Apoyo / Aliento moral', type: 'Sustantivo', category: 'Relaciones' },
    { kanji: '成功', kana: 'せいこう', romaji: 'seikou', meaning: 'Éxito / Triunfo', type: 'Sustantivo', category: 'Metas' }
  ],

  // === MÓDULO 29 ===
  '29_1': [
    { kanji: 'ライブ', kana: 'らいぶ', romaji: 'raibu', meaning: 'Concierto en vivo', type: 'Sustantivo', category: 'Música' },
    { kanji: 'チケット', kana: 'ちけっと', romaji: 'chiketto', meaning: 'Entrada / Boleto de espectáculo', type: 'Sustantivo', category: 'Ocio' },
    { kanji: '取る', kana: 'とる', romaji: 'toru', meaning: 'Conseguir / Adquirir boletos', type: 'Verbo', category: 'Acciones' },
    { kanji: '話題', kana: 'わだい', romaji: 'wadai', meaning: 'Tema de conversación de moda', type: 'Sustantivo', category: 'Comunicación' },
    { kanji: 'ファン', kana: 'ふぁん', romaji: 'fan', meaning: 'Aficionado / Seguidor / Fan', type: 'Sustantivo', category: 'Ocio' }
  ],
  '29_2': [
    { kanji: '漫画', kana: 'まんが', romaji: 'manga', meaning: 'Cómic japonés / Manga', type: 'Sustantivo', category: 'Cultura Pop' },
    { kanji: '主人公', kana: 'しゅじんこう', romaji: 'shujinkou', meaning: 'Personaje protagonista', type: 'Sustantivo', category: 'Narrativa' },
    { kanji: '成長', kana: 'せいちょう', romaji: 'seichou', meaning: 'Maduración / Crecimiento personal', type: 'Sustantivo', category: 'Narrativa' },
    { kanji: '描く', kana: 'えがく', romaji: 'egaku', meaning: 'Retratar / Dibujar una historia', type: 'Verbo', category: 'Arte' },
    { kanji: '監督', kana: 'かんとく', romaji: 'kantoku', meaning: 'Director de cine o animación', type: 'Sustantivo', category: 'Cine' }
  ],

  // === MÓDULO 30 ===
  '30_1': [
    { kanji: '鍵', kana: 'かぎ', romaji: 'kagi', meaning: 'Cerradura / Llave', type: 'Sustantivo', category: 'Hogar' },
    { kanji: '調子', kana: 'ちょうし', romaji: 'choushi', meaning: 'Estado de funcionamiento', type: 'Sustantivo', category: 'Condición' },
    { kanji: '悪い', kana: 'わるい', romaji: 'warui', meaning: 'Malo / Defectuoso / Descompuesto', type: 'Adjetivo -i', category: 'Cualidades' },
    { kanji: '不動産', kana: 'ふどうさん', romaji: 'fudousan', meaning: 'Agencia inmobiliaria', type: 'Sustantivo', category: 'Vivienda' },
    { kanji: '水漏れ', kana: 'みずもれ', romaji: 'mizumore', meaning: 'Fuga de agua / Gotera', type: 'Sustantivo', category: 'Averías' }
  ],
  '30_2': [
    { kanji: '南向き', kana: 'みなみむき', romaji: 'minamimuki', meaning: 'Orientación sur (máxima luz solar)', type: 'Sustantivo', category: 'Vivienda' },
    { kanji: '日当たり', kana: 'ひあたり', romaji: 'hiatari', meaning: 'Exposición y entrada de sol', type: 'Sustantivo', category: 'Vivienda' },
    { kanji: '部屋', kana: 'へや', romaji: 'heya', meaning: 'Piso / Habitación', type: 'Sustantivo', category: 'Vivienda' },
    { kanji: '希望', kana: 'きぼう', romaji: 'kibou', meaning: 'Preferencia / Requisito deseado', type: 'Sustantivo', category: 'Vivienda' },
    { kanji: '契約', kana: 'けいやく', romaji: 'keiyaku', meaning: 'Firma de contrato de arrendamiento', type: 'Sustantivo', category: 'Legal' }
  ],

  // === MÓDULO 31 ===
  '31_1': [
    { kanji: '塩分', kana: 'えんぶん', romaji: 'enbun', meaning: 'Salinidad / Cantidad de sal', type: 'Sustantivo', category: 'Nutrición' },
    { kanji: '取る', kana: 'とる', romaji: 'toru', meaning: 'Consumir / Ingerir nutrientes', type: 'Verbo', category: 'Salud' },
    { kanji: '気をつける', kana: 'きをつける', romaji: 'ki o tsukeru', meaning: 'Tener cuidado / Prestar atención', type: 'Expresión', category: 'Salud' },
    { kanji: 'レシピ', kana: 'れしぴ', romaji: 'reshipi', meaning: 'Receta de cocina', type: 'Sustantivo', category: 'Cocina' },
    { kanji: '味付け', kana: 'あじつけ', romaji: 'ajitsuke', meaning: 'Sazón / Condimento culinario', type: 'Sustantivo', category: 'Cocina' }
  ],
  '31_2': [
    { kanji: 'うどん', kana: 'うどん', romaji: 'udon', meaning: 'Fideos gruesos udon', type: 'Sustantivo', category: 'Gastronomía' },
    { kanji: 'コシ', kana: 'こし', romaji: 'koshi', meaning: 'Firmeza y elasticidad al dente de los fideos', type: 'Sustantivo', category: 'Gastronomía' },
    { kanji: '味わう', kana: 'あじわう', romaji: 'ajiwau', meaning: 'Saborear / Degustar con deleite', type: 'Verbo', category: 'Gastronomía' },
    { kanji: '旬', kana: 'しゅん', romaji: 'shun', meaning: 'Temporada óptima de un alimento', type: 'Sustantivo', category: 'Gastronomía' },
    { kanji: '食文化', kana: 'しょくぶんか', romaji: 'shokubunka', meaning: 'Cultura gastronómica autóctona', type: 'Sustantivo', category: 'Cultura' }
  ],

  // === MÓDULO 32 ===
  '32_1': [
    { kanji: 'お互い', kana: 'おたがい', romaji: 'otagai', meaning: 'Mutuamente / El uno al otro', type: 'Sustantivo', category: 'Relaciones' },
    { kanji: '助け合う', kana: 'たすけあう', romaji: 'tasukeau', meaning: 'Ayudarse y cooperar mutuamente', type: 'Verbo', category: 'Comunidad' },
    { kanji: '関係', kana: 'かんけい', romaji: 'kankei', meaning: 'Vínculo / Relación humana', type: 'Sustantivo', category: 'Sociedad' },
    { kanji: 'サークル', kana: 'さーくる', romaji: 'saakuru', meaning: 'Club o agrupación aficionada', type: 'Sustantivo', category: 'Comunidad' },
    { kanji: '参加', kana: 'さんか', romaji: 'sanka', meaning: 'Participación en grupo', type: 'Sustantivo', category: 'Comunidad' }
  ],
  '32_2': [
    { kanji: 'どうぞ', kana: 'どうぞ', romaji: 'douzo', meaning: 'Por favor / Con toda confianza', type: 'Adverbio', category: 'Cortesía' },
    { kanji: '使う', kana: 'つかう', romaji: 'tsukau', meaning: 'Utilizar / Disponer de', type: 'Verbo', category: 'Acciones' },
    { kanji: '相談', kana: 'そうだん', romaji: 'soudan', meaning: 'Consulta amistosa / Diálogo', type: 'Sustantivo', category: 'Comunicación' },
    { kanji: 'お礼', kana: 'おれい', romaji: 'orei', meaning: 'Muestra de gratitud / Agradecimiento', type: 'Sustantivo', category: 'Cortesía' },
    { kanji: '親友', kana: 'しんゆう', romaji: 'shinyuu', meaning: 'Amigo íntimo / Confidente', type: 'Sustantivo', category: 'Relaciones' }
  ],

  // === MÓDULO 33 ===
  '33_1': [
    { kanji: '友人', kana: 'ゆうじん', romaji: 'yuujin', meaning: 'Amigo / Conocido', type: 'Sustantivo', category: 'Personas' },
    { kanji: '誘う', kana: 'さそう', romaji: 'sasou', meaning: 'Invitar / Animar a acompañar', type: 'Verbo', category: 'Comunicación' },
    { kanji: '茶道', kana: 'さどう', romaji: 'sadou', meaning: 'Ceremonia japonesa del té', type: 'Sustantivo', category: 'Tradición' },
    { kanji: '習う', kana: 'ならう', romaji: 'narau', meaning: 'Aprender mediante práctica y guía', type: 'Verbo', category: 'Educación' },
    { kanji: '始める', kana: 'はじめる', romaji: 'hajimeru', meaning: 'Comenzar una disciplina', type: 'Verbo', category: 'Acciones' }
  ],
  '33_2': [
    { kanji: 'アプリ', kana: 'あぷり', romaji: 'apuri', meaning: 'Aplicación informática / App móvil', type: 'Sustantivo', category: 'Tecnología' },
    { kanji: '活用', kana: 'かつよう', romaji: 'katsuyou', meaning: 'Aprovechamiento práctico / Uso eficaz', type: 'Sustantivo', category: 'Estudio' },
    { kanji: '隙間時間', kana: 'すきまじかん', romaji: 'sukimajikan', meaning: 'Tiempos muertos / Huecos de tiempo libre', type: 'Sustantivo', category: 'Gestión' },
    { kanji: '有効', kana: 'ゆうこう', romaji: 'yuukou', meaning: 'Eficaz / Válido / Provechoso', type: 'Adjetivo -na', category: 'Cualidades' },
    { kanji: '集中', kana: 'しゅうちゅう', romaji: 'shuuchuu', meaning: 'Concentración mental', type: 'Sustantivo', category: 'Estudio' }
  ],

  // === MÓDULO 34 ===
  '34_1': [
    { kanji: '危険', kana: 'きけん', romaji: 'kiken', meaning: 'Peligro / Riesgo inminente', type: 'Adjetivo -na', category: 'Seguridad' },
    { kanji: '離れる', kana: 'はなれる', romaji: 'hanareru', meaning: 'Alejarse / Distanciarse de un lugar', type: 'Verbo', category: 'Seguridad' },
    { kanji: '事故', kana: 'じこ', romaji: 'jiko', meaning: 'Accidente vial o laboral', type: 'Sustantivo', category: 'Emergencias' },
    { kanji: '通報', kana: 'つうほう', romaji: 'tsuuhou', meaning: 'Aviso urgente a la policía o bomberos', type: 'Sustantivo', category: 'Emergencias' },
    { kanji: '安全', kana: 'あんぜん', romaji: 'anzen', meaning: 'Protección y seguridad ciudadana', type: 'Adjetivo -na', category: 'Seguridad' }
  ],
  '34_2': [
    { kanji: '請求', kana: 'せいきゅう', romaji: 'seikyuu', meaning: 'Cobro / Facturación exigida', type: 'Sustantivo', category: 'Finanzas' },
    { kanji: '身に覚え', kana: 'みにおぼえ', romaji: 'minioboe', meaning: 'Recuerdo de haber incurrido en algo', type: 'Expresión / Sustantivo', category: 'Legal' },
    { kanji: '消費者センター', kana: 'しょうひしゃせんたー', romaji: 'shouhisha sentaa', meaning: 'Oficina de defensa del consumidor', type: 'Sustantivo', category: 'Instituciones' },
    { kanji: '相談', kana: 'そうだん', romaji: 'soudan', meaning: 'Asesoramiento y consulta formal', type: 'Sustantivo', category: 'Legal' },
    { kanji: '確認', kana: 'かくにん', romaji: 'kakunin', meaning: 'Verificación de autenticidad', type: 'Sustantivo', category: 'Seguridad' }
  ],

  // === MÓDULO 35 ===
  '35_1': [
    { kanji: '末永く', kana: 'すえながく', romaji: 'suenagaku', meaning: 'Por siempre / Por dilatados años venideros', type: 'Adverbio', category: 'Cortesía' },
    { kanji: '幸せ', kana: 'しあわせ', romaji: 'shiawase', meaning: 'Felicidad y dicha conyugal', type: 'Adjetivo -na', category: 'Vida' },
    { kanji: '招待', kana: 'しょうたい', romaji: 'shoutai', meaning: 'Invitación a ceremonia', type: 'Sustantivo', category: 'Eventos' },
    { kanji: '感謝', kana: 'かんしゃ', romaji: 'kansha', meaning: 'Gratitud sincera', type: 'Sustantivo', category: 'Sentimientos' },
    { kanji: 'プレゼント', kana: 'ぷれぜんと', romaji: 'purezento', meaning: 'Obsequio / Regalo nupcial', type: 'Sustantivo', category: 'Costumbres' }
  ],
  '35_2': [
    { kanji: '困る', kana: 'こまる', romaji: 'komaru', meaning: 'Encontrarse en aprietos o dificultades', type: 'Verbo', category: 'Emociones' },
    { kanji: 'いつでも', kana: 'いつでも', romaji: 'itsudemo', meaning: 'En cualquier momento / Siempre que haga falta', type: 'Adverbio', category: 'Tiempo' },
    { kanji: '気持ち', kana: 'きもち', romaji: 'kimochi', meaning: 'Sentimientos y ánimo interior', type: 'Sustantivo', category: 'Psicología' },
    { kanji: 'アドバイス', kana: 'あどばいす', romaji: 'adobaisu', meaning: 'Consejo prudencial y orientación', type: 'Sustantivo', category: 'Relaciones' },
    { kanji: '将来', kana: 'しょうらい', romaji: 'shourai', meaning: 'Porvenir / Futuro personal', type: 'Sustantivo', category: 'Vida' }
  ],

  // === MÓDULO 36 ===
  '36_1': [
    { kanji: '歴史', kana: 'れきし', romaji: 'rekishi', meaning: 'Historia y legado patrimonial', type: 'Sustantivo', category: 'Cultura' },
    { kanji: '城下町', kana: 'じょうかまち', romaji: 'joukamachi', meaning: 'Ciudad histórica construida al pie de un castillo', type: 'Sustantivo', category: 'Geografía' },
    { kanji: '街並み', kana: 'まちなみ', romaji: 'machinami', meaning: 'Paisaje urbano y fisonomía de las calles', type: 'Sustantivo', category: 'Turismo' },
    { kanji: '散策', kana: 'さんさく', romaji: 'sansaku', meaning: 'Paseo relajado para disfrutar del entorno', type: 'Sustantivo', category: 'Turismo' },
    { kanji: '観光', kana: 'かんこう', romaji: 'kankou', meaning: 'Turismo e itinerario de visitas', type: 'Sustantivo', category: 'Turismo' }
  ],
  '36_2': [
    { kanji: '露天風呂', kana: 'ろてんぶろ', romaji: 'rotenburo', meaning: 'Baño termal onsen al aire libre', type: 'Sustantivo', category: 'Viajes' },
    { kanji: '部屋', kana: 'へや', romaji: 'heya', meaning: 'Habitación de alojamiento tradicional', type: 'Sustantivo', category: 'Hotelería' },
    { kanji: 'グレードアップ', kana: 'ぐれーどあっぷ', romaji: 'gureedoappu', meaning: 'Mejora de categoría de habitación o servicio', type: 'Sustantivo', category: 'Hotelería' },
    { kanji: '旅館', kana: 'りょかん', romaji: 'ryokan', meaning: 'Posada de hospitalidad tradicional japonesa', type: 'Sustantivo', category: 'Turismo' },
    { kanji: '案内', kana: 'あんない', romaji: 'annai', meaning: 'Guía y orientación turística', type: 'Sustantivo', category: 'Turismo' }
  ],

  // === MÓDULO 37 ===
  '37_1': [
    { kanji: '安全', kana: 'あんぜん', romaji: 'anzen', meaning: 'Seguridad en planta industrial u oficina', type: 'Sustantivo', category: 'Trabajo' },
    { kanji: '衛生', kana: 'えいせい', romaji: 'eisei', meaning: 'Higiene y prevención de riesgos laborales', type: 'Sustantivo', category: 'Normativas' },
    { kanji: '確認', kana: 'かくにん', romaji: 'kakunin', meaning: 'Revisión minuciosa y comprobación de procesos', type: 'Sustantivo', category: 'Procedimientos' },
    { kanji: '業務', kana: 'ぎょうむ', romaji: 'gyoumu', meaning: 'Funciones y responsabilidades asignadas', type: 'Sustantivo', category: 'Trabajo' },
    { kanji: '報告', kana: 'ほうこく', romaji: 'houkoku', meaning: 'Informe de estado al superior jerárquico', type: 'Sustantivo', category: 'Comunicación Corporativa' }
  ],
  '37_2': [
    { kanji: '本日', kana: 'ほんじつ', romaji: 'honjitsu', meaning: 'El día de hoy (registro formal y solemne)', type: 'Sustantivo', category: 'Keigo Corporativo' },
    { kanji: '機会', kana: 'きかい', romaji: 'kikai', meaning: 'Oportunidad o coyuntura otorgada', type: 'Sustantivo', category: 'Protocolo' },
    { kanji: '誠に', kana: 'まことに', romaji: 'makotoni', meaning: 'Sinceramente / En verdad / Con la máxima deferencia', type: 'Adverbio', category: 'Keigo Corporativo' },
    { kanji: '自己PR', kana: 'じこぴーあーる', romaji: 'jiko piiaaru', meaning: 'Exposición personal de virtudes y méritos laborales', type: 'Sustantivo', category: 'Entrevistas' },
    { kanji: '採用', kana: 'さいよう', romaji: 'saiyou', meaning: 'Contratación e incorporación formal a la plantilla', type: 'Sustantivo', category: 'Recursos Humanos' }
  ]
};

module.exports = { VOCAB_EXPANSIONS };
