import server from "./app.config.js";

const PORT = Number(process.env.PORT ?? 2567);

await server.listen(PORT);

console.log(`Jaurías de Asfalto server running on ws://localhost:${PORT}`);
