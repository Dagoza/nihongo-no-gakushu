#!/usr/bin/env python3
"""
Nihongo Master - Full Database Builder for Next.js App
Extracts and normalizes all educational content from:
- material_de_estudio/gramatica_y_particulas/7. N5 Japanese Particles Checklist.xlsx
- material_de_estudio/historias_y_lecturas/Nihongo story.pages (Part 1, 2, 3 and sentence breakdown)
- material_de_estudio/kanji/Kanji book.pdf & kanji to print.pdf & practice sheets
- material_de_estudio/vocabulario/N5 vocabulary nouns.pdf, verbs.pdf, adjectives.pdf, adverbs.pdf
- material_de_estudio/vocabulario/N4 vocabulary adjectives.pdf & adverbs.pdf
- material_de_estudio/vocabulario/4. Hiragana Vocabulary Flashcard.pdf
- material_de_estudio/cursos/japones from spanish.pdf (NHK lessons)
- material_de_estudio/cursos/irodori elementary.pdf metadata
"""

import os
import sys
import re
import zlib
import json
import zipfile
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MATERIALS_DIR = os.path.join(BASE_DIR, "material_de_estudio")
os.makedirs(DATA_DIR, exist_ok=True)

print(f"Building Nihongo Master database in {DATA_DIR}...")

# ----------------------------------------------------------------------
# 1. Particles Checklist
# ----------------------------------------------------------------------
def extract_particles():
    excel_path = os.path.join(MATERIALS_DIR, "gramatica_y_particulas", "7. N5 Japanese Particles Checklist.xlsx")
    particles_list = []
    
    translations_es = {
        "Topic Marker": "Marcador de tema principal (en cuanto a...)",
        "Comparison": "Comparación o contraste entre dos cosas",
        "Also": "También / Tampoco (reemplaza a は / を)",
        "Noun + の + Noun": "Posesión o conexión entre sustantivos (de)",
        "Time (exact point of time)": "Punto exacto en el tiempo (a las... / en)",
        "Marks other party of action": "Destinatario o receptor de la acción (dar/recibir/hacer para)",
        "Position (exact point)": "Lugar de existencia estática (estar en...)",
        "Direction": "Destino o dirección del movimiento (hacia)",
        "To/ From": "Punto de partida y fin (desde... hasta...)",
        "Means": "Medio, herramienta o método (en tren, con lápiz)",
        "Place of action": "Lugar donde se realiza una acción dinámica",
        "With": "Compañía (con alguien)",
        "To quote": "Cita directa o indirecta (pensar que..., decir que...)",
        "Mark Object of action": "Objeto directo de la acción transitiva",
        "Than": "Comparación: 'más que' / 'en comparación con'",
        "Preference": "Gusto o preferencia (〜が好き / 嫌い)",
        "Wants": "Deseos (〜が欲しい / 〜が見たい)",
        "Existence": "Sujeto que existe (hay... / está...)",
        "Extreme": "Superlativo (el más / la más de todos)",
        "Sickness": "Síntomas o dolencias físicas (me duele..., tengo fiebre)",
        "Emphasis": "Énfasis en el sujeto (quién realiza la acción)",
        "When talking about a subject": "Descripción de cualidad o característica del sujeto"
    }

    if os.path.exists(excel_path):
        with zipfile.ZipFile(excel_path, 'r') as z:
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
                for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                    text = ''.join([t.text for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text])
                    shared_strings.append(text)

            sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
            rows = sheet_tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
            
            curr_particle = ''
            item_id = 1
            for r in rows[2:]:
                row_vals = []
                for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    t = c.get('t')
                    v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = v.text if v is not None else ''
                    if t == 's' and val.isdigit():
                        val = shared_strings[int(val)]
                    row_vals.append(val)
                
                if len(row_vals) >= 3 and any(row_vals[:3]):
                    p = row_vals[0].strip() or curr_particle
                    curr_particle = p
                    role = row_vals[1].strip() if len(row_vals) > 1 else ''
                    ex_text = row_vals[2].strip() if len(row_vals) > 2 else ''
                    if role or ex_text:
                        examples = [e.strip() for e in ex_text.split('\n') if e.strip()]
                        
                        quiz_items = []
                        for ex in examples:
                            p_clean = p.split('・')[0]
                            if p_clean in ex:
                                masked = ex.replace(p_clean, " 【 ？ 】 ", 1)
                                all_opts = ["は", "が", "を", "に", "で", "へ", "と", "も", "より", "の"]
                                dist = [opt for opt in all_opts if opt != p_clean][:3]
                                opts = [p_clean] + dist
                                opts.sort()
                                quiz_items.append({
                                    "sentence": ex,
                                    "masked": masked,
                                    "correct": p_clean,
                                    "options": opts
                                })

                        particles_list.append({
                            "id": f"particle_{item_id}",
                            "level": "N5",
                            "particle": p,
                            "role_en": role,
                            "role_es": translations_es.get(role, role),
                            "examples": examples,
                            "quiz_items": quiz_items
                        })
                        item_id += 1

    print(f"Extracted {len(particles_list)} particle items")
    save_json("particles", particles_list)
    return particles_list

# ----------------------------------------------------------------------
# 2. Extract Story from Pages & Raw text
# ----------------------------------------------------------------------
def extract_story():
    raw_path = os.path.join(DATA_DIR, "raw_story_decompressed.txt")
    if not os.path.exists(raw_path):
        print(f"Raw story file {raw_path} not found")
        return {}

    with open(raw_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()

    p1_start = text.find("Part 1: Natural Japanese (Kanji & Hiragana)")
    p2_start = text.find("Part 2: Hiragana Only (with spaces for easy reading)")
    p3_start = text.find("Part 3: English Translation")
    breakdown_start = text.find("Here is the story broken down line by line")

    natural_text = text[p1_start + len("Part 1: Natural Japanese (Kanji & Hiragana)"):p2_start].strip()
    hiragana_text = text[p2_start + len("Part 2: Hiragana Only (with spaces for easy reading)"):p3_start].strip()
    english_text = text[p3_start + len("Part 3: English Translation"):breakdown_start].strip()
    breakdown_raw = text[breakdown_start + len("Here is the story broken down line by line, with the Japanese text, the English translation, and grammatical notes explaining the rules and special words used."):].strip()

    sentences = []
    lines = [l.strip() for l in breakdown_raw.splitlines() if l.strip()]
    
    i = 0
    s_idx = 1
    while i < len(lines):
        line = lines[i]
        if line.startswith("Part ") or line.startswith("Here is"):
            i += 1
            continue
            
        if any('\u3040' <= c <= '\u9fff' for c in line) and not line.startswith("Note:"):
            jp_part = ""
            en_part = ""
            m = re.search(r'([\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uFF00-\uFFEF\sA-Za-z0-9「」！？、。]+?[。！？])\s+([A-Za-z0-9"].*)', line)
            if m:
                jp_part = m.group(1).strip()
                en_part = m.group(2).strip()
            else:
                jp_part = line
                en_part = ""

            note_part = ""
            if i + 1 < len(lines) and lines[i + 1].startswith("Note:"):
                note_part = lines[i + 1][len("Note:"):].strip()
                i += 1

            if jp_part:
                sentences.append({
                    "id": f"sent_{s_idx}",
                    "japanese": jp_part,
                    "english": en_part,
                    "grammar_note": note_part,
                    "clean_target": re.sub(r'[、。！？「」\s]', '', jp_part)
                })
                s_idx += 1
        i += 1

    paragraphs_raw = [p.strip() for p in natural_text.split('\n') if p.strip()]
    hiragana_paragraphs = [p.strip() for p in hiragana_text.split('\n') if p.strip()]
    
    story_collection = [
        {
            "id": "story_1",
            "title": "日本での一日 (Un día en Japón)",
            "title_en": "A Day in Japan",
            "difficulty": "Principiante / Intermedio (N5 - N4)",
            "description": "Una hermosa historia integral diseñada para conectar vocabulario cotidiano, números, días de la semana, partículas, expresiones temporales y formas verbales fundamentales.",
            "paragraphs": [
                {
                    "chapter": 1,
                    "title": "朝の始まり (Comienza la mañana)",
                    "japanese": paragraphs_raw[0] if len(paragraphs_raw) > 0 else natural_text[:200],
                    "hiragana": hiragana_paragraphs[0] if len(hiragana_paragraphs) > 0 else "",
                    "translation_es": "Llegué del extranjero este año. Mi país está lejos. Hoy es lunes 1 de abril. Ahora son las seis y media de la mañana. Me levanto temprano todos los días. Hace buen tiempo, hay pocas nubes blancas en el cielo y está mayormente azul. Pero afuera hace mucho frío. Me lavo la cara con agua fría. El desayuno siempre tiene buen sabor y es delicioso. Por supuesto, solo como un poco. Mi padre y mi madre ya se fueron a la empresa. Los niños todavía están en casa.",
                    "translation_en": "I came from a foreign country this year. My country is far. Today is April 1st, Monday. It is now 6:30 AM. I wake up early every day. The weather is good, and there are only a few white clouds in the sky, but it is mostly blue. But, outside is very cold. I wash my face with cold water. Breakfast always has a good taste and is delicious. Of course, I only eat a little. Father and mother already went to the company. The children are still at home."
                },
                {
                    "chapter": 2,
                    "title": "学校への道と友達 (El camino a la escuela y amigos)",
                    "japanese": paragraphs_raw[1] if len(paragraphs_raw) > 1 else "",
                    "hiragana": hiragana_paragraphs[1] if len(hiragana_paragraphs) > 1 else "",
                    "translation_es": "Soy estudiante. La estación está cerca de la escuela, pero como está lejos de mi casa, tomo el tren. El camino a la estación es largo. En el camino hay árboles grandes y hermosas flores. Debajo del árbol, están de pie un niño y una niña. A la derecha y a la izquierda se ven tiendas viejas y tiendas pequeñas nuevas. Frente a la estación hay una multitud de personas. El tren es rápido, pero siempre hay mucha gente. A las ocho salgo de la estación y entro a la escuela. En la entrada sur de la escuela me encontré con mi amiga. Su nombre es Mika. '¡Buenos días! ¿Cómo estás?' le digo.",
                    "translation_en": "I am a student. The station is near the school, but it is far from my house, so I take the train. The road to the station is long. There are big trees and beautiful flowers on the road. Under the tree, a boy and a girl are standing. On the right and left, I can see old shops and new small shops. In front of the station, there are many people. The train is fast, but there are always many people. I leave the station at 8:00 and enter the school. I met my friend at the south entrance of the school. Her name is 'Mika'. 'Good morning! How are you?' I say."
                },
                {
                    "chapter": 3,
                    "title": "日本語の授業 (Clase de japonés)",
                    "japanese": paragraphs_raw[2] if len(paragraphs_raw) > 2 else "",
                    "hiragana": hiragana_paragraphs[2] if len(hiragana_paragraphs) > 2 else "",
                    "translation_es": "Hoy estudiamos japonés. Los profesores son todos buenas personas. Hay libros dentro de la mochila. Saco los libros sobre el escritorio. Escuchamos atentamente las palabras del profesor y leemos el libro. Luego, escribimos caracteres. El examen de hoy no es muy fácil. Es un poco difícil. Le pregunto al profesor: '¿Cómo se lee este kanji?'. ¿La clase es aburrida? No, como estudio con ganas, es interesante. En el recreo, conversamos.",
                    "translation_en": "Today we will study Japanese. The teachers are all good people. There is a book inside my bag. I take the book out onto the desk. We listen well to what the teacher says, and read the book. And we write characters. Today's test is not very easy. It is a little difficult. I ask the teacher, 'What is the reading of this kanji?' Is the class boring? No, because I study well, it is interesting. During break time, we talk."
                },
                {
                    "chapter": 4,
                    "title": "昼休みと週末の計画 (El almuerzo y planes de fin de semana)",
                    "japanese": paragraphs_raw[3] if len(paragraphs_raw) > 3 else "",
                    "hiragana": hiragana_paragraphs[3] if len(hiragana_paragraphs) > 3 else "",
                    "translation_es": "Son las doce del mediodía. Salimos todos afuera y comemos pescado. También compramos bebidas. El té cuesta unos 150 yenes. En total son 1.298 yenes. Es barato. Le digo a mi amiga: '¿Qué harás el sábado y domingo de esta semana?'. 'Voy a la montaña del este. ¿Es alta la montaña? No, es baja, pero el aire es bueno y es divertido'. '¡Qué bien! Yo voy al río del oeste. Meter los pies se siente muy bien'. 'Los martes, miércoles, jueves y viernes son ocupados, pero las vacaciones son divertidas. Este año hace calor, así que bebe mucha agua, ¿eh?'. El papá de mi amiga compró un auto viejo por 30.000 yenes. Así que tal vez vayamos en auto. Pero como el auto es lento, es mejor ir en tren. El cielo del norte está negro. Puede que el tiempo empeore. Podría venir lluvia. Pero, por supuesto, iremos. Con mis propios ojos, oídos, boca y manos, disfrutaré de la gran montaña. En cinco minutos llegará la hora. Dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez. ¡Vamos!",
                    "translation_en": "It is 12:00 PM. Everyone goes outside, and we eat fish. We also buy drinks. Tea is about 150 yen. In total, it is 1,298 yen. It is cheap. I say to my friend, 'What will you do on Saturday and Sunday of this week?' 'I will go to the east mountain. Is the mountain high? No, it is low, but the air is good and it is fun.' 'That is nice. I will go to the west river. When you put your feet in, it feels good.' 'Tuesday, Wednesday, Thursday, and Friday are busy, but days off are fun. This year is hot, so please drink a lot of water.' My friend's father bought an old car for 30,000 yen. So, we might go by car. But cars are slow, so it is better to go by train. The north sky is black. It might become bad weather. Rain might come. But, of course, we will go. With my own eyes, ears, mouth, and hands, I will enjoy the big mountain. In 5 minutes, the time will come. Two, three, four, five, six, seven, eight, nine, ten. Well then, let's go!"
                }
            ],
            "sentences": sentences
        }
    ]

    print(f"Extracted story with {len(paragraphs_raw)} paragraphs and {len(sentences)} analyzed sentences")
    save_json("stories", story_collection)
    return story_collection

# ----------------------------------------------------------------------
# 3. Kanji Collection (Kanji Book + Kanji to Print + Practice Sheets)
# ----------------------------------------------------------------------
def extract_kanji():
    kanji_dict = {}

    kb_path = os.path.join(DATA_DIR, "kanji_book_raw.json")
    if os.path.exists(kb_path):
        with open(kb_path, "r", encoding="utf-8") as f:
            kb_pages = json.load(f)

        for p in kb_pages:
            p_num = p['page']
            txt = p['text']
            if p_num % 2 == 0:
                blocks = re.findall(r'([\u4e00-\u9fff])\s*\n\1\s*\nMeaning\s*:\s*([^\n]+?)\s*Pronunciation\s*:\s*([^\n]+)(.*?)(?=(?:[\u4e00-\u9fff]\s*\n[\u4e00-\u9fff]|\Z))', txt, re.DOTALL)
                for char, meaning, pron, rest in blocks:
                    clean_m = re.split(r'➡︎', meaning)[0].strip()
                    words = []
                    for wm in re.finditer(r'([^\s➡︎\n]+)\s*➡︎\s*([^\s➡︎\n]+)\s*➡︎\s*([^\n]+)', meaning + "\n" + rest):
                        w_char = wm.group(1).strip()
                        w_read = wm.group(2).strip()
                        w_mean = wm.group(3).strip()
                        words.append({"word": w_char, "reading": w_read, "meaning": w_mean})
                    
                    kanji_dict[char] = {
                        "kanji": char,
                        "level": "N5",
                        "meaning_en": clean_m,
                        "meaning_es": translate_meaning_es(clean_m),
                        "pronunciation": pron.strip(),
                        "words": words,
                        "source": "Kanji Book"
                    }

    kp_path = os.path.join(DATA_DIR, "kanji_print_raw.json")
    if os.path.exists(kp_path):
        with open(kp_path, "r", encoding="utf-8") as f:
            kp_pages = json.load(f)

        kanji_by_meaning = {
            "North": "北", "West": "西", "South": "南", "East": "東", "Fish": "魚",
            "Mother": "母", "Father": "父", "Water": "水", "Fire": "火", "Tree": "木",
            "Gold / Money": "金", "Soil / Earth": "土", "Sun / Day": "日", "Moon / Month": "月",
            "Mountain": "山", "River": "川", "Rain": "雨", "Sky / Empty": "空",
            "Eye": "目", "Ear": "耳", "Mouth": "口", "Hand": "手", "Foot / Leg": "足",
            "Car": "車", "Door / Gate": "門", "Book / Origin": "本", "Person": "人",
            "Child": "子", "Woman": "女", "Man": "男", "Big": "大", "Small": "小",
            "High / Expensive": "高", "White": "白", "Black": "黒"
        }

        for p in kp_pages:
            txt = p['text']
            m_m = re.search(r'Meaning:\s*([^\n]+)', txt)
            st_m = re.search(r'(\d+)\s+strokes', txt)
            ony_m = re.search(r'Onyomi:\s*([^\n]+)', txt)
            kun_m = re.search(r'Kunyomi:\s*([^\n]+)', txt)
            mne_m = re.search(r'★\s*([^\n]+(?:\n[^\n]+)?)', txt)

            if m_m:
                meaning = m_m.group(1).strip()
                k_char = kanji_by_meaning.get(meaning)
                if not k_char:
                    km = re.search(r'([\u4e00-\u9fff])', txt)
                    if km: k_char = km.group(1)

                if k_char:
                    if k_char not in kanji_dict:
                        kanji_dict[k_char] = {
                            "kanji": k_char,
                            "level": "N5",
                            "meaning_en": meaning,
                            "meaning_es": translate_meaning_es(meaning),
                            "pronunciation": (kun_m.group(1).strip() if kun_m else "") or (ony_m.group(1).strip() if ony_m else ""),
                            "words": [],
                            "source": "Kanji to Print"
                        }
                    
                    if st_m:
                        kanji_dict[k_char]["strokes"] = int(st_m.group(1))
                    if ony_m:
                        kanji_dict[k_char]["onyomi"] = ony_m.group(1).strip()
                    if kun_m:
                        kanji_dict[k_char]["kunyomi"] = kun_m.group(1).strip()
                    if mne_m:
                        clean_mne = mne_m.group(1).replace('\n', ' ').strip()
                        clean_mne = re.sub(r'NIHON ICHIBAN.*', '', clean_mne).strip()
                        kanji_dict[k_char]["mnemonic"] = clean_mne

    # Add practice sheet kanji
    kanji_dict["思"] = {
        "kanji": "思",
        "level": "N4",
        "meaning_en": "to think, to feel",
        "meaning_es": "pensar, sentir, recordar",
        "pronunciation": "おもう, し",
        "onyomi": "SHI [し]",
        "kunyomi": "omo-u [おもう]",
        "strokes": 9,
        "mnemonic": "Un campo de arroz (田) encima de un corazón (心). Pensar con la mente y el corazón.",
        "words": [
            {"word": "思う", "reading": "おもう", "meaning": "pensar"},
            {"word": "思い出す", "reading": "おもいだす", "meaning": "recordar"},
            {"word": "思い出", "reading": "おもいで", "meaning": "recuerdo"}
        ],
        "source": "思 Practice Sheet"
    }

    kanji_dict["美"] = {
        "kanji": "美",
        "level": "N4",
        "meaning_en": "beauty, beautiful",
        "meaning_es": "belleza, hermoso",
        "pronunciation": "うつくしい, び",
        "onyomi": "BI [び], MI [み]",
        "kunyomi": "utsuku-shii [うつくしい]",
        "strokes": 9,
        "mnemonic": "Una oveja grande (羊 + 大). En la antigüedad, una oveja grande y saludable representaba la belleza y prosperidad.",
        "words": [
            {"word": "美しい", "reading": "うつくしい", "meaning": "hermoso / bella"},
            {"word": "美人", "reading": "びじん", "meaning": "persona hermosa"},
            {"word": "美術", "reading": "びじゅつ", "meaning": "bellas artes"}
        ],
        "source": "美 Practice Sheet"
    }

    kanji_list = list(kanji_dict.values())
    print(f"Compiled {len(kanji_list)} kanji items")
    save_json("kanji", kanji_list)
    return kanji_list

def translate_meaning_es(en_mean):
    t = {
        "one": "uno", "two": "dos", "three": "tres", "four": "cuatro", "five": "cinco",
        "six": "seis", "seven": "siete", "eight": "ocho", "nine": "nueve", "ten": "diez",
        "person": "persona", "what, how, which": "qué / cuál", "now": "ahora",
        "to enter, to insert": "entrar / meter", "to leave, to get out": "salir / sacar",
        "North": "norte", "West": "oeste", "South": "sur", "East": "este", "Fish": "pez / pescado",
        "Mother": "madre", "Father": "padre", "Water": "agua", "Fire": "fuego", "Tree": "árbol",
        "Gold / Money": "oro / dinero / viernes", "Soil / Earth": "tierra / suelo / sábado",
        "Sun / Day": "sol / día / domingo", "Moon / Month": "luna / mes / lunes",
        "Mountain": "montaña", "River": "río", "Rain": "lluvia", "Sky / Empty": "cielo / vacío",
        "Eye": "ojo", "Ear": "oído / oreja", "Mouth": "boca", "Hand": "mano", "Foot / Leg": "pie / pierna",
        "Car": "auto / carro", "Door / Gate": "puerta / portón", "Book / Origin": "libro / origen",
        "Child": "niño / hijo", "Woman": "mujer", "Man": "hombre", "Big": "grande", "Small": "pequeño",
        "High / Expensive": "alto / caro", "White": "blanco", "Black": "negro",
        "to see, to look": "ver / mirar", "to eat": "comer", "to drink": "beber / tomar",
        "to go": "ir", "to come": "venir", "to return": "volver / regresar"
    }
    return t.get(en_mean, en_mean)

# ----------------------------------------------------------------------
# 4. Master Vocabulary (Categorized by Level & Theme)
# ----------------------------------------------------------------------
def extract_master_vocabulary():
    vocab_items = []
    seen = set()

    # Flashcards basics (Greetings, numbers, core verbs, everyday items)
    greetings = [
        ("こんにちは", "Hola / Buenas tardes", "Hello / Good afternoon", "Saludos y Cortesía", "N5"),
        ("おはよう", "Buenos días", "Good morning", "Saludos y Cortesía", "N5"),
        ("ありがとう", "Gracias", "Thank you", "Saludos y Cortesía", "N5"),
        ("すみません", "Disculpe / Lo siento", "Excuse me / I'm sorry", "Saludos y Cortesía", "N5"),
        ("こんばんは", "Buenas noches", "Good evening", "Saludos y Cortesía", "N5"),
        ("おねがいします", "Por favor", "Please", "Saludos y Cortesía", "N5"),
        ("さようなら", "Adiós", "Goodbye", "Saludos y Cortesía", "N5"),
        ("わかりません", "No entiendo", "I don't understand", "Frases Cotidianas", "N5")
    ]
    for kana, es, en, cat, lvl in greetings:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": kana,
            "kana": kana,
            "meaning_es": es,
            "meaning_en": en,
            "category": cat,
            "level": lvl
        })
        seen.add(kana)

    # Numbers
    numbers = [
        ("一", "いち", "uno", "one"),
        ("二", "に", "dos", "two"),
        ("三", "さん", "tres", "three"),
        ("四", "よん", "cuatro", "four"),
        ("五", "ご", "cinco", "five"),
        ("六", "ろく", "seis", "six"),
        ("七", "なな", "siete", "seven"),
        ("八", "はち", "ocho", "eight"),
        ("九", "きゅう", "nueve", "nine"),
        ("十", "じゅう", "diez", "ten"),
        ("百", "ひゃく", "cien", "hundred"),
        ("千", "せん", "mil", "thousand"),
        ("万", "まん", "diez mil", "ten thousand")
    ]
    for k, r, es, en in numbers:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": k,
            "kana": r,
            "meaning_es": es,
            "meaning_en": en,
            "category": "Números y Contadores",
            "level": "N5"
        })
        seen.add(k)

    # Foods
    foods = [
        ("卵", "たまご", "huevo", "egg"),
        ("水", "みず", "agua", "water"),
        ("魚", "さかな", "pescado / pez", "fish"),
        ("お茶", "おちゃ", "té verde", "tea"),
        ("肉", "にく", "carne", "meat"),
        ("林檎", "りんご", "manzana", "apple"),
        ("ご飯", "ごはん", "arroz / comida", "rice, meal"),
        ("野菜", "やさい", "verduras", "vegetables")
    ]
    for k, r, es, en in foods:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": k,
            "kana": r,
            "meaning_es": es,
            "meaning_en": en,
            "category": "Comidas y Bebidas",
            "level": "N5"
        })
        seen.add(k)

    # Places
    places = [
        ("家", "いえ", "casa", "house"),
        ("部屋", "へや", "habitación / cuarto", "room"),
        ("店", "みせ", "tienda", "shop, store"),
        ("駅", "えき", "estación de tren", "station"),
        ("学校", "がっこう", "escuela", "school"),
        ("公園", "こうえん", "parque", "park"),
        ("山", "やま", "montaña", "mountain"),
        ("川", "かわ", "río", "river"),
        ("海", "うみ", "mar", "sea"),
        ("日本", "にほん", "Japón", "Japan")
    ]
    for k, r, es, en in places:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": k,
            "kana": r,
            "meaning_es": es,
            "meaning_en": en,
            "category": "Lugares y Naturaleza",
            "level": "N5"
        })
        seen.add(k)

    # Colors
    colors = [
        ("赤", "あか", "rojo", "red"),
        ("青", "あお", "azul", "blue"),
        ("黒", "くろ", "negro", "black"),
        ("白", "しろ", "blanco", "white"),
        ("緑", "みどり", "verde", "green"),
        ("紫", "むらさき", "morado", "purple"),
        ("黄色", "きいろ", "amarillo", "yellow")
    ]
    for k, r, es, en in colors:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": k,
            "kana": r,
            "meaning_es": es,
            "meaning_en": en,
            "category": "Colores",
            "level": "N5"
        })
        seen.add(k)

    # Verbs N5
    verbs = [
        ("食べる", "たべる", "comer", "to eat", "Grupo 2 (Ichidan)", "食べます", "食べて", "N5"),
        ("飲む", "のむ", "beber / tomar", "to drink", "Grupo 1 (Godan)", "飲みます", "飲んで", "N5"),
        ("見る", "みる", "mirar / ver", "to see, watch", "Grupo 2 (Ichidan)", "見ます", "見て", "N5"),
        ("聞く", "きく", "escuchar / preguntar", "to hear, listen, ask", "Grupo 1 (Godan)", "聞きます", "聞いて", "N5"),
        ("読む", "よむ", "leer", "to read", "Grupo 1 (Godan)", "読みます", "読んで", "N5"),
        ("書く", "かく", "escribir", "to write", "Grupo 1 (Godan)", "書きます", "書いて", "N5"),
        ("話す", "はなす", "hablar / conversar", "to speak", "Grupo 1 (Godan)", "話します", "話して", "N5"),
        ("行く", "いく", "ir", "to go", "Grupo 1 (Godan)", "行きます", "行って", "N5"),
        ("来る", "くる", "venir", "to come", "Grupo 3 (Irregular)", "来ます", "来て", "N5"),
        ("帰る", "かえる", "regresar / volver", "to return", "Grupo 1 (Godan)", "帰ります", "帰って", "N5"),
        ("起きる", "おきる", "levantarse / despertar", "to wake up", "Grupo 2 (Ichidan)", "起きます", "起きて", "N5"),
        ("寝る", "ねる", "dormir / acostarse", "to sleep", "Grupo 2 (Ichidan)", "寝ます", "寝て", "N5"),
        ("会う", "あう", "encontrarse con / ver a alguien", "to meet", "Grupo 1 (Godan)", "会います", "会って", "N5"),
        ("買う", "かう", "comprar", "to buy", "Grupo 1 (Godan)", "買います", "買って", "N5"),
        ("洗う", "あらう", "lavar", "to wash", "Grupo 1 (Godan)", "洗います", "洗って", "N5"),
        ("待つ", "まつ", "esperar", "to wait", "Grupo 1 (Godan)", "待ちます", "待って", "N5"),
        ("持つ", "もつ", "tener / sostener", "to hold, have", "Grupo 1 (Godan)", "持ちます", "持って", "N5"),
        ("入る", "はいる", "entrar", "to enter", "Grupo 1 (Godan)", "入ります", "入って", "N5"),
        ("出る", "でる", "salir", "to leave, exit", "Grupo 2 (Ichidan)", "出ます", "出て", "N5"),
        ("乗る", "のる", "subirse / montar en (transporte)", "to ride, board", "Grupo 1 (Godan)", "乗ります", "乗って", "N5"),
        ("立つ", "たつ", "estar de pie / levantarse", "to stand", "Grupo 1 (Godan)", "立ちます", "立って", "N5"),
        ("座る", "すわる", "sentarse", "to sit", "Grupo 1 (Godan)", "座ります", "座って", "N5"),
        ("教える", "おしえる", "enseñar", "to teach", "Grupo 2 (Ichidan)", "教えます", "教えて", "N5"),
        ("勉強する", "べんきょうする", "estudiar", "to study", "Grupo 3 (Irregular)", "勉強します", "勉強して", "N5"),
        ("する", "する", "hacer", "to do", "Grupo 3 (Irregular)", "します", "して", "N5"),
        ("ある", "ある", "haber / estar (inanimado)", "to exist (inanimate)", "Grupo 1 (Godan)", "あります", "あって", "N5"),
        ("いる", "いる", "haber / estar (animado)", "to exist (living)", "Grupo 2 (Ichidan)", "います", "いて", "N5")
    ]
    for k, r, es, en, grp, polite, te, lvl in verbs:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": k,
            "kana": r,
            "meaning_es": es,
            "meaning_en": en,
            "category": "Verbos",
            "group": grp,
            "polite_masu": polite,
            "te_form": te,
            "level": lvl
        })
        seen.add(k)

    # Adjectives N5
    adjectives_n5 = [
        ("大きい", "おおきい", "grande", "big", "い-adjective", "N5"),
        ("小さい", "ちいさい", "pequeño", "small", "い-adjective", "N5"),
        ("高い", "たかい", "alto / caro", "high, expensive", "い-adjective", "N5"),
        ("安い", "やすい", "barato", "cheap", "い-adjective", "N5"),
        ("低い", "ひくい", "bajo (altura)", "low", "い-adjective", "N5"),
        ("新しい", "あたらしい", "nuevo", "new", "い-adjective", "N5"),
        ("古い", "ふるい", "viejo / antiguo", "old", "い-adjective", "N5"),
        ("良い", "いい / よい", "bueno / bien", "good", "い-adjective", "N5"),
        ("悪い", "わるい", "malo", "bad", "い-adjective", "N5"),
        ("近い", "ちかい", "cerca", "near", "い-adjective", "N5"),
        ("遠い", "とおい", "lejos", "far", "い-adjective", "N5"),
        ("早い", "はやい", "temprano", "early", "い-adjective", "N5"),
        ("速い", "はやい", "rápido (velocidad)", "fast", "い-adjective", "N5"),
        ("遅い", "おそい", "lento / tarde", "slow, late", "い-adjective", "N5"),
        ("暑い", "あつい", "caluroso (clima)", "hot (weather)", "い-adjective", "N5"),
        ("寒い", "さむい", "frío (clima)", "cold (weather)", "い-adjective", "N5"),
        ("冷たい", "つめたい", "frío (al tacto / bebida)", "cold (touch)", "い-adjective", "N5"),
        ("美味しい", "おいしい", "delicioso / rico", "delicious", "い-adjective", "N5"),
        ("楽しい", "たのしい", "divertido", "fun, enjoyable", "い-adjective", "N5"),
        ("難しい", "むずかしい", "difícil", "difficult", "い-adjective", "N5"),
        ("易しい", "やさしい", "fácil / sencillo", "easy", "い-adjective", "N5"),
        ("面白い", "おもしろい", "interesante", "interesting", "い-adjective", "N5"),
        ("つまらない", "つまらない", "aburrido", "boring", "い-adjective", "N5"),
        ("忙しい", "いそがしい", "ocupado", "busy", "い-adjective", "N5"),
        ("静か", "しずか", "tranquilo / silencioso", "quiet", "な-adjective", "N5"),
        ("元気", "げんき", "con energía / sano / bien", "healthy, energetic", "な-adjective", "N5"),
        ("便利", "べんり", "conveniente / práctico", "convenient", "な-adjective", "N5"),
        ("有名", "ゆうめい", "famoso", "famous", "な-adjective", "N5"),
        ("親切", "しんせつ", "amable", "kind", "な-adjective", "N5"),
        ("好き", "すき", "que gusta / favorito", "liked, favorite", "な-adjective", "N5")
    ]
    for k, r, es, en, adj_t, lvl in adjectives_n5:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": k,
            "kana": r,
            "meaning_es": es,
            "meaning_en": en,
            "category": "Adjetivos",
            "type": adj_t,
            "level": lvl
        })
        seen.add(k)

    # Adverbs N5
    adverbs_n5 = [
        ("とても", "とても", "muy", "very", "N5"),
        ("少し", "すこし", "un poco", "a little", "N5"),
        ("ちょっと", "ちょっと", "un poco / un momento", "a bit", "N5"),
        ("たくさん", "たくさん", "mucho / bastante", "a lot", "N5"),
        ("いつも", "いつも", "siempre", "always", "N5"),
        ("だいたい", "だいたい", "la mayoría / casi todo", "mostly, roughly", "N5"),
        ("早く", "はやく", "temprano / rápidamente", "early, quickly", "N5"),
        ("よく", "よく", "bien / con frecuencia", "well, often", "N5"),
        ("もう", "もう", "ya", "already", "N5"),
        ("まだ", "まだ", "todavía / aún", "still, yet", "N5"),
        ("もちろん", "もちろん", "por supuesto", "of course", "N5"),
        ("大勢", "おおぜい", "mucha gente / en multitud", "a crowd of people", "N5")
    ]
    for k, r, es, en, lvl in adverbs_n5:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": k,
            "kana": r,
            "meaning_es": es,
            "meaning_en": en,
            "category": "Adverbios",
            "level": lvl
        })
        seen.add(k)

    # N4 Adjectives
    adjectives_n4 = [
        ("素晴らしい", "すばらしい", "maravilloso / excelente", "wonderful", "い-adjective", "N4"),
        ("上手", "じょうず", "habilidoso / bueno para", "skillful, good at", "な-adjective", "N4"),
        ("得意", "とくい", "bueno en / punto fuerte", "one's forte", "な-adjective", "N4"),
        ("危ない", "あぶない", "peligroso", "dangerous", "い-adjective", "N4"),
        ("危険", "きけん", "peligro / peligroso", "danger, hazardous", "な-adjective", "N4"),
        ("安全", "あんぜん", "seguro", "safe", "な-adjective", "N4"),
        ("深い", "ふかい", "profundo", "deep", "い-adjective", "N4"),
        ("浅い", "あさい", "superficial / poco profundo", "shallow", "い-adjective", "N4"),
        ("怖い", "こわい", "aterrador / que da miedo", "scary", "い-adjective", "N4"),
        ("寂しい", "さびしい", "solitario / nostálgico", "lonely, homesick", "い-adjective", "N4"),
        ("厳しい", "きびしい", "estricto / riguroso", "strict", "い-adjective", "N4"),
        ("熱心", "ねっしん", "entusiasta / apasionado", "enthusiastic", "な-adjective", "N4"),
        ("悲しい", "かなしい", "triste", "sad", "い-adjective", "N4"),
        ("特別", "とくべつ", "especial", "special", "な-adjective", "N4"),
        ("苦い", "にがい", "amargo", "bitter", "い-adjective", "N4"),
        ("煩い", "うるさい", "ruidoso / molesto", "noisy, annoying", "い-adjective", "N4"),
        ("適切", "てきせつ", "adecuado / apropiado", "appropriate", "な-adjective", "N4")
    ]
    for k, r, es, en, adj_t, lvl in adjectives_n4:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": k,
            "kana": r,
            "meaning_es": es,
            "meaning_en": en,
            "category": "Adjetivos",
            "type": adj_t,
            "level": lvl
        })
        seen.add(k)

    # N4 Adverbs
    adverbs_n4 = [
        ("すると", "すると", "entonces / dicho eso", "then, upon which", "N4"),
        ("そろそろ", "そろそろ", "ya es hora de / pronto", "it's about time, soon", "N4"),
        ("今にも", "いまにも", "en cualquier momento / a punto de", "at any moment", "N4"),
        ("先に", "さきに", "antes / por adelantado", "ahead, before", "N4"),
        ("始めに", "はじめに", "al principio / para empezar", "at first, to begin with", "N4"),
        ("たまに", "たまに", "de vez en cuando / raras veces", "occasionally, rarely", "N4"),
        ("できるだけ", "できるだけ", "en la medida de lo posible", "as much as possible", "N4"),
        ("しっかり", "しっかり", "firmemente / con ganas", "firmly, diligently", "N4"),
        ("必ず", "かならず", "sin falta / ciertamente", "by all means, certainly", "N4"),
        ("だから", "だから", "por lo tanto / por eso", "therefore, so", "N4"),
        ("とうとう", "とうとう", "finalmente / al fin", "finally, at last", "N4"),
        ("例えば", "たとえば", "por ejemplo", "for example", "N4"),
        ("直接", "ちょくせつ", "directamente", "directly", "N4"),
        ("別に", "べつに", "no particularmente (con negativo)", "not particularly", "N4"),
        ("きちんと", "きちんと", "ordenadamente / como corresponde", "properly, neatly", "N4"),
        ("はっきり", "はっきり", "claramente", "clearly", "N4"),
        ("かなり", "かなり", "bastante / considerablemente", "considerably, quite", "N4"),
        ("十分に", "じゅうぶんに", "suficientemente", "sufficiently", "N4"),
        ("随分", "ずいぶん", "bastante / mucho", "extremely, a lot", "N4"),
        ("非常に", "ひじょうに", "sumamente / en extremo", "extremely", "N4"),
        ("ちっとも", "ちっとも", "ni un poco (con negativo)", "not in the least", "N4"),
        ("決して", "けっして", "jamás / de ninguna manera", "never, by no means", "N4"),
        ("絶対に", "ぜったいに", "absolutamente", "definitely, absolutely", "N4"),
        ("普通は", "ふつうは", "normalmente / por lo general", "normally", "N4"),
        ("急に", "きゅうに", "de repente", "suddenly", "N4"),
        ("すっかり", "すっかり", "completamente / del todo", "completely", "N4"),
        ("どんどん", "どんどん", "cada vez más / sin parar", "steadily, rapidly", "N4"),
        ("しばらく", "しばらく", "por un tiempo / un rato", "for a while", "N4"),
        ("ほとんど", "ほとんど", "casi todo / casi nada", "almost, hardly", "N4"),
        ("さっき", "さっき", "hace un momento", "a little while ago", "N4"),
        ("最近", "さいきん", "recientemente / últimamente", "recently", "N4")
    ]
    for k, r, es, en, lvl in adverbs_n4:
        vocab_items.append({
            "id": f"v_{len(vocab_items)+1}",
            "kanji": k,
            "kana": r,
            "meaning_es": es,
            "meaning_en": en,
            "category": "Adverbios",
            "level": lvl
        })
        seen.add(k)

    print(f"Compiled Master Vocabulary: {len(vocab_items)} items across levels")
    save_json("vocabulary", vocab_items)
    return vocab_items

# ----------------------------------------------------------------------
# 5. Context Exercises
# ----------------------------------------------------------------------
def extract_context_exercises():
    exercises = [
        {
            "id": "ex_1",
            "level": "N4",
            "prompt_es": "La vista desde la montaña es maravillosa.",
            "sentence": "山から見る景色はとても ( すばらしい ) です。",
            "masked": "山から見る景色はとても 【 ？ 】 です。",
            "correct": "すばらしい",
            "options": ["すばらしい", "あぶない", "こわい", "ふかい"],
            "explanation": "すばらしい (maravilloso). Se usa comúnmente para describir paisajes o vistas impresionantes."
        },
        {
            "id": "ex_2",
            "level": "N4",
            "prompt_es": "Nick vivió en Japón, así que habla bien japonés.",
            "sentence": "ニックさんは日本に住んでいたから、日本語が ( じょうず ) です。",
            "masked": "ニックさんは日本に住んでいたから、日本語が 【 ？ 】 です。",
            "correct": "じょうず",
            "options": ["じょうず", "きびしい", "うるさい", "にがい"],
            "explanation": "じょうず (hábil / bueno en algo). Expresa destreza adquirida tras vivir en Japón."
        },
        {
            "id": "ex_3",
            "level": "N4",
            "prompt_es": "Aquel lago es profundo por lo que es peligroso, pero este lago es seguro porque es poco profundo.",
            "sentence": "あの湖は深いから、( あぶない ) ですが、この湖は浅いから安全です。",
            "masked": "あの湖は深いから、【 ？ 】 ですが、この湖は浅いから安全です。",
            "correct": "あぶない",
            "options": ["あぶない", "うれしい", "ねっしん", "すばらしい"],
            "explanation": "あぶない / 危険 (peligroso), contrasta con 安全 (seguro)."
        },
        {
            "id": "ex_4",
            "level": "N4",
            "prompt_es": "Esta película de terror me da mucho miedo.",
            "sentence": "このホラー映画はとても ( こわい ) です。",
            "masked": "このホラー映画はとても 【 ？ 】 です。",
            "correct": "こわい",
            "options": ["こわい", "かなしい", "にがい", "とくべつ"],
            "explanation": "こわい (aterrador / que da miedo) es el adjetivo ideal para películas de terror."
        },
        {
            "id": "ex_5",
            "level": "N4",
            "prompt_es": "Llevo viviendo un año en Japón. Me siento un poco solitario/nostálgico.",
            "sentence": "日本に１年住んでいます。少し ( さびしい ) です。",
            "masked": "日本に１年住んでいます。少し 【 ？ 】 です。",
            "correct": "さびしい",
            "options": ["さびしい", "うるさい", "すばらしい", "あさい"],
            "explanation": "さびしい (solitario / con nostalgia de casa)."
        },
        {
            "id": "ex_6",
            "level": "N4",
            "prompt_es": "El profesor es estricto y apasionado, así que nos deja mucha tarea.",
            "sentence": "先生は ( きびしい ) し、熱心だし、たくさん宿題を出します。",
            "masked": "先生は 【 ？ 】 し、熱心だし、たくさん宿題を出します。",
            "correct": "きびしい",
            "options": ["きびしい", "にがい", "あぶない", "こわい"],
            "explanation": "きびしい (estricto), acompañado de 熱心 (dedicado/entusiasta)."
        },
        {
            "id": "ex_7",
            "level": "N4",
            "prompt_es": "En la India, la vaca es un animal especial.",
            "sentence": "インドでは牛は ( とくべつ ) な動物です。",
            "masked": "インドでは牛は 【 ？ 】 な動物です。",
            "correct": "とくべつ",
            "options": ["とくべつ", "うるさい", "てきせつ", "かなしい"],
            "explanation": "とくべつ (especial, adjetivo-na: 特別な動物)."
        },
        {
            "id": "ex_8",
            "level": "N4",
            "prompt_es": "Prefiero el café negro amargo al café dulce.",
            "sentence": "甘いコーヒーより ( にがい ) ブラックコーヒーが好きです。",
            "masked": "甘いコーヒーより 【 ？ 】 ブラックコーヒーが好きです。",
            "correct": "にがい",
            "options": ["にがい", "あぶない", "こわい", "ふかい"],
            "explanation": "にがい (amargo), opuesto a 甘い (dulce)."
        },
        {
            "id": "ex_9",
            "level": "N4",
            "prompt_es": "Están en obras viales, así que hay mucho ruido.",
            "sentence": "道路工事をしているから、とても ( うるさい ) です。",
            "masked": "道路工事をしているから、とても 【 ？ 】 です。",
            "correct": "うるさい",
            "options": ["うるさい", "すばらしい", "さびしい", "とくべつ"],
            "explanation": "うるさい (ruidoso / molesto) causado por obras en la calle (工事)."
        }
    ]

    save_json("exercises", exercises)
    return exercises

# ----------------------------------------------------------------------
# 6. NHK Lessons in Spanish
# ----------------------------------------------------------------------
def extract_nhk_lessons():
    key_lessons = [
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
                {"speaker": "Sakura", "jp": "いいえ、留学生ではありません。", "es": "No, no soy estudiante extranjera."}
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
            "topic": "Posesión con la partícula の",
            "level": "N5",
            "dialogue": [
                {"speaker": "Sakura", "jp": "かわいいですね。何ですか。", "es": "Qué lindo. ¿Qué es?"},
                {"speaker": "Anna", "jp": "それは私の宝物です。", "es": "Ese es mi tesoro."},
                {"speaker": "Sakura", "jp": "誰からもらいましたか。", "es": "¿De quién lo recibiste?"},
                {"speaker": "Anna", "jp": "母からもらいました。", "es": "Lo recibí de mi mamá."}
            ],
            "grammar_notes": [
                "A の B: 'B de A'. Expresa pertenencia o descripción (私の本 = mi libro).",
                "から (kara): Indica el origen o la persona que otorga algo (madre から = de mi madre)."
            ]
        },
        {
            "lesson": 6,
            "title_jp": "電話番号は何番ですか。",
            "title_es": "¿Cuál es tu número de teléfono?",
            "topic": "Números de teléfono y preguntas numéricas",
            "level": "N5",
            "dialogue": [
                {"speaker": "Sakura", "jp": "アンナさんの電話番号は何番ですか。", "es": "Anna, ¿cuál es tu número de teléfono?"},
                {"speaker": "Anna", "jp": "090-1234-5678です。", "es": "Es 090-1234-5678."},
                {"speaker": "Sakura", "jp": "分かりました。ありがとう。", "es": "Entendido. Gracias."}
            ],
            "grammar_notes": [
                "El guión '-' en números de teléfono se pronuncia como 'の' (no).",
                "何番 (nanban): '¿Qué número?'."
            ]
        }
    ]

    print(f"Compiled {len(key_lessons)} NHK Spanish course lessons")
    save_json("nhk_lessons", key_lessons)
    return key_lessons

# ----------------------------------------------------------------------
# 7. Incremental Learning Curriculum
# ----------------------------------------------------------------------
def extract_curriculum():
    curriculum = [
        {
            "step": 1,
            "title": "Nivel 1: Primeros Pasos y Saludos Cotidianos",
            "subtitle": "Dominando los saludos, la cortesía y la fonética",
            "stage": "Fundamentos",
            "icon": "🌸",
            "objectives": [
                "Aprender a saludar y presentarse en japonés (こんにちは, はじめまして)",
                "Uso de la cópula です y la negación ではありません",
                "Comprender la partícula は como marcador de tema"
            ],
            "included_vocab": ["こんにちは", "おはよう", "ありがとう", "すみません", "さようなら", "私", "人", "学生"],
            "grammar_focus": ["は (Topic Marker)", "A は B です / ではありません"],
            "tab": "vocab"
        },
        {
            "step": 2,
            "title": "Nivel 2: Números, Días, Meses y la Partícula の",
            "subtitle": "Aprender a contar, decir fechas y expresar posesión",
            "stage": "Esencial",
            "icon": "📅",
            "objectives": [
                "Contar del 1 al 10,000 en japonés",
                "Aprender los 7 días de la semana y partes del día (朝, 昼, 晩)",
                "Conectar sustantivos con la partícula の (mi país, libro de japonés)"
            ],
            "included_vocab": ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日", "今日", "今"],
            "grammar_focus": ["Noun + の + Noun", "の como posesivo", "Kanji de números 1 al 10"],
            "tab": "vocab"
        },
        {
            "step": 3,
            "title": "Nivel 3: Objetos, Lugares y Existencia (ある vs いる)",
            "subtitle": "Demostrativos y dónde están las cosas y personas",
            "stage": "Estructuras",
            "icon": "⛩️",
            "objectives": [
                "Usar これ, それ, あれ y ここ, そこ, あそこ",
                "Diferenciar entre あります (cosas) e います (seres vivos)",
                "Marcar la ubicación con に y el sujeto con が"
            ],
            "included_vocab": ["家", "部屋", "学校", "駅", "店", "本", "机", "木", "ある", "いる", "ここ", "そこ", "どこ"],
            "grammar_focus": ["Lugar に Objeto が あります / います", "Partícula に (Posición)", "Partícula が (Existencia)"],
            "tab": "grammar"
        },
        {
            "step": 4,
            "title": "Nivel 4: Verbos de Acción y la Partícula を",
            "subtitle": "Lo que comemos, bebemos, leemos y hacemos a diario",
            "stage": "Comunicación",
            "icon": "🍱",
            "objectives": [
                "Aprender los verbos transitivos más frecuentes en forma ます",
                "Marcar el objeto directo con la partícula を",
                "Indicar el lugar de la acción con で y la compañía con と"
            ],
            "included_vocab": ["食べる", "飲む", "読む", "書く", "聞く", "話す", "買う", "ご飯", "水", "お茶", "魚", "肉"],
            "grammar_focus": ["Objeto を Verbo", "Lugar で Verbo", "Persona と Verbo"],
            "tab": "vocab"
        },
        {
            "step": 5,
            "title": "Nivel 5: Movimiento, Tiempo y Partículas に, へ, から, まで",
            "subtitle": "Desplazarse en tren, horarios y direcciones",
            "stage": "Movimiento",
            "icon": "🚅",
            "objectives": [
                "Expresar origen y destino con から y まで",
                "Dirección del movimiento con へ e に con verbos 行く, 来る, 帰る",
                "Marcar el punto exacto de tiempo con に (a las 6:30, a las 8:00)"
            ],
            "included_vocab": ["行く", "来る", "帰る", "乗る", "出る", "電車", "車", "道", "午前", "午後", "時間", "から", "まで"],
            "grammar_focus": ["Tiempo に Verbo", "Destino へ / に 行く", "Punto A から Punto B まで"],
            "tab": "grammar"
        },
        {
            "step": 6,
            "title": "Nivel 6: Describir el Mundo con Adjetivos (い y な)",
            "subtitle": "Expresar opiniones, características y comparaciones",
            "stage": "Expresión",
            "icon": "🎨",
            "objectives": [
                "Dominar adjetivos い (大きい, 小さい, 美味しい, 楽しい)",
                "Dominar adjetivos な (静か, 元気, 便利, 親切)",
                "Conectar oraciones con la forma -te (良くて, 安くて) y contrastar con けど / が"
            ],
            "included_vocab": ["大きい", "小さい", "高い", "安い", "新しい", "古い", "良い", "悪い", "暑い", "寒い", "冷たい", "静か", "元気"],
            "grammar_focus": ["Adjetivo-い + です", "Adjetivo-て (Conexión)", "より (Comparación 'más que')"],
            "tab": "kanji"
        },
        {
            "step": 7,
            "title": "Nivel 7: Historia Integral 'Un Día en Japón' (Parte 1 y 2)",
            "subtitle": "Lectura interactiva, pronunciación y desglose palabra por palabra",
            "stage": "Consolidación",
            "icon": "📖",
            "objectives": [
                "Leer los capítulos 1 y 2 de la historia en modo natural o hiragana",
                "Escuchar la pronunciación nativa de cada oración",
                "Escribir oraciones completas en japonés con teclado IME"
            ],
            "included_vocab": ["今年", "外国", "遠い", "四月一日", "早く", "起きます", "天気", "空", "白い雲", "顔を洗う"],
            "grammar_focus": ["Lectura fluida con Furigana", "Comprensión auditiva y de lectura"],
            "tab": "stories"
        },
        {
            "step": 8,
            "title": "Nivel 8: Historia Integral (Capítulos 3 y 4) y Estructuras N4",
            "subtitle": "La escuela, planes con amigos y gramática de nivel superior",
            "stage": "Puente a Intermedio",
            "icon": "🎓",
            "objectives": [
                "Completar la historia: la clase de japonés y el almuerzo",
                "Aprender 〜かもしれません (posibilidad) y 〜方がいい (recomendación)",
                "Condicional con と (足を入れると気持ちがいい)"
            ],
            "included_vocab": ["勉強", "先生方", "机", "字", "易しい", "難しい", "面白い", "空気", "気持ちがいい", "車で行く"],
            "grammar_focus": ["〜かもしれません (Might)", "〜方がいい (Should)", "〜と (When/If)"],
            "tab": "stories"
        },
        {
            "step": 9,
            "title": "Nivel 9: Adjetivos y Adverbios N4 con Ejercicios en Contexto",
            "subtitle": "Vocabulario de nivel N4 para expresarse con fluidez y matices",
            "stage": "Fluidez",
            "icon": "⚡",
            "objectives": [
                "Dominar adjetivos N4 (素晴らしい, 危険, 安全, 厳しい, 熱心)",
                "Dominar adverbios N4 (そろそろ, 必ず, 例えば, はっきり, どんどん)",
                "Resolver ejercicios de rellenar espacios en blanco extraídos de exámenes N4"
            ],
            "included_vocab": ["すばらしい", "あぶない", "あんぜん", "こわい", "さびしい", "きびしい", "ねっしん", "かならず", "そろそろ", "はっきり"],
            "grammar_focus": ["Adverbios de grado y certeza", "Oraciones complejas N4"],
            "tab": "vocab"
        }
    ]

    print(f"Compiled {len(curriculum)} curriculum steps")
    save_json("curriculum", curriculum)
    return curriculum

# ----------------------------------------------------------------------
# 8. PDF Catalog (Reflecting organized folder material_de_estudio/)
# ----------------------------------------------------------------------
def extract_pdf_catalog():
    pdfs = [
        {
            "filename": "Nihongo story.pages",
            "title": "私の日本での生活 (Historia de Aprendizaje Integral)",
            "category": "historias_y_lecturas",
            "category_name": "Historias y Lecturas",
            "level": "N5 / N4",
            "path": "/material_de_estudio/historias_y_lecturas/Nihongo story.pages",
            "pages": 4,
            "size": "334 KB",
            "description": "Historia completa en 3 partes: japonés natural (Kanji + Hiragana), solo Hiragana con espacios, y desglose minucioso oración por oración con notas gramaticales y vocabulario."
        },
        {
            "filename": "7. N5 Japanese Particles Checklist.xlsx",
            "title": "N5 Japanese Particles Checklist",
            "category": "gramatica_y_particulas",
            "category_name": "Gramática y Partículas",
            "level": "N5",
            "path": "/material_de_estudio/gramatica_y_particulas/7. N5 Japanese Particles Checklist.xlsx",
            "pages": 1,
            "size": "69 KB",
            "description": "Checklist exhaustivo de las 25 funciones principales de las partículas japonesas N5 (は, も, の, に, で, と, を, から, まで, より, が) con roles y ejemplos reales."
        },
        {
            "filename": "Kanji book.pdf",
            "title": "Kanji Book N5",
            "category": "kanji",
            "category_name": "Kanji",
            "level": "N5",
            "path": "/material_de_estudio/kanji/Kanji book.pdf",
            "pages": 49,
            "size": "2.5 MB",
            "description": "Libro de kanji con 49 páginas: lecciones con lecturas On/Kun, palabras compuestas y páginas dedicadas de ejercicios prácticos de traducción y lectura."
        },
        {
            "filename": "kanji to print.pdf",
            "title": "Kanji Flashcards with Mnemonics",
            "category": "kanji",
            "category_name": "Kanji",
            "level": "N5",
            "path": "/material_de_estudio/kanji/kanji to print.pdf",
            "pages": 34,
            "size": "2.8 MB",
            "description": "Tarjetas con el orden de trazos, lecturas On'yomi y Kun'yomi, vocabulario clave y mnemotecnias visuales memorables para cada carácter."
        },
        {
            "filename": "N5 vocabulary nouns.pdf",
            "title": "N5 Vocabulary: Sustantivos (Nouns)",
            "category": "vocabulario",
            "category_name": "Vocabulario",
            "level": "N5",
            "path": "/material_de_estudio/vocabulario/N5 vocabulary nouns.pdf",
            "pages": 30,
            "size": "1.2 MB",
            "description": "30 categorías temáticas de sustantivos N5: personas, familia, países, calendario, horas, comida, objetos, lugares, transporte y naturaleza."
        },
        {
            "filename": "N5 vocabulary verbs.pdf",
            "title": "N5 Vocabulary: Verbos (Verbs)",
            "category": "vocabulario",
            "category_name": "Vocabulario",
            "level": "N5",
            "path": "/material_de_estudio/vocabulario/N5 vocabulary verbs.pdf",
            "pages": 6,
            "size": "450 KB",
            "description": "Colección completa de verbos esenciales de nivel N5 organizados por grupos (Godan, Ichidan, Irregulares) con furigana y significados."
        },
        {
            "filename": "N5 vocabulary adjectives.pdf",
            "title": "N5 Vocabulary: Adjetivos (Adjectives)",
            "category": "vocabulario",
            "category_name": "Vocabulario",
            "level": "N5",
            "path": "/material_de_estudio/vocabulario/N5 vocabulary adjectives.pdf",
            "pages": 4,
            "size": "806 KB",
            "description": "Adjetivos N5 de tipo い y tipo な con furigana, pares de antónimos (grande/pequeño, caro/barato, frío/caliente)."
        },
        {
            "filename": "N5 vocabulary adverbs.pdf",
            "title": "N5 Vocabulary: Adverbios (Adverbs)",
            "category": "vocabulario",
            "category_name": "Vocabulario",
            "level": "N5",
            "path": "/material_de_estudio/vocabulario/N5 vocabulary adverbs.pdf",
            "pages": 4,
            "size": "756 KB",
            "description": "Adverbios fundamentales de frecuencia, cantidad, grado y tiempo para estructurar oraciones naturales en N5."
        },
        {
            "filename": "N4 vocabulary adjectives.pdf",
            "title": "N4 Vocabulary: Adjetivos con Ejercicios",
            "category": "vocabulario",
            "category_name": "Vocabulario",
            "level": "N4",
            "path": "/material_de_estudio/vocabulario/N4 vocabulary adjectives.pdf",
            "pages": 6,
            "size": "1.3 MB",
            "description": "Unidades 1 a 3 de adjetivos N4 con sus pruebas y ejercicios prácticos de rellenar espacios en oraciones contextuales."
        },
        {
            "filename": "N4 vocabulary adverbs.pdf",
            "title": "N4 Vocabulary: Adverbios con Pruebas",
            "category": "vocabulario",
            "category_name": "Vocabulario",
            "level": "N4",
            "path": "/material_de_estudio/vocabulario/N4 vocabulary adverbs.pdf",
            "pages": 6,
            "size": "868 KB",
            "description": "Unidades 4 a 9 de adverbios N4 con pruebas de aplicación práctica y matices comunicativos."
        },
        {
            "filename": "4. Hiragana Vocabulary Flashcard.pdf",
            "title": "Hiragana Vocabulary Flashcards",
            "category": "vocabulario",
            "category_name": "Vocabulario",
            "level": "N5",
            "path": "/material_de_estudio/vocabulario/4. Hiragana Vocabulary Flashcard.pdf",
            "pages": 8,
            "size": "9.4 MB",
            "description": "Tarjetas ilustradas de vocabulario básico en Hiragana: saludos, números, alimentos, lugares, colores, familia y emociones."
        },
        {
            "filename": "japones from spanish.pdf",
            "title": "Hablemos en Japonés (NHK World en Español)",
            "category": "cursos",
            "category_name": "Cursos y Diálogos",
            "level": "General / N5",
            "path": "/material_de_estudio/cursos/japones from spanish.pdf",
            "pages": 58,
            "size": "6.2 MB",
            "description": "Curso completo de 48 lecciones en español con diálogos reales de la vida cotidiana en Japón, explicaciones gramaticales y notas culturales."
        },
        {
            "filename": "irodori elementary.pdf",
            "title": "Irodori: Japanese for Life in Japan (Elementary)",
            "category": "cursos",
            "category_name": "Cursos y Diálogos",
            "level": "A2 (General)",
            "path": "/material_de_estudio/cursos/irodori elementary.pdf",
            "pages": 515,
            "size": "158 MB",
            "description": "El aclamado curso oficial de Fundación Japón basado en objetivos Can-do para la vida diaria y laboral en Japón."
        },
        {
            "filename": "思 Practice Sheet.pdf",
            "title": "Kanji Practice Sheet: 思 (Omo / Shi)",
            "category": "kanji",
            "category_name": "Kanji",
            "level": "N4",
            "path": "/material_de_estudio/kanji/思 Practice Sheet.pdf",
            "pages": 14,
            "size": "1.7 MB",
            "description": "Ficha detallada del kanji 思 (pensar, sentir, recordar) con su composición radical y ejemplos."
        },
        {
            "filename": "美 Practice Sheet.pdf",
            "title": "Kanji Practice Sheet: 美 (Utsukushii / Bi)",
            "category": "kanji",
            "category_name": "Kanji",
            "level": "N4",
            "path": "/material_de_estudio/kanji/美 Practice Sheet.pdf",
            "pages": 16,
            "size": "1.9 MB",
            "description": "Ficha detallada del kanji 美 (belleza, hermoso) con vocabulario de nivel N4/N3."
        }
    ]

    print(f"Compiled {len(pdfs)} PDF catalog items")
    save_json("pdf_catalog", pdfs)
    return pdfs

def save_json(name, data):
    json_path = os.path.join(DATA_DIR, f"{name}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    extract_particles()
    extract_story()
    extract_kanji()
    extract_master_vocabulary()
    extract_context_exercises()
    extract_nhk_lessons()
    extract_curriculum()
    extract_pdf_catalog()
    print("Next.js database generated successfully!")
