const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  userId: {type: Object},
  role: {type: String}
})

module.exports = mongoose.model('Role', roleSchema)