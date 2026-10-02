#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
integrate_all_curriculum.py
Ejecuta la integración completa de los 18 nuevos módulos canónicos al Currículum Maestro:
- Módulos 20 a 28: Irodori Elementary 2 (初級2) -> Nivel N4
- Módulos 29 a 37: Irodori Pre-Intermediate (初中級) -> Nivel N3
- Sincronización léxica en data/vocabulary.json (3 formas: Kanji, Hiragana, Katakana + español + nivel JLPT)
- Sincronización en data/kanji.json y data/kanji.js (array words)
- Validación estricta según lib/curriculumValidator.js
"""

import json
import os
import re

# 1. Cargar módulos nuevos
from create_irodori_e2_preint_data import get_all_new_modules
from generate_preint_modules_29_to_37 import MODULES_29_TO_37

new_modules = get_all_new_modules()
new_modules.extend(MODULES_29_TO_37)

print(f"Total nuevos módulos a integrar: {len(new_modules)} (Módulos 20 a 37)")

# Asegurarse de que el paso final de ejercicios en cada módulo contenga los ejercicios del módulo
for m in new_modules:
    last_sec = m["sections"][-1]
    if last_sec.get("is_exercise_step"):
        last_sec["exercises"] = m["exercises"]

# 2. Cargar currículum existente
curriculum_path = "data/curriculum.json"
with open(curriculum_path, "r", encoding="utf-8") as f:
    curriculum = json.load(f)

print(f"Módulos existentes en curriculum.json: {len(curriculum)}")

# Eliminar módulos previos si ya existieran con step >= 20 para evitar duplicados
curriculum = [m for m in curriculum if m["step"] < 20]

# Enlaces bidireccionales en módulos existentes (1 a 19)
forward_links = {
    1: {"step": 20, "title": "Entorno Personal, Llegada a Japón y Rasgos de Personalidad", "icon": "🧳", "relationship": "Evolución Perfil N4", "reason": "Conecta los primeros saludos y presentación básica con la llegada reciente y descripción de rasgos en N4."},
    4: {"step": 21, "title": "Restaurantes, Alergias y Dietas Especiales", "icon": "🍜", "relationship": "Continuación Gastronómica", "reason": "De gustos culinarios personales se avanza a la gestión de alergias, restricciones dietéticas y etiqueta culinaria en N4."},
    5: {"step": 21, "title": "Restaurantes, Alergias y Dietas Especiales", "icon": "🍜", "relationship": "Ampliación de Servicio", "reason": "Profundiza en la interacción con camareros y pedidos condicionales con forma potencial."},
    6: {"step": 30, "title": "Vivienda, Búsqueda de Inmuebles y Resolución de Averías", "icon": "🏢", "relationship": "Autonomía Residencial N3", "reason": "De las partes de la casa y electrodomésticos en N5 se evoluciona a contratos de alquiler y reporte de averías en N3."},
    9: {"step": 37, "title": "Entorno Laboral Japonés, Deberes Profesionales y Keigo Avanzado", "icon": "💼", "relationship": "Cúspide Profesional N3", "reason": "De seguir órdenes elementales se pasa a instruir a compañeros y utilizar keigo avanzado en el trabajo."},
    10: {"step": 29, "title": "Ocio Moderno, Conversación Coloquial y Cultura Pop", "icon": "⚽", "relationship": "Cultura Pop N3", "reason": "De pasatiempos individuales se avanza a la argumentación de manga, cine y tertulias coloquiales."},
    11: {"step": 23, "title": "Eventos Comunitarios, Festivales y Condiciones", "icon": "🏮", "relationship": "Festividades y Clima N4", "reason": "Conecta la invitación a festivales con la previsión meteorológica comunitaria con 〜たら."},
    12: {"step": 22, "title": "Viajes, Reservas y Consejos Turísticos", "icon": "🚅", "relationship": "Movilidad Regional N4", "reason": "De transporte urbano y trenes locales en N5 se pasa a reservas de Shinkansen y consejos turísticos."},
    14: {"step": 25, "title": "Compras Inteligentes, Puntos y Ventajas de Consumo", "icon": "🛒", "relationship": "Consumo Inteligente N4", "reason": "De ubicar productos en tiendas se pasa a comparar prestaciones técnicas con 〜やすい / 〜にくい y tarjetas de fidelización."},
    17: {"step": 22, "title": "Viajes, Reservas y Consejos Turísticos", "icon": "🚅", "relationship": "Planificación Vacacional N4", "reason": "Profundiza en la experiencia en posadas y destinos turísticos con recomendaciones y opiniones con 〜てよかった."},
    18: {"step": 34, "title": "Prevención de Fraudes, Emergencias y Seguridad Ciudadana", "icon": "🛡️", "relationship": "Protección Civil N3", "reason": "De dolencias físicas en N5 se avanza a llamadas al 119 y prevención de estafas en N3."},
    19: {"step": 28, "title": "Proyección Vital, Logros y Emprendimiento", "icon": "🚀", "relationship": "Metas a Futuro N4", "reason": "Conecta los primeros planes de estudio con la creación de empresas y discursos de despedida en N4."}
}

for m in curriculum:
    step_num = m["step"]
    if step_num in forward_links:
        link = forward_links[step_num]
        if not any(r.get("step") == link["step"] for r in m.get("related_topics", [])):
            m.setdefault("related_topics", []).append(link)

# Añadir los 18 nuevos módulos
curriculum.extend(new_modules)

print(f"Total módulos en curriculum tras integración: {len(curriculum)}")

# 3. Validar con reglas estrictas de lib/curriculumValidator.js
def validate_curriculum(modules):
    errors = []
    for m in modules:
        s = m.get("step")
        if not isinstance(s, int):
            errors.append(f"Módulo sin step numérico: {m}")
        if not m.get("title"):
            errors.append(f"Módulo {s} carece de title")
        if not m.get("level") or m.get("level") not in ["N5", "N4", "N3", "N2", "N1", "N5 - N4"]:
            errors.append(f"Módulo {s} tiene nivel no estándar JLPT: {m.get('level')}")
        sections = m.get("sections", [])
        if len(sections) < 2:
            errors.append(f"Módulo {s} tiene menos de 2 secciones")
        else:
            for idx, sec in enumerate(sections[:-1]):
                if not sec.get("title"):
                    errors.append(f"Módulo {s} sec {idx+1} sin title")
                if not sec.get("objective"):
                    errors.append(f"Módulo {s} sec {idx+1} sin objective")
                gps = sec.get("grammar_points", [])
                if not gps:
                    errors.append(f"Módulo {s} sec {idx+1} sin grammar_points")
                for g_idx, gp in enumerate(gps):
                    if not gp.get("title") or not gp.get("formula") or len(gp.get("explanation", "")) < 20:
                        errors.append(f"Módulo {s} sec {idx+1} gp {g_idx+1} explicación o campos insuficientes")
                    if not gp.get("examples"):
                        errors.append(f"Módulo {s} sec {idx+1} gp {g_idx+1} sin examples")
            last_sec = sections[-1]
            if not last_sec.get("is_exercise_step"):
                errors.append(f"Módulo {s}: La última sección no es el paso exclusivo de ejercicios ('is_exercise_step: true')")
        if not m.get("related_topics") or len(m.get("related_topics")) == 0:
            errors.append(f"Módulo {s} carece de related_topics")
    return errors

val_errors = validate_curriculum(curriculum)
if val_errors:
    print("❌ ERRORES DE VALIDACIÓN:")
    for err in val_errors[:10]:
        print("  -", err)
    raise ValueError("Fallo en la validación curricular")
else:
    print("✅ ¡Validación curricular 100% exitosa sin ningún error!")

# Guardar curriculum.json
with open(curriculum_path, "w", encoding="utf-8") as f:
    json.dump(curriculum, f, ensure_ascii=False, indent=2)
print("✅ data/curriculum.json guardado con éxito.")

# 4. Sincronización de vocabulario (data/vocabulary.json)
def hira_to_kata(hira):
    return ''.join(chr(ord(c) + 0x60) if 0x3041 <= ord(c) <= 0x3096 else c for c in hira)

def kata_to_hira(kata):
    return ''.join(chr(ord(c) - 0x60) if 0x30A1 <= ord(c) <= 0x30F6 else c for c in kata)

vocab_path = "data/vocabulary.json"
with open(vocab_path, "r", encoding="utf-8") as f:
    vocabulary = json.load(f)

existing_kanji_words = {w.get("kanji") for w in vocabulary if w.get("kanji")}
existing_kana_words = {w.get("kana") for w in vocabulary if w.get("kana")}

added_vocab_count = 0
word_id_counter = len(vocabulary) + 1

category_map = {
    "N4": "Irodori Elemental 2 (N4)",
    "N3": "Irodori Pre-Intermedio (N3)"
}

for m in new_modules:
    mod_level = m["level"]
    cat = category_map.get(mod_level, "Vocabulario General")
    for v in m.get("vocab_details", []):
        kanji = v.get("kanji", "")
        kana = v.get("kana", "")
        meaning = v.get("meaning", "")
        
        # Determinar hiragana y katakana
        if any(0x30A0 <= ord(c) <= 0x30FF for c in kana):
            # Es katakana
            kata = kana
            hira = kata_to_hira(kata)
        else:
            hira = kana
            kata = hira_to_kata(hira)
        
        # Verificar si ya existe
        if kanji in existing_kanji_words or (not kanji and kana in existing_kana_words):
            continue
        
        # Encontrar una oración de ejemplo del módulo
        sample_sentence = None
        for ex in m.get("examples", []):
            if (kanji and kanji in ex.get("jp", "")) or (kana and kana in ex.get("kana", "")):
                sample_sentence = [{"jp": ex["jp"], "es": ex["es"]}]
                break
        if not sample_sentence:
            sample_sentence = [{"jp": f"{kanji or kana}を使います。", "es": f"Uso / empleo {meaning}."}]

        new_entry = {
            "id": f"v_iro_{word_id_counter}",
            "kanji": kanji,
            "kana": kana,
            "meaning_es": meaning,
            "meaning_en": v.get("romaji", ""),
            "category": cat,
            "level": mod_level,
            "hiragana": hira,
            "katakana": kata,
            "tatoeba_sentences": sample_sentence
        }
        vocabulary.append(new_entry)
        existing_kanji_words.add(kanji)
        existing_kana_words.add(kana)
        word_id_counter += 1
        added_vocab_count += 1

with open(vocab_path, "w", encoding="utf-8") as f:
    json.dump(vocabulary, f, ensure_ascii=False, indent=2)

print(f"✅ data/vocabulary.json actualizado: {added_vocab_count} nuevas palabras añadidas. Total vocab: {len(vocabulary)}.")

# 5. Sincronización en data/kanji.json y data/kanji.js
kanji_json_path = "data/kanji.json"
with open(kanji_json_path, "r", encoding="utf-8") as f:
    kanji_list = json.load(f)

synced_kanji_count = 0
for w in vocabulary:
    k_word = w.get("kanji")
    reading = w.get("kana")
    meaning = w.get("meaning_es")
    if not k_word or not reading or not meaning:
        continue
    
    # Buscar si algún kanji de la lista está en k_word
    for kj_item in kanji_list:
        kj_char = kj_item.get("kanji")
        if kj_char and kj_char in k_word:
            words_list = kj_item.setdefault("words", [])
            if not any(item.get("word") == k_word for item in words_list):
                words_list.append({
                    "word": k_word,
                    "reading": reading,
                    "meaning": meaning
                })
                synced_kanji_count += 1

with open(kanji_json_path, "w", encoding="utf-8") as f:
    json.dump(kanji_list, f, ensure_ascii=False, indent=2)

# Sincronizar data/kanji.js
with open("data/kanji.js", "w", encoding="utf-8") as f:
    f.write("// Auto-generated dataset for Nihongo Master\nwindow.KANJI_DATA = ")
    json.dump(kanji_list, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"✅ data/kanji.json y data/kanji.js sincronizados con {synced_kanji_count} nuevas referencias de palabras en kanjis.")
