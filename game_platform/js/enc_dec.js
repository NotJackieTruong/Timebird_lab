const crypto = require('crypto')
const algorithm = 'aes-256-cbc'
// const key = crypto.randomBytes(32)
// const iv = crypto.randomBytes(16)
const ENC_KEY = Buffer.from("bf3c199c2470cb477d907b1e0917c17bbf3c199c2470cb477d907b1e0917c17b", "hex"); // set random encryption key
const IV = Buffer.from("5183666c72eec9e45183666c72eec9e4", "hex"); // set random initialisation vector
const path = require('path')
const fs = require('fs')

// encrypt with AES algorithm
const aesEncrypt = (text) => {
  let cipher = crypto.createCipheriv(algorithm, ENC_KEY, IV)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted.toString('hex')
}

// decrypt with AES algorithm
const aesDecrypt = (encrypted) => {
  var encryptedText = Buffer.from(encrypted, 'hex')
  let decipher = crypto.createDecipheriv(algorithm, ENC_KEY, IV)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

// RSA encrypt with pub key
const rsaEncryptWithPubKey = (text, publicKeyPath) => {
  const keyPath = path.resolve(publicKeyPath)
  const publicKey = fs.readFileSync(keyPath, 'utf-8')
  const buffer = Buffer.from(text, 'utf-8')
  const encrypted = crypto.publicEncrypt(publicKey, buffer)
  return encrypted.toString('base64')
}

// RSA encrypt with priv key
const rsaEncryptWithPrivateKey = (text, privateKeyPath) => {
  const keyPath = path.resolve(privateKeyPath)
  const privateKey = fs.readFileSync(keyPath, 'utf-8')
  const buffer = Buffer.from(text, 'utf-8')
  const encrypted = crypto.privateEncrypt({
    key: privateKey.toString(),
    passphrase: 'this is some secret of system'
  }, buffer)
  return encrypted.toString('base64')
}

// RSA decrypt with private key
const rsaDecryptWithPrivateKey = (encrypted, privateKeyPath) => {
  const keyPath = path.resolve(privateKeyPath)
  const privateKey = fs.readFileSync(keyPath, 'utf8')
  const buffer = Buffer.from(encrypted, 'base64')
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase: 'this is some secret of system',
    },
    buffer,
  )
  return decrypted.toString('utf8')
}

// RSA decrypt with public key
const rsaDecryptWithPublicKey = (encrypted, publicKeyPath) => {
  const keyPath = path.resolve(publicKeyPath)
  const publicKey = fs.readFileSync(keyPath, 'utf-8')
  const buffer = Buffer.from(encrypted, 'base64')
  const decrypted = crypto.publicDecrypt(
    publicKey,
    buffer,
  )
  return decrypted.toString('utf-8')
}

// test
var plaintext = 'some random plain text'
// var encrypt1 = aesEncrypt(plaintext)
// var encrypt2 = rsaEncryptWithPubKey(encrypt1, `public.pem`)
// var decrypt1 = rsaDecryptWithPrivateKey(encrypt2, `private.pem`)
// var decrypt2 = aesDecrypt(decrypt1)

// var decrypt = rsaDecryptWithPublicKey(encrypt, `public.pem`)
// console.log('encrypted text with aes algorithm: ', encrypt)
// console.log('encrypted text with aes algorithm: ', decrypt2)

module.exports = {
  aesDecrypt, aesEncrypt, rsaEncryptWithPubKey, rsaEncryptWithPrivateKey, rsaDecryptWithPrivateKey, rsaDecryptWithPublicKey
}