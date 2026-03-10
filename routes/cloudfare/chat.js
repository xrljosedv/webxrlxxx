const axios = require('axios');

function obtenerURLCloudflare() {
  return process.env.CLOUDFLARE_AI_URL || 'https://ai.cloudflare.workers.dev';
}

async function chatConIA(mensajes, modelo) {
  try {
    const respuesta = await axios.post(
      obtenerURLCloudflare() + "/chat",
      {
        model: modelo,
        messages: mensajes,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
          "Referer": "https://ai.cloudflare.workers.dev/",
        },
        timeout: 30000,
      }
    );

    return respuesta.data.data;
  } catch (error) {
    console.error("Error API:", error.message);
    throw new Error("Error al obtener respuesta de la API");
  }
}

module.exports = [
  {
    metode: "GET",
    endpoint: "/cf/chat",
    name: "chat",
    category: "CloudflareAi",
    description: "Endpoint para interactuar con IA de Cloudflare mediante consultas simples",
    tags: ["IA", "Chatbot", "Cloudflare"],
    example: "?prompt=hola&system=eres un asistente útil&model=@cf/meta/llama-3.1-8b-instruct-fast",
    parameters: [
      {
        name: "prompt",
        in: "query",
        required: false,
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 1000,
        },
        description: "Mensaje del usuario para la IA",
        example: "¿Cuál es la capital de Francia?",
      },
      {
        name: "system",
        in: "query",
        required: false,
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 1000,
        },
        description: "Instrucción del sistema para la IA",
        example: "Eres un asistente útil.",
      },
      {
        name: "model",
        in: "query",
        required: false,
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 100,
        },
        description: "Modelo de IA personalizado",
        example: "@cf/meta/llama-3.1-8b-instruct-fast",
      },
    ],
    isPremium: false,
    isMaintenance: false,
    isPublic: true,
    async run({ req }) {
      const { prompt, system, model } = req.query || {};

      if (!prompt && !system) {
        return {
          status: false,
          error: "Se requiere al menos un parámetro (prompt o system)",
          code: 400,
        };
      }

      const mensajes = [];
      
      if (typeof system === "string" && system.trim().length > 0) {
        mensajes.push({ role: "system", content: system.trim() });
      }
      
      if (typeof prompt === "string" && prompt.trim().length > 0) {
        mensajes.push({ role: "user", content: prompt.trim() });
      }

      if (mensajes.length === 0) {
        return {
          status: false,
          error: "Los parámetros proporcionados están vacíos o son inválidos",
          code: 400,
        };
      }

      const modeloIA = typeof model === "string" && model.trim().length > 0 
        ? model.trim() 
        : "@cf/meta/llama-3.1-8b-instruct-fast";

      try {
        const resultado = await chatConIA(mensajes, modeloIA);

        if (!resultado) {
          return {
            status: false,
            error: "No se obtuvo respuesta de la IA",
            code: 500,
          };
        }

        return {
          status: true,
          data: resultado,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          status: false,
          error: error.message || "Error interno del servidor",
          code: 500,
        };
      }
    },
  },
  {
    metode: "POST",
    endpoint: "/cf/chat",
    name: "chat",
    category: "CloudflareAi",
    description: "Endpoint para conversaciones multi-turno con IA de Cloudflare",
    tags: ["IA", "Chatbot", "Cloudflare"],
    example: "",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              messages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    role: {
                      type: "string",
                      enum: ["system", "user"],
                      description: "Rol del remitente",
                      example: "user",
                    },
                    content: {
                      type: "string",
                      description: "Contenido del mensaje",
                      example: "Hola, ¿cómo estás?",
                      minLength: 1,
                      maxLength: 2000,
                    },
                  },
                  required: ["role", "content"],
                  additionalProperties: false,
                },
                minItems: 1,
              },
              model: {
                type: "string",
                description: "Modelo de IA personalizado",
                example: "@cf/meta/llama-3.1-8b-instruct-fast",
                minLength: 1,
                maxLength: 100,
              },
            },
            required: ["messages"],
            additionalProperties: false,
          },
          example: {
            messages: [
              { role: "system", content: "Eres un asistente útil." },
              { role: "user", content: "¿Puedes contarme un chiste?" },
            ],
            model: "@cf/meta/llama-3.1-8b-instruct-fast",
          },
        },
      },
    },
    isPremium: false,
    isMaintenance: false,
    isPublic: true,
    async run({ req }) {
      const { messages, model } = req.body || {};

      if (!Array.isArray(messages) || messages.length === 0) {
        return {
          status: false,
          error: "El cuerpo debe contener un array de mensajes no vacío",
          code: 400,
        };
      }

      const tieneMensajeUsuario = messages.some(
        (msg) => msg.role === "user" && typeof msg.content === "string" && msg.content.trim().length > 0
      );
      
      if (!tieneMensajeUsuario) {
        return {
          status: false,
          error: "Se requiere al menos un mensaje con rol 'user' y contenido no vacío",
          code: 400,
        };
      }

      for (const msg of messages) {
        if (!["system", "user"].includes(msg.role)) {
          return {
            status: false,
            error: "Cada mensaje debe tener un rol válido (system o user)",
            code: 400,
          };
        }
        if (typeof msg.content !== "string" || msg.content.trim().length === 0) {
          return {
            status: false,
            error: "Cada mensaje debe tener contenido no vacío",
            code: 400,
          };
        }
        if (msg.content.length > 2000) {
          return {
            status: false,
            error: "El contenido del mensaje debe tener menos de 2000 caracteres",
            code: 400,
          };
        }
      }

      const modeloIA = typeof model === "string" && model.trim().length > 0 
        ? model.trim() 
        : "@cf/meta/llama-3.1-8b-instruct-fast";

      try {
        const resultado = await chatConIA(messages, modeloIA);

        if (!resultado) {
          return {
            status: false,
            error: "No se obtuvo respuesta de la IA",
            code: 500,
          };
        }

        return {
          status: true,
          data: resultado,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          status: false,
          error: error.message || "Error interno del servidor",
          code: 500,
        };
      }
    },
  },
];