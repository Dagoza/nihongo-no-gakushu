/**
 * curriculumValidator.js
 * Validador estricto para asegurar que todos los módulos (existentes y nuevos)
 * cumplan con la arquitectura seccionada por pasos:
 * - Subdivisión por pasos (1 paso si es tema único, 2-3 si abarca varios temas)
 * - Cada sección/paso de contenido debe concatenar pedagógicamente:
 *   1. Objetivo del paso (objective)
 *   2. Vocabulario contextual segmentado (vocab: 8-12 términos)
 *   3. Kanjis y combinaciones Jukugo (kanji_jukugo)
 *   4. Componentes y puente funcional (functional_bridge)
 *   5. Puntos clave de gramática con fórmulas y ejemplos consolidados (grammar_points)
 *   6. Competencias Can-Do (can_dos)
 */

export function validateModuleSection(section, stepNum, sectionIndex) {
  const errors = [];
  const prefix = `Módulo ${stepNum} -> Sección/Paso ${sectionIndex + 1}`;

  if (!section) {
    return [`${prefix}: La sección no está definida`];
  }

  if (typeof section.substep !== 'number') {
    errors.push(`${prefix}: Falta 'substep' numérico`);
  }

  if (!section.title || typeof section.title !== 'string' || section.title.trim().length === 0) {
    errors.push(`${prefix}: Falta 'title' descriptivo`);
  }

  if (!section.objective || typeof section.objective !== 'string' || section.objective.trim().length === 0) {
    errors.push(`${prefix}: Falta 'objective' claro para este paso`);
  }

  // Si es el paso final exclusivo de ejercicios
  if (section.is_exercise_step) {
    return errors;
  }

  // Validar grammar_points para pasos de contenido temático
  if (!Array.isArray(section.grammar_points) || section.grammar_points.length === 0) {
    errors.push(`${prefix}: Debe contener al menos un punto gramatical en 'grammar_points'`);
  } else {
    section.grammar_points.forEach((gp, gpIdx) => {
      const gpPrefix = `${prefix} -> Gramática [${gpIdx + 1}]`;
      if (!gp.title || typeof gp.title !== 'string') {
        errors.push(`${gpPrefix}: Falta 'title' del punto gramatical`);
      }
      if (!gp.formula || typeof gp.formula !== 'string') {
        errors.push(`${gpPrefix}: Falta 'formula' estructural del punto gramatical`);
      }
      if (!gp.explanation || typeof gp.explanation !== 'string' || gp.explanation.length < 20) {
        errors.push(`${gpPrefix}: Explicación insuficiente en 'explanation' (mínimo 20 caracteres con detalle teórico/libros)`);
      }
      if (!Array.isArray(gp.examples) || gp.examples.length === 0) {
        errors.push(`${gpPrefix}: Debe contener al menos un ejemplo en 'examples'`);
      }
    });
  }

  // Can-dos debe existir como arreglo
  if (!Array.isArray(section.can_dos)) {
    errors.push(`${prefix}: 'can_dos' debe ser un arreglo (puede ser vacío si no aplica)`);
  }

  // Validar vocabulario segmentado (requisito pedagógico: 8-12 términos contextuales)
  if (!Array.isArray(section.vocab)) {
    errors.push(`${prefix}: 'vocab' debe ser un arreglo de vocabulario`);
  } else if (section.vocab.length < 8 || section.vocab.length > 12) {
    errors.push(`${prefix}: 'vocab' debe contener entre 8 y 12 términos contextuales (actual: ${section.vocab.length})`);
  } else {
    section.vocab.forEach((v, vIdx) => {
      const vPrefix = `${prefix} -> Vocabulario [${vIdx + 1}]`;
      if (!v.kanji || typeof v.kanji !== 'string') {
        errors.push(`${vPrefix}: Falta 'kanji' o representación escrita del término`);
      }
      if (!v.kana || typeof v.kana !== 'string') {
        errors.push(`${vPrefix}: Falta 'kana'`);
      }
      if (!v.meaning || typeof v.meaning !== 'string') {
        errors.push(`${vPrefix}: Falta 'meaning' en español`);
      }
    });
  }

  // La propiedad 'examples' en la raíz del paso está obsoleta; los ejemplos residen exclusivamente en grammar_points[].examples
  if (section.examples !== undefined) {
    errors.push(`${prefix}: 'examples' redundante detectado a nivel de sección; los ejemplos deben residir exclusivamente dentro de 'grammar_points[].examples'`);
  }

  // Validar sección interactiva de Kanjis y Jukugo
  if (section.kanji_jukugo !== undefined) {
    if (!Array.isArray(section.kanji_jukugo)) {
      errors.push(`${prefix}: 'kanji_jukugo' debe ser un arreglo`);
    } else {
      section.kanji_jukugo.forEach((kj, kjIdx) => {
        const kjPrefix = `${prefix} -> Kanji/Jukugo [${kjIdx + 1}]`;
        if (!kj.kanji || typeof kj.kanji !== 'string') errors.push(`${kjPrefix}: Falta 'kanji'`);
        if (!kj.meaning || typeof kj.meaning !== 'string') errors.push(`${kjPrefix}: Falta 'meaning'`);
      });
    }
  }

  // Validar bloque puente funcional (partículas y prefijos)
  if (section.functional_bridge !== undefined) {
    if (!Array.isArray(section.functional_bridge)) {
      errors.push(`${prefix}: 'functional_bridge' debe ser un arreglo`);
    } else {
      section.functional_bridge.forEach((fb, fbIdx) => {
        const fbPrefix = `${prefix} -> Functional Bridge [${fbIdx + 1}]`;
        if (!fb.item || typeof fb.item !== 'string') errors.push(`${fbPrefix}: Falta 'item' funcional`);
        if (!fb.name || typeof fb.name !== 'string') errors.push(`${fbPrefix}: Falta 'name' descriptivo`);
        if (!fb.function_es || typeof fb.function_es !== 'string') errors.push(`${fbPrefix}: Falta 'function_es'`);
      });
    }
  }

  return errors;
}

export function validateModule(moduleObj) {
  const errors = [];
  if (!moduleObj) return { isValid: false, errors: ['El módulo no está definido'] };

  const stepNum = moduleObj.step;
  if (typeof stepNum !== 'number') {
    errors.push(`El módulo carece de 'step' numérico`);
  }

  if (!moduleObj.title) {
    errors.push(`Módulo ${stepNum}: Falta 'title'`);
  }

  if (!Array.isArray(moduleObj.sections) || moduleObj.sections.length < 2) {
    errors.push(`Módulo ${stepNum}: Debe contener un arreglo 'sections' con al menos 2 pasos (paso(s) de contenido + paso final de ejercicios)`);
  } else {
    moduleObj.sections.forEach((sec, idx) => {
      const secErrors = validateModuleSection(sec, stepNum, idx);
      errors.push(...secErrors);
    });

    const lastSection = moduleObj.sections[moduleObj.sections.length - 1];
    if (!lastSection.is_exercise_step) {
      errors.push(`Módulo ${stepNum}: El último paso debe ser obligatoriamente el paso exclusivo de ejercicios ('is_exercise_step: true')`);
    }

    const exerciseStepsCount = moduleObj.sections.filter(s => s.is_exercise_step).length;
    if (exerciseStepsCount > 1) {
      errors.push(`Módulo ${stepNum}: Solo debe existir un único paso final de ejercicios por módulo (actualmente tiene ${exerciseStepsCount})`);
    }
  }

  if (!Array.isArray(moduleObj.related_topics) || moduleObj.related_topics.length === 0) {
    errors.push(`Módulo ${stepNum}: Debe incluir obligatoriamente 'related_topics' (Regla 4)`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAllCurriculum(curriculumList) {
  if (!Array.isArray(curriculumList)) {
    return { isValid: false, errors: ['El currículum no es un arreglo'] };
  }

  const allErrors = [];
  curriculumList.forEach((mod) => {
    const res = validateModule(mod);
    if (!res.isValid) {
      allErrors.push(...res.errors);
    }
  });

  return {
    isValid: allErrors.length === 0,
    totalModules: curriculumList.length,
    errors: allErrors
  };
}

export default {
  validateModuleSection,
  validateModule,
  validateAllCurriculum
};
