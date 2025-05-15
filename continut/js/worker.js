
self.onmessage = function(event) {
    if (event.data.actiune === "adauga_produs") {
        const numeProdus = event.data.numeProdus;
        const cantitateProdus = event.data.cantitateProdus;

        const produsNou = new Produs(numeProdus, cantitateProdus);

        postMessage({
            actiune: "adauga_produs",
            produs: produsNou
        });
    }
};

class Produs {
    constructor(nume, cantitate) {
        this.nume = nume;
        this.cantitate = parseInt(cantitate);
    }
}
