let db;

// Create a database connection request
const request = indexedDB.open("budget", 1);

// Create an object store for pending transactions
request.onupgradeneeded = event => {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onerror = event => {
    console.log("Ruh Roh... Looks like there's an issue with your indexedDB: " + event.target.errorCode);
};

