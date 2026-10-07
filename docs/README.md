# 📚 Documentación y Arquitectura — Nihongo Master

Esta carpeta contiene la documentación estratégica, análisis de temarios, guías de arquitectura agentica y planes de diseño de Nihongo Master.

## 📑 Índice de Documentos

1. **[ANALISIS_MERCADO_Y_PLATAFORMA_NIHONGO_MASTER.md](./ANALISIS_MERCADO_Y_PLATAFORMA_NIHONGO_MASTER.md)**
   - Estudio integral de mercado (Duolingo, WaniKani, Bunpro, Renshuu, LingoDeer).
   - Propuesta de valor única y arquitectura de diferenciación de Nihongo Master.
   - Especificaciones de módulos clave: Pitch Accent SVG, FSRS v5, inmersión con YouTube y sombras fonéticas.

2. **[ANALISIS_TEMARIOS_LIBROS.md](./ANALISIS_TEMARIOS_LIBROS.md)**
   - Desglose y trazabilidad de libros oficiales y métodos integrados (Irodori Starter/Elementary/Pre-Intermediate, NHK World Japonés en Español, Minna no Nihongo, Genki).
   - Matriz curricular de 37 módulos clasificados bajo estándar JLPT (N5 a N1).
   - Checklist y auditoría de lecciones, Can-Dos, diálogos y ejercicios.

3. **[GUIA_INGENIERIA_AGENTICA_Y_MCP.md](./GUIA_INGENIERIA_AGENTICA_Y_MCP.md)**
   - Arquitectura de agentes e integración con Model Context Protocol (MCP).
   - Patrones de Tool Calling, bucles de razonamiento (Agent Loops) y Human-in-the-Loop.
   - Especificación de herramientas y subagentes para Nihongo Master.

4. **[PLAN_IA_FACADE.md](./PLAN_IA_FACADE.md)**
   - Especificación técnica del patrón Facade multi-proveedor para IA (Gemini, Groq, OpenRouter).
   - Sistema de balanceo, reintentos y tolerancia a fallos en llamadas a LLMs.

---
*Para reglas de desarrollo y normas de contribución técnica, consulta [AGENTS.md](../AGENTS.md) e [INSTRUCCIONES.md](../INSTRUCCIONES.md) en la raíz del proyecto.*
