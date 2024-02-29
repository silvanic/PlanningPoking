import { Application, Context, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import router from "./routes/room.route.ts";
import { MongoDatabase } from "./db/db.ts";
import { load } from "https://deno.land/std@0.217.0/dotenv/mod.ts";
import * as middlewares from "./middlewares/middlesware.ts"

const env = await load();

const app = new Application();

app.use(middlewares.loggerMiddleware);

app.use(
  oakCors({
    origin: "*",
  }),
);

export const db = new MongoDatabase(env['MONGO_URL'], env['MONGO_DB']);

try{
  await db.connect();
}catch(err){
  console.log(err.message);
}

app.use(router.routes());
await app.listen({ port: 8080 })
