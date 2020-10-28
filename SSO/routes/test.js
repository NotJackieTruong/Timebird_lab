var fs = require('fs')
// require('../../game_platform/public/images')
fs.writeFile('../../game_platform/public/images/abc.txt', 'hello 123 456', (err)=>{
  if(err) console.error(err)
  console.log('saved')
})