const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const Filter = require('bad-words');
const {generatetime} = require('../public/util/time');
const {locationtime} = require('../public/util/locationtime');
const socketio = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const {adduser , removeuser , getuser , getusersinroom} = require('./utils/users');
const io = socketio(server);
const publicpath = path.join(__dirname , '../public');
app.use(express.static(publicpath));


io.on('connection' , (socket)=>{
   console.log('web socket connection established');

    
    socket.on('join' , ({username , room} , callback)=>{
      const {error , user} = adduser({id:socket.id ,  username , room});
      if(error){
          return callback(error);
      }

      socket.join(user.room);
      io.to(user.room).emit('roomdata' , {room : user.room , users : getusersinroom(user.room)}); 
      socket.emit('printmessage' , generatetime('Admin' , `welcome ${user.username}`));
      socket.broadcast.to(user.room).emit('printmessage' , generatetime('Admin' , `${user.username} has joined the chat!`));
      callback();

    });

   socket.on('newmessage' , (messagedata , callback)=>{
       const filter = new Filter();
       if(filter.isProfane(messagedata)){
           return callback('bad words found - message cant be delivered');
       }
       const user = getuser(socket.id);
       console.log(user);
       io.to(user.room).emit('printmessage' ,  generatetime(user.username , messagedata));
       callback('delivered');
   });
    
   socket.on('disconnect' , ()=>{
       const user = removeuser(socket.id);
    
       if(user){
        io.to(user.room).emit('printmessage' , generatetime('Admin', `${user.username} has left the chat!`));    
        io.to(user.room).emit('roomdata' , {room : user.room , users : getusersinroom(user.room)});   
    }
       
   });
   
    socket.on('sendlocation' , (coords , callback)=>{
        const user = getuser(socket.id);
        console.log(user);
       io.to(user.room).emit('printlocation' , locationtime(user.username , `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
       callback();
   });



});

server.listen(port , (error)=>{
    if(error){
     console.log('error establishing connection')
    }else{
     console.log('listening on the port :' , port);
    }
});

