/**
 * curriculumValidator.js
 * Validador estricto para asegurar que todos los módulos (existentes y nuevos)
 * cumplan con la arquitectura seccionada por pasos:
 * - Subdivisión por pasos (1 paso si es tema único, 2-3 si abarca varios temas)
 * - Cada sección/paso debe concatenar:
 *   1. Objetivo del paso (objective)
 *   2. Puntos clave de gramática con explicación profunda, fórmula y notas de uso (grammar_points)
 *   3. Competencias Can-Do (can_dos)
 *   4. Vocabulario del paso (vocab)
 *   5. Ejemplos reales en contexto con audio y análisis (examples)
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

  // Can-dos, vocabulario y ejemplos deben existir como arreglos
  if (!Array.isArray(section.can_dos)) {
    errors.push(`${prefix}: 'can_dos' debe ser un arreglo (puede ser vacío si no aplica)`);
  }

  if (!Array.isArray(section.vocab)) {
    errors.push(`${prefix}: 'vocab' debe ser un arreglo de vocabulario`);
  }

  if (!Array.isArray(section.examples)) {
    errors.push(`${prefix}: 'examples' debe ser un arreglo de ejemplos en contexto`);
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
