let db;

// Create a database connection request
const request = indexedDB.open("budget", 1);

// Create an object store for pending transactions
request.onupgradeneeded = event => {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

// Handle error
request.onerror = event => {
    console.log("Ruh Roh... Looks like there's an issue with your indexedDB: " + event.target.errorCode);
};

// Handle success
request.onsuccess = event => {
    db = event.target.result;
    
    // Check if app is online before accessing db
    if (navigator.onLine) checkDatabase();
};

function checkDatabase () {

    // Open a transaction on pending db, access object store, and get all records
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.createObjectStore("pending");
    const allRecords = store.getAll();

    // Update the database with pending transactions
    allRecords.onsuccess() = () => {
        if (allRecords.result.length > 0) {

            // Access this api route
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(allRecords.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {

                // If successful, log it
                console.log("db updated successfully");

                // Open a transaction, access the object store and clear it
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            })
            .catch(err => console.error(err));
        }
    };
};