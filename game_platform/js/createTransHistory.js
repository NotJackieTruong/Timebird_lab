export const createTransHistory = (objArray, query) => {
  objArray.forEach(obj => {
    var tr = document.createElement('tr')
    tr.id = obj._id
    document.querySelectorAll('#trans-history-table thead th').forEach(element => {
      var prop = obj[element.id]
      var th = document.createElement('th')
      th.innerHTML = prop ? prop : '-'
      tr.appendChild(th)     
    })
    document.querySelector(query).appendChild(tr)
  });
}
