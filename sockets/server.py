
import socket
import threading
import csv
import time
import signal
import sys
from collections import defaultdict

HOST = '127.0.0.1'
PORT = 12345

clients = {}
rooms = {}
questions = {}
leaderboard = defaultdict(int)
shutdown_flag = False

def load_questions(filename):
    with open(filename, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            room = row['room']
            if room not in questions:
                questions[room] = []
            questions[room].append({
                'question': row['question'],
                'options': [row['option1'], row['option2'], row['option3'], row['option4']],
                'answer': row['answer']
            })

def broadcast(room, message):
    if room in rooms:
        for client in rooms[room]:
            try:
                client[0].send(f"{message}\n".encode())
            except:
                remove_client(client[0])

def remove_client(client):
    if client in clients:
        username, room, score, _ = clients[client]
        if room:
            time_taken = time.time() - clients[client][3]
            leaderboard[username] += score
            broadcast(room, f"Final score for {username}: {score} (Time: {time_taken:.1f}s)")
            
            if room in rooms:
                rooms[room] = [c for c in rooms[room] if c[0] != client]
                if not rooms[room]:
                    del rooms[room]

        del clients[client]
        client.close()
        update_leaderboard()

def update_leaderboard():
    sorted_lb = sorted(leaderboard.items(), key=lambda x: x[1], reverse=True)[:10]
    lb_msg = "\nLEADERBOARD:\n" + "\n".join(f"{i+1}. {name}: {score}" for i, (name, score) in enumerate(sorted_lb))
    for room in rooms.values():
        for client in room:
            try:
                client[0].send(lb_msg.encode())
            except:
                continue

def handle_quiz(client, room_name):
    username = clients[client][0]
    clients[client] = (username, room_name, 0, time.time())
    
    if room_name not in questions:
        client.send("No questions available for this room!\n".encode())
        return
    
    for i, q in enumerate(questions[room_name]):
        if shutdown_flag: break
        
        options = "\n".join(f"{j+1}. {opt}" for j, opt in enumerate(q['options']))
        client.send(f"Question {i+1}: {q['question']}\n{options}\n".encode())
        
        try:
            answer = client.recv(1024).decode().strip()
            if answer == q['answer']:
                clients[client] = (username, room_name, clients[client][2]+10, clients[client][3])
                client.send("Correct! +10 points\n".encode())
            else:
                client.send(f"Wrong! Correct answer was {q['answer']}\n".encode())
        except:
            remove_client(client)
            return
        
    time_taken = time.time() - clients[client][3]
    leaderboard[username] += clients[client][2]
    client.send(f"Quiz completed! Your score: {clients[client][2]} (Time: {time_taken:.1f}s)\n".encode())
    update_leaderboard()

def handle_client(client):
    client.send("Enter your name: ".encode())
    username = client.recv(1024).decode().strip()

    if username in [c[0] for c in clients.values()]:
        client.send("Username taken. Try again later.\n".encode())
        client.close()
        return

    clients[client] = (username, None, 0, 0)
    client.send("Welcome to Quiz Server! Type /help for commands\n".encode())

    while not shutdown_flag:
        try:
            msg = client.recv(1024).decode().strip()
            
            if not msg:
                continue

            if msg.startswith("/help"):
                client.send("Commands:\n/join [room] - Join a quiz room\n/listrooms - Show available rooms\n/leaderboard - Show top scores\n/logout - Exit\n".encode())

            elif msg.startswith("/join"):
                parts = msg.split(maxsplit=1)
                if len(parts) < 2:
                    client.send("Usage: /join [room_name]\n".encode())
                    continue
                
                room_name = parts[1]
                if room_name not in questions:
                    client.send("Invalid room name\n".encode())
                    continue
                
                if room_name not in rooms:
                    rooms[room_name] = []
                rooms[room_name].append((client, username))
                client.send(f"Joined {room_name}! Starting quiz...\n".encode())
                handle_quiz(client, room_name)
                rooms[room_name].remove((client, username))
                clients[client] = (username, None, 0, 0)

            elif msg.startswith("/listrooms"):
                room_list = "\n".join(questions.keys())
                client.send(f"Available rooms:\n{room_list}\n".encode())

            elif msg.startswith("/leaderboard"):
                update_leaderboard()

            elif msg.startswith("/logout"):
                client.send("Goodbye!\n".encode())
                remove_client(client)
                break

            else:
                client.send("Unknown command. Type /help for list\n".encode())

        except:
            remove_client(client)
            break

def start_server():
    load_questions('questions.csv')
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, PORT))
    server.listen(5)
    print(f"Quiz Server started on {HOST}:{PORT}")

    def signal_handler(sig, frame):
        global shutdown_flag
        print("\nShutting down server gracefully...")
        shutdown_flag = True
        
        # Notify all clients
        for client in list(clients.keys()):
            try:
                client.send("Server is shutting down. Disconnecting...\n".encode())
            except:
                pass
        
        # Close all client connections
        for client in list(clients.keys()):
            remove_client(client)
        
        server.close()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    while not shutdown_flag:
        try:
            client, addr = server.accept()
            threading.Thread(target=handle_client, args=(client,)).start()
        except OSError:
            break

if __name__ == "__main__":
    start_server()
