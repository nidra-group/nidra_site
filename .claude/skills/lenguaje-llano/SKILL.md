---
name: lenguaje-llano
description: Regla de nivel de lenguaje por página para el sitio de Nidra. La portada le habla a un dueño de PyME que puede no saber usar una planilla de cálculo; servicios, integraciones y el currículum admiten vocabulario técnico. Úsala junto con copywriting y redactor-web cada vez que se escriba o revise texto del sitio, para decidir qué palabras están permitidas en cada página.
---

# Lenguaje llano por página

El sitio de Nidra le habla a dos lectores distintos, y confundirlos cuesta
consultas.

**La portada la lee alguien que no es técnico.** Es el dueño de una empresa
de doce personas. Sabe perfectamente qué le duele —que la administración le
come el día, que el sistema que necesita es carísimo— y no sabe, ni tiene por
qué saber, qué es una API. Si lee una palabra que no entiende, no pregunta:
asume que el servicio no es para él y cierra la pestaña.

**Las páginas de servicios, integraciones y el currículum las lee alguien que
ya decidió mirar en serio.** Ahí el vocabulario técnico es información, no
barrera: quien llegó hasta esa página quiere saber con qué se integra y cómo
se verifica. Bajar el nivel ahí resta credibilidad.

## La regla

| Página | Nivel | Criterio |
|---|---|---|
| Portada | Llano estricto | Se lo entiende sin haber trabajado nunca con software |
| Contacto | Llano estricto | Es la continuación de la portada |
| Legales | Llano estricto | Nadie debería necesitar traducción para saber qué pasa con sus datos |
| Servicios | Técnico moderado | Cada término técnico se explica en su primera aparición |
| Integraciones | Técnico | Nombres de plataformas y protocolos, sin diccionario |
| Currículum | Técnico | Lo lee alguien que evalúa un perfil profesional |

## Traducciones obligatorias en la portada

Izquierda: lo que se escribía. Derecha: lo que se escribe.

| No | Sí |
|---|---|
| API, interfaz de programación | «conectar dos programas entre sí» |
| RAG, embeddings, base vectorial | «busca en tus documentos y responde citando de dónde salió» |
| Modelo de lenguaje, LLM | «la inteligencia artificial que entiende texto» |
| Automatizar un flujo | «que se haga solo» |
| Integrar sistemas | «que los programas se pasen los datos entre ellos» |
| Desplegar en producción | «que quede funcionando de verdad, no como prueba» |
| Pipeline, arquitectura, microservicios | (no aparecen en la portada) |
| Escalable, robusto, optimizado | (no dicen nada; se borran) |
| Stack, framework, repositorio | (no aparecen en la portada) |
| Onboarding, deploy, features | (son anglicismos; se traducen) |

Las siglas se prohíben salvo dos: **IA**, que ya está en el lenguaje común, y
**PyME**, que es como se llaman a sí mismos los lectores.

## Cómo se verifica

Antes de dar por buena una frase de la portada, pasala por estas tres pruebas:

1. **La prueba del contador.** ¿La entendería el contador de la empresa, que
   no es técnico pero sí es adulto y profesional? Si hay que explicarle una
   palabra, la palabra se cambia.
2. **La prueba de la ambigüedad.** ¿Puede interpretarse de dos maneras? La
   confianza se rompe más rápido con una promesa ambigua que con una promesa
   chica. Preferí siempre la frase que solo se puede leer de una forma.
3. **La prueba del ejemplo.** ¿La frase menciona algo que el lector pueda
   imaginar pasando en su oficina? «Cargar facturas», «pasar datos de un
   correo a una planilla», «buscar un contrato» funcionan. «Optimizar
   procesos» no: nadie vio nunca un proceso optimizándose.

## Frases largas

En la portada, el límite es **veinte palabras por oración**. No es una regla
estética: una oración larga con una subordinada obliga al lector a sostener
dos ideas a la vez, y quien no está cómodo con el tema abandona antes de
llegar al punto.

Si una idea no entra en veinte palabras, son dos ideas. Separalas.

## Lo que no se sacrifica

Simplificar no es vaciar. Estas cosas se mantienen aunque cuesten palabras:

- **Los números concretos.** «Entre 4 y 8 horas por semana» es más fácil de
  entender que «mucho tiempo», no menos.
- **Los límites honestos.** «Si no te conviene, te lo digo» es la frase más
  simple y la que más confianza genera del sitio.
- **La precisión.** Simplificar el vocabulario nunca justifica prometer algo
  que no se va a cumplir. Si la versión simple exagera, la versión simple está
  mal escrita.
