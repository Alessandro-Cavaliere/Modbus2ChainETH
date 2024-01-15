from werkzeug.security import generate_password_hash, check_password_hash


def register_user(db, email, password, first_name, last_name):
    users = db['utenti']
    hashed_password = generate_password_hash(password)
    print(hashed_password)
    user_data = {
        'email': email,
        'password': hashed_password,
        'first_name': first_name,
        'last_name': last_name
    }

    if users.find_one({"email": email}):
        return False

    users.insert_one(user_data)
    print("eccoci")
    return True


def login_user(db, email, password):
    users = db['utenti']
    user = users.find_one({"email": email})
    if not user or not check_password_hash(user['password'], password):
        return False

    return user


def find_user_by_email(db, email):
    users_collection = db["utenti"]

    user = users_collection.find_one({"email": email})

    return user


def insert_transaction(db, txID, validator_address, block_number, timestamp, data):
    transactions_collection = db["transactions"]

    transaction_data = {
        "txID": txID,
        "validator_address": validator_address,
        "block_number": block_number,
        "timestamp": timestamp,
        "data": data
    }

    transactions_collection.insert_one(transaction_data)


def get_transactions_by_from_address(db, from_address):
    transactions_collection = db["transactions"]
    transactions = transactions_collection.find(
        {"validator_address": from_address})

    transactions_list = [{"txID": transaction["txID"], "validator_address": transaction["validator_address"],
                          "block_number": transaction["block_number"], "timestamp": transaction["timestamp"], "data": transaction["data"]} for transaction in transactions]

    return transactions_list


def is_validator(db, email):
    users_collection = db["utenti"]
    user = users_collection.find_one({"email": email})
    if user and "address" in user:
        return True
    else:
        return False
