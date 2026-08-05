// GENERADO POR scripts/build-tech-icons.mjs — NO EDITAR A MANO.
//
// Qué logotipos existen en public/logos/tech.svg. Solo los nombres: los
// trazados viven en esa lámina y los descarga el navegador una sola vez.
//
// Antes acá estaban los trazados y se dibujaban dentro de cada página. Eso
// mandaba 47 KB de curvas DOS VECES —una en el HTML y otra en la carga de
// hidratación, porque React necesita reconstruir el árbol—, unos 94 KB de los
// 233 que pesaba la portada. Para el logotipo de Nidra dibujarlo en línea
// sigue siendo lo correcto: son dos trazados y ahorran una petición. Con
// veintiséis, la cuenta se da vuelta.
//
// Esta lista existe para poder decidir en el servidor si un logotipo está
// disponible: sin él, la tecnología se muestra solo con su nombre en vez de
// dejar un hueco.
//
// Para regenerar, después de tocar el YAML:  pnpm build:icons

export const TECH_ICONS = new Set<string>([
  "airtable",
  "angular",
  "anthropic",
  "apachekafka",
  "calendly",
  "chatwoot",
  "cloudflare",
  "docker",
  "dropbox",
  "elasticsearch",
  "fastapi",
  "github",
  "gmail",
  "googleads",
  "googlecloud",
  "googledrive",
  "googlegemini",
  "googlesheets",
  "hubspot",
  "huggingface",
  "instagram",
  "jira",
  "kubernetes",
  "langchain",
  "mailchimp",
  "make",
  "mercadopago",
  "meta",
  "mongodb",
  "mysql",
  "n8n",
  "nestjs",
  "nodedotjs",
  "notion",
  "postgresql",
  "python",
  "qdrant",
  "rabbitmq",
  "react",
  "redis",
  "shopify",
  "spring",
  "stripe",
  "supabase",
  "telegram",
  "terraform",
  "trello",
  "typescript",
  "vercel",
  "whatsapp",
  "zapier",
])

/** La lámina de símbolos, servida como archivo estático y cacheable. */
export const TECH_SPRITE = '/logos/tech.svg'
