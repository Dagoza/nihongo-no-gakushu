import json

# Load existing curriculum
old_curriculum = json.load(open('data/curriculum.json'))
old_by_step = {item['step']: item for item in old_curriculum}

def dedupe_list(items):
    seen = set()
    result = []
    for x in items:
        if not x:
            continue
        key = x.strip() if isinstance(x, str) else json.dumps(x, sort_keys=True)
        if key not in seen:
            seen.add(key)
            result.append(x)
    return result

def dedupe_vocab_details(v_list):
    seen = set()
    res = []
    for v in v_list:
        if not v or not isinstance(v, dict):
            continue
        key = (v.get('kanji', ''), v.get('kana', ''), v.get('meaning', ''))
        if key not in seen:
            seen.add(key)
            res.append(v)
    return res

def dedupe_examples(ex_list):
    seen = set()
    res = []
    for ex in ex_list:
        if not ex or not isinstance(ex, dict):
            continue
        key = ex.get('jp', '').strip()
        if key not in seen:
            seen.add(key)
            res.append(ex)
    return res

def dedupe_exercises(q_list):
    seen = set()
    res = []
    for q in q_list:
        if not q or not isinstance(q, dict):
            continue
        key = q.get('question', '').strip() + '___' + q.get('sentence', '').strip()
        if key not in seen:
            seen.add(key)
            res.append(q)
    return res

# Define the 19 Consolidated Modules specification
modules_spec = [
    {
        "step": 1,
        "title": "Saludos, Cortesía y Presentación Personal",
        "subtitle": "はじめまして。私はアンナです。(Encantada, soy Anna)",
        "icon": "🤝",
        "level": "N5",
        "stage": "Módulo 1 · Fundamentos",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 1 y 3)", "Japonés from Spanish NHK (Lecc. 1-2)", "Japonés para Hispanohablantes (JLPT N5)"],
        "detailed_guide": "Este módulo fundacional consolida las tres fuentes esenciales de iniciación: las fórmulas rituales de saludo en distintos momentos del día (buenos días, tardes, noches), la presentación personal protocolaria con 'Hajimemashite' y 'Douzo yoroshiku onegaishimasu', la presentación de nombre, país y profesión con la cópula です y la partícula は, así como las despedidas habituales en el entorno cotidiano y laboral.",
        "input_steps": [1, 101, 103, 201],
        "extra_objectives": [
            "Dominar los saludos cotidianos y corporativos (おはようございます, こんにちは, こんばんは, お疲れ様です).",
            "Presentarse formalmente indicando nombre, nacionalidad y ocupación usando [X] は [Y] です.",
            "Utilizar adecuadamente las fórmulas de apertura y cierre (はじめまして / よろしくお願いします).",
            "Despedirse según el contexto social (じゃあ、また / 失礼します / お先に失礼します)."
        ],
        "extra_grammar": [
            "Cópula afirmativa y negativa: 〜です / 〜ではありません (じゃありません)",
            "Partícula de tema principal: 〜は (pronunciada 'wa')",
            "Partícula interrogativa: 〜か (¿es usted...?)",
            "Fórmula de cortesía y trato con sufijos honoríficos: 〜さん, 〜先生"
        ],
        "related_topics": [
            {
                "step": 2,
                "title": "Estrategias de Comunicación y Gestión de Idiomas",
                "icon": "💬",
                "relationship": "Consecutivo Natural",
                "reason": "Permite resolver dudas y pedir aclaraciones cuando no entiendes al interlocutor tras presentarte."
            },
            {
                "step": 3,
                "title": "Identidad, Familia, Residencia y Datos de Contacto",
                "icon": "🏠",
                "relationship": "Ampliación de Perfil",
                "reason": "Profundiza en la presentación personal añadiendo dónde vives, con quién y cómo contactarte."
            },
            {
                "step": 19,
                "title": "Metas Personales, Despedidas y Expresiones de Gratitud",
                "icon": "🎓",
                "relationship": "Cierre del Ciclo",
                "reason": "Conecta los primeros saludos de llegada con las fórmulas de agradecimiento y despedida al culminar estancias."
            }
        ]
    },
    {
        "step": 2,
        "title": "Estrategias de Comunicación y Gestión de Idiomas",
        "subtitle": "すみません、もう一度ゆっくりお願いします。(Disculpe, una vez más despacio)",
        "icon": "💬",
        "level": "N5",
        "stage": "Módulo 2 · Comunicación",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 2)", "Japonés from Spanish NHK (Lecc. 8)"],
        "detailed_guide": "Módulo clave de supervivencia lingüística. Enseña a gestionar conversaciones en japonés cuando tu nivel es inicial: cómo indicar que no has entendido algo, pedir amablemente que repitan o que hablen más despacio, declarar qué idiomas hablas o comprendes (español, inglés, japonés básico) y pedir permiso para usar una aplicación de traducción.",
        "input_steps": [102],
        "extra_objectives": [
            "Expresar incomprensión de manera natural y educada (よくわかりません / もう少しゆっくり).",
            "Pedir repetición o aclaración utilizando 〜てください y 〜お願いします.",
            "Declarar competencias de idiomas usando [Idioma] が できます / できません.",
            "Gestionar malentendidos en situaciones laborales y de atención al público."
        ],
        "extra_grammar": [
            "Petición cortés elemental: 〜てください (Por favor haga...)",
            "Petición de repetición con sustantivo: [Cosa] を お願いします / もう一度お願いします",
            "Partícula de objeto de habilidad: [Idioma] が できます (Poder hablar/hacer)",
            "Gradación de capacidad: 少し (un poco) / あまり (no mucho, con negativo)"
        ],
        "related_topics": [
            {
                "step": 1,
                "title": "Saludos, Cortesía y Presentación Personal",
                "icon": "🤝",
                "relationship": "Precedente",
                "reason": "Aporta las bases del saludo que preceden a cualquier interacción conversacional."
            },
            {
                "step": 9,
                "title": "Instrucciones de Trabajo, Peticiones y Reglas Laborales",
                "icon": "📋",
                "relationship": "Aplicación Laboral",
                "reason": "Aplica las peticiones formales con 〜てください en entornos de oficina y talleres de trabajo."
            }
        ]
    },
    {
        "step": 3,
        "title": "Identidad, Familia, Residencia y Datos de Contacto",
        "subtitle": "東京に住んでいます。家族は3人です。(Vivo en Tokio. Somos 3 en mi familia)",
        "icon": "🏠",
        "level": "N5",
        "stage": "Módulo 3 · Vida Personal",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 4)", "Japonés from Spanish NHK (Lecc. 4-6, 31)", "Japonés para Hispanohablantes (JLPT N5)"],
        "detailed_guide": "Consolida las conversaciones para hablar de tu lugar de residencia actual, tu país de procedencia, la estructura familiar (padre, madre, hermanos, hijos, cónyuge), las edades de las personas y el intercambio de números telefónicos o correos electrónicos. Integra la partícula de pertenencia の y el verbo de residencia 〜に住んでいます.",
        "input_steps": [104, 202],
        "extra_objectives": [
            "Decir dónde vives y con quién compartes vivienda (〜に住んでいます / 〜と住んでいます).",
            "Presentar a los miembros de tu familia usando el vocabulario humilde propio y respetuoso ajeno.",
            "Preguntar y responder edades (何歳ですか / 〜歳です).",
            "Dictar y anotar números de teléfono y direcciones de correo electrónico con la partícula の."
        ],
        "extra_grammar": [
            "Estado continuo de residencia: [Lugar] に 住んでいます",
            "Partícula de compañía: [Persona] と (junto con)",
            "Partícula conectiva y posesiva: [Poseedor] の [Objeto / Familiar]",
            "Contador de personas: 〜人 (ひとり、ふたり、さんにん...)",
            "Pregunta de edad y números: 何歳 (なんさい) / 何番 (なんばん)"
        ],
        "related_topics": [
            {
                "step": 1,
                "title": "Saludos, Cortesía y Presentación Personal",
                "icon": "🤝",
                "relationship": "Precedente",
                "reason": "Ampliación inmediata tras presentarse con nombre y nacionalidad."
            },
            {
                "step": 6,
                "title": "El Hogar, Vivienda, Distribución y Electrodomésticos",
                "icon": "🛋️",
                "relationship": "Continuación Temática",
                "reason": "Pasa de hablar del vecindario/familia a describir las habitaciones y muebles de la vivienda."
            },
            {
                "step": 8,
                "title": "Rutinas, Horarios, Días de la Semana e Intervalos",
                "icon": "⏰",
                "relationship": "Complementario",
                "reason": "Utiliza los números y fechas para coordinar llamadas y citas personales."
            }
        ]
    },
    {
        "step": 4,
        "title": "Gustos, Preferencias Culinarias y Hábitos Diarios",
        "subtitle": "うどんが好きです。毎朝コーヒーを飲みます。(Me gusta el udon. Bebo café cada mañana)",
        "icon": "🍜",
        "level": "N5",
        "stage": "Módulo 4 · Comida y Hábitos",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 5)", "Japonés from Spanish NHK (Lecc. 13)", "Japonés para Hispanohablantes (JLPT N5)"],
        "detailed_guide": "Aborda los hábitos cotidianos de alimentación, desayunos, comidas favoritas e ingredientes que no puedes consumir por alergia o preferencia. Integra los verbos transitivos fundamentales (食べます, 飲みます) con la partícula acusativa を, y el uso del adjetivo な 好き (gustar) con la partícula が.",
        "input_steps": [4, 105],
        "extra_objectives": [
            "Expresar platos e ingredientes favoritos usando [Comida] が 好きです / 嫌いです.",
            "Describir hábitos matutinos y de comidas diarias (朝ごはんを食べます / コーヒーを飲みます).",
            "Mencionar intolerancias o alimentos que no se pueden comer (〜は食べられません / 苦手です).",
            "Preguntar a un compañero qué suele comer o qué le apetece (何が好きですか)."
        ],
        "extra_grammar": [
            "Objeto directo de acción verbal: [Comida] を 食べます／飲みます",
            "Expresión de gusto y aversión: [Cosa] が 好きです／好きじゃないです",
            "Frecuencia temporal elemental: 毎日 (todos los días), いつも (siempre), よく (a menudo)",
            "Pregunta sobre preferencias: どんな食べ物が好きですか"
        ],
        "related_topics": [
            {
                "step": 5,
                "title": "Restaurantes, Menús, Pedidos y Contadores",
                "icon": "🍱",
                "relationship": "Siguiente Paso Práctico",
                "reason": "Lleva el vocabulario de platos y gustos al contexto real de pedir en restaurantes japoneses."
            },
            {
                "step": 8,
                "title": "Rutinas, Horarios, Días de la Semana e Intervalos",
                "icon": "⏰",
                "relationship": "Complementario",
                "reason": "Permite especificar a qué hora desayunas, almuerzas y cenas en tu día a día."
            }
        ]
    },
    {
        "step": 5,
        "title": "Restaurantes, Menús, Pedidos y Contadores",
        "subtitle": "これを2つとウーロン茶をください。(Dos de esto y un té oolong, por favor)",
        "icon": "🍱",
        "level": "N5",
        "stage": "Módulo 5 · Gastronomía",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 6)", "Japonés from Spanish NHK (Lecc. 7, 17, 34, 42)"],
        "detailed_guide": "Consolidación práctica para desenvolverse con solvencia en restaurantes, izakayas, cadenas de comida rápida y puestos callejeros en Japón: lectura de cartas con fotos y kanjis básicos, uso de los contadores generales nativos (ひとつ, ふたつ, みっつ...), fórmulas para ordenar platos, pedir recomendaciones y solicitar la cuenta.",
        "input_steps": [106, 203],
        "extra_objectives": [
            "Pedir comida y bebida señalando el menú: これを [Cantidad] ください.",
            "Emplear con precisión la serie de contadores nativos japoneses del 1 al 10 (ひとつ〜とお).",
            "Preguntar si disponen de un plato o ingrediente específico (〜はありますか).",
            "Solicitar la cuenta o pagar en caja (お会計をお願いします / ごちそうさまでした)."
        ],
        "extra_grammar": [
            "Petición directa de objetos: [Objeto] を ください / [Objeto] を お願いします",
            "Conjunción de elementos en el pedido: [A] と [B] (A y B)",
            "Pregunta de existencia de productos: [Plato] は ありますか",
            "Contadores nativos: ひとつ (1), ふたつ (2), みっつ (3), よっつ (4), いつつ (5)..."
        ],
        "related_topics": [
            {
                "step": 4,
                "title": "Gustos, Preferencias Culinarias y Hábitos Diarios",
                "icon": "🍜",
                "relationship": "Precedente",
                "reason": "Proporciona el vocabulario de comidas y bebidas que se piden en el restaurante."
            },
            {
                "step": 14,
                "title": "Tiendas, Grandes Almacenes y Búsqueda de Productos",
                "icon": "🛍️",
                "relationship": "Extensión Comercial",
                "reason": "Comparte los protocolos de interacción con el personal de servicio y mostradores."
            },
            {
                "step": 15,
                "title": "Precios, Descuentos y Caja del Combini",
                "icon": "💴",
                "relationship": "Transacción Económica",
                "reason": "Enseña a gestionar el momento del pago, billetes, monedas y recibos."
            }
        ]
    },
    {
        "step": 6,
        "title": "El Hogar, Vivienda, Distribución y Electrodomésticos",
        "subtitle": "部屋が4つあります。エアコンと洗濯機があります。(Hay 4 habitaciones. Hay aire y lavadora)",
        "icon": "🛋️",
        "level": "N5",
        "stage": "Módulo 6 · El Hogar",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 7)", "Japonés from Spanish NHK (Lecc. 5, 14, 32)"],
        "detailed_guide": "Describe los tipos de vivienda en Japón (mansion, apāto, casa unifamiliar), la distribución de los espacios (cocina, salón, baño, dormitorio) y la presencia de muebles y electrodomésticos clave (aire acondicionado, lavadora, microondas, nevera). Introduce la existencia con あります y contadores de habitaciones.",
        "input_steps": [107],
        "extra_objectives": [
            "Describir la distribución de una vivienda o piso compartido (部屋が〜つあります).",
            "Indicar los electrodomésticos y comodidades disponibles con [Objeto] が あります.",
            "Preguntar por las instalaciones de un apartamento o dormitorio de estudiantes.",
            "Comprender la nomenclatura inmobiliaria básica japonesa (1DK, 2LDK, 和室, 洋室)."
        ],
        "extra_grammar": [
            "Existencia de cosas inanimadas: [Lugar] に [Cosa] が あります",
            "Uso de contadores de estancias y cosas: [Número] つ あります",
            "Conexión aditiva de equipamiento: [A] や [B] (A y B entre otros)"
        ],
        "related_topics": [
            {
                "step": 3,
                "title": "Identidad, Familia, Residencia y Datos de Contacto",
                "icon": "🏠",
                "relationship": "Precedente",
                "reason": "Conecta la dirección y la ciudad donde resides con las características de la casa."
            },
            {
                "step": 7,
                "title": "El Lugar de Trabajo, Orientación y Existencia (ある vs いる)",
                "icon": "🏢",
                "relationship": "Contraste Gramatical",
                "reason": "Amplía la existencia física contrastando seres vivos (いる) con objetos (ある)."
            }
        ]
    },
    {
        "step": 7,
        "title": "El Lugar de Trabajo, Orientación y Existencia (ある vs いる)",
        "subtitle": "山田さんは2階の会議室にいます。コピー機はあそこです。(Yamada está en la 2ª planta)",
        "icon": "🏢",
        "level": "N5",
        "stage": "Módulo 7 · Trabajo y Espacio",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 8)", "Japonés from Spanish NHK (Lecc. 3, 10, 25)", "Japonés para Hispanohablantes (JLPT N5)"],
        "detailed_guide": "Trata la ubicación espacial en entornos de trabajo, oficinas, fábricas y almacenes. Establece la distinción entre seres animados (personas y animales con います) y objetos inanimados (herramientas, máquinas y lugares con あります), el uso de plantas de edificios (〜階) y los pronombres de lugar (ここ, そこ, あそこ, どこ).",
        "input_steps": [3, 108],
        "extra_objectives": [
            "Localizar personas en la empresa usando [Persona] は [Lugar] に います.",
            "Localizar equipos y suministros usando [Objeto] は [Lugar] に あります.",
            "Preguntar dónde está un servicio o compañero usando [X] は どこですか.",
            "Indicar las plantas de un edificio usando el contador 〜階 (いっかい、にかい、さんがい...)."
        ],
        "extra_grammar": [
            "Existencia animada vs inanimada: [Persona/Animal] が います vs [Cosa] が あります",
            "Demostrativos de lugar: ここ (aquí), そこ (ahí), あそこ (allí), どこ (¿dónde?)",
            "Contador de plantas de edificios: 〜階 (かい／がい)",
            "Localización relativa: 上 (arriba), 下 (abajo), 隣 (al lado), 前 (delante)"
        ],
        "related_topics": [
            {
                "step": 6,
                "title": "El Hogar, Vivienda, Distribución y Electrodomésticos",
                "icon": "🛋️",
                "relationship": "Base Gramatical",
                "reason": "Aplica las mismas partículas de existencia espacial pero ahora incluyendo personas."
            },
            {
                "step": 9,
                "title": "Instrucciones de Trabajo, Peticiones y Reglas Laborales",
                "icon": "📋",
                "relationship": "Continuación Laboral",
                "reason": "Pasa de encontrar a los compañeros o máquinas a trabajar con ellos e intercambiar materiales."
            },
            {
                "step": 13,
                "title": "Orientación Urbana, Puntos de Encuentro y Señalización",
                "icon": "🗺️",
                "relationship": "Extensión a la Ciudad",
                "reason": "Extrapola las indicaciones de lugar de la oficina al callejero urbano."
            }
        ]
    },
    {
        "step": 8,
        "title": "Rutinas, Horarios, Días de la Semana e Intervalos",
        "subtitle": "9時から5時まで働きます。水曜日は休みです。(Trabajo de 9 a 5. Descanso el miércoles)",
        "icon": "⏰",
        "level": "N5",
        "stage": "Módulo 8 · Tiempo y Horarios",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 9)", "Japonés from Spanish NHK (Lecc. 9)", "Japonés para Hispanohablantes (JLPT N5)"],
        "detailed_guide": "Consolidación del sistema temporal en japonés: lectura precisa de horas (〜時) y minutos (〜分), días de la semana (月曜日 a 日曜日), meses y días del mes, e indicación de intervalos temporales de turnos laborales, horarios de atención y pausas con las partículas から (desde) y まで (hasta).",
        "input_steps": [2, 109],
        "extra_objectives": [
            "Decir la hora y minutos exactos con fluidez (何時何分ですか).",
            "Indicar días laborables, turnos y días de descanso semanal.",
            "Definir intervalos de apertura y trabajo con [Hora] から [Hora] まで.",
            "Preguntar por el horario de reuniones, pausas para comer y transporte."
        ],
        "extra_grammar": [
            "Contadores de tiempo: 〜時 (horas), 〜分 (minutos, pron. ぷん／ふん)",
            "Partículas de intervalo: [Punto A] から [Punto B] まで (desde A hasta B)",
            "Días de la semana: 月 (lunes), 火 (martes), 水 (miércoles), 木 (jueves), 金 (viernes), 土 (sábado), 日 (domingo)",
            "Partícula temporal puntual: [Hora/Día específico] に [Acción]"
        ],
        "related_topics": [
            {
                "step": 4,
                "title": "Gustos, Preferencias Culinarias y Hábitos Diarios",
                "icon": "🍜",
                "relationship": "Complementario",
                "reason": "Permite fijar las horas de las comidas diarias y descansos."
            },
            {
                "step": 9,
                "title": "Instrucciones de Trabajo, Peticiones y Reglas Laborales",
                "icon": "📋",
                "relationship": "Entorno Laboral",
                "reason": "Sincroniza los horarios con las tareas y normas del puesto de trabajo."
            },
            {
                "step": 16,
                "title": "Fin de Semana, Relatar el Pasado y Experiencias de Ocio",
                "icon": "🗓️",
                "relationship": "Eje Temporal Pasado",
                "reason": "Aplica los días de la semana y horas para contar qué se hizo en el tiempo libre."
            }
        ]
    },
    {
        "step": 9,
        "title": "Instrucciones de Trabajo, Peticiones y Reglas Laborales",
        "subtitle": "ホチキスを貸してください。ここでタバコを吸わないでください。(Préstame la grapadora)",
        "icon": "📋",
        "level": "N5",
        "stage": "Módulo 9 · Peticiones y Reglas",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 10)", "Japonés from Spanish NHK (Lecc. 8, 23, 24)"],
        "detailed_guide": "Aborda la comunicación operativa en el puesto de trabajo: pedir prestado material de oficina (grapadora, tijeras, bolígrafo), pedir explicaciones sobre cómo usar herramientas o software (教えてください), solicitar ayuda ante dificultades y comprender advertencias y prohibiciones de seguridad laboral.",
        "input_steps": [110],
        "extra_objectives": [
            "Pedir prestados útiles de trabajo usando [Objeto] を 貸してください.",
            "Pedir amablemente asistencia o instrucción técnica (教えてください / 手伝ってください).",
            "Entender señales de precaución y prohibiciones comunes en centros de trabajo (危ない, 禁煙).",
            "Agradecer al devolver material prestado (ありがとうございました / 助かりました)."
        ],
        "extra_grammar": [
            "Forma て de petición cortés: [Verbo en forma て] + ください",
            "Petición de préstamo: [Cosa] を 貸してください (Prestar hacia mí)",
            "Petición de enseñanza: [Acción] を 教えてください",
            "Prohibición suave o advertencia: [Verbo ないで] + ください (No haga...)"
        ],
        "related_topics": [
            {
                "step": 2,
                "title": "Estrategias de Comunicación y Gestión de Idiomas",
                "icon": "💬",
                "relationship": "Base Comunicativa",
                "reason": "Facilita pedir que te repitan instrucciones laborales si no las captas a la primera."
            },
            {
                "step": 7,
                "title": "El Lugar de Trabajo, Orientación y Existencia (ある vs いる)",
                "icon": "🏢",
                "relationship": "Entorno Espacial",
                "reason": "Permite desplazarse a buscar las herramientas antes de pedir instrucciones de uso."
            },
            {
                "step": 18,
                "title": "Salud, Síntomas Corporales y Deberes Ineludibles",
                "icon": "🏥",
                "relationship": "Obligaciones Laborales",
                "reason": "Cubre las notificaciones al supervisor en caso de enfermedad o bajas médicas."
            }
        ]
    },
    {
        "step": 10,
        "title": "Aficiones, Tiempo Libre, Ocio y Redes Sociales",
        "subtitle": "休みの日は何をしますか？マンガを読んだり、音楽を聴きます。(¿Qué haces en tu tiempo libre?)",
        "icon": "🎮",
        "level": "N5",
        "stage": "Módulo 10 · Aficiones y Ocio",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 11)", "Japonés from Spanish NHK (Lecc. 11, 20)"],
        "detailed_guide": "Trata las conversaciones sociales sobre aficiones, deportes, música, manga, anime y actividades de ocio durante los días libres. Enseña a compartir fotos en redes sociales, comentar aficiones de otros y expresar gustos culturales compartidos.",
        "input_steps": [111, 204],
        "extra_objectives": [
            "Hablar de aficiones personales y actividades recreativas (趣味は何ですか / サッカーをします).",
            "Preguntar qué tipo de música, cine o libros le gustan al interlocutor (どんな〜が好きですか).",
            "Compartir y comentar fotografías en el móvil o redes sociales (写真を見せる / いいですね).",
            "Comprender publicaciones breves en redes de amigos japoneses."
        ],
        "extra_grammar": [
            "Pregunta abierta de gustos: どんな [Categoría] が 好きですか",
            "Verbos de afición: 音楽を聴きます (escuchar música), 本を読みます (leer), 写真を撮ります (tomar fotos)",
            "Partícula を con actividades recreativas: [Deporte/Actividad] を します"
        ],
        "related_topics": [
            {
                "step": 4,
                "title": "Gustos, Preferencias Culinarias y Hábitos Diarios",
                "icon": "🍜",
                "relationship": "Paralelismo de Gustos",
                "reason": "Extiende la estructura [Cosa] が 好きです de la comida a los pasatiempos y el arte."
            },
            {
                "step": 11,
                "title": "Eventos, Festivales, Invitaciones y Propuestas",
                "icon": "🎆",
                "relationship": "Siguiente Paso Social",
                "reason": "Usa las aficiones comunes para proponer planes conjuntos e invitar a eventos."
            },
            {
                "step": 16,
                "title": "Fin de Semana, Relatar el Pasado y Experiencias de Ocio",
                "icon": "🗓️",
                "relationship": "Relato en Pasado",
                "reason": "Permite narrar en pasado las actividades de ocio que realizaste."
            }
        ]
    },
    {
        "step": 11,
        "title": "Eventos, Festivales, Invitaciones y Propuestas",
        "subtitle": "今週の土曜日、いっしょにお祭りに行きませんか？(¿Vamos juntos al festival?)",
        "icon": "🎆",
        "level": "N5",
        "stage": "Módulo 11 · Socialización",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 12)", "Japonés from Spanish NHK (Lecc. 26, 27, 41)"],
        "detailed_guide": "Enseña a interactuar en la vida social japonesa: proponer salidas con la forma 〜ませんか, responder con entusiasmo aceptando (いいですね、行きましょう) o declinar con tacto sin resultar cortante (すみません、その日はちょっと...), acordar la hora y el punto de encuentro para festivales, conciertos o barbacoas.",
        "input_steps": [112],
        "extra_objectives": [
            "Invitar a compañeros o amigos a planes de ocio con [Verbo ます] + ませんか.",
            "Aceptar invitaciones con entusiasmo y acordar detalles con 〜ましょう.",
            "Rechazar cordialmente invitaciones usando la fórmula elusiva japonesa (ちょっと都合が...).",
            "Fijar hora y lugar de encuentro usando las partículas に y で (駅で6時に会いましょう)."
        ],
        "extra_grammar": [
            "Invitación cortés: [Verbo raíz] + ませんか (¿No le gustaría...?)",
            "Propuesta / Aceptación activa: [Verbo raíz] + ましょう (¡Hagámoslo!)",
            "Partícula de lugar de acción: [Lugar] で 会います／食べます",
            "Rechazo elíptico educado: [Día] は ちょっと..."
        ],
        "related_topics": [
            {
                "step": 10,
                "title": "Aficiones, Tiempo Libre, Ocio y Redes Sociales",
                "icon": "🎮",
                "relationship": "Motivación Previa",
                "reason": "Las propuestas de salida surgen a raíz de aficiones compartidas."
            },
            {
                "step": 12,
                "title": "Movilidad, Transporte Público y Estaciones",
                "icon": "🚆",
                "relationship": "Desplazamiento",
                "reason": "Enseña cómo desplazarse en tren o autobús hasta el lugar del evento."
            },
            {
                "step": 13,
                "title": "Orientación Urbana, Puntos de Encuentro y Señalización",
                "icon": "🗺️",
                "relationship": "Coordinación Espacial",
                "reason": "Facilita citarse en salidas específicas de estaciones o plazas emblemáticas."
            }
        ]
    },
    {
        "step": 12,
        "title": "Movilidad, Transporte Público y Estaciones",
        "subtitle": "この電車は新宿に行きますか？何番線ですか？(¿Va a Shinjuku? ¿Qué vía es?)",
        "icon": "🚆",
        "level": "N5",
        "stage": "Módulo 12 · Movilidad y Transporte",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 13)", "Japonés from Spanish NHK (Lecc. 12, 16, 28)", "Japonés para Hispanohablantes (JLPT N5)"],
        "detailed_guide": "Guía integral para desplazarse por la red de transportes japonesa: trenes locales, metro, líneas JR, tren bala (shinkansen) y autobuses. Enseña a preguntar por el andén correcto (何番線), la dirección del convoy, transbordos (乗り換え), paradas y tiempos estimados de trayecto con las partículas に, へ, で, から, まで.",
        "input_steps": [5, 113, 205],
        "extra_objectives": [
            "Preguntar si un autobús o tren se dirige a un destino determinado (〜に行きますか).",
            "Identificar el andén o vía correcto en estaciones complejas (何番線ですか / 3番線です).",
            "Preguntar por transbordos y billetes (どこで乗り換えますか / 切符).",
            "Preguntar cuánto tarda el trayecto (どのくらいかかりますか / 30分くらいです)."
        ],
        "extra_grammar": [
            "Partículas de dirección y destino: [Destino] に／へ 行きます",
            "Partícula de medio de transporte: [Medio] で 行きます (電車で, バスで, pero 歩いて para a pie)",
            "Partículas de origen y destino espacial: [Origen] から [Destino] まで",
            "Pregunta de andén: 何番線 (なんばんせん) / 次の電車 (próximo tren)"
        ],
        "related_topics": [
            {
                "step": 11,
                "title": "Eventos, Festivales, Invitaciones y Propuestas",
                "icon": "🎆",
                "relationship": "Planificación",
                "reason": "Permite llegar a tiempo a los eventos sociales acordados."
            },
            {
                "step": 13,
                "title": "Orientación Urbana, Puntos de Encuentro y Señalización",
                "icon": "🗺️",
                "relationship": "Conexión a Pie",
                "reason": "Cubre el tramo a pie desde la salida de la estación hasta el destino exacto."
            },
            {
                "step": 17,
                "title": "Planes Vacacionales, Deseos y Cultura Onsen",
                "icon": "♨️",
                "relationship": "Viajes de Larga Distancia",
                "reason": "Aplica el uso de trenes bala y autobuses expresos para viajes turísticos."
            }
        ]
    },
    {
        "step": 13,
        "title": "Orientación Urbana, Puntos de Encuentro y Señalización",
        "subtitle": "交差点を右に曲がってください。大きなビルの前です。(Gire a la derecha en el cruce)",
        "icon": "🗺️",
        "level": "N5",
        "stage": "Módulo 13 · Ciudad y Rutas",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 14)", "Japonés from Spanish NHK (Lecc. 18, 38)"],
        "detailed_guide": "Enseña a orientarse en ciudades japonesas, interpretar señalizaciones públicas (salidas de metro, pasos de peatones, puentes, comisarías koban), pedir y dar indicaciones sobre cómo llegar a un edificio o comercio, y acordar puntos de encuentro exactos utilizando referencias arquitectónicas visibles.",
        "input_steps": [114],
        "extra_objectives": [
            "Pedir indicaciones callejeras a transeúntes o agentes de policía (〜はどこですか / 道を教えてください).",
            "Comprender direcciones espaciales: まっすぐ (recto), 右 (derecha), 左 (izquierda), 角 (esquina).",
            "Identificar edificios y puntos de referencia urbanos (交差点, 橋, コンビニ, 信号).",
            "Describir la fachada o magnitud de un punto de encuentro (大きな白い建物)."
        ],
        "extra_grammar": [
            "Direcciones con forma て: まっすぐ行って (vaya recto), 右に曲がって (gire a la derecha)",
            "Partícula de movimiento a través de un espacio: [Espacio] を 渡ります／曲がります",
            "Modificación nominal con adjetivos: 大きな [Sustantivo] / 赤い [Sustantivo]",
            "Fórmulas de ubicación: [Lugar A] は [Lugar B] の 前／隣／向かい です"
        ],
        "related_topics": [
            {
                "step": 7,
                "title": "El Lugar de Trabajo, Orientación y Existencia (ある vs いる)",
                "icon": "🏢",
                "relationship": "Demostrativos",
                "reason": "Aplica los términos de proximidad (ここ, そこ, あそこ) en el espacio público exterior."
            },
            {
                "step": 12,
                "title": "Movilidad, Transporte Público y Estaciones",
                "icon": "🚆",
                "relationship": "Conexión Inmediata",
                "reason": "Permite encontrar la salida adecuada (出口) tras bajar del tren."
            },
            {
                "step": 14,
                "title": "Tiendas, Grandes Almacenes y Búsqueda de Productos",
                "icon": "🛍️",
                "relationship": "Navegación Interior",
                "reason": "Traslada la orientación urbana al interior de grandes centros comerciales y plantas."
            }
        ]
    },
    {
        "step": 14,
        "title": "Tiendas, Grandes Almacenes y Búsqueda de Productos",
        "subtitle": "電池がほしいんですが、何階にありますか？(Busco pilas, ¿en qué planta están?)",
        "icon": "🛍️",
        "level": "N5",
        "stage": "Módulo 14 · Tiendas y Compras",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 15)", "Japonés from Spanish NHK (Lecc. 35)"],
        "detailed_guide": "Consolida las interacciones en zonas comerciales, centros departamentales, droguerías y tiendas de electrónica. Enseña a expresar la búsqueda de un producto con la estructura explicativa 〜がほしいんですが, consultar a los dependientes en qué sección o planta se encuentra (何階ですか) e interactuar cordialmente durante la compra.",
        "input_steps": [115],
        "extra_objectives": [
            "Expresar el deseo de adquirir un objeto cotidiano usando [Objeto] が ほしいんですが.",
            "Preguntar a dependientes por la sección o planta de un artículo (〜売り場はどこですか).",
            "Interpretar los carteles de directorio de plantas de grandes almacenes (フロアガイド).",
            "Solicitar probarse ropa o ver de cerca un artículo (これを見せてください)."
        ],
        "extra_grammar": [
            "Expresión de deseo de sustantivos: [Objeto] が ほしいです (Quiero/deseo un objeto)",
            "Introducción suave o preliminar de consulta: 〜んですが (Es que quisiera...)",
            "Pregunta por secciones: [Artículo] 売り場 (sección de venta de...)",
            "Petición de exhibición: これを 見せてください (Por favor muéstreme este)"
        ],
        "related_topics": [
            {
                "step": 5,
                "title": "Restaurantes, Menús, Pedidos y Contadores",
                "icon": "🍱",
                "relationship": "Paralelismo de Servicio",
                "reason": "Comparte fórmulas de atención al cliente y pedidos con dependientes."
            },
            {
                "step": 13,
                "title": "Orientación Urbana, Puntos de Encuentro y Señalización",
                "icon": "🗺️",
                "relationship": "Búsqueda de Tiendas",
                "reason": "Localiza el establecimiento en la calle antes de acceder a sus plantas."
            },
            {
                "step": 15,
                "title": "Precios, Descuentos y Caja del Combini",
                "icon": "💴",
                "relationship": "Cierre de Compra",
                "reason": "Conduce de la elección del producto al mostrador de caja y pago."
            }
        ]
    },
    {
        "step": 15,
        "title": "Precios, Descuentos y Caja del Combini",
        "subtitle": "これ、いくらですか？袋はいりません。(¿Cuánto cuesta esto? No necesito bolsa)",
        "icon": "💴",
        "level": "N5",
        "stage": "Módulo 15 · Precios y Pagos",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 16)", "Japonés from Spanish NHK (Lecc. 35, 42)"],
        "detailed_guide": "Domina el sistema monetario de Japón: lectura de números elevados (centenas 百, miles 千, decenas de miles 万), cálculo de rebajas y etiquetas de descuento habituales en supermercados al final de la jornada (半額, 2割引), y el diálogo estándar en cajas de combini (bolsa de plástico, calentar comida en microondas, tarjetas de fidelidad y ticket).",
        "input_steps": [116],
        "extra_objectives": [
            "Preguntar el precio de cualquier mercancía: これ、いくらですか.",
            "Comprender precios pronunciados con fluidez en yenes hasta cifras de decenas de miles (〜万円).",
            "Identificar etiquetas de rebaja de alimentos perecederos (20%引き, 半額 / mitad de precio).",
            "Responder a preguntas estándar del cajero de combini (袋, レシート, 温め)."
        ],
        "extra_grammar": [
            "Pregunta de precio: [Objeto] は いくらですか (¿Cuánto cuesta?)",
            "Unidades de numeración: 百 (ひゃく - 100), 千 (せん - 1.000), 万 (まん - 10.000)",
            "Descuentos porcentuales: 〜割引 (わりびき - décimas de descuento), 半額 (はんがく - mitad de precio)",
            "Preguntas de cortesía en caja: 袋はいりますか (¿necesita bolsa?), 温めますか (¿se lo caliento?)"
        ],
        "related_topics": [
            {
                "step": 8,
                "title": "Rutinas, Horarios, Días de la Semana e Intervalos",
                "icon": "⏰",
                "relationship": "Sistema Numérico",
                "reason": "Extiende el dominio de los números cardinales a transacciones monetarias elevadas."
            },
            {
                "step": 14,
                "title": "Tiendas, Grandes Almacenes y Búsqueda de Productos",
                "icon": "🛍️",
                "relationship": "Proceso Contiguo",
                "reason": "Culmina la selección de mercancía realizada en las plantas comerciales."
            }
        ]
    },
    {
        "step": 16,
        "title": "Fin de Semana, Relatar el Pasado y Experiencias de Ocio",
        "subtitle": "週末はどうでしたか？映画を見ました。とても楽しかったです。(¿Qué tal el fin de semana?)",
        "icon": "🗓️",
        "level": "N5",
        "stage": "Módulo 16 · Pasado y Experiencias",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 17)", "Japonés para Hispanohablantes (JLPT N5 y N4)"],
        "detailed_guide": "Consolidación fundamental de la conjugación en pasado formal para relatar sucesos, salidas y sensaciones vividas. Abarca la conjugación en pasado de verbos afirmativos y negativos (〜ました / 〜ませんでした), la conjugación de adjetivos い (〜かったです) y adjetivos な (〜でした), y la narración de anécdotas de ocio.",
        "input_steps": [6, 7, 117],
        "extra_objectives": [
            "Preguntar a compañeros qué tal estuvo su fin de semana o vacaciones (週末はどうでしたか).",
            "Conjugar verbos en pasado formal para relatar acciones realizadas (行きました, 見ました, 食べました).",
            "Conjugar adjetivos い y な en pasado para evaluar experiencias (楽しかったです, 静かでした).",
            "Expresar propósito de movimiento con la estructura [Verbo raíz] + に 行きました."
        ],
        "extra_grammar": [
            "Pasado verbal formal: [Verbo raíz] + ました / ませんでした",
            "Pasado de adjetivos い: quitar い + かったです / くなかったです",
            "Pasado de adjetivos な y sustantivos: + でした / ではありませんでした",
            "Propósito de desplazamiento: [Verbo raíz] に 行きました (Fui a ver, fui a comer)"
        ],
        "related_topics": [
            {
                "step": 8,
                "title": "Rutinas, Horarios, Días de la Semana e Intervalos",
                "icon": "⏰",
                "relationship": "Contraste Temporal",
                "reason": "Contrasta los hábitos de presente continuo con el relato de lo ocurrido."
            },
            {
                "step": 10,
                "title": "Aficiones, Tiempo Libre, Ocio y Redes Sociales",
                "icon": "🎮",
                "relationship": "Temática de Ocio",
                "reason": "Suministra las actividades y hobbies que se relatan en pasado."
            },
            {
                "step": 17,
                "title": "Planes Vacacionales, Deseos y Cultura Onsen",
                "icon": "♨️",
                "relationship": "Deseo vs Realidad",
                "reason": "Conecta lo ya experimentado con los futuros planes y deseos de viaje."
            }
        ]
    },
    {
        "step": 17,
        "title": "Planes Vacacionales, Deseos y Cultura Onsen",
        "subtitle": "次の休みに温泉に行きたいです。富士山に登りたいです。(Quiero ir a un onsen)",
        "icon": "♨️",
        "level": "N5 - N4",
        "stage": "Módulo 17 · Planes y Tradición",
        "sourceBooks": ["Irodori Elementary 1 (Lecc. 18)", "Japonés from Spanish NHK (Lecc. 29, 30, 33, 37)", "Japonés para Hispanohablantes (JLPT N5-N4)"],
        "detailed_guide": "Cubre la expresión de deseos y proyectos personales de ocio y viajes con la forma verbal 〜たいです (desear hacer), así como la comprensión integral de las costumbres tradicionales de Japón: protocolos de entrada, lavado previo y etiqueta en aguas termales (onsen) y baños públicos (sento), estancias en posadas ryokan y excursiones turísticas.",
        "input_steps": [8, 118],
        "extra_objectives": [
            "Expresar lo que se desea hacer en futuras vacaciones usando [Verbo raíz] + たいです.",
            "Preguntar a otros por sus planes de descanso (次の休みに何をしたいですか).",
            "Comprender las normas de etiqueta de baños termales japoneses (onsen) y vestimenta yukata.",
            "Hacer reservas preliminares y expresar preferencias de viaje y alojamiento."
        ],
        "extra_grammar": [
            "Expresión de deseo de acción personal: [Verbo raíz] + たいです / たくないです",
            "Partícula con 〜たい: [Objeto] を／が 食べたいです (ambas son válidas en la norma)",
            "Pregunta de planes futuros: 次の休みに 何を しますか／したいですか",
            "Fórmulas de experiencia previa: [Verbo forma た] + ことが あります (Haber hecho alguna vez)"
        ],
        "related_topics": [
            {
                "step": 12,
                "title": "Movilidad, Transporte Público y Estaciones",
                "icon": "🚆",
                "relationship": "Rutas de Viaje",
                "reason": "Enseña el transporte necesario para llegar a zonas termales y turísticas."
            },
            {
                "step": 16,
                "title": "Fin de Semana, Relatar el Pasado y Experiencias de Ocio",
                "icon": "🗓️",
                "relationship": "Eje Pasado-Futuro",
                "reason": "Permite comparar viajes ya realizados con nuevos destinos deseados."
            },
            {
                "step": 19,
                "title": "Metas Personales, Despedidas y Expresiones de Gratitud",
                "icon": "🎓",
                "relationship": "Proyección Vital",
                "reason": "Extiende el deseo de ocio con 〜たい a metas de desarrollo profesional y vital."
            }
        ]
    },
    {
        "step": 18,
        "title": "Salud, Síntomas Corporales y Deberes Ineludibles",
        "subtitle": "頭が痛いです。病院へ行かなければなりません。(Me duele la cabeza. Debo ir al médico)",
        "icon": "🏥",
        "level": "N5 - N4",
        "stage": "Módulo 18 · Salud y Autonomía",
        "sourceBooks": ["Japonés from Spanish NHK (Lecc. 19, 22, 36, 39-40)", "Japonés para Hispanohablantes (JLPT N5 y N4)"],
        "detailed_guide": "Módulo esencial de salud y seguridad. Enseña a comunicar síntomas corporales y molestias (dolor de cabeza, fiebre, resfriado, dolor de estómago) con la estructura [Parte del cuerpo] が 痛い / 熱がある, pedir medicamentos específicos en la farmacia, comprender pautas médicas básicas y expresar deberes u obligaciones ineludibles con 〜なければなりません.",
        "input_steps": [9, 206],
        "extra_objectives": [
            "Describir dolencias físicas y estados de salud: [Parte] が 痛いです / 熱があります.",
            "Pedir medicamentos adecuados en farmacias o droguerías (風邪薬をください / 胃腸薬).",
            "Expresar obligaciones médicas o laborales ineludibles usando 〜なければなりません.",
            "Conocer los números y protocolos de emergencias en Japón (119 bomberos/ambulancia, 110 policía)."
        ],
        "extra_grammar": [
            "Descripción de dolencias: [Parte corporal] が 痛い (いたい - doloroso) / 熱がある (tener fiebre)",
            "Obligación formal ineludible: [Verbo forma ない sin い] + ければなりません (Tener que hacer obligatoriamente)",
            "Prohibición estricta de salud/normas: [Verbo forma て] + は いけません (No debe hacer)",
            "Consejo preventivo: [Verbo forma た] + ほうがいいです (Es mejor que haga...)"
        ],
        "related_topics": [
            {
                "step": 9,
                "title": "Instrucciones de Trabajo, Peticiones y Reglas Laborales",
                "icon": "📋",
                "relationship": "Justificación de Ausencias",
                "reason": "Permite avisar a superiores o compañeros en caso de encontrarse indispuesto para acudir a trabajar."
            },
            {
                "step": 14,
                "title": "Tiendas, Grandes Almacenes y Búsqueda de Productos",
                "icon": "🛍️",
                "relationship": "Compras en Droguería",
                "reason": "Aplica las fórmulas de compra en droguerías (kusuriya/matsukiyo) para adquirir apósitos o analgésicos."
            }
        ]
    },
    {
        "step": 19,
        "title": "Metas Personales, Despedidas y Expresiones de Gratitud",
        "subtitle": "日本語が上手になりたいです。大変お世話になりました。(Muchas gracias por todo)",
        "icon": "🎓",
        "level": "N5 - N4",
        "stage": "Módulo 19 · Metas y Gratitud",
        "sourceBooks": ["Japonés from Spanish NHK (Lecc. 21, 26, 43, 47-48)", "Japonés para Hispanohablantes (JLPT N5 y N4)"],
        "detailed_guide": "Culmina el itinerario formativo consolidando la expresión de progreso en el idioma (hacerse bueno con 〜になります), planes de futuro profesional y académico en Japón, y las expresiones formales y cordiales de profunda gratitud y despedida protocolaria ante amigos, tutores y compañeros de trabajo.",
        "input_steps": [207],
        "extra_objectives": [
            "Expresar aspiraciones de superación y metas de vida: 日本語が上手になりたいです.",
            "Expresar cambios de estado con el verbo になります con adjetivos y sustantivos.",
            "Agradecer con la máxima cordialidad japonesa la ayuda recibida (大変お世話になりました).",
            "Despedirse de forma memorable en entornos académicos, profesionales y personales (お元気で / また会いましょう)."
        ],
        "extra_grammar": [
            "Cambio de estado: [Adjetivo な / Sustantivo] に なります / [Adjetivo い sin い] + く なります",
            "Fórmula de gratitud formal por atenciones recibidas: 大変お世話になりました",
            "Deseo de bienestar en despedidas duraderas: お元気で (cuídese mucho)",
            "Promesa de futuro reencuentro: またいつか会いましょう (nos volveremos a encontrar)"
        ],
        "related_topics": [
            {
                "step": 1,
                "title": "Saludos, Cortesía y Presentación Personal",
                "icon": "🤝",
                "relationship": "Cierre del Itinerario",
                "reason": "Cierra el periplo de aprendizaje que comenzó con 'Hajimemashite' con una despedida llena de agradecimiento."
            },
            {
                "step": 17,
                "title": "Planes Vacacionales, Deseos y Cultura Onsen",
                "icon": "♨️",
                "relationship": "Deseos y Futuro",
                "reason": "Utiliza la estructura 〜たい para metas a largo plazo en lugar de solo vacaciones."
            }
        ]
    }
]

# Now assemble each consolidated module
consolidated_curriculum = []

for spec in modules_spec:
    step_num = spec["step"]
    title = spec["title"]
    subtitle = spec["subtitle"]
    icon = spec["icon"]
    level = spec["level"]
    stage = spec["stage"]
    guide = spec["detailed_guide"]
    source_books = spec["sourceBooks"]
    
    # Collect items from input steps
    combined_objectives = list(spec.get("extra_objectives", []))
    combined_grammar = list(spec.get("extra_grammar", []))
    combined_can_dos = []
    combined_vocab = []
    combined_vocab_details = []
    combined_examples = []
    combined_exercises = []
    
    for inp in spec["input_steps"]:
        old_mod = old_by_step.get(inp)
        if not old_mod:
            continue
        
        # Objectives
        for obj in old_mod.get("objectives", []):
            if obj not in combined_objectives:
                combined_objectives.append(obj)
                
        # Grammar
        for gf in old_mod.get("grammar_focus", []):
            if gf not in combined_grammar:
                combined_grammar.append(gf)
                
        # Can-dos
        for cd in old_mod.get("can_dos", []):
            if cd not in combined_can_dos:
                combined_can_dos.append(cd)
                
        # Vocab list
        for v in old_mod.get("included_vocab", []):
            if v not in combined_vocab:
                combined_vocab.append(v)
                
        # Vocab details
        for vd in old_mod.get("vocab_details", []):
            combined_vocab_details.append(vd)
            
        # Examples
        for ex in old_mod.get("examples", []):
            combined_examples.append(ex)
            
        # Exercises
        for ex_quiz in old_mod.get("exercises", []):
            combined_exercises.append(ex_quiz)

    # Special handling for Module 18 (Salud) to ensure Can-Dos exist
    if step_num == 18 and not combined_can_dos:
        combined_can_dos = [
            {"id": "CD-80", "task": "Describir síntomas corporales y dolencias físicas al médico o compañero de piso", "sample": "頭が痛いです。熱が少しあります。"},
            {"id": "CD-81", "task": "Comprar medicamentos de uso común en una farmacia o droguería explicando el malestar", "sample": "風邪薬をください。胃が痛いです。"},
            {"id": "CD-82", "task": "Comprender instrucciones de posología médica y precauciones de descanso", "sample": "1日3回、食後に飲んでください。"},
            {"id": "CD-83", "task": "Solicitar ayuda urgente o contactar con servicios de auxilio (119 / 110)", "sample": "助けてください！救急車をお願いします。"}
        ]
        
    # Special handling for Module 19 (Metas y Gratitud) to ensure Can-Dos exist
    if step_num == 19 and not combined_can_dos:
        combined_can_dos = [
            {"id": "CD-84", "task": "Expresar metas personales y motivación para seguir aprendiendo japonés", "sample": "もっと日本語が上手になりたいです。"},
            {"id": "CD-85", "task": "Agradecer formalmente la acogida y ayuda brindada durante una estancia o trabajo", "sample": "今まで大変お世話になりました。"},
            {"id": "CD-86", "task": "Despedirse con calidez y desear bienestar a profesores y amistades", "sample": "先生もお元気で。また会いましょう。"},
            {"id": "CD-87", "task": "Proponer mantener el contacto a través de redes sociales o mensajería", "sample": "連絡先を教えてください。メッセージを送ります。"}
        ]

    # Deduplicate arrays
    cleaned_objectives = dedupe_list(combined_objectives)
    cleaned_grammar = dedupe_list(combined_grammar)
    cleaned_vocab = dedupe_list(combined_vocab)
    cleaned_vocab_details = dedupe_vocab_details(combined_vocab_details)
    cleaned_examples = dedupe_examples(combined_examples)
    cleaned_exercises = dedupe_exercises(combined_exercises)

    module_entry = {
        "step": step_num,
        "title": title,
        "subtitle": subtitle,
        "icon": icon,
        "level": level,
        "stage": stage,
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": source_books,
        "sourcePdf": "Irodori + NHK + JLPT",
        "detailed_guide": guide,
        "objectives": cleaned_objectives,
        "can_dos": combined_can_dos,
        "grammar_focus": cleaned_grammar,
        "included_vocab": cleaned_vocab,
        "vocab_details": cleaned_vocab_details,
        "examples": cleaned_examples,
        "exercises": cleaned_exercises,
        "related_topics": spec["related_topics"]
    }
    
    consolidated_curriculum.append(module_entry)

print(f"Generated {len(consolidated_curriculum)} consolidated modules.")
total_candos = sum(len(m["can_dos"]) for m in consolidated_curriculum)
total_exercises = sum(len(m["exercises"]) for m in consolidated_curriculum)
total_examples = sum(len(m["examples"]) for m in consolidated_curriculum)
total_vocab = sum(len(m["included_vocab"]) for m in consolidated_curriculum)
print(f"Total Can-Dos: {total_candos} (Original Irodori: 79 + 8 complementarios)")
print(f"Total Exercises: {total_exercises}")
print(f"Total Examples: {total_examples}")
print(f"Total Vocab Items across modules: {total_vocab}")

# Save to data/curriculum.json
with open('data/curriculum.json', 'w', encoding='utf-8') as f:
    json.dump(consolidated_curriculum, f, ensure_ascii=False, indent=2)

print("Saved consolidated data to data/curriculum.json successfully!")
