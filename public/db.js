let db;
const request = indexedDB.open("BudgetDB", 1)

// create new db request
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = event => {
  db = event.target.result
  if (navigator.online) {
    checkDatabase()
  }
};

request.onerror = event => {
  console.log(`Error: ${event.target.errorCode}`)
};

// functions to saveRecord and checkdatabase
function saveRecord(record) {
  // create a transaction on the pending object store in the budget db with readwrite access
  let transaction = db.transaction(["pending"], "readwrite");

  // access pending object store
  const store = transaction.objectStore("pending");

  // add record to your store with add method.
  store.add(record);
};

function checkDatabase() {
  // create a transaction on the pending object store in the budget db
  let transaction = db.transaction(["pending"], "readwrite");

  // access pending object store
  const store = transaction.objectStore("pending");

  // get all records from store and set to a variable
  const getAll = store.getAll();

  // if request was successful
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          // if successful, create a transaction on pending 
          const transaction = db.transaction(["pending"], "readwrite");

          // accesspending object store
          const store = transaction.objectStore("pending");

          // clear all items in your store
          store.clear();
        });
    }
  };
}

// event listener for app coming back online
window.addEventListener('online', checkDatabase);

