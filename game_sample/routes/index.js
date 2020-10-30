var express = require('express');
var router = express.Router();
var fetch = require('fetch')
require('dotenv').config()

var gameAddress = (process.env.GAME_ADDRESS || 'http://localhost:3002')
var gamePlatformAddress = (process.env.GAME_PLATFORM_ADDRESS || 'http://localhost:3000')
var ssoAddress = (process.env.SSO_ADDRESS || 'http://localhost:3001')

const parseJwt = (token) => {
  try {
    var base64Payload = token.split('.')[1];
    var payload = Buffer.from(base64Payload, 'base64');
    return JSON.parse(payload.toString());
  } catch (err) {
    console.error(err)
    return
  }

}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Game sample' });
});

router.post('/wallet', (req, res, next) => {
  console.log('req body: ', req.body)
  try {
    var payload = parseJwt(req.body.jwt)
    console.log('payload from wallet: ', payload)

    fetch.fetchUrl(`${gamePlatformAddress}/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload)
    }, (err, meta, result) => {
      console.log('result: ', result)
      if (result) {
        const fetchResponse = JSON.parse(result.toString('utf-8'))
        console.log('fetch response: ', fetchResponse)
        res.send({
          username: fetchResponse.name,
          token: fetchResponse.amount,
          avatar: fetchResponse.avatar,
          userId: fetchResponse._id
        })
      }

    })
  } catch (error) {
    console.error(error)
  }

})

router.post('/updateToken', (req, res, next) => {
  console.log('req body: ', req.body);
  fetch.fetchUrl(`${gamePlatformAddress}/updateToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(req.body)
  }, (err, meta, result)=>{
    // if(result){
    //   var fetchResponse = JSON.parse(result.toString('utf-8'))
    //   console.log('fetch response: ', fetchResponse)
    //   res.send(fetchResponse)
    // }
  })
 
})

module.exports = router;
