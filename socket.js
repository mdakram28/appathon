var socketioJwt = require('socketio-jwt');
var socketIo = require('socket.io')();
var User = require("./models/user");

var sockets = {};

var pendingMessages = {};

function sendOffline(socket) {
    socket.user.contacts.forEach(function(contact){
        if(sockets[contact.username]){
            sockets[contact.username].emit('offline',socket.user.username);
        }
    });
}

function sendOnline(socket) {
    socket.user.contacts.forEach(function(contact){
        if(sockets[contact.username]){
            sockets[contact.username].emit('online',socket.user.username);
        }
    });
}

function sendContacts(socket) {
    var ret = [];
    socket.user.contacts.forEach(function (contact) {
        ret.push({
            username: contact.username,
            online: sockets[contact]!=undefined
        });
    });
    socket.emit('contacts',ret);
}

function sendMessage(from,to,msg) {
    if(!sockets[to]){
        if(!pendingMessages[to])pendingMessages = [];
        pendingMessages[to].push(msg);
    }else{
        to.emit('message',msg);
    }
}

module.exports = function (server) {

    var sio = socketIo.attach(server);
    sio.set('authorization', socketioJwt.authorize({
        secret: '87g&*Tg8g^YG87678*&*(',
        handshake: true
    }));

    sio.sockets
        .on('connection', function (socket) {
            console.log(socket.handshake.decoded_token, 'connected');

            socket.user = socket.handshake.decoded_token;

            sockets[socket.user.username] = socket;

            sendOnline(socket);

            User.findOne({
                username: user.username
            }).populate('contacts').exec(function (err,user) {
                if(err)throw err;
                socket.user = user;
                
                sendContacts(socket);
            });

            socket.on('open',function (data) {
                var contact = socket.user.contacts.filter(function (obj) {
                    return obj.username == data.username;
                });
                if(contact.length == 0)return;
                contact = contact[0];
                socket.on('send',function (data) {
                    sendMessage(socket,contact.username,data);
                });
            });
            
            socket.on('disconnect',function (data) {
                sendOffline(socket);
                delete sockets[socket.user.username];
            });
        });

}
