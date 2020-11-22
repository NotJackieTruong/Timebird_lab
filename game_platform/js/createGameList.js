const gameCardHTML = `
<!-- Card -->
<div class="card">

  <!--Card image-->
  <div class="view overlay">
    <img id="cover" class="card-img-top" src="https://mdbootstrap.com/img/Photos/Others/images/16.jpg"
      alt="Card image cap">
    <a href="#!">
      <div class="mask rgba-white-slight"></div>
    </a>
  </div>

  <!--Card content-->
  <div class="card-body">

    <!--Title-->
    <h4 class="card-title" id="name">Card title</h4>
    <!--Text-->
    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the
      card's content.</p>
    <!-- Provides extra visual weight and identifies the primary action in a set of buttons -->
    <button type="button" class="btn btn-md btn-primary" id="play">Play</button>

  </div>

</div>
<!-- Card -->
`

export const createGameList = (object, query, type) => {
  var div = document.createElement('div')
  div.className = 'col mb-4'
  div.innerHTML = gameCardHTML

  var cardDiv = div.querySelector('.card')
  cardDiv.setAttribute('data-url', object.url)
  cardDiv.id = object._id

  for (var prop in object) {
    if (div.querySelector(`#${prop}`)) {
      if (prop === 'cover') {
        div.querySelector(`#${prop}`).setAttribute('src', object[prop])
      } else {
        div.querySelector(`#${prop}`).innerHTML = object[prop]
      }
    }
  }
  div.querySelector('button#play').addEventListener('click', event => {
    handlePlayGame(event)
  })
  document.querySelector(`${query}`).appendChild(div)
}

const handlePlayGame = (event) => {
  var game = event.target.closest('.card').getAttribute('data-url')
  var gameId = event.target.closest('.card').id

  window.location.href = `/game?game=${game}&gameId=${gameId}`
}