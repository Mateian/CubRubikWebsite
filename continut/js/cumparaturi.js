var listaProduse = [];
var saveType = "local";

document.getElementById("cumparaturi-save-data-type").addEventListener("change", (e) => {
    localStorage.setItem("selectedSaveType", e.target.value);
    if(e.target.value === "local") {
        storage = new LocalStorageStorage();
    } else {
        storage = new IndexDBStorage();
    }
});

class StorageBase {
    constructor() {
        if(this.constructor === StorageBase) {
            throw new Error("Nu se poate initializa cu o clasa abstracta.");
        }
    }

    getValue() {
        throw new Error("Metoda getValue() trebuie implementata.")
    }

    salveaza() {
        throw new Error("Metoda salveaza() trebuie implementata.");
    }

    incarca() {
        throw new Error("Metoda load() trebuie implementata.");
    }

    curata() {
        throw new Error("Metoda curata() trebuie implementata.");
    }
}

class LocalStorageStorage extends StorageBase {
    constructor() {
        super();
    }

    getValue() {
        return "local";
    }

    salveaza(listaProduse) {
        localStorage.setItem("cumparaturi", JSON.stringify(listaProduse));
    }

    incarca() {
        const data = localStorage.getItem("cumparaturi");
        return data ? JSON.parse(data) : [];
    }

    curata() {
        localStorage.removeItem("cumparaturi");
    }
}

class IndexDBStorage extends StorageBase {
    constructor() {
        super();
        this.dbName = "cumparaturiDB";
        this.dbVersion = 4;
    }
    getValue() {
        return "db";
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject("Nu s-a reusit deschiderea IndexedDB: ", event.target.errorCode);
            };

            request.onupgradeneeded  = (event) => {
                const db = event.target.result;


                if(db.objectStoreNames.contains("produse")) {
                    db.deleteObjectStore("produse");
                }
                
                db.createObjectStore("produse", { 
                    keyPath: "id",
                    autoincrement: true
                });
            };
        });
    }

    async salveaza(listaProduse) {
        const db = await this.openDB();
        const transaction = db.transaction("produse", "readwrite");
        const store = transaction.objectStore("produse");

        listaProduse.forEach(produs => {
            store.add(produs);
        });

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject("Esuare salvare IndexedDB: " + event.target.errorCode);
        });
    }

    async incarca() {
        const db = await this.openDB();
        const transaction = db.transaction("produse", "readonly");
        const store = transaction.objectStore("produse");
        const allItems = store.getAll();

        return new Promise((resolve, reject) => {
            allItems.onsuccess = () => resolve(allItems.result);
            allItems.onerror = (event) => reject("Esuare la incarcare IndexedDB: " + event.target.errorCode);
        });
    }

    async clear() {
        const db = await this.openDB();
        const transaction = db.transaction("produse", "readwrite");
        const store = transaction.objectStore("produse");

        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject("Failed to clear IndexedDB: " + event.target.errorCode);
        });
    }
}

const worker = new Worker("js/worker.js");

const butonAdauga = document.getElementById("cumparaturi-input-button");

const tabelCumparaturi = document.getElementById("cumparaturi-table");

function buttonEvent() {
    const numeProdus = document.getElementById("cumparaturi-input-text-nume").value;
    const cantitateProdus = document.getElementById("cumparaturi-input-number-cantitate").value;

    worker.postMessage({
        actiune: "adauga_produs",
        numeProdus: numeProdus,
        cantitateProdus: cantitateProdus
    });
};

worker.onmessage = (event) => {
    if (event.data.actiune === "adauga_produs") {
        console.log("Web Worker a procesat adaugarea unui produs: ", event.data.produs);

        listaProduse.push(event.data.produs);

        let trElement = document.createElement("tr");
        let tdElement1 = document.createElement("td");
        let tdElement2 = document.createElement("td");

        tdElement1.innerHTML = event.data.produs.nume;
        tdElement2.innerHTML = event.data.produs.cantitate;

        trElement.appendChild(tdElement1);
        trElement.appendChild(tdElement2);

        tabelCumparaturi.appendChild(trElement);
        storage = document.getElementById("cumparaturi-save-data-type").value === "local" ? new LocalStorageStorage() : new IndexDBStorage();
        storage.salveaza(listaProduse);

        // let chooseSave = document.getElementById("cumparaturi-save-data-type").value;
        // if (chooseSave === "local") {
        //     localStorage.setItem("produs" + listaProduse.length + "nume", event.data.produs.nume);
        //     localStorage.setItem("produs" + listaProduse.length + "cantitate", event.data.produs.cantitate);
        //     localStorage.setItem("save", chooseSave);
        //     localStorage.setItem("lungime", listaProduse.length);
        // }
    }
};

let getData = async function () {
    storage = document.getElementById("cumparaturi-save-data-type").value === "local" ? new LocalStorageStorage() : new IndexDBStorage();
    document.getElementById("cumparaturi-save-data-type").value = storage.getValue();
    listaProduse = await storage.incarca();
    for (let i = 0; i < listaProduse.length; i++) {
        let trElement = document.createElement("tr");
        let tdElement1 = document.createElement("td");
        let tdElement2 = document.createElement("td");

        tdElement1.innerHTML = listaProduse[i].nume;
        tdElement2.innerHTML = listaProduse[i].cantitate;

        trElement.appendChild(tdElement1);
        trElement.appendChild(tdElement2);

        document.getElementById("cumparaturi-table").appendChild(trElement);
    }
    // listaProduse = [];
    // if(localStorage.getItem("save") === "local") {
    //     let lungime = localStorage.getItem("lungime");
    //     console.log("Lungime lista produse din localStorage:", lungime);
    //     if (lungime) {
    //         for(let i = 1; i <= lungime; i++) {
    //             let numeProdus = localStorage.getItem("produs" + i + "nume");
    //             let cantitateProdus = localStorage.getItem("produs" + i + "cantitate");

    //             console.log("Produs " + i + ": " + numeProdus + ", Cantitate: " + cantitateProdus);

    //             if (numeProdus && cantitateProdus) {
    //                 let produsNou = new Produs(numeProdus, cantitateProdus);
    //                 listaProduse.push(produsNou);
    //             }
    //         }
    //     }

    //     console.log("Lista produse:", listaProduse);

    //     for(let i = 0; i < listaProduse.length; i++){
    //         let trElement = document.createElement("tr");
    //         let tdElement1 = document.createElement("td");
    //         let tdElement2 = document.createElement("td");
            
    //         tdElement1.innerHTML = listaProduse[i].nume;
    //         tdElement2.innerHTML = listaProduse[i].cantitate;

    //         trElement.appendChild(tdElement1);
    //         trElement.appendChild(tdElement2);

    //         document.getElementById("cumparaturi-table").appendChild(trElement);
    //     }
    // } else {
    //     console.log("Nu sunt produse salvate în localStorage.");
    // }
}



/*
Constructor
function Produs(nume, cantitate) {
    this.nume = nume;
    this.cantitate = cantitate;
}
*/
class Produs {
    constructor(nume, cantitate) {
        this.nume = nume;
        this.cantitate = parseInt(cantitate);
    }
}

function adaugaProdus() {
    let numeProdus = document.getElementById("cumparaturi-input-text-nume").value;
    let cantitateProdus = document.getElementById("cumparaturi-input-number-cantitate").value;

    let produsNou = new Produs(numeProdus, cantitateProdus);
    listaProduse.push(produsNou);

    let tableElement = document.getElementById("cumparaturi-table");

    let rowElement = document.createElement("tr");

    let dataElement1 = document.createElement("td");
    let dataElement2 = document.createElement("td");
    
    dataElement1.innerHTML = produsNou.nume;
    dataElement2.innerHTML = produsNou.cantitate;

    rowElement.appendChild(dataElement1);
    rowElement.appendChild(dataElement2);

    tableElement.appendChild(rowElement);

    let chooseSave = document.getElementById("cumparaturi-save-data-type").value;
    if(chooseSave === "local") {
        localStorage.setItem("produs" + listaProduse.length +"nume", produsNou.nume);
        localStorage.setItem("produs" + listaProduse.length +"cantitate", produsNou.cantitate);
        console.log(localStorage);
        localStorage.setItem("save", chooseSave);
        localStorage.setItem("lungime", listaProduse.length);
    } else if(chooseSave === "db") {
        console.log("nu");
    }
}

function initCumparaturi() {
    const selectedType = localStorage.getItem("selectedSaveType") || "local";
    document.getElementById("cumparaturi-save-data-type").value = selectedType;

    storage = selectedType === "local" ? new LocalStorageStorage() : new IndexDBStorage();

    getData();
}