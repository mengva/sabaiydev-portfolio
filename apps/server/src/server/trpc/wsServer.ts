// import ws from "ws";
// import { appRouter } from "./router";
// import { createdTRPCContext } from "./context";
// import { applyWSSHandler } from '@trpc/server/adapters/ws';
// import { env } from "@/server/config/env";


// const wss = new ws.Server({
//   port: env("PORT"),
// });
// const handler = applyWSSHandler({
//   wss,
//   router: appRouter,
//   createContext: createdTRPCContext,
//   keepAlive: {
//     enabled: true,
//   },
// });