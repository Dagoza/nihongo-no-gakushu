const fs = require('fs');
const path = require('path');
const wanakana = require('wanakana');

// Master curated dictionary for comprehensive JLPT & everyday Japanese
const CORE_LEXICON = [
  // Pronombres y Demostrativos
  { kanji: '私', hiragana: 'わたし', meaning_es: 'Yo / Mí mismo (primera persona)', category: 'Pronombres', level: 'N5' },
  { kanji: '僕', hiragana: 'ぼく', meaning_es: 'Yo (masculino coloquial)', category: 'Pronombres', level: 'N5' },
  { kanji: '俺', hiragana: 'おれ', meaning_es: 'Yo (masculino informal/fuerte)', category: 'Pronombres', level: 'N4' },
  { kanji: 'あなた', hiragana: 'あなた', meaning_es: 'Tú / Usted', category: 'Pronombres', level: 'N5' },
  { kanji: '彼', hiragana: 'かれ', meaning_es: 'Él / Novio', category: 'Pronombres', level: 'N5' },
  { kanji: '彼女', hiragana: 'かのじょ', meaning_es: 'Ella / Novia', category: 'Pronombres', level: 'N5' },
  { kanji: '私たち', hiragana: 'わたしたち', meaning_es: 'Nosotros / Nosotras', category: 'Pronombres', level: 'N5' },
  { kanji: '彼ら', hiragana: 'かれら', meaning_es: 'Ellos', category: 'Pronombres', level: 'N4' },
  { kanji: 'これ', hiragana: 'これ', meaning_es: 'Esto (cerca del hablante)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'それ', hiragana: 'それ', meaning_es: 'Eso (cerca del oyente)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'あれ', hiragana: 'あれ', meaning_es: 'Aquello (lejos de ambos)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'どれ', hiragana: 'どれ', meaning_es: 'Cuál (interrogativo)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'この', hiragana: 'この', meaning_es: 'Este / Esta (+ sustantivo)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'その', hiragana: 'その', meaning_es: 'Ese / Esa (+ sustantivo)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'あの', hiragana: 'あの', meaning_es: 'Aquel / Aquella (+ sustantivo)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'どの', hiragana: 'どの', meaning_es: 'Cuál (+ sustantivo)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'ここ', hiragana: 'ここ', meaning_es: 'Aquí / Este lugar', category: 'Lugares', level: 'N5' },
  { kanji: 'そこ', hiragana: 'そこ', meaning_es: 'Ahí / Ese lugar', category: 'Lugares', level: 'N5' },
  { kanji: 'あそこ', hiragana: 'あそこ', meaning_es: 'Allí / Aquel lugar lejano', category: 'Lugares', level: 'N5' },
  { kanji: 'どこ', hiragana: 'どこ', meaning_es: 'Dónde (interrogativo de lugar)', category: 'Interrogativos', level: 'N5' },
  { kanji: 'こちら', hiragana: 'こちら', meaning_es: 'Por aquí / Esta dirección / Esta persona (formal)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'そちら', hiragana: 'そちら', meaning_es: 'Por ahí / Esa dirección (formal)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'あちら', hiragana: 'あちら', meaning_es: 'Por allá / Aquella dirección (formal)', category: 'Demostrativos', level: 'N5' },
  { kanji: 'どちら', hiragana: 'どちら', meaning_es: 'Cuál camino / Dónde (formal)', category: 'Interrogativos', level: 'N5' },
  { kanji: '誰', hiragana: 'だれ', meaning_es: 'Quién', category: 'Interrogativos', level: 'N5' },
  { kanji: '何', hiragana: 'なに', meaning_es: 'Qué', category: 'Interrogativos', level: 'N5' },
  { kanji: 'どう', hiragana: 'どう', meaning_es: 'Cómo / De qué manera', category: 'Interrogativos', level: 'N5' },
  { kanji: 'いかが', hiragana: 'いかが', meaning_es: 'Cómo (cortés de どう)', category: 'Cortesía', level: 'N4' },
  { kanji: 'いつ', hiragana: 'いつ', meaning_es: 'Cuándo', category: 'Interrogativos', level: 'N5' },
  { kanji: 'どうして', hiragana: 'どうして', meaning_es: 'Por qué / Cómo es que', category: 'Interrogativos', level: 'N5' },
  { kanji: 'なぜ', hiragana: 'なぜ', meaning_es: 'Por qué (formal)', category: 'Interrogativos', level: 'N4' },
  { kanji: 'いくら', hiragana: 'いくら', meaning_es: 'Cuánto cuesta / Cuánto', category: 'Interrogativos', level: 'N5' },
  { kanji: 'いくつ', hiragana: 'いくつ', meaning_es: 'Cuántos (objetos) / Qué edad', category: 'Interrogativos', level: 'N5' },
  { kanji: '誰か', hiragana: 'だれか', meaning_es: 'Alguien', category: 'Pronombres', level: 'N5' },
  { kanji: '何か', hiragana: 'なにか', meaning_es: 'Algo', category: 'Pronombres', level: 'N5' },
  { kanji: 'どこか', hiragana: 'どこか', meaning_es: 'Algún lugar', category: 'Pronombres', level: 'N5' },
  { kanji: 'いつか', hiragana: 'いつか', meaning_es: 'Algún día / En algún momento', category: 'Pronombres', level: 'N5' },
  { kanji: '誰も', hiragana: 'だれも', meaning_es: 'Nadie (+ negativo) / Todos', category: 'Pronombres', level: 'N5' },
  { kanji: '何も', hiragana: 'なにも', meaning_es: 'Nada (+ negativo)', category: 'Pronombres', level: 'N5' },
  { kanji: 'どこも', hiragana: 'どこも', meaning_es: 'Ningún lugar (+ negativo)', category: 'Pronombres', level: 'N5' },

  // Personas y Profesiones
  { kanji: '人', hiragana: 'ひと', meaning_es: 'Persona / Ser humano', category: 'Personas', level: 'N5' },
  { kanji: '方', hiragana: 'かた', meaning_es: 'Persona (formal) / Manera de hacer', category: 'Personas', level: 'N5' },
  { kanji: '男', hiragana: 'おとこ', meaning_es: 'Hombre / Varón', category: 'Personas', level: 'N5' },
  { kanji: '女', hiragana: 'おんな', meaning_es: 'Mujer', category: 'Personas', level: 'N5' },
  { kanji: '男の人', hiragana: 'おとこのひと', meaning_es: 'Hombre', category: 'Personas', level: 'N5' },
  { kanji: '女の人', hiragana: 'おんなのひと', meaning_es: 'Mujer', category: 'Personas', level: 'N5' },
  { kanji: '男の子', hiragana: 'おとこのこ', meaning_es: 'Niño / Chico', category: 'Personas', level: 'N5' },
  { kanji: '女の子', hiragana: 'おんなのこ', meaning_es: 'Niña / Chica', category: 'Personas', level: 'N5' },
  { kanji: '子供', hiragana: 'こども', meaning_es: 'Niño / Hijo / Hijos', category: 'Personas', level: 'N5' },
  { kanji: '大人', hiragana: 'おとな', meaning_es: 'Adulto', category: 'Personas', level: 'N5' },
  { kanji: '先生', hiragana: 'せんせい', meaning_es: 'Profesor / Maestro / Doctor', category: 'Personas y Profesiones', level: 'N5' },
  { kanji: '学生', hiragana: 'がくせい', meaning_es: 'Estudiante / Alumno', category: 'Personas y Profesiones', level: 'N5' },
  { kanji: '生徒', hiragana: 'せいと', meaning_es: 'Alumno / Escolar', category: 'Personas y Profesiones', level: 'N5' },
  { kanji: '留学生', hiragana: 'りゅうがくせい', meaning_es: 'Estudiante extranjero / De intercambio', category: 'Personas y Profesiones', level: 'N5' },
  { kanji: '友達', hiragana: 'ともだち', meaning_es: 'Amigo / Amiga / Compañero', category: 'Personas', level: 'N5' },
  { kanji: '医者', hiragana: 'いしゃ', meaning_es: 'Médico / Doctor', category: 'Personas y Profesiones', level: 'N5' },
  { kanji: '看護師', hiragana: 'かんごし', meaning_es: 'Enfermero / Enfermera', category: 'Personas y Profesiones', level: 'N4' },
  { kanji: '会社員', hiragana: 'かいしゃいん', meaning_es: 'Empleado de empresa / Oficinista', category: 'Personas y Profesiones', level: 'N5' },
  { kanji: '店員', hiragana: 'てんいん', meaning_es: 'Empleado de tienda / Dependiente', category: 'Personas y Profesiones', level: 'N5' },
  { kanji: '警察官', hiragana: 'けいさつかん', meaning_es: 'Policía / Oficial de policía', category: 'Personas y Profesiones', level: 'N4' },
  { kanji: '歌手', hiragana: 'かしゅ', meaning_es: 'Cantante', category: 'Personas y Profesiones', level: 'N4' },
  { kanji: '作家', hiragana: 'さっか', meaning_es: 'Escritor / Autor', category: 'Personas y Profesiones', level: 'N4' },
  { kanji: '選手', hiragana: 'せんしゅ', meaning_es: 'Atleta / Jugador deportivo', category: 'Personas y Profesiones', level: 'N4' },
  { kanji: '山田', hiragana: 'やまだ', meaning_es: 'Yamada (apellido japonés común)', category: 'Nombres Propios', level: 'N5' },
  { kanji: '田中', hiragana: 'たなか', meaning_es: 'Tanaka (apellido japonés común)', category: 'Nombres Propios', level: 'N5' },
  { kanji: '佐藤', hiragana: 'さとう', meaning_es: 'Sato (apellido japonés muy común)', category: 'Nombres Propios', level: 'N5' },
  { kanji: '鈴木', hiragana: 'すずき', meaning_es: 'Suzuki (apellido japonés muy común)', category: 'Nombres Propios', level: 'N5' },
  { kanji: 'アンナ', hiragana: 'あんな', meaning_es: 'Anna (nombre propio)', category: 'Nombres Propios', level: 'N5' },
  { kanji: 'さくら', hiragana: 'さくら', meaning_es: 'Sakura (nombre / cerezo)', category: 'Nombres Propios', level: 'N5' },
  { kanji: 'さん', hiragana: 'さん', meaning_es: 'Sr. / Sra. / Don / Doña (sufijo honorífico)', category: 'Sufijos', level: 'N5' },
  { kanji: 'ちゃん', hiragana: 'ちゃん', meaning_es: 'Sufijo cariñoso para niños o personas cercanas', category: 'Sufijos', level: 'N5' },
  { kanji: 'くん', hiragana: 'くん', meaning_es: 'Sufijo familiar para chicos o compañeros', category: 'Sufijos', level: 'N5' },
  { kanji: '様', hiragana: 'さま', meaning_es: 'Sr. / Sra. (sufijo de máxima cortesía/respeto)', category: 'Sufijos', level: 'N4' },

  // Familia
  { kanji: '家族', hiragana: 'かぞく', meaning_es: 'Familia', category: 'Familia', level: 'N5' },
  { kanji: '両親', hiragana: 'りょうしん', meaning_es: 'Padres / Ambos progenitores', category: 'Familia', level: 'N5' },
  { kanji: '父', hiragana: 'ちち', meaning_es: 'Mi padre (humilde)', category: 'Familia', level: 'N5' },
  { kanji: 'お父さん', hiragana: 'おとうさん', meaning_es: 'Padre / Su padre (cortés)', category: 'Familia', level: 'N5' },
  { kanji: '母', hiragana: 'はは', meaning_es: 'Mi madre (humilde)', category: 'Familia', level: 'N5' },
  { kanji: 'お母さん', hiragana: 'おかあさん', meaning_es: 'Madre / Su madre (cortés)', category: 'Familia', level: 'N5' },
  { kanji: '兄', hiragana: 'あに', meaning_es: 'Mi hermano mayor', category: 'Familia', level: 'N5' },
  { kanji: 'お兄さん', hiragana: 'おにいさん', meaning_es: 'Hermano mayor (cortés)', category: 'Familia', level: 'N5' },
  { kanji: '姉', hiragana: 'あね', meaning_es: 'Mi hermana mayor', category: 'Familia', level: 'N5' },
  { kanji: 'お姉さん', hiragana: 'おねえさん', meaning_es: 'Hermana mayor (cortés)', category: 'Familia', level: 'N5' },
  { kanji: '弟', hiragana: 'おとうと', meaning_es: 'Hermano menor', category: 'Familia', level: 'N5' },
  { kanji: '妹', hiragana: 'いもうと', meaning_es: 'Hermana menor', category: 'Familia', level: 'N5' },
  { kanji: '兄弟', hiragana: 'きょうだい', meaning_es: 'Hermanos / Hermanas', category: 'Familia', level: 'N5' },
  { kanji: '祖父', hiragana: 'そふ', meaning_es: 'Mi abuelo', category: 'Familia', level: 'N5' },
  { kanji: 'おじいさん', hiragana: 'おじいさん', meaning_es: 'Abuelo / Anciano (cortés)', category: 'Familia', level: 'N5' },
  { kanji: '祖母', hiragana: 'そぼ', meaning_es: 'Mi abuela', category: 'Familia', level: 'N5' },
  { kanji: 'おばあさん', hiragana: 'おばあさん', meaning_es: 'Abuela / Anciana (cortés)', category: 'Familia', level: 'N5' },
  { kanji: '夫', hiragana: 'おっと', meaning_es: 'Mi esposo / Mi marido', category: 'Familia', level: 'N4' },
  { kanji: '主人', hiragana: 'しゅじん', meaning_es: 'Mi esposo / Dueño', category: 'Familia', level: 'N5' },
  { kanji: '妻', hiragana: 'つま', meaning_es: 'Mi esposa / Mi mujer', category: 'Familia', level: 'N4' },
  { kanji: '家内', hiragana: 'かない', meaning_es: 'Mi esposa', category: 'Familia', level: 'N5' },

  // Lugares y Ciudad
  { kanji: '家', hiragana: 'いえ', meaning_es: 'Casa / Hogar', category: 'Lugares', level: 'N5' },
  { kanji: 'うち', hiragana: 'うち', meaning_es: 'Casa propia / Familia / Mi hogar', category: 'Lugares', level: 'N5' },
  { kanji: '部屋', hiragana: 'へや', meaning_es: 'Habitación / Cuarto', category: 'Lugares', level: 'N5' },
  { kanji: '台所', hiragana: 'だいどころ', meaning_es: 'Cocina', category: 'Lugares', level: 'N5' },
  { kanji: '風呂', hiragana: 'ふろ', meaning_es: 'Baño / Tina de baño tradicional', category: 'Lugares', level: 'N5' },
  { kanji: 'トイレ', hiragana: 'といれ', meaning_es: 'Inodoro / Baño / Servicios', category: 'Lugares', level: 'N5' },
  { kanji: 'お手洗い', hiragana: 'おてあらい', meaning_es: 'Baño / Lavabo (formal)', category: 'Lugares', level: 'N5' },
  { kanji: '庭', hiragana: 'にわ', meaning_es: 'Jardín / Patio', category: 'Lugares', level: 'N5' },
  { kanji: '玄関', hiragana: 'げんかん', meaning_es: 'Entrada de la casa / Recibidor', category: 'Lugares', level: 'N5' },
  { kanji: '窓', hiragana: 'まど', meaning_es: 'Ventana', category: 'Hogar', level: 'N5' },
  { kanji: 'ドア', hiragana: 'どあ', meaning_es: 'Puerta', category: 'Hogar', level: 'N5' },
  { kanji: '机', hiragana: 'つくえ', meaning_es: 'Escritorio / Mesa de trabajo', category: 'Hogar', level: 'N5' },
  { kanji: '椅子', hiragana: 'いす', meaning_es: 'Silla', category: 'Hogar', level: 'N5' },
  { kanji: '学校', hiragana: 'がっこう', meaning_es: 'Escuela / Colegio', category: 'Lugares', level: 'N5' },
  { kanji: '教室', hiragana: 'きょうしつ', meaning_es: 'Aula / Salón de clases', category: 'Lugares', level: 'N5' },
  { kanji: '大学', hiragana: 'だいがく', meaning_es: 'Universidad', category: 'Lugares', level: 'N5' },
  { kanji: '図書館', hiragana: 'としょかん', meaning_es: 'Biblioteca', category: 'Lugares', level: 'N5' },
  { kanji: '病院', hiragana: 'びょういん', meaning_es: 'Hospital / Clínica', category: 'Lugares', level: 'N5' },
  { kanji: '銀行', hiragana: 'ぎんこう', meaning_es: 'Banco (entidad financiera)', category: 'Lugares', level: 'N5' },
  { kanji: '郵便局', hiragana: 'ゆうびんきょく', meaning_es: 'Oficina de correos', category: 'Lugares', level: 'N5' },
  { kanji: '交番', hiragana: 'こうばん', meaning_es: 'Puesto de policía local', category: 'Lugares', level: 'N5' },
  { kanji: '駅', hiragana: 'えき', meaning_es: 'Estación de tren', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '空港', hiragana: 'くうこう', meaning_es: 'Aeropuerto', category: 'Transporte y Viajes', level: 'N4' },
  { kanji: '港', hiragana: 'みなと', meaning_es: 'Puerto marítimo', category: 'Lugares', level: 'N4' },
  { kanji: '店', hiragana: 'みせ', meaning_es: 'Tienda / Comercio / Establecimiento', category: 'Lugares', level: 'N5' },
  { kanji: 'レストラン', hiragana: 'れすとらん', meaning_es: 'Restaurante', category: 'Lugares', level: 'N5' },
  { kanji: '喫茶店', hiragana: 'きっさてん', meaning_es: 'Cafetería tradicional', category: 'Lugares', level: 'N5' },
  { kanji: 'コンビニ', hiragana: 'こんびに', meaning_es: 'Tienda de conveniencia abierta 24h', category: 'Lugares', level: 'N5' },
  { kanji: 'スーパー', hiragana: 'すーぱー', meaning_es: 'Supermercado', category: 'Lugares', level: 'N5' },
  { kanji: 'デパート', hiragana: 'でぱーと', meaning_es: 'Grandes almacenes', category: 'Lugares', level: 'N5' },
  { kanji: 'ホテル', hiragana: 'ほてる', meaning_es: 'Hotel', category: 'Lugares', level: 'N5' },
  { kanji: '公園', hiragana: 'こうえん', meaning_es: 'Parque público', category: 'Lugares', level: 'N5' },
  { kanji: '動物園', hiragana: 'どうぶつえん', meaning_es: 'Zoológico', category: 'Lugares', level: 'N5' },
  { kanji: '映画館', hiragana: 'えいがかん', meaning_es: 'Cine / Sala de cine', category: 'Lugares', level: 'N5' },
  { kanji: '美術館', hiragana: 'びじゅつかん', meaning_es: 'Museo de arte', category: 'Lugares', level: 'N4' },
  { kanji: '博物館', hiragana: 'はくぶつかん', meaning_es: 'Museo histórico o de ciencias', category: 'Lugares', level: 'N4' },
  { kanji: '神社', hiragana: 'じんじゃ', meaning_es: 'Santuario sintoísta', category: 'Cultura', level: 'N4' },
  { kanji: '寺', hiragana: 'てら', meaning_es: 'Templo budista', category: 'Cultura', level: 'N5' },
  { kanji: '城', hiragana: 'しろ', meaning_es: 'Castillo tradicional japonés', category: 'Cultura', level: 'N4' },
  { kanji: '海', hiragana: 'うみ', meaning_es: 'Mar / Océano', category: 'Naturaleza', level: 'N5' },
  { kanji: '山', hiragana: 'やま', meaning_es: 'Montaña', category: 'Naturaleza', level: 'N5' },
  { kanji: '川', hiragana: 'かわ', meaning_es: 'Río', category: 'Naturaleza', level: 'N5' },
  { kanji: '池', hiragana: 'いけ', meaning_es: 'Estanque', category: 'Naturaleza', level: 'N5' },
  { kanji: '町', hiragana: 'まち', meaning_es: 'Pueblo / Ciudad / Barrio comercial', category: 'Lugares', level: 'N5' },
  { kanji: '市', hiragana: 'し', meaning_es: 'Ciudad (entidad administrativa)', category: 'Lugares', level: 'N4' },
  { kanji: '村', hiragana: 'むら', meaning_es: 'Aldea / Villa rural', category: 'Lugares', level: 'N4' },
  { kanji: '国', hiragana: 'くに', meaning_es: 'País / Nación / Origen', category: 'Lugares', level: 'N5' },
  { kanji: '外国', hiragana: 'がいこく', meaning_es: 'País extranjero', category: 'Lugares', level: 'N5' },
  { kanji: '日本', hiragana: 'にほん', meaning_es: 'Japón', category: 'Lugares', level: 'N5' },
  { kanji: '東京', hiragana: 'とうきょう', meaning_es: 'Tokio (capital de Japón)', category: 'Lugares', level: 'N5' },
  { kanji: '京都', hiragana: 'きょうと', meaning_es: 'Kioto (antigua capital imperial)', category: 'Lugares', level: 'N5' },
  { kanji: '大阪', hiragana: 'おおさか', meaning_es: 'Osaka', category: 'Lugares', level: 'N5' },
  { kanji: '富士山', hiragana: 'ふじさん', meaning_es: 'Monte Fuji', category: 'Lugares', level: 'N5' },

  // Comida y Bebida
  { kanji: '食べ物', hiragana: 'たべもの', meaning_es: 'Comida / Alimento', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '飲み物', hiragana: 'のみもの', meaning_es: 'Bebida', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'ご飯', hiragana: 'ごはん', meaning_es: 'Arroz cocido / Comida en general', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '朝ご飯', hiragana: 'あさごはん', meaning_es: 'Desayuno', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '昼ご飯', hiragana: 'ひるごはん', meaning_es: 'Almuerzo / Comida del mediodía', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '晩ご飯', hiragana: 'ばんごはん', meaning_es: 'Cena', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'パン', hiragana: 'ぱん', meaning_es: 'Pan', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '肉', hiragana: 'にく', meaning_es: 'Carne', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '牛肉', hiragana: 'ぎゅうにく', meaning_es: 'Carne de res / Ternera', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '豚肉', hiragana: 'ぶたにく', meaning_es: 'Carne de cerdo', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '鶏肉', hiragana: 'とりにく', meaning_es: 'Carne de pollo', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '魚', hiragana: 'さかな', meaning_es: 'Pescado / Pez', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '卵', hiragana: 'たまご', meaning_es: 'Huevo', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '野菜', hiragana: 'やさい', meaning_es: 'Verdura / Vegetal', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '果物', hiragana: 'くだもの', meaning_es: 'Fruta', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'りんご', hiragana: 'りんご', meaning_es: 'Manzana', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'みかん', hiragana: 'みかん', meaning_es: 'Mandarina japonesa', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'バナナ', hiragana: 'ばなな', meaning_es: 'Plátano / Banana', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'いちご', hiragana: 'いちご', meaning_es: 'Fresa', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'すいか', hiragana: 'すいか', meaning_es: 'Sandía', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '水', hiragana: 'みず', meaning_es: 'Agua fría / Agua', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'お茶', hiragana: 'おちゃ', meaning_es: 'Té verde / Té japonés', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '紅茶', hiragana: 'こうちゃ', meaning_es: 'Té negro', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'コーヒー', hiragana: 'こーひー', meaning_es: 'Café', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '牛乳', hiragana: 'ぎゅうにゅう', meaning_es: 'Leche de vaca', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'ミルク', hiragana: 'みるく', meaning_es: 'Leche', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'ジュース', hiragana: 'じゅーす', meaning_es: 'Zumo / Jugo', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'ビール', hiragana: 'びーる', meaning_es: 'Cerveza', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'お酒', hiragana: 'おさけ', meaning_es: 'Alcohol / Sake tradicional', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'ワイン', hiragana: 'わいん', meaning_es: 'Vino', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '料理', hiragana: 'りょうり', meaning_es: 'Cocina / Plato de comida', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '寿司', hiragana: 'すし', meaning_es: 'Sushi', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '刺身', hiragana: 'さしみ', meaning_es: 'Sashimi (pescado crudo laminado)', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '天ぷら', hiragana: 'てんぷら', meaning_es: 'Tempura (rebozado frito)', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'ラーメン', hiragana: 'らーめん', meaning_es: 'Ramen', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'うどん', hiragana: 'うどん', meaning_es: 'Udon (fideo grueso)', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'そば', hiragana: 'そば', meaning_es: 'Soba (fideo de trigo sarraceno)', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'カレー', hiragana: 'かれー', meaning_es: 'Curry japonés', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '弁当', hiragana: 'べんとう', meaning_es: 'Fiambrera / Bento preparado', category: 'Comida y Bebida', level: 'N5' },
  { kanji: 'おにぎり', hiragana: 'おにぎり', meaning_es: 'Bola de arroz rellena', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '砂糖', hiragana: 'さとう', meaning_es: 'Azúcar', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '塩', hiragana: 'しお', meaning_es: 'Sal', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '醤油', hiragana: 'しょうゆ', meaning_es: 'Salsa de soja', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '味噌', hiragana: 'みそ', meaning_es: 'Miso (pasta de soja fermentada)', category: 'Comida y Bebida', level: 'N5' },
  { kanji: '箸', hiragana: 'はし', meaning_es: 'Palillos japoneses', category: 'Hogar', level: 'N5' },
  { kanji: '皿', hiragana: 'さら', meaning_es: 'Plato', category: 'Hogar', level: 'N5' },
  { kanji: 'コップ', hiragana: 'こっぷ', meaning_es: 'Vaso de cristal', category: 'Hogar', level: 'N5' },

  // Transporte
  { kanji: '電車', hiragana: 'でんしゃ', meaning_es: 'Tren eléctrico', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '地下鉄', hiragana: 'ちかてつ', meaning_es: 'Metro / Subterráneo', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '新幹線', hiragana: 'しんかんせん', meaning_es: 'Tren bala / Shinkansen', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: 'バス', hiragana: 'ばす', meaning_es: 'Autobús', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: 'タクシー', hiragana: 'たくしー', meaning_es: 'Taxi', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '車', hiragana: 'くるま', meaning_es: 'Coche / Auto / Carro', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '自動車', hiragana: 'じどうしゃ', meaning_es: 'Automóvil', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '自転車', hiragana: 'じてんしゃ', meaning_es: 'Bicicleta', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '飛行機', hiragana: 'ひこうき', meaning_es: 'Avión', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '船', hiragana: 'ふね', meaning_es: 'Barco / Embarcación', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '切符', hiragana: 'きっぷ', meaning_es: 'Billete / Boleto / Ticket de transporte', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '定期券', hiragana: 'ていきけん', meaning_es: 'Abono de transporte / Pase mensual', category: 'Transporte y Viajes', level: 'N4' },
  { kanji: 'パスポート', hiragana: 'ぱすぽーと', meaning_es: 'Pasaporte', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '荷物', hiragana: 'にもつ', meaning_es: 'Equipaje / Paquete / Maletas', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '地図', hiragana: 'ちず', meaning_es: 'Mapa / Plano geográfico', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '旅行', hiragana: 'りょこう', meaning_es: 'Viaje / Turismo', category: 'Transporte y Viajes', level: 'N5' },
  { kanji: '道', hiragana: 'みち', meaning_es: 'Camino / Calle / Vía', category: 'Lugares', level: 'N5' },
  { kanji: '橋', hiragana: 'はし', meaning_es: 'Puente', category: 'Lugares', level: 'N5' },
  { kanji: '信号', hiragana: 'しんごう', meaning_es: 'Semáforo', category: 'Transporte y Viajes', level: 'N4' },
  { kanji: '交差点', hiragana: 'こうさてん', meaning_es: 'Intersección / Cruce de calles', category: 'Lugares', level: 'N5' },
  { kanji: '角', hiragana: 'かど', meaning_es: 'Esquina', category: 'Lugares', level: 'N5' },
  { kanji: '右', hiragana: 'みぎ', meaning_es: 'Derecha', category: 'Direcciones', level: 'N5' },
  { kanji: '左', hiragana: 'ひだり', meaning_es: 'Izquierda', category: 'Direcciones', level: 'N5' },
  { kanji: '前', hiragana: 'まえ', meaning_es: 'Delante / Frente / Antes', category: 'Posición y Tiempo', level: 'N5' },
  { kanji: '後ろ', hiragana: 'うしろ', meaning_es: 'Detrás / Atrás', category: 'Posición y Tiempo', level: 'N5' },
  { kanji: '上', hiragana: 'うえ', meaning_es: 'Arriba / Encima', category: 'Posición', level: 'N5' },
  { kanji: '下', hiragana: 'した', meaning_es: 'Abajo / Debajo', category: 'Posición', level: 'N5' },
  { kanji: '中', hiragana: 'なか', meaning_es: 'Dentro / En medio', category: 'Posición', level: 'N5' },
  { kanji: '外', hiragana: 'そと', meaning_es: 'Fuera / Exterior', category: 'Posición', level: 'N5' },
  { kanji: '隣', hiragana: 'となり', meaning_es: 'Al lado / Vecino', category: 'Posición', level: 'N5' },
  { kanji: '近く', hiragana: 'ちかく', meaning_es: 'Cerca / Proximidad', category: 'Posición', level: 'N5' },
  { kanji: '遠く', hiragana: 'とおく', meaning_es: 'Lejos / Distancia', category: 'Posición', level: 'N5' },
  { kanji: '間', hiragana: 'あいだ', meaning_es: 'Entre (dos cosas) / Intervalo', category: 'Posición', level: 'N5' },

  // Cuerpo y Salud
  { kanji: '体', hiragana: 'からだ', meaning_es: 'Cuerpo humano / Salud física', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '頭', hiragana: 'あたま', meaning_es: 'Cabeza / Mente', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '顔', hiragana: 'かお', meaning_es: 'Rostro / Cara', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '目', hiragana: 'め', meaning_es: 'Ojo / Ojos', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '鼻', hiragana: 'はな', meaning_es: 'Nariz', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '口', hiragana: 'くち', meaning_es: 'Boca / Entrada', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '歯', hiragana: 'は', meaning_es: 'Diente / Dientes', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '耳', hiragana: 'みみ', meaning_es: 'Oreja / Oído', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '手', hiragana: 'て', meaning_es: 'Mano / Manos', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '足', hiragana: 'あし', meaning_es: 'Pie / Pierna', category: 'Cuerpo Humano', level: 'N5' },
  { kanji: '病気', hiragana: 'びょうき', meaning_es: 'Enfermedad', category: 'Salud', level: 'N5' },
  { kanji: '風邪', hiragana: 'かぜ', meaning_es: 'Resfriado / Catarro', category: 'Salud', level: 'N5' },
  { kanji: '熱', hiragana: 'ねつ', meaning_es: 'Fiebre / Calor', category: 'Salud', level: 'N5' },
  { kanji: '薬', hiragana: 'くすり', meaning_es: 'Medicina / Medicamento', category: 'Salud', level: 'N5' },

  // Naturaleza, Clima y Animales
  { kanji: '天気', hiragana: 'てんき', meaning_es: 'Tiempo / Clima', category: 'Naturaleza', level: 'N5' },
  { kanji: '雨', hiragana: 'あめ', meaning_es: 'Lluvia', category: 'Naturaleza', level: 'N5' },
  { kanji: '雪', hiragana: 'ゆき', meaning_es: 'Nieve', category: 'Naturaleza', level: 'N5' },
  { kanji: '風', hiragana: 'かぜ', meaning_es: 'Viento', category: 'Naturaleza', level: 'N5' },
  { kanji: '空', hiragana: 'そら', meaning_es: 'Cielo', category: 'Naturaleza', level: 'N5' },
  { kanji: '太陽', hiragana: 'たいよう', meaning_es: 'Sol', category: 'Naturaleza', level: 'N4' },
  { kanji: '月', hiragana: 'つき', meaning_es: 'Luna / Mes', category: 'Naturaleza', level: 'N5' },
  { kanji: '星', hiragana: 'ほし', meaning_es: 'Estrella', category: 'Naturaleza', level: 'N4' },
  { kanji: '花', hiragana: 'はな', meaning_es: 'Flor', category: 'Naturaleza', level: 'N5' },
  { kanji: '木', hiragana: 'き', meaning_es: 'Árbol / Madera', category: 'Naturaleza', level: 'N5' },
  { kanji: '桜', hiragana: 'さくら', meaning_es: 'Flor de cerezo / Cerezo japonés', category: 'Naturaleza', level: 'N5' },
  { kanji: '動物', hiragana: 'どうぶつ', meaning_es: 'Animal', category: 'Animales', level: 'N5' },
  { kanji: '犬', hiragana: 'いぬ', meaning_es: 'Perro', category: 'Animales', level: 'N5' },
  { kanji: '猫', hiragana: 'ねこ', meaning_es: 'Gato', category: 'Animales', level: 'N5' },
  { kanji: '鳥', hiragana: 'とり', meaning_es: 'Pájaro / Ave', category: 'Animales', level: 'N5' },
  { kanji: '魚', hiragana: 'さかな', meaning_es: 'Pez / Pescado', category: 'Animales', level: 'N5' },
  { kanji: '馬', hiragana: 'うま', meaning_es: 'Caballo', category: 'Animales', level: 'N4' },
  { kanji: '牛', hiragana: 'うし', meaning_es: 'Vaca / Buey', category: 'Animales', level: 'N5' },

  // Objetos Diarios y Ropa
  { kanji: '物', hiragana: 'もの', meaning_es: 'Cosa / Objeto material', category: 'Hogar', level: 'N5' },
  { kanji: '服', hiragana: 'ふく', meaning_es: 'Ropa / Vestimenta', category: 'Ropa', level: 'N5' },
  { kanji: 'シャツ', hiragana: 'しゃつ', meaning_es: 'Camisa / Camiseta', category: 'Ropa', level: 'N5' },
  { kanji: 'ズボン', hiragana: 'ずぼん', meaning_es: 'Pantalones', category: 'Ropa', level: 'N5' },
  { kanji: 'スカート', hiragana: 'すかーと', meaning_es: 'Falda', category: 'Ropa', level: 'N5' },
  { kanji: '靴', hiragana: 'くつ', meaning_es: 'Zapatos / Calzado', category: 'Ropa', level: 'N5' },
  { kanji: '靴下', hiragana: 'くつした', meaning_es: 'Calcetines', category: 'Ropa', level: 'N5' },
  { kanji: '帽子', hiragana: 'ぼうし', meaning_es: 'Sombrero / Gorro', category: 'Ropa', level: 'N5' },
  { kanji: '眼鏡', hiragana: 'めがね', meaning_es: 'Gafas / Lentes', category: 'Ropa', level: 'N5' },
  { kanji: '時計', hiragana: 'とけい', meaning_es: 'Reloj', category: 'Hogar', level: 'N5' },
  { kanji: '傘', hiragana: 'かさ', meaning_es: 'Paraguas / Sombrilla', category: 'Hogar', level: 'N5' },
  { kanji: '鞄', hiragana: 'かばん', meaning_es: 'Bolsa / Cartera / Mochila', category: 'Hogar', level: 'N5' },
  { kanji: '財布', hiragana: 'さいふ', meaning_es: 'Cartera / Monedero', category: 'Hogar', level: 'N5' },
  { kanji: 'お金', hiragana: 'おかね', meaning_es: 'Dinero', category: 'Economía', level: 'N5' },
  { kanji: '鍵', hiragana: 'かぎ', meaning_es: 'Llave', category: 'Hogar', level: 'N5' },
  { kanji: '本', hiragana: 'ほん', meaning_es: 'Libro', category: 'Estudio', level: 'N5' },
  { kanji: '辞書', hiragana: 'じしょ', meaning_es: 'Diccionario', category: 'Estudio', level: 'N5' },
  { kanji: '雑誌', hiragana: 'ざっし', meaning_es: 'Revista', category: 'Estudio', level: 'N5' },
  { kanji: '新聞', hiragana: 'しんぶん', meaning_es: 'Periódico', category: 'Estudio', level: 'N5' },
  { kanji: '手紙', hiragana: 'てがみ', meaning_es: 'Carta escrita', category: 'Estudio', level: 'N5' },
  { kanji: 'ノート', hiragana: 'のーと', meaning_es: 'Cuaderno / Libreta', category: 'Estudio', level: 'N5' },
  { kanji: 'ペン', hiragana: 'ぺん', meaning_es: 'Bolígrafo / Pluma', category: 'Estudio', level: 'N5' },
  { kanji: '鉛筆', hiragana: 'えんぴつ', meaning_es: 'Lápiz', category: 'Estudio', level: 'N5' },
  { kanji: '紙', hiragana: 'かみ', meaning_es: 'Papel', category: 'Estudio', level: 'N5' },
  { kanji: '写真', hiragana: 'しゃしん', meaning_es: 'Fotografía', category: 'Hogar', level: 'N5' },
  { kanji: 'カメラ', hiragana: 'かめら', meaning_es: 'Cámara fotográfica', category: 'Hogar', level: 'N5' },
  { kanji: 'テレビ', hiragana: 'てれび', meaning_es: 'Televisión', category: 'Hogar', level: 'N5' },
  { kanji: 'パソコン', hiragana: 'ぱそこん', meaning_es: 'Ordenador / Computadora personal', category: 'Hogar', level: 'N5' },
  { kanji: '電話', hiragana: 'でんわ', meaning_es: 'Teléfono / Llamada telefónica', category: 'Hogar', level: 'N5' },
  { kanji: 'スマホ', hiragana: 'すまほ', meaning_es: 'Teléfono inteligente / Smartphone', category: 'Hogar', level: 'N5' },

  // Verbos Ichidan (Ru-verbs)
  { kanji: '食べる', hiragana: 'たべる', meaning_es: 'Comer', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '見る', hiragana: 'みる', meaning_es: 'Ver / Mirar / Observar', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '起きる', hiragana: 'おきる', meaning_es: 'Levantarse / Despertar', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '寝る', hiragana: 'ねる', meaning_es: 'Dormir / Acostarse', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '開ける', hiragana: 'あける', meaning_es: 'Abrir (puerta, ventana, etc.)', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '閉める', hiragana: 'しめる', meaning_es: 'Cerrar (puerta, ventana, etc.)', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '教える', hiragana: 'おしえる', meaning_es: 'Enseñar / Informar / Explicar', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '覚える', hiragana: 'おぼえる', meaning_es: 'Memorizar / Recordar / Aprender', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '忘れる', hiragana: 'わすれる', meaning_es: 'Olvidar', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '疲れる', hiragana: 'つかれる', meaning_es: 'Cansarse / Fatigarse', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '出る', hiragana: 'でる', meaning_es: 'Salir / Aparecer / Egresar', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '入れる', hiragana: 'いれる', meaning_es: 'Meter / Introducir / Poner dentro', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '降りる', hiragana: 'おりる', meaning_es: 'Bajar de un vehículo / Descender', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '着る', hiragana: 'きる', meaning_es: 'Ponerse ropa (del torso) / Vestir', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '借りる', hiragana: 'かりる', meaning_es: 'Pedir prestado / Alquilar', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '始める', hiragana: 'はじめる', meaning_es: 'Comenzar / Empezar algo', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '見せる', hiragana: 'みせる', meaning_es: 'Mostrar / Enseñar a alguien', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '決める', hiragana: 'きめる', meaning_es: 'Decidir / Determinar', category: 'Verbo Ichidan', level: 'N4', verbType: 'ichidan' },
  { kanji: '答える', hiragana: 'こたえる', meaning_es: 'Responder / Contestar', category: 'Verbo Ichidan', level: 'N5', verbType: 'ichidan' },
  { kanji: '考える', hiragana: 'かんがえる', meaning_es: 'Pensar / Reflexionar / Considerar', category: 'Verbo Ichidan', level: 'N4', verbType: 'ichidan' },
  { kanji: '調べる', hiragana: 'しらべる', meaning_es: 'Investigar / Consultar / Averiguar', category: 'Verbo Ichidan', level: 'N4', verbType: 'ichidan' },
  { kanji: '集める', hiragana: 'あつめる', meaning_es: 'Reunir / Coleccionar', category: 'Verbo Ichidan', level: 'N4', verbType: 'ichidan' },

  // Verbos Godan (U-verbs)
  { kanji: '行く', hiragana: 'いく', meaning_es: 'Ir / Dirigirse', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ku' },
  { kanji: '来る', hiragana: 'くる', meaning_es: 'Venir', category: 'Verbo Irregular', level: 'N5', verbType: 'kuru' },
  { kanji: 'する', hiragana: 'する', meaning_es: 'Hacer', category: 'Verbo Irregular', level: 'N5', verbType: 'suru' },
  { kanji: '飲む', hiragana: 'のむ', meaning_es: 'Beber / Tomar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_mu' },
  { kanji: '読む', hiragana: 'よむ', meaning_es: 'Leer', category: 'Verbo Godan', level: 'N5', verbType: 'godan_mu' },
  { kanji: '書く', hiragana: 'かく', meaning_es: 'Escribir / Dibujar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ku' },
  { kanji: '話す', hiragana: 'はなす', meaning_es: 'Hablar / Conversar / Relatar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_su' },
  { kanji: '聞く', hiragana: 'きく', meaning_es: 'Escuchar / Oír / Preguntar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ku' },
  { kanji: '会う', hiragana: 'あう', meaning_es: 'Encontrarse con / Ver a alguien', category: 'Verbo Godan', level: 'N5', verbType: 'godan_u' },
  { kanji: '買う', hiragana: 'かう', meaning_es: 'Comprar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_u' },
  { kanji: '待つ', hiragana: 'まつ', meaning_es: 'Esperar / Aguardar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_tsu' },
  { kanji: '持つ', hiragana: 'もつ', meaning_es: 'Tener / Sostener / Portar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_tsu' },
  { kanji: '立つ', hiragana: 'たつ', meaning_es: 'Ponerse de pie / Estar de pie', category: 'Verbo Godan', level: 'N5', verbType: 'godan_tsu' },
  { kanji: '座る', hiragana: 'すわる', meaning_es: 'Sentarse', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '入る', hiragana: 'はいる', meaning_es: 'Entrar / Ingresar (Godan)', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '帰る', hiragana: 'かえる', meaning_es: 'Regresar / Volver a casa (Godan)', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '走る', hiragana: 'はしる', meaning_es: 'Correr (Godan)', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '歩く', hiragana: 'あるく', meaning_es: 'Caminar / Andar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ku' },
  { kanji: '泳ぐ', hiragana: 'およぐ', meaning_es: 'Nadar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_gu' },
  { kanji: '飛ぶ', hiragana: 'とぶ', meaning_es: 'Volar / Saltar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_bu' },
  { kanji: '呼ぶ', hiragana: 'よぶ', meaning_es: 'Llamar / Convocar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_bu' },
  { kanji: '遊ぶ', hiragana: 'あそぶ', meaning_es: 'Jugar / Divertirse', category: 'Verbo Godan', level: 'N5', verbType: 'godan_bu' },
  { kanji: '死ぬ', hiragana: 'しぬ', meaning_es: 'Morir', category: 'Verbo Godan', level: 'N5', verbType: 'godan_nu' },
  { kanji: '働く', hiragana: 'はたらく', meaning_es: 'Trabajar / Laborar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ku' },
  { kanji: '休む', hiragana: 'やすむ', meaning_es: 'Descansar / Faltar a clase o trabajo', category: 'Verbo Godan', level: 'N5', verbType: 'godan_mu' },
  { kanji: '終わる', hiragana: 'おわる', meaning_es: 'Terminar / Finalizar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '作る', hiragana: 'つくる', meaning_es: 'Hacer / Fabricar / Cocinar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '使う', hiragana: 'つかう', meaning_es: 'Usar / Utilizar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_u' },
  { kanji: '取る', hiragana: 'とる', meaning_es: 'Tomar / Agarrar / Fotografiar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '置く', hiragana: 'おく', meaning_es: 'Colocar / Poner', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ku' },
  { kanji: '貸す', hiragana: 'かす', meaning_es: 'Prestar algo a alguien', category: 'Verbo Godan', level: 'N5', verbType: 'godan_su' },
  { kanji: '返す', hiragana: 'かえす', meaning_es: 'Devolver algo', category: 'Verbo Godan', level: 'N5', verbType: 'godan_su' },
  { kanji: '売る', hiragana: 'うる', meaning_es: 'Vender', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '払う', hiragana: 'はらう', meaning_es: 'Pagar', category: 'Verbo Godan', level: 'N4', verbType: 'godan_u' },
  { kanji: '送る', hiragana: 'おくる', meaning_es: 'Enviar / Acompañar a alguien', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '歌う', hiragana: 'うたう', meaning_es: 'Cantar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_u' },
  { kanji: '習う', hiragana: 'ならう', meaning_es: 'Aprender de un profesor', category: 'Verbo Godan', level: 'N5', verbType: 'godan_u' },
  { kanji: '登る', hiragana: 'のぼる', meaning_es: 'Escalar / Subir a una montaña', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '降る', hiragana: 'ふる', meaning_es: 'Caer lluvia o nieve / Precipitar', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '咲く', hiragana: 'さく', meaning_es: 'Florecer', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ku' },
  { kanji: '泣く', hiragana: 'なく', meaning_es: 'Llorar', category: 'Verbo Godan', level: 'N4', verbType: 'godan_ku' },
  { kanji: '笑う', hiragana: 'わらう', meaning_es: 'Reír / Sonreír', category: 'Verbo Godan', level: 'N4', verbType: 'godan_u' },
  { kanji: '探す', hiragana: 'さがす', meaning_es: 'Buscar algo o a alguien', category: 'Verbo Godan', level: 'N4', verbType: 'godan_su' },
  { kanji: '押す', hiragana: 'おす', meaning_es: 'Empujar / Presionar un botón', category: 'Verbo Godan', level: 'N5', verbType: 'godan_su' },
  { kanji: '引く', hiragana: 'ひく', meaning_es: 'Tirar / Jalar / Tocar cuerdas', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ku' },
  { kanji: '知る', hiragana: 'しる', meaning_es: 'Saber / Conocer (Godan)', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '分かる', hiragana: 'わかる', meaning_es: 'Entender / Comprender', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '要る', hiragana: 'いる', meaning_es: 'Necesitar (Godan)', category: 'Verbo Godan', level: 'N5', verbType: 'godan_ru' },
  { kanji: '頼む', hiragana: 'たのむ', meaning_es: 'Pedir / Encargar un favor', category: 'Verbo Godan', level: 'N5', verbType: 'godan_mu' },

  // Verbos Suru
  { kanji: '勉強する', hiragana: 'べんきょうする', meaning_es: 'Estudiar', category: 'Verbo Suru', level: 'N5' },
  { kanji: '仕事する', hiragana: 'しごとする', meaning_es: 'Trabajar', category: 'Verbo Suru', level: 'N5' },
  { kanji: '練習する', hiragana: 'れんしゅうする', meaning_es: 'Practicar / Ensayar', category: 'Verbo Suru', level: 'N5' },
  { kanji: '掃除する', hiragana: 'そうじする', meaning_es: 'Limpiar la casa / Asear', category: 'Verbo Suru', level: 'N5' },
  { kanji: '洗濯する', hiragana: 'せんたくする', meaning_es: 'Lavar la ropa', category: 'Verbo Suru', level: 'N5' },
  { kanji: '料理する', hiragana: 'りょうりする', meaning_es: 'Cocinar', category: 'Verbo Suru', level: 'N5' },
  { kanji: '散歩する', hiragana: 'さんぽする', meaning_es: 'Pasear / Dar un paseo', category: 'Verbo Suru', level: 'N5' },
  { kanji: '旅行する', hiragana: 'りょこうする', meaning_es: 'Viajar / Hacer un viaje', category: 'Verbo Suru', level: 'N5' },
  { kanji: '買い物する', hiragana: 'かいものする', meaning_es: 'Hacer compras / Ir de compras', category: 'Verbo Suru', level: 'N5' },
  { kanji: '運転する', hiragana: 'うんてんする', meaning_es: 'Conducir / Manejar un auto', category: 'Verbo Suru', level: 'N4' },
  { kanji: '電話する', hiragana: 'でんわする', meaning_es: 'Llamar por teléfono', category: 'Verbo Suru', level: 'N5' },
  { kanji: '質問する', hiragana: 'しつもんする', meaning_es: 'Hacer una pregunta', category: 'Verbo Suru', level: 'N5' },
  { kanji: '案内する', hiragana: 'あんないする', meaning_es: 'Guiar / Mostrar el camino', category: 'Verbo Suru', level: 'N4' },
  { kanji: '紹介する', hiragana: 'しょうかいする', meaning_es: 'Presentar a alguien', category: 'Verbo Suru', level: 'N4' },
  { kanji: '相談する', hiragana: 'そうだんする', meaning_es: 'Consultar / Pedir consejo', category: 'Verbo Suru', level: 'N4' },
  { kanji: '結婚する', hiragana: 'けっこんする', meaning_es: 'Casarse / Contraer matrimonio', category: 'Verbo Suru', level: 'N5' },
  { kanji: '準備する', hiragana: 'じゅんびする', meaning_es: 'Preparar / Disponer', category: 'Verbo Suru', level: 'N4' },
  { kanji: '約束する', hiragana: 'やくそくする', meaning_es: 'Prometer / Hacer una cita', category: 'Verbo Suru', level: 'N4' },
  { kanji: '出発する', hiragana: 'しゅっぱつする', meaning_es: 'Partir / Salir de viaje', category: 'Verbo Suru', level: 'N4' },
  { kanji: '到着する', hiragana: 'とうちゃくする', meaning_es: 'Llegar a destino', category: 'Verbo Suru', level: 'N4' },

  // Adjetivos -i
  { kanji: '大きい', hiragana: 'おおきい', meaning_es: 'Grande', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '小さい', hiragana: 'ちいさい', meaning_es: 'Pequeño', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '高い', hiragana: 'たかい', meaning_es: 'Alto / Caro (precio)', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '安い', hiragana: 'やすい', meaning_es: 'Barato / Económico', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '低い', hiragana: 'ひくい', meaning_es: 'Bajo (estatura o altura)', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '長い', hiragana: 'ながい', meaning_es: 'Largo (longitud o tiempo)', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '短い', hiragana: 'みじかい', meaning_es: 'Corto / Breve', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '新しい', hiragana: 'あたらしい', meaning_es: 'Nuevo / Fresco', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '古い', hiragana: 'ふるい', meaning_es: 'Viejo / Antiguo', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '良い', hiragana: 'よい', meaning_es: 'Bueno / Agradable', category: 'Adjetivo -i', level: 'N5' },
  { kanji: 'いい', hiragana: 'いい', meaning_es: 'Bueno / Bien / Agradable', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '悪い', hiragana: 'わるい', meaning_es: 'Malo / Dañino', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '美味しい', hiragana: 'おいしい', meaning_es: 'Delicioso / Rico / Sabroso', category: 'Adjetivo -i', level: 'N5' },
  { kanji: 'まずい', hiragana: 'まずい', meaning_es: 'Malo de sabor / Desagradable', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '暑い', hiragana: 'あつい', meaning_es: 'Caluroso (clima)', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '寒い', hiragana: 'さむい', meaning_es: 'Frío (clima)', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '熱い', hiragana: 'あつい', meaning_es: 'Caliente (objeto / comida / líquido)', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '冷たい', hiragana: 'つめたい', meaning_es: 'Frío al tacto (bebida / objeto)', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '暖かい', hiragana: 'あたたかい', meaning_es: 'Cálido / Templado agradable', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '涼しい', hiragana: 'すずしい', meaning_es: 'Fresco agradable', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '重い', hiragana: 'おもい', meaning_es: 'Pesado', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '軽い', hiragana: 'かるい', meaning_es: 'Ligero / Liviano', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '早い', hiragana: 'はやい', meaning_es: 'Temprano (hora)', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '速い', hiragana: 'はやい', meaning_es: 'Rápido (velocidad)', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '遅い', hiragana: 'おそい', meaning_es: 'Lento / Tarde', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '明るい', hiragana: 'あかるい', meaning_es: 'Luminoso / Alegre', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '暗い', hiragana: 'くらい', meaning_es: 'Oscuro / Sombrío', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '近い', hiragana: 'ちかい', meaning_es: 'Cercano / Próximo', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '遠い', hiragana: 'とおい', meaning_es: 'Lejano / Distante', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '広い', hiragana: 'ひろい', meaning_es: 'Amplio / Espacioso', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '狭い', hiragana: 'せまい', meaning_es: 'Estrecho / Angosto', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '多い', hiragana: 'おおい', meaning_es: 'Mucho / Abundante', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '少ない', hiragana: 'すくない', meaning_es: 'Poco / Escaso', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '難しい', hiragana: 'むずかしい', meaning_es: 'Difícil / Complicado', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '易しい', hiragana: 'やさしい', meaning_es: 'Fácil / Sencillo', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '優しい', hiragana: 'やさしい', meaning_es: 'Amable / Tierno / Cariñoso', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '楽しい', hiragana: 'たのしい', meaning_es: 'Divertido / Agradable', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '面白い', hiragana: 'おもしろい', meaning_es: 'Interesante / Gracioso', category: 'Adjetivo -i', level: 'N5' },
  { kanji: 'つまらない', hiragana: 'つまらない', meaning_es: 'Aburrido / Insignificante', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '忙しい', hiragana: 'いそがしい', meaning_es: 'Ocupado / Con mucho trabajo', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '痛い', hiragana: 'いたい', meaning_es: 'Doloroso / ¡Ay, me duele!', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '嬉しい', hiragana: 'うれしい', meaning_es: 'Feliz / Contento / Alegre', category: 'Adjetivo -i', level: 'N4' },
  { kanji: '悲しい', hiragana: 'かなしい', meaning_es: 'Triste', category: 'Adjetivo -i', level: 'N4' },
  { kanji: '寂しい', hiragana: 'さびしい', meaning_es: 'Solitario / Desolado', category: 'Adjetivo -i', level: 'N4' },
  { kanji: '欲しい', hiragana: 'ほしい', meaning_es: 'Deseado / Querer un objeto', category: 'Adjetivo -i', level: 'N5' },
  { kanji: '危ない', hiragana: 'あぶない', meaning_es: 'Peligroso / ¡Cuidado!', category: 'Adjetivo -i', level: 'N5' },

  // Adjetivos -na
  { kanji: '静か', hiragana: 'しずか', meaning_es: 'Tranquilo / Silencioso', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '賑やか', hiragana: 'にぎやか', meaning_es: 'Animado / Bullicioso / Lleno de vida', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '綺麗', hiragana: 'きれい', meaning_es: 'Hermoso / Bonito / Limpio', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '有名', hiragana: 'ゆうめい', meaning_es: 'Famoso / Célebre', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '親切', hiragana: 'しんせつ', meaning_es: 'Amable / Atento / Servicial', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '元気', hiragana: 'げんき', meaning_es: 'Sano / Con energía / Enérgico', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '暇', hiragana: 'ひま', meaning_es: 'Libre / Con tiempo libre', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '便利', hiragana: 'べんり', meaning_es: 'Útil / Cómodo / Práctico', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '不便', hiragana: 'ふべん', meaning_es: 'Incómodo / Poco práctico', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '好き', hiragana: 'すき', meaning_es: 'Gustar / Preferido', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '嫌い', hiragana: 'きらい', meaning_es: 'Desagradar / No gustar', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '大好き', hiragana: 'だいすき', meaning_es: 'Encantar / Fascinar / Amar', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '大嫌い', hiragana: 'だいきらい', meaning_es: 'Odiar / Detestar', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '上手', hiragana: 'じょうず', meaning_es: 'Habilidoso / Bueno en algo', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '下手', hiragana: 'へた', meaning_es: 'Torpe / Malo en algo', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '得意', hiragana: 'とくい', meaning_es: 'Fuerte en algo / Especialidad propia', category: 'Adjetivo -na', level: 'N4' },
  { kanji: '苦手', hiragana: 'にがて', meaning_es: 'Débil en algo / No dársele bien', category: 'Adjetivo -na', level: 'N4' },
  { kanji: '大変', hiragana: 'たいへん', meaning_es: 'Duro / Pesado / Terrible', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '楽', hiragana: 'らく', meaning_es: 'Fácil / Cómodo / Sin esfuerzo', category: 'Adjetivo -na', level: 'N4' },
  { kanji: '簡単', hiragana: 'かんたん', meaning_es: 'Simple / Sencillo', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '大切', hiragana: 'たいせつ', meaning_es: 'Importante / Valioso', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '大事', hiragana: 'だいじ', meaning_es: 'Importante / Valioso / Cuidado', category: 'Adjetivo -na', level: 'N5' },
  { kanji: '安全', hiragana: 'あんぜん', meaning_es: 'Seguro / Libre de peligro', category: 'Adjetivo -na', level: 'N4' },
  { kanji: '危険', hiragana: 'きけん', meaning_es: 'Peligroso / Riesgoso', category: 'Adjetivo -na', level: 'N4' },
  { kanji: '必要', hiragana: 'ひつよう', meaning_es: 'Necesario / Indispensable', category: 'Adjetivo -na', level: 'N4' },
  { kanji: '特別', hiragana: 'とくべつ', meaning_es: 'Especial / Particular', category: 'Adjetivo -na', level: 'N4' },

  // Adverbios y Conectores
  { kanji: 'とても', hiragana: 'とても', meaning_es: 'Muy / Mucho', category: 'Adverbios', level: 'N5' },
  { kanji: 'たいへん', hiragana: 'たいへん', meaning_es: 'Sumamente / Muy (formal)', category: 'Adverbios', level: 'N5' },
  { kanji: 'すごく', hiragana: 'すごく', meaning_es: 'Tremendamente / Increíblemente', category: 'Adverbios', level: 'N5' },
  { kanji: '少し', hiragana: 'すこし', meaning_es: 'Un poco / Algo', category: 'Adverbios', level: 'N5' },
  { kanji: 'ちょっと', hiragana: 'ちょっと', meaning_es: 'Un momento / Un poco', category: 'Adverbios', level: 'N5' },
  { kanji: 'たくさん', hiragana: 'たくさん', meaning_es: 'Mucho / En gran cantidad', category: 'Adverbios', level: 'N5' },
  { kanji: 'あまり', hiragana: 'あまり', meaning_es: 'No mucho (+ negativo) / Demasiado', category: 'Adverbios', level: 'N5' },
  { kanji: '全然', hiragana: 'ぜんぜん', meaning_es: 'Para nada (+ negativo)', category: 'Adverbios', level: 'N5' },
  { kanji: 'いつも', hiragana: 'いつも', meaning_es: 'Siempre', category: 'Adverbios', level: 'N5' },
  { kanji: 'よく', hiragana: 'よく', meaning_es: 'A menudo / Frecuentemente / Bien', category: 'Adverbios', level: 'N5' },
  { kanji: '時々', hiragana: 'ときどき', meaning_es: 'A veces / De vez en cuando', category: 'Adverbios', level: 'N5' },
  { kanji: 'もう', hiragana: 'もう', meaning_es: 'Ya / Ya no / Otro más', category: 'Adverbios', level: 'N5' },
  { kanji: 'まだ', hiragana: 'まだ', meaning_es: 'Todavía / Aún', category: 'Adverbios', level: 'N5' },
  { kanji: 'すぐ', hiragana: 'すぐ', meaning_es: 'Inmediatamente / Pronto', category: 'Adverbios', level: 'N5' },
  { kanji: 'ゆっくり', hiragana: 'ゆっくり', meaning_es: 'Despacio / Con calma', category: 'Adverbios', level: 'N5' },
  { kanji: '一緒に', hiragana: 'いっしょに', meaning_es: 'Juntos / En compañía', category: 'Adverbios', level: 'N5' },
  { kanji: '多分', hiragana: 'たぶん', meaning_es: 'Quizás / Probablemente', category: 'Adverbios', level: 'N5' },
  { kanji: 'ぜひ', hiragana: 'ぜひ', meaning_es: 'Sin falta / Por favor', category: 'Adverbios', level: 'N5' },
  { kanji: 'どうぞ', hiragana: 'どうぞ', meaning_es: 'Adelante / Por favor / Sírvase', category: 'Cortesía', level: 'N5' },
  { kanji: 'そして', hiragana: 'そして', meaning_es: 'Y / Y además', category: 'Conjunciones', level: 'N5' },
  { kanji: 'それから', hiragana: 'それから', meaning_es: 'Y después / Luego', category: 'Conjunciones', level: 'N5' },
  { kanji: 'だから', hiragana: 'だから', meaning_es: 'Por eso / Por tanto', category: 'Conjunciones', level: 'N5' },
  { kanji: 'しかし', hiragana: 'しかし', meaning_es: 'Sin embargo / Pero (formal)', category: 'Conjunciones', level: 'N5' },
  { kanji: 'でも', hiragana: 'でも', meaning_es: 'Pero / Aunque', category: 'Conjunciones', level: 'N5' }
];

console.log('Core lexicon entries:', CORE_LEXICON.length);

const dictionaryMap = new Map();

function cleanStr(s) {
  return (s || '').replace(/[「」『』・\n\r]/g, '').trim();
}

function registerWord(entry) {
  const kanji = cleanStr(entry.kanji);
  let hira = cleanStr(entry.hiragana || entry.kana);
  const meaning = cleanStr(entry.meaning_es || entry.meaning);
  const category = cleanStr(entry.category || entry.type) || 'Vocabulario General';
  const level = entry.level || 'N5';
  const verbType = entry.verbType || null;

  if (!kanji && !hira) return;

  if (!hira && kanji) {
    if (!wanakana.isKanji(kanji)) {
      hira = wanakana.toHiragana(kanji);
    }
  }

  const primaryKey = kanji || hira;
  const kata = entry.katakana ? cleanStr(entry.katakana) : (hira ? wanakana.toKatakana(hira) : '');
  const rom = entry.romaji ? cleanStr(entry.romaji) : (hira ? wanakana.toRomaji(hira) : '');

  const wordObj = {
    kanji: kanji || hira,
    hiragana: hira,
    katakana: kata,
    romaji: rom,
    meaning_es: meaning,
    category: category,
    level: level,
    ...(verbType ? { verbType } : {})
  };

  if (!dictionaryMap.has(primaryKey)) {
    dictionaryMap.set(primaryKey, wordObj);
  } else {
    const existing = dictionaryMap.get(primaryKey);
    if (!existing.meaning_es && meaning) existing.meaning_es = meaning;
    if (!existing.hiragana && hira) {
      existing.hiragana = hira;
      existing.katakana = kata;
      existing.romaji = rom;
    }
    if (verbType && !existing.verbType) existing.verbType = verbType;
  }

  // Also register by hiragana key if different so searching by kana works directly
  if (hira && hira !== primaryKey && !dictionaryMap.has(hira)) {
    dictionaryMap.set(hira, {
      ...wordObj,
      isKanaIndex: true
    });
  }
}

// 1. Ingest CORE_LEXICON first (highest curation priority for Spanish meanings & grammar)
CORE_LEXICON.forEach(registerWord);

// 2. Ingest vocabulary.json
try {
  const v = JSON.parse(fs.readFileSync('data/vocabulary.json', 'utf8'));
  v.forEach(registerWord);
} catch(e) {
  console.warn('Error reading vocabulary.json:', e.message);
}

// 3. Ingest vocabulary_n5.json
try {
  const v5 = JSON.parse(fs.readFileSync('data/vocabulary_n5.json', 'utf8'));
  v5.forEach(registerWord);
} catch(e) {
  console.warn('Error reading vocabulary_n5.json:', e.message);
}

// 4. Ingest vocabulary_n4.json
try {
  const v4 = JSON.parse(fs.readFileSync('data/vocabulary_n4.json', 'utf8'));
  (v4.vocabulary || []).forEach(registerWord);
} catch(e) {
  console.warn('Error reading vocabulary_n4.json:', e.message);
}

// 5. Ingest kanji.json words
try {
  const kanjiList = JSON.parse(fs.readFileSync('data/kanji.json', 'utf8'));
  kanjiList.forEach(k => {
    (k.words || []).forEach(w => {
      registerWord({
        kanji: w.word,
        hiragana: w.reading,
        meaning_es: w.meaning,
        level: k.level,
        category: 'Vocabulario con Kanji'
      });
    });
  });
} catch(e) {
  console.warn('Error reading kanji.json:', e.message);
}

// 6. Ingest curriculum.json section vocab
try {
  const curr = JSON.parse(fs.readFileSync('data/curriculum.json', 'utf8'));
  curr.forEach(m => {
    (m.sections || []).forEach(s => {
      (s.vocab || []).forEach(v => {
        registerWord({
          kanji: v.kanji,
          hiragana: v.kana,
          meaning_es: v.meaning,
          level: m.level,
          category: v.type || 'Currículum'
        });
      });
    });
  });
} catch(e) {
  console.warn('Error reading curriculum.json:', e.message);
}

// Convert Map to array
const finalDictionary = Array.from(dictionaryMap.values());
console.log('Total entries in unified dictionary:', finalDictionary.length);

// Write to data/dictionary.json
const outPath = path.resolve('data/dictionary.json');
fs.writeFileSync(outPath, JSON.stringify(finalDictionary, null, 2), 'utf8');
console.log('Successfully wrote data/dictionary.json!');

