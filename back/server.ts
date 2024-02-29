import { Application, Context, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { Room } from "./models/Room.ts";
import router from "./routes/room.route.ts";
import { MongoDatabase } from "./db/db.ts";

const app = new Application();
app.use(
  oakCors({
    origin: "*",
  }),
);

export let rooms : Map<string,Room> = new Map();
export const db = new MongoDatabase('mongodb://127.0.0.1:27017/', 'formation');

try{
  await db.connect();

}catch(err){
  console.log(err.message);
}

app.use(router.routes());
await app.listen({ port: 8080 })
