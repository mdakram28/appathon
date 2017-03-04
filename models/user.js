var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    password: String,
    fullName: String,
    dateCreated: String,
    contacts: String,
    deviceId: String
});

module.exports = mongoose.model('User', userSchema);