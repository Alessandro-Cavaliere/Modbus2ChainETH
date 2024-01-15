from flask_cors import CORS
import asyncio
import json
import utils
from geth import get_temperature, get_humidity, post_temperature, post_humidity
import dao
from dotenv import load_dotenv
from pymongo import MongoClient
import os
import auth
from flask import Flask, jsonify, request
import sys
import paramiko
sys.path.insert(0, 'app/auth.py')

loop = asyncio.get_event_loop()
load_dotenv()
app = Flask("Modbus2Chain")
CORS(app, resources={r"/*": {"origins": "https://localhost:3000"}})
# Connessione al database MongoDB
client = MongoClient(os.getenv("HOST"))
db = client[os.getenv("DATABASE")]
print(client)
users = db["utenti"]

# Chiave segreta per la firma del token JWT (dovrebbe essere segreta)
jwt_secret_key = os.getenv('SECRET_APP')

bbb = paramiko.SSHClient()
bbb_ip = os.getenv("BBB_IP")
bbb_username = os.getenv('BBB_SSH_USERNAME')
bbb_password = os.getenv('BBB_SSH_PASSWORD')


# SSH connection to the BBB
bbb.set_missing_host_key_policy(paramiko.AutoAddPolicy())
bbb.connect(bbb_ip, username=bbb_username, password=bbb_password)
utils.load_files_on_bbb(bbb)


@app.route('/')
def home():
    return "Welcome to Modbus2Chain Server"


@app.route('/register', methods=['POST'])
def register():
    try:
        # Estrai i dati dal corpo della richiesta JSON
        data = request.form
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')

        # Verifica se email e password sono forniti
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        existing_user = dao.find_user_by_email(db, email)
        if existing_user:
            return jsonify({"error": "User already exists"}), 409

        # Crea un nuovo utente nel database (puoi implementare questa funzione in base alle tue esigenze)
        dao.register_user(db, email, password, first_name, last_name)

        # 201 Created
        return jsonify({"message": "Registration successful"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route per il login
@app.route('/login', methods=['POST'])
def login():
    try:
        # Apply the authenticate_token_app middleware function here
        if (not auth.authenticate_token_app(request.headers.get('Authorization'))):
            return jsonify({"message": "Unauthorized"}), 401

        email = request.form.get('email')
        password = request.form.get('password')
        # Verifica se email e password sono forniti
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        user = dao.login_user(db, email, password)

        if user == False:
            return jsonify({"error": "Invalid email or password"}), 401
        # Esegui l'autenticazione con successo e genera il token JWT
        token = auth.generate_jwt_token(user)
        return jsonify({"token": token}), 200

    except paramiko.AuthenticationException:
        # Gestisci errori di autenticazione SSH
        return jsonify({"message": "Errore di autenticazione SSH"}), 401

    except paramiko.SSHException as e:
        # Gestisci altri errori SSH
        return jsonify({"message": f"Errore SSH: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/view-temperature', methods=['GET'])
def view_temperature():
    try:
        # Apply the authenticate_token_app middleware function here
        auth.authenticate_token(request.headers.get('Authorization'))
        python_command = 'python3 /var/lib/cloud9/Modbus2Chain-master/utils.py get_temp_from_slave'
        # Esegui il comando Python
        stdin, stdout, stderr = bbb.exec_command(python_command)

        temp = int(stdout.read().decode('utf-8').splitlines()[-1])
        print(temp)
        return jsonify({"message": "Temperatura estrapolata tramite comunicazione Modbus TCP", "temperature": temp}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/view-humidity', methods=['GET'])
def view_humidity():
    try:
        # Apply the authenticate_token_app middleware function here
        auth.authenticate_token(request.headers.get('Authorization'))
        python_command = 'python3 /var/lib/cloud9/Modbus2Chain-master/utils.py get_hum_from_slave'
        # Esegui il comando Python
        stdin, stdout, stderr = bbb.exec_command(python_command)

        hum = int(stdout.read().decode('utf-8').splitlines()[-1])

        return jsonify({"message": "Umidità estrapolata tramite comunicazione Modbus TCP", "humidity": hum}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/detects-movement', methods=['GET'])
def detects_movement():
    try:
        # Apply the authenticate_token_app middleware function here
        auth.authenticate_token(request.headers.get('Authorization'))
        python_command = 'python3 /var/lib/cloud9/Modbus2Chain-master/utils.py detects_movement'
        # Esegui il comando Python
        stdin, stdout, stderr = bbb.exec_command(python_command)

        mov = int(stdout.read().decode('utf-8').splitlines()[-1])

        return jsonify({"message": "Umidità estrapolata tramite comunicazione Modbus TCP", "humidity": mov}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/notarize-temperature', methods=['POST'])
def notarize_temperature():
    try:
        # Apply the authenticate_token_app middleware function here
        auth.authenticate_token(request.headers.get('Authorization'))

        user = dao.find_user_by_email(db, request.form.get('email'))
        if (not user):
            return jsonify({"error": "L'email non è presente nel database, utente inesistente"}), 401
        if (not user.get('address')):
            return jsonify({"error": "L'utente non è un validatore sulla blockchain e non può caricare dati e inserire blocchi."}), 401
        python_command = 'python3 /var/lib/cloud9/Modbus2Chain-master/utils.py get_temp_from_slave'

        # Esegui il comando Python
        stdin, stdout, stderr = bbb.exec_command(python_command)

        temp = int(stdout.read().decode('utf-8').splitlines()[-1])
        result = loop.run_until_complete(
            post_temperature(user.get('address'), "20", temp))
        print("ssss")
        receipt_dict = dict(result["receipt"])

        # Trasforma gli oggetti HexBytes in stringhe
        receipt_dict['blockHash'] = receipt_dict['blockHash'].hex()
        receipt_dict['logsBloom'] = receipt_dict['logsBloom'].hex()
        receipt_dict['transactionHash'] = receipt_dict['transactionHash'].hex()
        if (receipt_dict['status'] == 1):
            for log_entry in receipt_dict['logs']:
                for log_entry in receipt_dict['logs']:
                    if isinstance(log_entry, dict) and 'topics' in log_entry:
                        # Cambia gli oggetti HexBytes nei campi specifici
                        log_entry['address'] = log_entry['address'].hex()
                        log_entry['data'] = log_entry['data'].hex()
                        log_entry['blockHash'] = log_entry['blockHash'].hex()
                        log_entry['transactionHash'] = log_entry['transactionHash'].hex()
                        log_entry['blockNumber'] = log_entry['blockNumber'].hex()
                        log_entry['transactionIndex'] = log_entry['transactionIndex'].hex(
                        )
                        log_entry['blockHash'] = log_entry['blockHash'].hex()
            receipt_dict['logs'] = dict(receipt_dict['logs'])
            receipt_dict['timestamp'] = result["timestamp"]
        dao.insert_transaction(db, receipt_dict["transactionHash"], receipt_dict["from"],
                               receipt_dict["blockNumber"], result["timestamp"], "Temp: "+str(temp)+"°C")
        return jsonify({"message": "Temperatura estrapolata tramite comunicazione Modbus TCP e notarizzata su blockchain Ethereum", "temperature": temp, "blockchain_receipt": receipt_dict}), 200

    except Exception as e:
        # Gestisci eccezioni
        return jsonify({"error": str(e)}), 500


@app.route('/notarize-humidity', methods=['POST'])
def notarize_humidity():
    try:
        # Apply the authenticate_token_app middleware function here
        auth.authenticate_token(request.headers.get('Authorization'))
        user = dao.find_user_by_email(db, request.form.get('email'))
        if (not user):
            return jsonify({"error": "L'email non è presente nel database, utente inesistente"}), 401
        if (not user.get('address')):
            return jsonify({"error": "L'utente non è un validatore sulla blockchain e non può caricare dati e inserire blocchi."}), 401
        python_command = 'python3 /var/lib/cloud9/Modbus2Chain-master/utils.py get_hum_from_slave'
        # Esegui il comando Python
        stdin, stdout, stderr = bbb.exec_command(python_command)
        hum = int(stdout.read().decode('utf-8').splitlines()[-1])
        print(hum)
        result = loop.run_until_complete(
            post_humidity(user.get('address'), "20", hum))
        receipt_dict = dict(result["receipt"])

        # Trasforma gli oggetti HexBytes in stringhe
        receipt_dict['blockHash'] = receipt_dict['blockHash'].hex()
        receipt_dict['logsBloom'] = receipt_dict['logsBloom'].hex()
        receipt_dict['transactionHash'] = receipt_dict['transactionHash'].hex()
        if (receipt_dict['status'] == 1):
            for log_entry in receipt_dict['logs']:
                for log_entry in receipt_dict['logs']:
                    if isinstance(log_entry, dict) and 'topics' in log_entry:
                        # Cambia gli oggetti HexBytes nei campi specifici
                        log_entry['address'] = log_entry['address'].hex()
                        log_entry['data'] = log_entry['data'].hex()
                        log_entry['blockHash'] = log_entry['blockHash'].hex()
                        log_entry['transactionHash'] = log_entry['transactionHash'].hex()
                        log_entry['blockNumber'] = log_entry['blockNumber'].hex()
                        log_entry['transactionIndex'] = log_entry['transactionIndex'].hex(
                        )
                        log_entry['blockHash'] = log_entry['blockHash'].hex()
            receipt_dict['logs'] = dict(receipt_dict['logs'])
            receipt_dict['timestamp'] = result["timestamp"]
        dao.insert_transaction(db, receipt_dict["transactionHash"], receipt_dict["from"],
                               receipt_dict["blockNumber"], result["timestamp"], "Hum: "+str(hum)+"%")

        return jsonify({"message": "Umidità estrapolata tramite comunicazione Modbus TCP e notarizzata su blockchain Ethereum", "humidity": hum, "blockchain_receipt": receipt_dict}), 200

    except Exception as e:
        # Gestisci eccezioni
        return jsonify({"error": str(e)}), 500


@app.route('/get-transactions', methods=['POST'])
def get_transactions():
    try:
        # Apply the authenticate_token_app middleware function here
        auth.authenticate_token(request.headers.get('Authorization'))

        user = dao.find_user_by_email(db, request.form.get('email'))
        print(user)
        if (not user.get('address')):
            return jsonify({"message": "L'utente non è un validatore sulla blockchain e non può caricare dati e inserire blocchi."}), 401

        transactions = dao.get_transactions_by_from_address(
            db, user.get('address'))
        return jsonify({"message": "Transazioni restituite correttamente!", "transactions": transactions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/is-validator', methods=['POST'])
def is_validator():
    try:
        # Apply the authenticate_token_app middleware function here
        auth.authenticate_token(request.headers.get('Authorization'))

        result = dao.is_validator(db, request.form.get('email'))
        if (not result):
            return jsonify({"error": "L'utente non è un validatore sulla blockchain e non può caricare dati e inserire blocchi."}), 401

        return jsonify({"message": "L'utente è un validatore!", "result": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


app.run(host='0.0.0.0', port=5000, debug=True, ssl_context=(
    'web-server/server.crt', 'web-server/server.key'), threaded=True)
