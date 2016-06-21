var express = require('express'),
    config = require('./config.js').configure(),
        app = express()
        , server = require('http').Server(app)
        , io = require('socket.io')(server) // create socket io instance on server side and listen them through http via express
        , bodyParser = require('body-parser') // for reading POSTed form data into `req.body`;
        , port = config.port || 8080
        , mysql = require('mysql');


// create mysql connection
var connection = mysql.createConnection(config.db);
        
// Starting HTTP server
server.listen(port, function(err) {
    if(err) {
        console.log(err);
    }
    var host = server.address().address
    var port = server.address().port
    console.log('Server listening at http://%s:%d', host, port);
});

app.use(express.static(__dirname + '/public'));

var rooms = {
    123:['pradeep','gourav','abhishek']
    ,124:['pradeep','satish','vipul']
    ,125:['pradeep','Amit','vipul','devender']
    ,126:['pradeep','Amit','vipul','devender']
    ,127:['pradeep','Amit','vipul','devender','ravi mathur']
};


// usernames which are currently connected to the chat
var usernames = {pradeep:'pradeep'};

var selectedRoom = '';
// routing
app.get('/', function (req, res) {
  res.sendFile(__dirname+'/public/index.html');
});

app.get('/chat/:room/:user', function (req, res) {
    selectedRoom = req.params.room;
    joinedUser = req.params.user;
    if(!selectedRoom) {
        res.redirect('/');
    }
  res.sendFile(__dirname+'/public/index.html');
});

/*app.error(function(err, req, res){
    if (err instanceof NotFound) {
        res.redirect('/');
    }
});*/


//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.redirect('/');
});
io.on('connection',function(socket){
    socket.emit('updaterooms',rooms,'');
    socket.emit('allrooms',rooms,'');
    console.log('here');    
    socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', {message:'you have connected to '+ newroom});
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', {message:socket.username+' has left this room'});
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', {message:socket.username+' has joined this room'});
		socket.emit('updaterooms', rooms, newroom);
	});
    
    
    // when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username,roomName){
        // store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = roomName;
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join(roomName);
		// echo to client they've connected
		//socket.emit('updatechat', 'SERVER', {u_type:'s',message:'you have connected to '+ roomName});
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(roomName).emit('updatechat', 'SERVER', {u_type:'s',message:username + ' has connected to this room'});
		//socket.emit('updaterooms', rooms, roomName);
	});
    
    
    // when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
    
    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
       console.log('disconnect');
        // remove the username from global usernames list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        //io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        //socket.broadcast.emit('updatechat', 'SERVER', {message:socket.username + ' has disconnected'});
        socket.leave(socket.room);
    });
    
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function() {
        io.sockets.in(socket.room).emit('typing', socket.username, socket.room);
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function() {
        io.sockets.in(socket.room).emit('stop typing', socket.username, socket.room);
    });
    
});