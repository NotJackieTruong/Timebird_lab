var cardInnerHTML = `<!-- Card -->
<!-- Card image -->
<img class="card-img-top" src="https://mdbootstrap.com/img/Photos/Others/images/43.jpg" alt="Card image cap"
style="width: 16rem;">
<!-- Card content -->
<div class="card-body">
<!-- Title -->
<h4 class="card-title"><a></a></h4>
<!-- Text -->
</div>
<div class="card-footer">
<!-- Button -->
<button class="btn btn-default btn-sm" id="edit">Edit</button>
<button class="btn btn-danger btn-sm" id="delete">Delete</button>
</div>
<!-- Card -->`

var modalBody = `<div class="register-container">
<div class="form-group">
  <label for="avatar">Avatar</label>
  <cropper-wc title="abc" id="avatar"></cropper-wc>
</div>
<div class="form-group">
  <label for="name" class="bmd-label-floating">Name</label>
  <input type="text" class="form-control" id="name" name="name">
</div>
<div class="form-group">
  <label for="email" class="bmd-label-floating">Email address</label>
  <input type="email" class="form-control" id="email" name="email">
  <span class="bmd-help">We'll never share your email with anyone else.</span>
</div>
<div class="form-group">
  <label for="password" class="bmd-label-floating">Password</label>
  <input type="password" class="form-control" id="password" name="password">
</div>

</div>`
const select = document.createElement('div')
select.className = 'form-group'
select.innerHTML = `
<label for="role">Role</label>
<select class="browser-default custom-select role-select" id="role">
  <option value="root">Root</option>
  <option value="admin">Admin</option>
  <option value="gameProvider">Game provider</option>
</select>`

export const createUserCard = (user, role = 'root', elementName) => {
  var card = document.createElement('div')
  card.className = 'card'
  card.style.width = '16rem'
  card.id = user._id
  card.innerHTML = cardInnerHTML
  card.querySelector('h4.card-title').innerHTML = user.name
  for (var prop in user) {
    if (prop !== 'name' && prop !== 'password' && prop !== 'avatar' && prop !== '__v') {
      var cardText = document.createElement('p')
      cardText.className = 'card-text'
      cardText.innerHTML = `${prop}: ${user[prop]}`
      card.querySelector('.card-body').appendChild(cardText)
    }
    if (prop === 'avatar') {
      console.log('image: ', card.querySelector('img.card-img-top'))
      card.querySelector('img.card-img-top').setAttribute('src', user[prop])
    }
  }

  document.querySelector(`div#${elementName}`).appendChild(card)

  // delete user
  card.querySelector('button#delete').addEventListener('click', (event) => {
    console.log('event: ', event.target.closest('.card'))
    $.ajax({
      type: 'DELETE',
      url: `/management/${event.target.closest('.card').id}`,
      contentType: 'application/json',
      success: result => {
        console.log('result: ', result)
        window.location.reload()
      }
    })
  })

  // edit user
  card.querySelector('button#edit').addEventListener('click', (event) => {
    console.log('event: ', event.target)
    document.querySelector('.modal .modal-body').id = user._id
    document.querySelector('.modal .modal-body').innerHTML = modalBody
    document.querySelectorAll('.modal .modal-body input, .modal .modal-body select').forEach(element => {
      element.value = user[element.id]
    })
    if (role === 'root') {
      document.querySelector('.modal .modal-body').appendChild(select)
    }
    // update user info
    document.querySelector('.modal .modal-footer #update').addEventListener('click', (event) => {
      console.log('event: ', event.target)
      var obj = {
        avatar: document.querySelector('cropper-wc').getImageData(),
      }
      document.querySelectorAll('.modal .modal-body input').forEach(element => {
        obj[element.id] = element.value
      })
      var updateObj = role === "root" ? { ...obj, role: document.querySelector('.modal .modal-body select').value } : obj

      $.ajax({
        type: 'PUT',
        url: `/management/${document.querySelector('.modal .modal-body').id}`,
        contentType: 'application/json',
        data: JSON.stringify(updateObj),
        success: result => {
          console.log('result: ', result)
          window.location.reload()
        }
      })
    })
    $('#editUser').modal('show')
  })
}
