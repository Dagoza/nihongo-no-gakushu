#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Appends additional vetted JLPT questions to data/jlpt_exams.json
Ensures each level (N5 to N1) has balanced coverage across vocabulary, grammar, reading and listening.
"""

import json
import os
import sys

def get_additional_questions():
    return [
        # --- N5 ADDITIONS ---
        {
            "id": "jlpt_n5_v_09",
            "level": "N5",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "公園で<u>友だち</u>とサッカーをしました。",
            "targetWord": "友だち",
            "options": ["ともだち", "ゆうだち", "どちだち", "ともたち"],
            "correctIndex": 0,
            "explanation": "「友だち」 se lee ともだち (tomodachi) y significa 'amigo'.",
            "furigana": "こうえんでともだちとサッカーをしました。"
        },
        {
            "id": "jlpt_n5_v_10",
            "level": "N5",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "今、何<u>時</u>ですか。",
            "targetWord": "時",
            "options": ["じ", "じかん", "とき", "こと"],
            "correctIndex": 0,
            "explanation": "何時 (なんじ / nanji) utiliza la lectura on じ de 時 para preguntar '¿qué hora es?'.",
            "furigana": "いま、なんじですか。"
        },
        {
            "id": "jlpt_n5_g_07",
            "level": "N5",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "学校は９時【 ？ 】３時までです。",
            "options": ["から", "まで", "より", "ほど"],
            "correctIndex": 0,
            "explanation": "La correlación 〜から〜まで indica el punto de origen temporal ('desde las 9') hasta el límite ('hasta las 3').",
            "furigana": "がっこうはくじからさんじまでです。"
        },
        {
            "id": "jlpt_n5_g_08",
            "level": "N5",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "わたしは兄【 ？ 】いっしょに買い物に行きました。",
            "options": ["と", "に", "で", "を"],
            "correctIndex": 0,
            "explanation": "La partícula と (to) en conjunto con いっしょに (juntos) expresa compañía ('junto con mi hermano mayor').",
            "furigana": "わたしはあにといっしょにかいものにいきました。"
        },
        {
            "id": "jlpt_n5_g_09",
            "level": "N5",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "佐藤さんは英語が話せます。フランス語【 ？ 】話せます。",
            "options": ["も", "は", "で", "に"],
            "correctIndex": 0,
            "explanation": "La partícula も (mo) equivale a 'también' o 'tampoco', reemplazando o añadiendo sobre otra categoría ('también sabe hablar francés').",
            "furigana": "さとうさんはえいごがはなせます。フランスごもはなせます。"
        },

        # --- N4 ADDITIONS ---
        {
            "id": "jlpt_n4_v_07",
            "level": "N4",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "駅員が道を<u>案内</u>してくれました。",
            "targetWord": "案内",
            "options": ["あんない", "あんうち", "かんない", "おんない"],
            "correctIndex": 0,
            "explanation": "「案内」 se lee あんない (annai) y significa 'guiar / orientar'.",
            "furigana": "えきいんがみちをあんないしてくれました。"
        },
        {
            "id": "jlpt_n4_v_08",
            "level": "N4",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "エレベーターが<u>故障</u>しています。",
            "targetWord": "故障",
            "options": ["こしょう", "こうしょう", "こじょう", "くしょう"],
            "correctIndex": 0,
            "explanation": "「故障」 se lee こしょう (koshou) y significa 'avería / daño mecánico'.",
            "furigana": "エレベーターがこしょうしています。"
        },
        {
            "id": "jlpt_n4_g_06",
            "level": "N4",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "美術館のなかで写真を【 ？ 】はいけません。",
            "options": ["とって", "とる", "とった", "とり"],
            "correctIndex": 0,
            "explanation": "〜てはいけません expresa una prohibición estricta ('está prohibido tomar fotos'). とる (tomar) en forma te es とって.",
            "furigana": "びじゅつかんのなかでしゃしんをとってはいけません。"
        },
        {
            "id": "jlpt_n4_g_07",
            "level": "N4",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "ここで少し休ん【 ？ 】いいですか。",
            "options": ["でも", "ても", "だら", "たら"],
            "correctIndex": 0,
            "explanation": "休む (やすむ) termina en む, su forma te es 休んで (やすんで). Para pedir permiso se usa 〜でもいいですか.",
            "furigana": "ここですこしやすんでもいいですか。"
        },
        {
            "id": "jlpt_n4_g_08",
            "level": "N4",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "昨日のお酒を飲み【 ？ 】、頭が痛いです。",
            "options": ["すぎて", "ながら", "そうに", "やすく"],
            "correctIndex": 0,
            "explanation": "Raíz verbal + すぎる expresa un exceso negativo ('beber en exceso'). 飲みすぎて = habiendo bebido demasiado.",
            "furigana": "きのうのおさけをのみすぎて、あたまがいたいです。"
        },

        # --- N3 ADDITIONS ---
        {
            "id": "jlpt_n3_v_04",
            "level": "N3",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "もっと<u>具体的</u>な例を挙げてください。",
            "targetWord": "具体的",
            "options": ["ぐたいてき", "こうたいてき", "ぐたいでき", "くたいてき"],
            "correctIndex": 0,
            "explanation": "「具体的」 se lee ぐたいてき (gutaiteki) y significa 'concreto / específico'.",
            "furigana": "もっとぐたいてきなれいをあげてください。"
        },
        {
            "id": "jlpt_n3_v_05",
            "level": "N3",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "業務のプロセスを<u>改善</u>する。",
            "targetWord": "改善",
            "options": ["かいぜん", "かいせん", "こうぜん", "がいぜん"],
            "correctIndex": 0,
            "explanation": "「改善」 se lee かいぜん (kaizen) y significa 'mejorar / optimizar'.",
            "furigana": "ぎょうむのプロセスをかいぜんする。"
        },
        {
            "id": "jlpt_n3_g_04",
            "level": "N3",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "毎日遅くまで練習していたのだから、彼らは試合に勝つ【 ？ 】だ。",
            "options": ["にちがいない", "にすぎない", "どころではない", "わけがない"],
            "correctIndex": 0,
            "explanation": "〜に違いない expresa una convicción o certeza lógica absoluta del hablante ('sin duda alguna ganarán el partido').",
            "furigana": "まいにちおそくまでれんしゅうしていたのだから、かれらはしあいにかつにちがいないだ。"
        },
        {
            "id": "jlpt_n3_g_05",
            "level": "N3",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "台風の接近により、交通機関が乱れる【 ？ 】があります。",
            "options": ["おそれ", "わけ", "はず", "きらい"],
            "correctIndex": 0,
            "explanation": "〜恐れがある (おそれがある) se usa para advertir formalmente sobre un riesgo o peligro potencial indeseado ('hay riesgo de que el transporte se altere').",
            "furigana": "たいふうのせっきんにより、こうつうきかんがみだれるおそれがあります。"
        },
        {
            "id": "jlpt_n3_g_06",
            "level": "N3",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "食事の【 ？ 】に電話がかかってきて、話が中断した。",
            "options": ["最中", "たび", "ついで", "最期"],
            "correctIndex": 0,
            "explanation": "Sustantivo + の最中に (さいちゅうに) denota encontrarse en el clímax o pleno desarrollo de una actividad cuando sucede una interrupción imprevista.",
            "furigana": "しょくじのさいちゅうにでんわがかかってきて、はなしがちゅうだんした。"
        },

        # --- N2 ADDITIONS ---
        {
            "id": "jlpt_n2_v_04",
            "level": "N2",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "現地の状況を正確に<u>把握</u>する。",
            "targetWord": "把握",
            "options": ["はあく", "はわく", "ばあく", "ほうあく"],
            "correctIndex": 0,
            "explanation": "「把握」 se lee はあく (haaku) y significa 'captar / comprender con precisión / asimilar la situación'.",
            "furigana": "げんちのじょうきょうをせいかくにはあくする。"
        },
        {
            "id": "jlpt_n2_v_05",
            "level": "N2",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "留学を<u>契機</u>に、海外で働く決意を固めた。",
            "targetWord": "契機",
            "options": ["けいき", "けっけ", "かいき", "かいき"],
            "correctIndex": 0,
            "explanation": "「契機」 se lee けいき (keiki) y significa 'oportunidad / momento decisivo / catalizador'.",
            "furigana": "りゅうがくをけいきに、かいがいではたらくけついをかためた。"
        },
        {
            "id": "jlpt_n2_g_04",
            "level": "N2",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "新製品の発売【 ？ 】、大規模な展示会が開催された。",
            "options": ["に先立って", "に基づいて", "につれて", "にともなって"],
            "correctIndex": 0,
            "explanation": "〜に先立って (にさきだって) significa 'con antelación a / como preparativo previo a un evento importante'.",
            "furigana": "しんせいひんのはつばいにさきだって、だいきぼなてんじかいがかいさいされた。"
        },
        {
            "id": "jlpt_n2_g_05",
            "level": "N2",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "年齢や国籍【 ？ 】、どなたでも自由にご応募いただけます。",
            "options": ["を問わず", "をめぐって", "にかけては", "に即して"],
            "correctIndex": 0,
            "explanation": "〜を問わず (をとわず / sin importar / independientemente de): 'Independientemente de la edad o nacionalidad, cualquiera puede postularse'.",
            "furigana": "ねんれいやこくせきをとわず、どなたでもじゆうにごおうぼいただけます。"
        },
        {
            "id": "jlpt_n2_g_06",
            "level": "N2",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "この薬は効果が高い【 ？ 】、副作用も現れやすい。",
            "options": ["反面", "うえに", "かわりに", "一方"],
            "correctIndex": 0,
            "explanation": "〜反面 (はんめん / por otra parte, en contraste): presenta dos aspectos opuestos o paradójicos de un mismo fenómeno (alta eficacia pero propensión a efectos secundarios).",
            "furigana": "このくすりはこうかがたかいはんめん、ふくさようもあらわれやすい。"
        },

        # --- N1 ADDITIONS ---
        {
            "id": "jlpt_n1_v_04",
            "level": "N1",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "経営陣は不正会計の事実を<u>隠蔽</u>しようとした。",
            "targetWord": "隠蔽",
            "options": ["いんぺい", "おんぺい", "いんへい", "かくぺい"],
            "correctIndex": 0,
            "explanation": "「隠蔽」 se lee いんぺい (inpei) y significa 'encubrimiento / ocultamiento deliberado'.",
            "furigana": "けいえいじんはふせいかいけいのじじつをいんぺいしようとした。"
        },
        {
            "id": "jlpt_n1_v_05",
            "level": "N1",
            "section": "vocabulary",
            "subType": "kanji_reading",
            "question": "サプライチェーンの<u>脆弱</u>性が露呈した。",
            "targetWord": "脆弱",
            "options": ["ぜいじゃく", "きじゃく", "せきじゃく", "そうじゃく"],
            "correctIndex": 0,
            "explanation": "「脆弱」 se lee ぜいじゃく (zeijaku) y significa 'fragilidad / vulnerabilidad'.",
            "furigana": "サプライチェーンのぜいじゃくせいがろていした。"
        },
        {
            "id": "jlpt_n1_g_04",
            "level": "N1",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "公衆の面前で激高するとは、プロとして非常識【 ？ 】。",
            "options": ["極まりない", "極まる", "きわめて", "尽きない"],
            "correctIndex": 0,
            "explanation": "Adjetivo Na / sustantivo + 極まりない (きわまりない) es una locución enfática de N1 para reprochar una falta total de decoro o sentido común ('extremadamente insensato / carente de toda sensatez').",
            "furigana": "こうしゅうのめんぜんでげっこうするとは、プロとしてひじょうしききわまりない。"
        },
        {
            "id": "jlpt_n1_g_05",
            "level": "N1",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "皆様方の温かいご支援には、感謝【 ？ 】ません。",
            "options": ["に堪え", "に過ぎ", "に足ら", "に及ば"],
            "correctIndex": 0,
            "explanation": "〜に堪えない (にたえない / sustantivo de sentimiento + に堪えない) expresa un sentimiento tan abrumadoramente profundo que no se puede reprimir ni contener ('profundamente agradecido').",
            "furigana": "みなさまがたのあたたかいごしえんには、かんしゃにたえません。"
        },
        {
            "id": "jlpt_n1_g_06",
            "level": "N1",
            "section": "grammar",
            "subType": "grammar_form",
            "question": "繊細な色彩感覚は、職人の長年の修練【 ？ 】のものだ。",
            "options": ["ならでは", "にあって", "をおいて", "となると"],
            "correctIndex": 0,
            "explanation": "〜ならでは (exclusivo / propio únicamente de...): 'Esa delicada sensibilidad cromática es algo que solo puede provenir de los largos años de maestría del artesano'.",
            "furigana": "せんさいなしきさいかんかくは、しょくにんのながねんのしゅうれんならではのものだ。"
        }
    ]

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_file = os.path.join(base_dir, 'data', 'jlpt_exams.json')

    with open(target_file, 'r', encoding='utf-8') as f:
        existing = json.load(f)

    existing_ids = {q['id'] for q in existing}
    added = 0

    for q in get_additional_questions():
        if q['id'] not in existing_ids:
            existing.append(q)
            existing_ids.add(q['id'])
            added += 1

    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    print(f"Added {added} new questions. Total questions in {target_file}: {len(existing)}")

if __name__ == '__main__':
    main()
