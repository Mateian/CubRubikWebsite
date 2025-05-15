import gzip
import json
import os
import socket
import threading

FOLDER_HTML = os.path.abspath(os.path.join(os.path.dirname(__file__), '../continut/'))
print(f"Folder HTML: {FOLDER_HTML}")
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print('--------------------------------------------------')

serversocket.bind(('', 5678))

serversocket.listen(5)

def porneste_server():
    print('[:] Se asteapta conectarea unui client.')
    print('--------------------------------------------------')
    while True:
        clientsocket, address = serversocket.accept()
        print('[+] Client conectat.')
        print('--------------------------------------------------')
        client_thread = threading.Thread(target=handle_client, args=(clientsocket, address))
        client_thread.start()

def handle_post(cerere, clientsocket):
    try:
        body_start = cerere.find("\r\n\r\n") + 4
        body = cerere[body_start:]
        try:
            user = json.loads(body)
        except json.JSONDecodeError:
            clientsocket.sendall(b"HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nEroare: JSON invalid")
            return
        
        print(f'[+] User primit: {user}.')
        fisier = os.path.join(FOLDER_HTML, "resurse/utilizatori.json")

        if os.path.exists(fisier):
            with open(fisier, 'r', encoding='utf-8') as f:
                try:
                    lista = json.load(f)
                except json.JSONDecodeError:
                    lista = []
        else:
            lista = []
        
        lista.append(user)

        with open(fisier, 'w', encoding='utf-8') as f:
            json.dump(lista, f, indent=4)

        raspuns = (
            "HTTP/1.1 201 Created\r\n"
            "Content-Type: application/json\r\n"
            "Connection: close\r\n"
            "\r\n" 
            '{"mesaj": "Utilizator adaugat"}'
        ).encode()

        clientsocket.sendall(raspuns)
    except Exception as ex:
        print(ex)
        clientsocket.sendall(b"HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\nEroare interna")

def handle_client(clientsocket, address):
    try:
        cerere = b''
        while True:
            print(f'[:] Se asteapta datele de la {address}.')
            print('--------------------------------------------------')
            data = clientsocket.recv(1024)
            if not data:
                break
            cerere = cerere + data
            if b'\r\n\r\n' in cerere:
                break
        
        if not cerere:
            clientsocket.close()
            return

        cerere = cerere.decode(errors='ignore')
        print(f'[+] Datele au fost primite de la {address}:')
        print('--------------------------------------------------')
        print(f'[->] Cerere de la {address}:')
        print(cerere)
        print('--------------------------------------------------')

        linieDeStart = cerere.splitlines()[0] if cerere else ''
        resursa = linieDeStart.split()[1] if len(linieDeStart.split()) > 1 else '/'
        
        if resursa == '/':
            resursa = 'index.html'
        else:
            resursa = resursa.lstrip('/')
        if resursa == 'api/utilizatori':
            handle_post(cerere, clientsocket)

        print(f'[+] Resursa dorita: {resursa}')

        cale_fisier = os.path.join(FOLDER_HTML, resursa)

        is_gzip = 'Accept-Encoding: gzip' in cerere

        if os.path.exists(cale_fisier) and os.path.isfile(cale_fisier):
            with open(cale_fisier, "rb") as f:
                continut = f.read()

            if resursa.endswith('.html'):
                content_type = "text/html"
            elif resursa.endswith('.css'):
                content_type = "text/css"
            elif resursa.endswith('.js'):
                content_type = "text/javascript"
            elif resursa.endswith('.png'):
                content_type = "image/png"
            elif resursa.endswith('.jpg') or resursa.endswith('.jpeg'):
                content_type = "image/jpeg"
            elif resursa.endswith('.gif'):
                content_type = "image/gif"
            elif resursa.endswith('.ico'):
                content_type = "image/x-icon"
            elif resursa.endswith('.json'):
                content_type = 'application/json'
            elif resursa.endswith('.xml'):
                content_type = 'application/xml'
            else:
                content_type = "application/octet-stream"

            if is_gzip:
                continut = gzip.compress(continut)
                encoding_header = 'Content-Encoding: gzip\r\n'
            else:
                encoding_header = ''

            raspuns = (
                "HTTP/1.1 200 OK\r\n"                       
                f"Content-Type: {content_type}\r\n"         
                f'Content-Length: {len(continut)}\r\n'      
                f"{encoding_header}"                        
                "Server: matei-server\r\n"                  
                "Connection: close\r\n"                     
                "\r\n"
            ).encode() + continut       
                                        
        else: 
            continut_404 = "<html><body><h1>404 Not Found</h1></body></html>".encode()
            if is_gzip:
                continut_404_gzip = gzip.compress(continut_404)
                encoding_header = 'Content-Encoding: gzip\r\n'
            else:
                encoding_header = ''

            raspuns = (
                "HTTP/1.1 404 Not Found\r\n"
                "Content-Type: text/html\r\n"
                f"Content-Length: {len(continut_404_gzip)}\r\n"
                f'{encoding_header}'
                "Connection: close\r\n"
                "\r\n"
            ).encode() + continut_404
        clientsocket.sendall(raspuns)
    except Exception as ex:
        print(f'{address}: ', ex)
        print('--------------------------------------------------')
    finally:
        clientsocket.close()
        print(f'S-a terminat comunicarea cu clientul {address}.')
        print('--------------------------------------------------')

porneste_server()