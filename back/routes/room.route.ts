import { Router } from "https://deno.land/x/oak@v13.2.5/mod.ts";
import { User } from "../models/type.ts";
import eventEmitter from "../events/room.events.ts";
import { RoomService } from "../services/room.service.ts"
import { db } from "../server.ts";

const router = new Router();
export const roomService = new RoomService();

router.post("/login", async (ctx) => {
  const data = await ctx.request.body.json();
  let room;
  if (data.roomId) {
    room = roomService.get(data.roomId);
  }
  if (!room) {
    room = roomService.creer(data.roomName);
  }
  const user = roomService.addUser(room.id, {
    id: null,
    vote: "",
    name: data.username,
  });
  db.insertIntoCollection('histo',{
    action:'login',
    room: room,
    user: user
  })
  ctx.response.status = 200;
  ctx.response.body = {
    userId: user?.id,
    room: room.sendJSON(),
  };
});

router.get("/events/:roomId/:userId", (ctx) => {
  const target = ctx.sendEvents();

  const user: User = {
    id: ctx.params.userId,
    vote: "",
    name: "",
    target: target,
  };

  eventEmitter.emit("connect", ctx.params.roomId, user);

  target.addEventListener("close", (evt) => {
    eventEmitter.emit("disconnect", ctx.params.roomId, user);
  });
});

router.put("/room/:roomId", async (ctx) => {
  const room = roomService.get(ctx.params.roomId);
  if (room) {
    try {
      let json = await ctx.request.body.json();
      db.insertIntoCollection('histo',{
        action:'Update info Room',
        room: ctx.params.roomId,
        body : json
      })
      roomService.updateInfo(room.id, json.description, json.url);
    } catch (e) {
      db.insertIntoCollection('histo',{
        action:'Update Status Room',
        room: room
      })
      roomService.updateStatus(room.id);
    }
    eventEmitter.emit("send", room, "updateRoom");
    ctx.response.status = 200;
  } else {
    ctx.response.status = 401;
  }
});

router.get("/room/:id", (ctx) => {
  db.insertIntoCollection('histo',{
    action:'Get Room',
    roomId: ctx.params.id
  })
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

router.put("/room/:roomId/voter", async (ctx) => {
  const data = await ctx.request.body.json();
  db.insertIntoCollection('histo',{
    action:'Voter',
    roomId: ctx.params.roomId,
    userId: data.userId,
    vote: data.vote
  })
  //console.log('voter', data);
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
