const mongoose = require('mongoose')

const User = mongoose.model('User', {
   token: {
      type: String,
      require: true
   },
   email: {
      type: String,
      require: true,
      unique: true
   },
   hash: {
      type: String,
      require: true
   },
   salt: {
      type: String,
      require: true
   },
   account: {
      username: {
         type: String,
         require: true,
         unique: true
      },
      name: {
         type: String,
         require: true
      },
      description: {
         type: String,
         require: true
      },
      photo: Object
   },
   rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
      }
    ]
})

module.exports = User