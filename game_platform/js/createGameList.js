const gameListHTML = `
<div class="col-12">
<!-- Card -->
<div class="card card-horizontal">

  <div class="card-img-container col-md-2">
    <!-- Card image -->
    <img class="card-img-top" id="image" src="https://mdbootstrap.com/img/Photos/Others/images/43.jpg"
      alt="Card image cap">
  </div>

  <!-- Card content -->
  <div class="card-body">

    <!-- Title -->
    <h4 class="card-title" id="name">Card title</h4>
    <!-- Text -->
    <p class="card-text" id="url">Some quick example text to build on the card title and make up the bulk of
      the
      card's
      content.</p>
  </div>

  <!-- Card footer -->
  <div class="card-footer">
    <!-- Button -->
    <button class="btn btn-blue-grey" id="accept">Accept</button>
  </div>

</div>
<!-- Card -->

</div>
`

export const createGameList = (object, query, type) => {
  const div = document.createElement('div')
  div.className = 'row mb-4 mt-4'
  div.innerHTML = gameListHTML
  div.querySelector('.card').id = object._id
  for (var prop in object) {
    if (div.querySelector(`div.card #${prop}`)) {
      prop === 'image' ? div.querySelector(`div.card #${prop}`).setAttribute('src', object[prop]) :
        div.querySelector(`div.card #${prop}`).innerHTML = object[prop]
    }
  }
  if(type !== 'submitting'){
    div.querySelector('.card-footer').removeChild(div.querySelector('button#accept'))
  }
  if(div.querySelector('button#accept')){
    div.querySelector('button#accept').addEventListener('click', (event) => {
      console.log('event: ', event.target.closest('.card'))
      $.ajax({
        type: 'PUT',
        url: `/management/games/submitting/${event.target.closest('.card').id}`,
        contentType: 'application/json',
        data: JSON.stringify({
          status: 'active'
        }),
        success: result => {
          console.log('result: ', result)
          window.location.reload()
        }
      })
    })
  }
 
  document.querySelector(`${query}`).appendChild(div)
}