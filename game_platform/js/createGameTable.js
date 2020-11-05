export const createGameTable = (objArray, query) => {
  objArray.forEach(obj => {
    var tr = document.createElement('tr')
    tr.id = obj._id
    document.querySelectorAll('#submitting-game-table thead th').forEach(element => {
      var prop = obj[element.id]
      var th = document.createElement('th')
      var td = document.createElement('td')

      switch (element.id) {
        case ('cover'):
          var cover = document.createElement('img')
          cover.src = prop
          cover.className = 'game-cover'
          td.style.padding = '0'
          td.appendChild(cover)
          tr.appendChild(td)
          break
        case ('option'):
          var button = document.createElement('button')
          button.className = 'btn btn-blue-grey btn-sm'
          button.id = 'accept'
          button.innerHTML = 'Accept'
          button.addEventListener('click', event => {
            handleAcceptGame(event)
          })
          td.appendChild(button)
          tr.appendChild(td)
          break
        default:
          th.innerHTML = obj[element.id] ? obj[element.id] : '-'
          tr.appendChild(th)
      }
    })
    document.querySelector(query).appendChild(tr)
  });
}

const handleAcceptGame = (event) => {
  $.ajax({
    type: 'PUT',
    url: `/management/games/submitting/${event.target.closest('tr').id}`,
    contentType: 'application/json',
    data: JSON.stringify({
      status: 'active'
    }),
    success: result => {
      console.log('result: ', result)
      window.location.reload()
    }
  })
}