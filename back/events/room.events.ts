import { EventEmitter } from "https://deno.land/std@0.110.0/node/events.ts";
import { Room } from "../models/Room.ts";
import { rooms } from "../server.ts";
import { User } from "../models/type.ts";
import { roomService } from "../routes/room.route.ts";

const eventEmitter = new EventEmitter();

eventEmitter.on("connect",(roomId: string,user: User) => {
  const room = roomService.get(roomId);
  if(room){
    roomService.addUser(roomId,user);;
    eventEmitter.emit('send', room, 'connect');
  }
})

eventEmitter.on('disconnect', (roomId: string, user: User) => {
  const room = roomService.get(roomId);
  //console.log('disconnect', roomId, user.id);
  if(room){
    roomService.removeUser(roomId, user.id??'');
    if(room.users.length===0){
      roomService.removeRoom(room.id);
    }else{
      roomService.set(room);
    }    
    eventEmitter.emit('send', room, 'disconnect');
  }
});

eventEmitter.on('send', (room: Room, call: string)=>{
  if(room.users.length>0){
    room.users.forEach((user)=>{
      //console.log('send', user);  
      if(user.target){
        user.target.dispatchMessage(
          `data: ${JSON.stringify(room.sendJSON())}`
        );
      }
    })
  }
});

export default eventEmitter;