const userCardHTML = `
<div class="col-12">
<!-- Card -->
<div class="card card-horizontal">

  <!-- Card image -->
  <img id="avatar" class="card-img-top" src="https://mdbootstrap.com/img/Photos/Others/images/43.jpg"
    alt="Card image cap">

  <!-- Card content -->
  <div class="card-body">

    <!-- Title -->
    <h4 class="card-title"><p id="name">Card title</p></h4>
    <!-- Text -->
    <p class="card-text" id="_id"></p>
    <p class="card-text" id="email"></p>
  </div>

  <!-- Card footer -->
  <div class="card-footer">
    <button class="btn btn-blue-grey" id="edit">Edit</button>
    <button class="btn btn-elegant" id="delete">Delete</button>

  </div>

</div>
<!-- Card -->
</div>

`

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
<label for="role">Role</label>
<select class="browser-default custom-select role-select" id="role">
  <option value="root">Root</option>
  <option value="admin">Admin</option>
  <option value="gameProvider">Game provider</option>
</select>

</div>`

export const createUserManagement = (object, query) => {
  const div = document.createElement('div')
  div.className = 'row mb-4 mt-4'
  div.innerHTML = userCardHTML
  div.querySelector('div.card').id = object._id
  div.querySelectorAll('.card .card-body p').forEach(element => {
    element.innerHTML = object[element.id]
  })
  div.querySelector('.card #avatar').setAttribute('src', object.avatar)
  document.querySelector(query).appendChild(div)
  const card = div.querySelector('.card')

  // delete button
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

  // edit button
  card.querySelector('button#edit').addEventListener('click', (event) => {
    console.log('event: ', event.target)
    document.querySelector('.modal .modal-body').id = object._id
    document.querySelector('.modal .modal-body').innerHTML = modalBody
    document.querySelectorAll('.modal .modal-body input, .modal .modal-body select').forEach(element => {
      element.value = object[element.id]
    })

    // update object info
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