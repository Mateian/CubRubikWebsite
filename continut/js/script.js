function shopFunction() {
    getData();
}

window.intervalDate = null;

function addColumn(event) {
    let text = document.getElementById("invat-text-tabela").value;
    const position = text.split("::=")[0];
    const dataArray = text.split("::=")[1].split(";");
    let i = 0;
    while (i < dataArray.length) {
        dataArray[i] = dataArray[i].trim();
        i++;
    }
    const headerText = document.createElement("th");
    const node = document.createTextNode(dataArray[0]);
    headerText.appendChild(node);

    const tableHeader = document.getElementById("invat-tabel-headers");
    const headers = tableHeader.getElementsByTagName("th");
    if(position <= headers.length && position >= 1) {
        headers[position - 2].parentNode.insertBefore(headerText, headers[position - 2].nextSibling);
    }

    dataArray.shift();

    const contentElements = document.getElementById("invat-tabel");
    const contentArray = Array.from(contentElements.getElementsByTagName("tr"));
    contentArray.shift();
    for(let i = 0; i < contentArray.length; i++) {
        let newElement = document.createElement("td");
        let nd = document.createTextNode(dataArray[i]);
        newElement.appendChild(nd);
        const auxArray = contentArray[i].getElementsByTagName("td");
        let bck_color = document.getElementById("invat-culoare-element-tabel").value;
        newElement.setAttribute("style", `background-color: ${bck_color}`);
        auxArray[position - 2].parentNode.insertBefore(newElement, auxArray[position - 2].nextSibling);
    }
}

function addRow(event) {
    const text = document.getElementById("invat-text-tabela").value;
    const position = text.split("::=")[0]
    let bck_color = document.getElementById("invat-culoare-element-tabel").value;
    const dataArray = text.split("::=")[1].split(";");
    let i = 0;
    while (i < dataArray.length) {
        dataArray[i] = dataArray[i].trim();
        i++;
    }
    const rows = document.getElementById("invat-tabel").getElementsByTagName("tr");
    if(position <= rows.length && position >= 1) {
        let rowText = "", index = 0;
        let tdElements = document.createElement("td");;
        let tdEl;
        let tdnd;
        let aEl, imgEl;
        let newElement = document.createElement("tr");
        for(index = 0; index < dataArray.length; index++) {
            tdEl = document.createElement("td");
            if(dataArray[index].includes("a-link")) {
                dataArray[index] = dataArray[index].replace("a-link", "");
                let link = dataArray[index].trim()
                aEl = document.createElement("a");
                aEl.setAttribute("href", link);
                let txtAux = document.createTextNode("Site");
                aEl.appendChild(txtAux);
                tdEl.appendChild(aEl);
                tdEl.setAttribute("style", `background-color: ${bck_color}`);
                newElement.appendChild(tdEl);
            } else if(dataArray[index].includes("img-link")) { 
                dataArray[index] = dataArray[index].replace("img-link", "");
                let link = dataArray[index].trim()
                imgEl = document.createElement("img");
                imgEl.setAttribute("src", link);
                imgEl.setAttribute("alt", "image link");
                imgEl.setAttribute("style", "height: 50px;");
                tdEl.appendChild(imgEl);
                tdEl.setAttribute("style", `background-color: ${bck_color}`);
                newElement.appendChild(tdEl);
            } else {
                tdnd = document.createTextNode(dataArray[index]);
                tdEl.appendChild(tdnd);
                tdEl.setAttribute("style", `background-color: ${bck_color}`);
                newElement.appendChild(tdEl);
            }
        }

        rows[position - 1].parentNode.insertBefore(newElement, rows[position - 1].nextSibling);
    }
}

function addElement(event) {
window.onload = () => {
    // data si ora curenta
    let dataCurenta = new Date().toLocaleString();

    // url pagina
    let urlPagina = window.location.href;

    // informatii browser si SO
    let browser = navigator.userAgent;
    let sistemOperare = navigator.oscpu;

    // locatie
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pozitie) => {
            let locatie = `Latitudine: ${pozitie.coords.latitude}, Longitudine: ${pozitie.coords.longitude}`;
            document.getElementById("invat-locatie").innerHTML = `<b>Locație:</b> ${locatie}`;
        }, () => {
            document.getElementById("invat-locatie").innerHTML = `<b>Locație:</b> Nu ați permis accesul la locație.`;
        });
    } else {
        document.getElementById("invat-locatie").innerHTML = `<b>Locație:</b> Nu există funcția.`;
    }

    // scriere informatii
    document.getElementById('invat-date').innerHTML = `<b>Data și ora:</b> ${dataCurenta}`;
    document.getElementById('invat-url').innerHTML = `<b>URL curent:</b> ${urlPagina}`;
    document.getElementById('invat-browser').innerHTML = `<b>Browser:</b> ${browser}`;
    document.getElementById('invat-platforma').innerHTML = `<b>Platforma:</b> ${sistemOperare}`;

    let pct1 = null;
    let pct2 = null;

    const canvas = document.getElementById("invat-desen-canvas");
    const context = canvas.getContext("2d");

    const colorStroke = document.getElementById("invat-culoare-stroke");
    const colorFill = document.getElementById("invat-culoare-fill")

    // click
    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log("x = ", x,"\ny = ", y,"\nscreenX = ", event.screenX, "\nscreenY = ", event.screenY, "\nevent.clientX = ", event.clientX, "\nevent.clientY = ", event.clientY, "\nrect.left = ", rect.left, "\nrect.top = ", rect.top)

        if(!pct1) {
            pct1 = { x, y }; // primul pct
        } else {
            pct2 = { x, y }; // al doilea pct
            drawRect(pct1, pct2);
            pct1 = null; // reset pt urmatorul dreptunghi
        }
    });

    const drawRect = (p1, p2) => {
        const width = Math.abs(p2.x - p1.x);
        const height = Math.abs(p2.y - p1.y);
        const inceputX = Math.min(p1.x, p2.x);
        const inceputY = Math.min(p1.y, p2.y);

        // desen
        context.fillStyle = colorFill.value;
        context.fillRect(inceputX, inceputY, width, height);

        context.strokeStyle = colorStroke.value;
        context.lineWidth = 2;
        context.strokeRect(inceputX, inceputY, width, height);
    }
}
}

function loadIndex() {
    //window.onload = () => {
        if (window.intervalDate) {
            clearInterval(window.intervalDate);
        }
        // data si ora curenta
        let dataCurenta = new Date().toLocaleString();
    
        // url pagina
        let urlPagina = window.location.href;
    
        // informatii browser si SO
        let browser = navigator.userAgent;
        let sistemOperare = navigator.oscpu;
    
        // locatie
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pozitie) => {
                let locatie = `Latitudine: ${pozitie.coords.latitude}, Longitudine: ${pozitie.coords.longitude}`;
                document.getElementById("invat-locatie").innerHTML = `<b>Locație:</b> ${locatie}`;
            }, () => {
                document.getElementById("invat-locatie").innerHTML = `<b>Locație:</b> Nu ați permis accesul la locație.`;
            });
        } else {
            document.getElementById("invat-locatie").innerHTML = `<b>Locație:</b> Nu există funcția.`;
        }
    
        // scriere informatii
        document.getElementById('invat-date').innerHTML = `<b>Data și ora:</b> ${dataCurenta}`;
        document.getElementById('invat-url').innerHTML = `<b>URL curent:</b> ${urlPagina}`;
        document.getElementById('invat-browser').innerHTML = `<b>Browser:</b> ${browser}`;
        document.getElementById('invat-platforma').innerHTML = `<b>Platforma:</b> ${sistemOperare}`;
    
        let pct1 = null;
        let pct2 = null;
    
        const canvas = document.getElementById("invat-desen-canvas");
        const context = canvas.getContext("2d");
    
        const colorStroke = document.getElementById("invat-culoare-stroke");
        const colorFill = document.getElementById("invat-culoare-fill")
    
        // click
        canvas.addEventListener("click", (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            console.log("x = ", x,"\ny = ", y,"\nscreenX = ", event.screenX, "\nscreenY = ", event.screenY, "\nevent.clientX = ", event.clientX, "\nevent.clientY = ", event.clientY, "\nrect.left = ", rect.left, "\nrect.top = ", rect.top)
    
            if(!pct1) {
                pct1 = { x, y }; // primul pct
            } else {
                pct2 = { x, y }; // al doilea pct
                drawRect(pct1, pct2);
                pct1 = null; // reset pt urmatorul dreptunghi
            }
        });
    
        const drawRect = (p1, p2) => {
            const width = Math.abs(p2.x - p1.x);
            const height = Math.abs(p2.y - p1.y);
            const inceputX = Math.min(p1.x, p2.x);
            const inceputY = Math.min(p1.y, p2.y);
    
            // desen
            context.fillStyle = colorFill.value;
            context.fillRect(inceputX, inceputY, width, height);
    
            context.strokeStyle = colorStroke.value;
            context.lineWidth = 2;
            context.strokeRect(inceputX, inceputY, width, height);
        }
    //}
    window.intervalDate = setInterval(() => {
        let dataCurenta = new Date().toLocaleString();
        document.getElementById('invat-date').innerHTML = `<b>Data și ora:</b> ${dataCurenta}`;
    }, 1000);
    let arrayNavigation = document.getElementsByClassName("a-nav");
    document.getElementById("invat-buton-coloana").addEventListener("click", addColumn);
    document.getElementById("invat-buton-linie").addEventListener("click", addRow);
}

/*
let div = document.createElement("div");
for(let i = 0; i < 3; i++) {
    let p = document.createElement("p");
    let text = `p${i + 1}`;
    let textNode = document.createTextNode(text);
    p.appendChild(textNode);
    div.appendChild(p);
}
document.body.append(div); */