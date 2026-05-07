const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CineVault DVD Rental API",
      version: "1.0.0",
      description: "REST API for the CineVault DVD Rental Management System",
    },
    servers: [{ url: "http://localhost:5000", description: "Development server" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Member: {
          type: "object",
          properties: {
            _id:        { type: "string" },
            memberName: { type: "string" },
            email:      { type: "string" },
            phone:      { type: "string" },
            isAdmin:    { type: "boolean" },
            joinDate:   { type: "string", format: "date-time" },
          },
        },
        Film: {
          type: "object",
          properties: {
            _id:          { type: "string" },
            filmTitle:    { type: "string" },
            releaseDate:  { type: "string", format: "date" },
            filmDuration: { type: "number" },
            rating:       { type: "number" },
            price:        { type: "number" },
            poster:       { type: "string" },
            description:  { type: "string" },
          },
        },
        Rental: {
          type: "object",
          properties: {
            _id:         { type: "string" },
            memberId:    { type: "string" },
            copyId:      { type: "string" },
            dateRented:  { type: "string", format: "date-time" },
            dueDateBack: { type: "string", format: "date-time" },
            rentalCost:  { type: "number" },
            overDueCost: { type: "number" },
            returnDate:  { type: "string", format: "date-time", nullable: true },
          },
        },
        Error: {
          type: "object",
          properties: { message: { type: "string" } },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
