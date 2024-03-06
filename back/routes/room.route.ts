import { Router } from "https://deno.land/x/oak@v13.2.5/mod.ts";
import { User } from "../models/type.ts";
import eventEmitter from "../events/room.events.ts";
import { RoomService } from "../services/room.service.ts"

const router = new Router();
export const roomService = new RoomService();

router.post("/login", async (ctx) => {
  const data = await ctx.request.body.json();
  let room;
  if (data.roomId) {
    room = roomService.get(data.roomId);
  }
  if (!room) {
    room = roomService.creer(data.roomName, data.suit);
  }
  const user = roomService.addUser(room.id, {
    id: null,
    vote: "",
    name: data.username
  });  
  ctx.response.status = 200;
  ctx.response.body = {
    userId: user?.id,
    room: room.sendJSON(),
  };
});

router.get("/events/:roomId/:userId", async (ctx) => {
  const target = await ctx.sendEvents();
  
  console.log('Connect SSE : ',ctx.params.userId);
  
  target.addEventListener("close", () => {
    eventEmitter.emit("disconnect", ctx.params.roomId, user);
  });

  const user: User = {
    id: ctx.params.userId,
    vote: "",
    name: "",
    target: target,
  };

  eventEmitter.emit("connect", ctx.params.roomId, user);

});

router.put("/room/:roomId", async (ctx) => {
  const room = roomService.get(ctx.params.roomId);
  if (room) {
    try {
      const json = await ctx.request.body.json();      
      roomService.updateInfo(room.id, json.description, json.url);
    } catch (_e) {      
      roomService.updateStatus(room.id);
    }
    eventEmitter.emit("send", room, "updateRoom");
    ctx.response.status = 200;
  } else {
    ctx.response.status = 401;
  }
});

router.get("/room/:id", (ctx) => {
  const room = roomService.get(ctx.params.id);
  if (room) {
    ctx.response.status = 200;
    ctx.response.body = {
      room: {
        id: ctx.params.id,
        name: room.name,
      },
    };
  } else {
    ctx.response.status = 404;
    ctx.response.body = {
      room : {}
    };
  }
});

router.get('/rooms', (ctx) => {
  ctx.response.status=200;
  let result = [];
  for (const iterator of roomService.rooms.entries()) {
    result.push(iterator[1].sendJSON());
  }
  ctx.response.body = result;
})

router.put("/room/:roomId/voter", async (ctx) => {
  const data = await ctx.request.body.json();
  if (data.userId && data.vote) {
    const room = roomService.get(ctx.params.roomId);
    if (room) {
      roomService.setVote(room.id, {
        userId: data.userId,
        vote: data.vote,
      });
      eventEmitter.emit("send", room, "voter");
      ctx.response.status = 200;
    }
  }
});

router.get("/testing/:roomId", (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = roomService.get(ctx.params.roomId)?.sendJSON();
});

export default router;
