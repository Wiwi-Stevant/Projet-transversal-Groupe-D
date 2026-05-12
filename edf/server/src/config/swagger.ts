import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API EDF — Backend",
      version: "1.0.0",
      description:
        "Documentation OpenAPI du backend (authentification, utilisateurs, appareil : LED, seuil d’activité). " +
        "Interface Swagger UI : `GET /api-docs`.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Développement local (variable `PORT` du serveur)",
      },
    ],
    tags: [
      { name: "Authentication", description: "Basic, Digest, JWT (login, refresh, profil)" },
      { name: "Users", description: "Gestion des utilisateurs" },
      { name: "Device", description: "LED et seuil d’activité (`config` PostgreSQL)" },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: "http",
          scheme: "basic",
        },
        digestAuth: {
          type: "http",
          scheme: "digest",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: [
    "./src/routes/authRoutes.ts",
    "./src/routes/userRoutes.ts",
    "./src/routes/ledRoutes.ts",
    "./src/routes/thresholdRoutes.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
