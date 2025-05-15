// function schimbaContinut(resursa) {
//     var xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function() {
//         if(this.readyState == 4 && this.status == 200) {
//             document.getElementById("continut").innerHTML = this.responseText;
//             if(resursa === "inregistrare") {
//                 initForm();
//             }
//         }
//     }
    
//     let resursa_html = resursa + '.html';
//     xhttp.open("GET", resursa_html, true);
//     xhttp.send();
// }

// function schimbaContinut(resursa, jsFisier, jsFunctie) {
//     var xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function() {
//         if(this.readyState == 4 && this.status == 200) {
//             document.getElementById("continut").innerHTML = this.responseText;
//             document.head.title = resursa;
//             if(resursa === "inregistreaza") {
//                 initForm();
//             }
//             if (jsFisier) {
//                 var elementScript = document.createElement('script');
//                 elementScript.onload = function () {
//                     let functii = jsFunctie.split(' ');
//                     for(i in functii) {
//                         if (functii[i]) {
//                             window[functii[i]]();
//                         }
//                     }
//                 };
//                 elementScript.src = jsFisier;
//                 document.head.appendChild(elementScript);
//             } else {
//                 let functii = jsFunctie.split(' ');
//                     for(i in functii) {
//                         if (functii[i]) {
//                             window[functii[i]]();
//                         }
//                     }
//             }
//         }
//     }
    
//     let resursa_html = resursa + '.html';
//     xhttp.open("GET", resursa_html, true);
//     xhttp.send();
// }
function initForm() {
    const form = document.getElementById('formular-inregistrare');
    const buton = document.getElementById('butonf');
    const checkBox = document.getElementById('acordf');
    
    checkBox.addEventListener('change', () => {
        buton.disabled = !checkBox.checked;
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const dateFormular = {
            utilizator : document.getElementById('numeutilizatorf').value,
            nume: document.getElementById("numef").value,
            prenume: document.getElementById("prenumef").value,
            email: document.getElementById("emailf").value,
            parola: document.getElementById("parolaf").value,
            telefon: document.getElementById("telefonf").value,
            sex: document.getElementById("sexf").value,
            mancare_preferata: document.getElementById("mancarepreferatafm").value,
            culoare_preferata: document.getElementById("culoaref").value,
            data_nastere: document.getElementById("datanasteref").value,
            varsta: document.getElementById("varstaf").value,
            adresa_personala: document.getElementById("adresapersonalaf").value,
            descriere: document.getElementById("descrieref").value
        };


        fetch('/api/utilizatori', {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(dateFormular)
        })
        .then(response => JSON.parse(JSON.stringify(response)))
        .then(data => {
            alert(`S-a inserat utilizatorul dorit.`)
            form.reset();
            buton.disabled = true;
        })
        .catch(error => {
            console.error('Eroare la trimiterea formularului: ', error);
            alert('A aparut o eroare. Verificati consola.')
        });
    });
}

function incarcaPersoane() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            xmlResponse = this.responseText;
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(xmlResponse, "text/xml");
            //document.getElementById('continut').innerHTML = xmlDoc.getElementsByTagName('nume')[0].innerHTML;
            let titlePersoaneTable = "<h1>Administrație Website</h1>";
            let containerTag = document.getElementsByClassName('info-container')[0];
            containerTag.innerHTML = titlePersoaneTable;
            createTable(xmlDoc);
        }
    }
    xhttp.open('GET', '/resurse/persoane.xml', true);
    xhttp.send();
}

function createTable(xmlDoc) {
    var table = document.createElement('table');
    var tr_header = document.createElement('tr');
    var title_headers = xmlDoc.getElementsByTagName('persoana')[0].children;
    for (const element of title_headers) {
        element_tagname = element.tagName;
        let th = document.createElement("th");
        th.textContent = element_tagname[0].toUpperCase() + element_tagname.substring(1);
        tr_header.appendChild(th);
    };
    table.appendChild(tr_header);
    

    const persons = xmlDoc.getElementsByTagName('persoana');
    for (let i = 0; i < persons.length; ++i) {
        const person_row_element = document.createElement('tr');
        for(const data_tag of persons[i].children) {
            if(data_tag.children.length === 0) {
                const data = data_tag.innerHTML;
                const table_data_element = document.createElement('td');
                table_data_element.textContent = data;
                person_row_element.appendChild(table_data_element);
            } else {
                const data_tag_children = data_tag.children;
                const table_data_element = document.createElement('td');
                for(const subdata_tag of data_tag_children) {
                    const data = subdata_tag.innerHTML;
                    table_data_element.textContent += data + ', ';
                }
                table_data_element.textContent = table_data_element.textContent.substring(0, table_data_element.textContent.length - 2);
                person_row_element.appendChild(table_data_element);
            }
        }
        table.appendChild(person_row_element);
    }
    document.getElementsByClassName('info-container')[0].append(table);
}

function verificaPersoane() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            jsonResponse = this.responseText;
            const users = JSON.parse(jsonResponse);
            const username = document.getElementById('verifica-username').value;
            const password = document.getElementById('verifica-password').value;
            if(username && password) {
                for(const user of users) {
                    if(user.utilizator === username && user.parola === password) {
                        gasit = true;
                        break;
                    } else {
                        gasit = false;
                    }
                }
                if(gasit) {
                    document.getElementById('verificare-check').innerHTML = `&#9989`;;
                } else {
                    document.getElementById('verificare-check').innerHTML = `&#10060;`;
                }
            }
        }
    }
    xhttp.open('GET', '/resurse/utilizatori.json', true);
    xhttp.send();
}