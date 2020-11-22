var express = require('express');
var router = express.Router();
var User = require('../models/user')
var jwt = require('jsonwebtoken');
const fs = require('fs')
const async = require('async')
var filePath = './routes/logout.json'
const atob = require('atob')
const btoa = require('btoa')
const mongoose = require('mongoose')
const {
  aesDecrypt, aesEncrypt, rsaEncryptWithPubKey,
  rsaEncryptWithPrivateKey, rsaDecryptWithPrivateKey, rsaDecryptWithPublicKey
} = require('../js/enc_dec');
const accessTokenSecret = 'somerandomaccesstoken';
const refreshTokenSecret = 'somerandomstringforrefreshtoken';
const refreshTokens = [];

require('dotenv').config()


var gameAddress = (process.env.GAME_ADDRESS || 'http://localhost:3002')
var gamePlatformAddress = (process.env.GAME_PLATFORM_ADDRESS || 'http://localhost:3000')
var ssoAddress = (process.env.SSO_ADDRESS || 'http://localhost:3001')

// var rootAccount = {
//   _id: new mongoose.Types.ObjectId('5f8d6dbf59e889d8522259af'),
//   // role: "root",
//   name: "abc",
//   email: "abc@email.com",
//   password: "123",
//   avatar: "/images/abc123.png"
// }

const saveAvatarToPublicFolder = (obj, callback) => {
  var userInfo = obj
  if (userInfo.avatar) {
    var avatar = userInfo.avatar
    let base64Ext = avatar.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0].split('/')[1]
    let base64data = avatar.replace(/^data:image\/[a-z]+;base64,/, "")
    if (base64data) {
      fs.writeFile(`./public/images/${userInfo.name}.${base64Ext}`, base64data, 'base64', (err) => {
        if (err) console.error(err)
        userInfo.avatar = `/images/${userInfo.name}.${base64Ext}`
        callback(userInfo)

      })
    }
  } else {
    callback(userInfo)

  }
}

const deleteAvatarFromPublicFolder = (obj, callback) => {
  fs.unlink(`./public${obj.avatar}`, (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log('Delete avatar successfully!')
    }
    callback()

  })
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Iframe' });
});

// get register
router.get('/register', (req, res) => {
  res.render('register', {})
})

// post register
router.post('/register', (req, res) => {
  console.log('req: ', req.body)
  saveAvatarToPublicFolder(req.body, (userInfo) => {
    var user = new User(userInfo)
    user.save((err, result) => {
      if (err) throw err
      if (result) {
        // sign jwt
        const accessToken = jwt.sign({ id: result._id, name: result.name }, accessTokenSecret, { expiresIn: '20m' });
        const refreshToken = jwt.sign({ id: result._id, name: result.name }, refreshTokenSecret);
        refreshTokens.push(refreshToken);
        console.log('access token: ', accessToken)

        res.send({ accessToken: accessToken, url: `${gamePlatformAddress}/home` })
      } else {
        res.send({ message: 'Failed to register!', url: `${gamePlatformAddress}` })

      }

    })
  })


})

// get login
router.get('/login', (req, res) => {

})

// login
router.post('/login', (req, res) => {
  console.log('req', req.body)
  const reqJWT = req.body.jwt
  User.findOne({ email: req.body.email }).select('name _id isActive').exec((err, result) => {
    if (err) throw err
    console.log('result of login: ', result.isActive)
    if (result && result.isActive) {
      // create accesss and refresh token
      const accessToken = jwt.sign({ id: result._id, name: result.name }, accessTokenSecret, { expiresIn: '20m' });
      const refreshToken = jwt.sign({ id: result._id, name: result.name }, refreshTokenSecret);
      refreshTokens.push(refreshToken);
      console.log('access token: ', accessToken)
      res.send({ accessToken: accessToken, url: `${gamePlatformAddress}` })

    } else {
      res.send({ message: 'Email or password is invalid or your account is not active!', url: `${gamePlatformAddress}` })
    }
  })

})

// management
router.get('/users', (req, res) => {
  User.find({}).exec((err, result) => {
    if (err) throw err
    res.send({ users: result })
  })
})

// get me
router.get('/users/:id', (req, res) => {
  console.log('req params: ', req.params.id)
  console.log('path: ', '')
  try {
    User.findOne({ _id: req.params.id }).exec((err, result) => {
      if (err) throw err
      // res.render('me', { userInfo: result })
      res.send({ userInfo: result })
    })
  } catch (err) {
    console.error(err)
  }

})

// delete
router.delete('/users/:id', (req, res) => {
  console.log('id: ', req.params.id)
  User.findOne({ _id: req.params.id }).exec((err, result) => {
    if (err) throw err
    deleteAvatarFromPublicFolder(result, () => {
      User.findOneAndDelete({ _id: req.params.id }).exec((err, result) => {
        if (err) throw err
        res.send({ message: 'Delete successfully!' })
      })
    })
  })

})

// update
router.put('/users/:id', (req, res) => {
  console.log('id: ', req.params.id)
  console.log('body: ', req.body)
  saveAvatarToPublicFolder(req.body, (userInfo) => {
    User.findOneAndUpdate({ _id: req.params.id }, { $set: userInfo }, { new: true }).exec((err, result) => {
      if (err) throw err
      res.send({ message: 'Update sucessfully', userInfo: result })
    })
  })
})

// logout
var logoutArray = []
router.post('/logout', (req, res) => {
  console.log('req body: ', req.body)
  var value = JSON.parse(atob(req.body.accessToken.split('.')[1]));
  console.log('value: ', value)
  logoutArray.push(req.body.accessToken)
  var timeSpan = new Date(Date.now()).getTime() - value.expiresIn
  var timeout = setTimeout(() => {
    logoutArray.splice(logoutArray.indexOf(req.body.accessToken))
  }, timeSpan)
  // fileContent.push(value)

  fs.writeFileSync(filePath, JSON.stringify(logoutArray))
  // jwt.verify(req.body.accessToken, accessTokenSecret, (err, decoded) => {
  //   if (err) console.log('error: ', err)
  //   console.log('value abc: ', decoded)

  // })
  res.send('Logout')
})

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

const checkBase64 = (str) => {
  if (str === '' || str.trim() === '') { return false; }
  try {
    console.log('test result from checkBase64 1: ', btoa(atob(str)) == str)
    return btoa(atob(str)) == str;
  } catch (err) {
    console.log('test result from checkBase64 2: ', false)

    return false;
  }
}

module.exports = router;
