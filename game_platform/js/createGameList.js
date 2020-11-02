const gameListHTML = `
<div class="col-12">
<!-- Card -->
<div class="card card-horizontal">

  <!-- Card image -->
  <img class="card-img-top" src="https://mdbootstrap.com/img/Photos/Others/images/43.jpg"
    alt="Card image cap">

  <!-- Card content -->
  <div class="card-body">

    <!-- Title -->
    <h4 class="card-title"><a>Card title</a></h4>
    <!-- Text -->
    <p class="card-text">Some quick example text to build on the card title and make up the bulk of
      the
      card's
      content.</p>
  </div>

  <!-- Card footer -->
  <div class="card-footer">
    <!-- Button -->
    <a href="#" class="btn btn-blue-grey">Button</a>
  </div>

</div>
<!-- Card -->

</div>
`

export const createGameList = (object, query) => {
  const div = document.createElement('div')
  div.className = 'row mb-4 mt-4'
  div.innerHTML = gameListHTML
  document.querySelector(`${query}`).appendChild(div)
}