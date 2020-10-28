var logoutArray = [
  {
    name: 'a',
    time: 8
  },
  {
    name: 'b',
    time: 7
  },
  {
    name: 'c',
    time: 6
  },
  {
    name: 'd',
    time: 5
  },
]
const length = logoutArray.length
for(var i=0;i<length; i++){
  var timeout = setTimeout(() => {
    logoutArray.splice(logoutArray.indexOf(logoutArray[0]), 1)
    console.log('log out array: ', logoutArray)
  
  }, (parseInt(10 - logoutArray[0].time)) * 2000)
  console.log('time out: ', logoutArray)
}


// var interval = setInterval(() => {
//   logoutArray.splice(logoutArray.indexOf(logoutArray[0]), 1)
//   console.log('log out array: ', logoutArray)
// }, 5000);