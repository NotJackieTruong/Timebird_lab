var express = require('express');
var router = express.Router();
var fetch = require('fetch')
var {
  aesDecrypt, aesEncrypt, rsaEncryptWithPubKey, rsaEncryptWithPrivateKey, rsaDecryptWithPrivateKey, rsaDecryptWithPublicKey
} = require('../js/enc_dec');
const { v4: uuidv4 } = require('uuid');
var Wallet = require('../models/wallet')
var Role = require('../models/role')
var async = require('async');
const wallet = require('../models/wallet');
const mongoose = require('mongoose')
const fs = require('fs')
require('dotenv').config()

var gameAddress = (process.env.GAME_ADDRESS || 'http://localhost:3002')
var gamePlatformAddress = (process.env.GAME_PLATFORM_ADDRESS || 'http://localhost:3000')
var ssoAddress = (process.env.SSO_ADDRESS || 'http://localhost:3001')

function parseJwt(token) {
  var base64Payload = token.split('.')[1];
  var payload = Buffer.from(base64Payload, 'base64');
  return JSON.parse(payload.toString());
}

const writeBaseUrlToFile = (baseUrl, userName) => {
  fs.writeFile(`./public/gameProviderPubKey/${userName}_base_url.pem`, baseUrl, (err) => {
    if (err) console.error(err)
  })
}

const writePubKeyToFile = (pubKey, userName) => {
  fs.writeFile(`./public/gameProviderPubKey/${userName}_pub_key.pem`, pubKey, (err) => {
    if (err) console.error(err)
  })
}

const findWallet = (userId) => {
  var wallet = Wallet.findOne({ address: userId }).exec()
  return wallet
}

const findRole = (userId) => {
  var role = Role.findOne({ userId: userId }).exec()
  return role
}

// Pass in function expiration date to check token 
const checkToken = (exp) => {
  if (Date.now() <= exp * 1000) {
    console.log(true, 'token is not expired')
    return true
  } else {
    console.log(false, 'token is expired')
    return false
  }
}

// home page 
router.get('/', function (req, res) {
  res.render('home', {})
})

// login
router.post('/signIn', (req, res) => {
  console.log('req body: ', req.body)
  fetch.fetchUrl(`${ssoAddress}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify(req.body)
  }, (err, meta, result) => {
    console.log('result: ', result.toString('utf-8'))
    const fetchResponse = JSON.parse(result.toString('utf-8'))
    res.send(fetchResponse)
  })
})

// sign up
router.get('/signUp', (req, res) => {
  res.render('signUp', {})

})

router.post('/signUp', (req, res) => {
  console.log('req body: ', req.body)
  var userRole = req.body.role
  var userRSAKey = req.body.rsaKey
  var userBaseURL = req.body.baseUrl
  fetch.fetchUrl(`${ssoAddress}/register`, {
    method: "POST",
    payload: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' }
  }, (err, meta, result) => {
    var fetchResponse = JSON.parse(result.toString('utf-8'))
    var payload = parseJwt(fetchResponse.accessToken)
    if (userRole) {
      new Role({
        userId: payload.id,
        role: userRole
      }).save()
      writeBaseUrlToFile(userBaseURL, payload.name)
      writePubKeyToFile(userRSAKey, payload.name)
    }
    res.send({ message: 'Create user successfully!' })
  })
})

// logout
router.post('/signOut', async (req, res) => {
  console.log('req body: ', req.body)
  var accessToken = req.body.accessToken
  console.log('token: ', accessToken)
  // decrypt access token with RSA
  var rsaAccessTokenDecrypt = await rsaDecryptWithPrivateKey(req.body.accessToken, './bin/private.pem')
  console.log('access token after rsa decrypting: ', rsaAccessTokenDecrypt)

  // decrypt aes access token with AES
  var aesAccessTokenDecrypt = aesDecrypt(rsaAccessTokenDecrypt)
  console.log('access token after aes decrypting: ', aesAccessTokenDecrypt)

  const postObj = {
    accessToken: aesAccessTokenDecrypt
  }

  fetch.fetchUrl(`${ssoAddress}/logout`, {
    method: 'POST',
    payload: JSON.stringify(postObj),
    headers: { 'Content-Type': 'application/json' }
  }, function (err, meta, result) {
    console.log('result in index game platform: ', result)
  })
  res.send({})
})

// post encrypt access token
router.post('/handleAccessToken', async (req, res) => {
  console.log('req body: ', req.body)
  var accessToken = req.body.accessToken
  console.log('access token: ', accessToken)

  var payload = parseJwt(accessToken)
  console.log('jwt: ', payload)
  // encrypt access token with AES
  var aesAccessTokenEncrypt = aesEncrypt(accessToken)
  console.log('access token after aes encrypting: ', aesAccessTokenEncrypt)

  // encrypt aes access token with RSA
  var rsaAccessTokenEncrypt = rsaEncryptWithPubKey(aesAccessTokenEncrypt, './bin/public.pem')
  console.log('access token after rsa encrypting: ', rsaAccessTokenEncrypt)
  Wallet.findOne({ address: payload.id }).exec((err, result) => {
    if (err) throw err
    if (!result) {
      new Wallet({
        address: payload.id,
        book: []
      }).save()
    }
  })
  Role.findOne({ userId: payload.id }).exec((err, result) => {
    if (err) throw err
    if (!result) {
      new Role({
        userId: payload.id,
        role: 'user'
      }).save((err, result) => {
        if (err) throw err
        res.send({ accessToken: rsaAccessTokenEncrypt, payload, role: result.role })

      })
    } else {
      res.send({ accessToken: rsaAccessTokenEncrypt, payload, role: result.role })

    }
  })

})

// check access token
router.post('/checkAccessToken', (req, res) => {
  console.log('req body: ', req.body)
  var accessToken = req.body.accessToken
  console.log('token: ', accessToken)
  // decrypt access token with RSA
  var rsaAccessTokenDecrypt = rsaDecryptWithPrivateKey(req.body.accessToken, './bin/private.pem')
  console.log('access token after rsa decrypting: ', rsaAccessTokenDecrypt)

  // decrypt aes access token with AES
  var aesAccessTokenDecrypt = aesDecrypt(rsaAccessTokenDecrypt)
  console.log('access token after aes decrypting: ', aesAccessTokenDecrypt)


  var payload = parseJwt(aesAccessTokenDecrypt)
  console.log('payload: ', payload)

  var isExisted = checkToken(payload.exp)
  res.send({ isExisted: isExisted })

})

// MANAGEMENT
// management page
router.get('/management/users', (req, res) => {
  Role.find({}).exec((err, roleResult) => {
    if (err) throw err

    fetch.fetchUrl(`${ssoAddress}/users`, {
      method: 'GET',
    }, (err, meta, result) => {
      var users = JSON.parse(result.toString('utf-8')).users
      var userArray = users.filter(user => {
        user.role = roleResult.find(res => {
          return res.userId === user._id
        })
        user.avatar = `${ssoAddress}${user.avatar}`
        return user
      })
      // if (users.length !== 0) {
      //   var userArray = users.filter(async user => {
      //     var wallet = await findWallet(user._id)
      //     var role = await findRole(user._id)

      //     console.log('wallet: ', wallet)
      //     var user1 = {...user, wallet: wallet, role: role}
      //     return user1
      //   })

      // }
      res.render('management', { users: userArray })

    })
  })

})

// edit user
router.put('/management/:id', (req, res) => {
  console.log('req id: ', req.params.id)
  const userRole = req.body.role
  console.log('use role: ', userRole)
  if (userRole) {
    Role.findOneAndUpdate({ userId: req.params.id }, { $set: { role: userRole } }, (err, result) => {
      if (err) throw err
      console.log('result: ', result)
    })
  }
  fetch.fetchUrl(`${ssoAddress}/users/${req.params.id}`, {
    method: "PUT",
    payload: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' }
  }, (err, meta, result) => {
    console.log('result: ', result)
    const fetchResponse = JSON.parse(result.toString('utf-8'))
    res.send({ message: fetchResponse.message, payload: fetchResponse.userInfo })
  })
})

// get me
router.get('/management/:id', function (req, res) {
  console.log('id: ', req.params.id)

  fetch.fetchUrl(`${ssoAddress}/users/${req.params.id}`, {
    method: 'GET'
  }, function (err, meta, result) {
    console.log('meta in index game platform: ', meta)
    var result = result ? JSON.parse(result.toString('utf-8')) : null
    console.log('result in index game platform: ', result)
    // res.render('me')
    var userInfo = result.userInfo
    userInfo.avatar = `${ssoAddress}${userInfo.avatar}`
    Role.findOne({ userId: userInfo._id }).exec((err, result) => {
      if (err) throw err
      res.render('me', { userInfo: userInfo, role: result.role })

    })
  })

})

// delete user
router.delete('/management/:id', (req, res) => {
  fetch.fetchUrl(`${ssoAddress}/users/${req.params.id}`, {
    method: 'DELETE',
  }, (err, meta, result) => {
    res.send({ message: result.message })
  })
})

// get accepted games
router.get('/management/games/accepted', (req, res) => {
  res.render('acceptedGame', {})
})

// get submitting game
router.get('/management/games/submitting', (req, res) => {
  res.render('submittingGame', {})
})

// get dashboard
router.get('/management/games/dashboard', (req, res) => {
  res.render('dashboard', {})
})

// create new user from root level
router.get('/createNewUser', (req, res) => {
  res.render('createNewUser', {})
})

router.get('/game', function (req, res) {
  res.render('game', { game: 'Game 1' })
})

router.post('/tokens', function (req, res) {
  console.log('req body: ', req.body)
  var trans = {
    transNumb: uuidv4(),
    transDate: new Date().getTime(),
    srcAddress: req.body.srcAddress,
    destAddress: req.body.destAddress,
    amount: req.body.value

  }
  console.log('trans: ', trans)
  async.parallel({
    srcWallet: callback => {
      Wallet.findOneAndUpdate({ address: req.body.srcAddress }, { $push: { 'book': trans } }).exec(callback)
    },
    destAddress: callback => {
      Wallet.findOneAndUpdate({ address: req.body.destAddress }, { $push: { 'book': trans } }).exec(callback)
    }
  }, (err, results) => {
    if (err) throw err
    console.log('src wallet: ', results.srcWallet)
    console.log('dest wallet: ', results.destAddress)


    if (results.srcWallet && results.destAddress) {
      res.send('Update src and dest wallet successfully!')
    }
  })

})

// test get hompage
router.get('/testHome', (req, res) => {
  res.render('testHome')
})

module.exports = router;
