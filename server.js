var express = require('express');
var app = express();
var http = require('http');

var server = http.createServer(app);

var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");

mongoose.connect("127.0.0.1/appathon");

app.post('/registerDevice', function (req,res) {
    var user = new User({
        username: req.body.username,
        password: req.body.password,
        deviceId: req.body.deviceId,
        fullName: req.body.fullName,
        dateCreated: new Date(),
        contacts: []
    });

    user.save(function(err){
        if(err)return res.status(500).json(err);
        else return res.status(200).send();
    });

});

app.post('/login', function (req, res) {
    User.findOne({
        deviceId: req.body.deviceId.toString(),
        password: req.body.password.toString()
    }).exec(function (err,user) {
        if(err)return res.status(500).json(err);
        if(!user)return res.status(500).json({
            message: "User not found"
        });

        delete user.password;

        var token = jwt.sign(user, jwtSecret, { expiresInMinutes: 60*5 });

        res.send(token);

    });
});

require("./socket.js")(server);



server.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});