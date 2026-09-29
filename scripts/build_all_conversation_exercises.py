import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

nhk_lessons = json.load(open(os.path.join(DATA_DIR, "nhk_lessons.json"), encoding="utf-8"))

exercises = []

# Template generator for 48 lessons
for l in nhk_lessons:
    num = l["lesson"]
    t_jp = l["title_jp"]
    t_es = l["title_es"]
    dialogue = l["dialogue"]
    
    # 1. Reply exercise
    if num == 1:
        exercises.append({
            "id": f"conv_ex_{num}_1",
            "lesson": num,
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
        })
        exercises.append({
            "id": f"conv_ex_{num}_2",
            "lesson": num,
            "type": "missing_word",
            "type_label": "Completar partícula",
            "prompt_es": "¿Qué partícula marca el tema en 'Watashi wa Anna desu'?",
            "context": "私 【 ？ 】 アンナです。",
            "correct": "は",
            "options": ["は", "を", "に", "が"],
            "explanation": "La partícula は (wa) marca el tema del que se habla."
        })
        exercises.append({
            "id": f"conv_ex_{num}_3",
            "lesson": num,
            "type": "missing_kanji",
            "type_label": "Kanji en contexto",
            "prompt_es": "¿Cómo se escribe en kanji 'Watashi' (Yo)?",
            "context": "【 ？ 】 はアンナです。",
            "correct": "私",
            "options": ["私", "人", "本", "日"],
            "explanation": "私 (わたし) es el kanji de 'yo' o 'primera persona'."
        })
    else:
        # Generate 3 targeted questions per lesson based on its dialogue and grammar
        d1 = dialogue[0] if len(dialogue) > 0 else {"speaker": "Interlocutor", "jp": t_jp, "es": t_es}
        d2 = dialogue[1] if len(dialogue) > 1 else dialogue[0]
        
        # Q1: Reply or situational choice
        exercises.append({
            "id": f"conv_ex_{num}_1",
            "lesson": num,
            "type": "reply",
            "type_label": "¿Qué responder?",
            "prompt_es": f"En la situación de la Lección {num} ({t_es}), si {d1['speaker']} dice: 「{d1['jp']}」, ¿cuál es la respuesta más natural?",
            "context": f"{d1['speaker']}: {d1['jp']}\nTú: 【 ？ 】",
            "correct": d2['jp'],
            "options": [
                d2['jp'],
                "いいえ、わかりません。",
                "どういたしまして。",
                "失礼します。"
            ],
            "explanation": f"En el diálogo de la Lección {num}, la respuesta adecuada es: '{d2['jp']}' ({d2['es']})."
        })
        
        # Q2: Missing word / grammar focus
        # Pick key phrases from lesson
        g_note = l["grammar_notes"][0] if l.get("grammar_notes") else "Gramática de la lección"
        clean_jp = d2['jp']
        # mask a word or particle
        words_in_dialogue = [w for w in ["は", "が", "を", "に", "で", "へ", "と", "も", "から", "まで", "です", "でした", "ください", "ます", "ました"] if w in clean_jp]
        target_word = words_in_dialogue[0] if words_in_dialogue else "です"
        masked = clean_jp.replace(target_word, "【 ？ 】", 1)
        
        opts = [target_word]
        distractors = [w for w in ["は", "が", "を", "に", "で", "へ", "と", "から", "です", "でした"] if w != target_word][:3]
        while len(distractors) < 3:
            distractors.append("ね")
        opts.extend(distractors)
        
        exercises.append({
            "id": f"conv_ex_{num}_2",
            "lesson": num,
            "type": "missing_word",
            "type_label": "Completar hueco",
            "prompt_es": f"Completa la frase clave de la lección: '{clean_jp}'",
            "context": masked,
            "correct": target_word,
            "options": opts,
            "explanation": f"Foco de la lección: {g_note}"
        })
        
        # Q3: Kanji / Comprensión
        exercises.append({
            "id": f"conv_ex_{num}_3",
            "lesson": num,
            "type": "missing_kanji",
            "type_label": "Comprensión y Kanji",
            "prompt_es": f"¿Qué significa la expresión central de la Lección {num}: 「{t_jp}」?",
            "context": f"Título: {t_jp}",
            "correct": t_es,
            "options": [
                t_es,
                "¿Podría hablar más despacio?",
                "Hasta mañana en la universidad.",
                "Disculpe las molestias causadas."
            ],
            "explanation": f"「{t_jp}」 se traduce como: '{t_es}'."
        })

print(f"Generated {len(exercises)} exercises covering all {len(nhk_lessons)} lessons!")

with open(os.path.join(DATA_DIR, "conversation_exercises.json"), "w", encoding="utf-8") as f:
    json.dump(exercises, f, ensure_ascii=False, indent=2)

print("Saved conversation_exercises.json successfully!")
