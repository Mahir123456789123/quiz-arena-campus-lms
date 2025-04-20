import socket
import threading

HOST = '127.0.0.1'
PORT = 12345

def receive_messages(sock):
    while True:
        try:
            msg = sock.recv(1024).decode()
            if not msg:
                break
            print(msg, end="")
        except:
            print("\nDisconnected from server.")
            break

def start_client():
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect((HOST, PORT))

    threading.Thread(target=receive_messages, args=(client,), daemon=True).start()

    while True:
        try:
            msg = input()
            client.send(msg.encode())

            if msg.startswith("/logout"):
                break
        except:
            break

    client.close()

if __name__ == "__main__":
    start_client()
