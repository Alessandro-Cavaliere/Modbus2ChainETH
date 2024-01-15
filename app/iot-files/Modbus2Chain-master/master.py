import os
import time
import argparse
from dotenv import load_dotenv
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from package.umodbus import tcp
import hashlib
import binascii
load_dotenv()


# Initialize the encryptor and the decryptor
hex_string = os.getenv('NONCE')
nonce = binascii.unhexlify(hex_string)
encryption_key = hashlib.sha256(os.getenv("ENCRYPTION_KEY").encode()).digest() 


slave_tcp_port = int(os.getenv("SLAVE_TCP_PORT")) 
slave_ip = os.getenv("SLAVE_IP")

register_definitions = {
    "COILS": {
        "MOVEMENT_HANDLE": {
            "register": 91,
            "len": 1,
            "val": 0
        },
        "RESPONSE_TEST": {
            "register": 122,
            "len": 1,
            "val": 1
        }
    },
    "HREGS": {
        "TEXT_REGISTER_HREG": {
            "register": 90,
            "len": 3,
            "val": 11  # Initial value of the string
        },
        "TEMPERATURE_HREG": {
            "register": 93,
            "len": 1,
            "val": 1
        },
        "HUMIDITY_HREG": {
            "register": 94,
            "len": 1,
            "val": 0  # Initial value of humidity
        },
        "PRESSURE_HREG": {
            "register": 92,
            "len": 1,
            "val": 0  # Initial value of pressure
        },
        "TEMP_HREG_TEMPERTURE": {
            "register": 96,
            "len": 1,
            "val": 0  # Initial value of pressure
        },
        "TEMP_HREG_HUMIDITY": {
            "register": 95,
            "len": 1,
            "val": 0  # Initial value of pressure
        }
    },
    "IREGS": {
        "DATE_CREATION_OF_THE_PROJECT_IREG": {
            "register": 10,
            "len": 1,
            "val": 1679804937  # Current timestamp in int format (to be converted in the interface)
        }
    }
}

def connect_to_slave():
    host = tcp.TCP(
           slave_ip=slave_ip,
           slave_port=slave_tcp_port,
           timeout=30) 
    return host

# Function to send a write request to registers
def write_to_register(host,register_type, register_name, data_to_write):
    print("register_type {}, write to reg" .format(register_name))
    register_address = register_definitions[register_type][register_name]['register']
    register_qty = register_definitions[register_type][register_name]['len']

    # Encrypt the data
   
    # Write encrypted data to the register
    operation_status = host.write_single_register(
        slave_addr=int(os.getenv("SLAVE_ADDRESS")),
        register_address=register_address,
        register_value=data_to_write,
        signed=False)
  
    time.sleep(1)
    print('Result of setting {} {}: {}'.format(register_type, register_name, operation_status))

# Function to send a read request to registers
def read_from_register(host,register_type, register_name):
    register_address = register_definitions[register_type][register_name]['register']
    register_qty = register_definitions[register_type][register_name]['len']
    # Read encrypted data from the register
    data = host.read_holding_registers(
        slave_addr=int(os.getenv("SLAVE_ADDRESS")),
        starting_addr=register_address,
        register_qty=register_qty,
        signed=False)
    
    return data
    
# Function to send a read request to registers [COILS]
def read_from_register_coils(host,register_type, register_name):
    register_address = register_definitions[register_type][register_name]['register']
    register_qty = register_definitions[register_type][register_name]['len']
    # Read encrypted data from the register
    data = host.read_coils(
        slave_addr=int(os.getenv("SLAVE_ADDRESS")),
        starting_addr=register_address,
        coil_qty=register_qty
        )
    
    return data

# Function to send a write request to registers [COILS]
def write_to_register_coils(host,register_type, register_name, data_to_write):
    print("register_type {}, write to reg" .format(register_name))
    register_address = register_definitions[register_type][register_name]['register']
    register_qty = register_definitions[register_type][register_name]['len']

    # Write in the COIL Register
    operation_status = host.write_single_coil(
        slave_addr=int(os.getenv("SLAVE_ADDRESS")),
        output_address=register_address,
        output_value=data_to_write
        )
  
    print('Result of setting {} {}: {}'.format(register_type, register_name, operation_status))
    
def get_sensors_data(host,register_type, register_name):
    read_from_register(host,register_type, register_name)
    return read_from_register(host,register_type, register_name)
    
# Function to encrypt and encode data
def encrypt_and_encode(data_to_encrypt):
    cipher = Cipher(algorithms.ChaCha20(encryption_key, nonce), mode=None, backend=default_backend())
    encryptor = cipher.encryptor()
    # Convert the int data in array of bytes
    data_bytes = int_to_bytes(data_to_encrypt)
    ciphertext = encryptor.update(data_bytes) + encryptor.finalize()
    return int.from_bytes(ciphertext, byteorder='big')

#Decrypts and decodes the encoded data.
def decrypt_and_decode(encoded_data):
    cipher = Cipher(algorithms.ChaCha20(encryption_key, nonce), mode=None, backend=default_backend())
    decryptor = cipher.decryptor()

    # Convert the int data to bytes
    ciphertext = int_to_bytes(encoded_data)
    
    # Decrypt the ciphertext
    decrypted_data_bytes = decryptor.update(ciphertext) + decryptor.finalize()
    # Convert the decrypted bytes to an integer
    decrypted_data = int.from_bytes(decrypted_data_bytes, byteorder='big')
    return decrypted_data

def int_to_bytes(value):
    return value.to_bytes((value.bit_length() + 7) // 8, 'big')

def bytes_to_int(bytes_data):
    return int.from_bytes(bytes_data, 'big')
    

def get_temp_from_slave():
    host= connect_to_slave()
    
    #Take the temperature from DHT11 and encrypt
    read_from_register(host,'HREGS', 'TEMPERATURE_HREG')[0]
    temp=read_from_register(host,'HREGS', 'TEMP_HREG_TEMPERTURE')[0]
    encrypted_temperature=encrypt_and_encode(int(temp))
    
    #Write to the register the encrypted temperature
    write_to_register(host,'HREGS', 'TEMPERATURE_HREG', encrypted_temperature)
    
    print(temp)
    
def get_hum_from_slave():
    host= connect_to_slave()
    
    #Take the temperature from DHT11 and encrypt
    read_from_register(host,'HREGS', 'HUMIDITY_HREG')[0]
    hum=read_from_register(host,'HREGS', 'TEMP_HREG_HUMIDITY')[0]
    encrypted_humidity=encrypt_and_encode(int(hum))
    
    #Write to the register the encrypted temperature
    write_to_register(host,'HREGS', 'HUMIDITY_HREG', encrypted_humidity)
    
    print(hum)

def detects_movement():
    host= connect_to_slave()
    
    #Take the temperature from DHT11 and encrypt
    read_from_register_coils(host,'COILS', 'MOVEMENT_HANDLE')[0]
    mov=read_from_register_coils(host,'COILS', 'MOVEMENT_HANDLE')[0]
    
    #Write to the register the encrypted temperature
    write_to_register_coils(host,'COILS', 'MOVEMENT_HANDLE', mov)
    
    print(mov)

def main():
    parser = argparse.ArgumentParser(description='Esegui una funzione specifica.')
    parser.add_argument('funzione', choices=['get_temp_from_slave','get_hum_from_slave','detects_movement'], help='Nome della funzione da eseguire')
    args = parser.parse_args()

    if args.funzione == 'get_temp_from_slave':
        return get_temp_from_slave()
    elif args.funzione == 'get_hum_from_slave':
        return get_hum_from_slave()
    elif args.funzione == 'detects_movement':
        return detects_movement()

if __name__ == '__main__':
    main()
    
