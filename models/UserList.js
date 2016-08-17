var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userListSchema = new Schema({
    user: String,
    socketID: String
});

var UserList = mongoose.model('UserList', userListSchema);

module.exports = UserList;
