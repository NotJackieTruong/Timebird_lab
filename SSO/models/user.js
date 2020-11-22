var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
  email: {type: String,},
  password: {type: String},
  name: {type: String, max: 500},
  avatar: {type: String, default: 'https://cdn0.iconfinder.com/data/icons/set-ui-app-android/32/8-512.png'},
  createdAt: {type: Date, default: new Date(Date.now())},
  isActive: {type: Boolean, default: true},
  // role: {type: String, default: 'user'}
})

module.exports = mongoose.model('User', userSchema)