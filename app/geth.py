from web3 import Web3, HTTPProvider
from web3.middleware import geth_poa_middleware
import asyncio
import json
import os

# Collegati alla tua rete Geth privata (assicurati di fornire l'URL corretto)
web3 = Web3(HTTPProvider('http://127.0.0.1:8546'))
web3.middleware_onion.inject(geth_poa_middleware, layer=0)
print(web3.client_version)
# Imposta l'indirizzo dello smart contract e l'ABI
contract_address = os.getenv('SC_ADDRESS')
with open('./build/contracts/IoTDataNotarization.json') as f:
    contract_json = json.load(f)
    abi = contract_json['abi']

contract = web3.eth.contract(address=contract_address, abi=abi)
print(contract)
gas_limit = 200000
gas_price = web3.to_wei('20000000000', 'wei')


async def get_temperature(device_id):
    function_data = contract.functions.readTemperatureRecord(device_id).call()
    print('Transazione GET Temperature completata. Risposta:', function_data)
    return function_data


async def get_humidity(device_id):
    function_data = contract.functions.readHumidityRecord(device_id).call()
    print('Transazione GET Umidità completata. Risposta:', function_data)
    return function_data


async def post_temperature(from_address, device_id, temperature):
    print("funzione on")
    nonce = web3.eth.get_transaction_count(from_address)
    print(nonce)

    transaction_data = contract.functions.recordTemperature(device_id, temperature).build_transaction({
        'from': from_address,
        'chainId': 10002,
        'nonce': nonce
    })
    private_key = ""
    if (from_address == os.getenv('1_PUB_KEY')):
        private_key = os.getenv('1_PRIV_KEY')
    elif (from_address == os.getenv('2_PUB_KEY')):
        private_key = os.getenv('2_PRIV_KEY')
    elif (from_address == os.getenv('3_PUB_KEY')):
        private_key = os.getenv('3_PRIV_KEY')

    signed_transaction = web3.eth.account.sign_transaction(
        transaction_data, private_key=private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_transaction.rawTransaction)
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    block_number = receipt['blockNumber']

    block = web3.eth.get_block(block_number)
    timestamp = block['timestamp']
    print('Transazione POST completata. Risposta:', receipt)
    return {"receipt": receipt, "timestamp": timestamp}


async def post_humidity(from_address, device_id, humidity):
    nonce = web3.eth.get_transaction_count(from_address)
    print(nonce)

    transaction_data = contract.functions.recordHumidity(device_id, humidity).build_transaction({
        'from': from_address,
        'chainId': 10002,
        'nonce': nonce
    })

    private_key = ""
    if (from_address == os.getenv('1_PUB_KEY')):
        private_key = os.getenv('1_PRIV_KEY')
    elif (from_address == os.getenv('2_PUB_KEY')):
        private_key = os.getenv('2_PRIV_KEY')
    elif (from_address == os.getenv('3_PUB_KEY')):
        private_key = os.getenv('3_PRIV_KEY')

    signed_transaction = web3.eth.account.sign_transaction(
        transaction_data, private_key=private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_transaction.rawTransaction)
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    block_number = receipt['blockNumber']

    block = web3.eth.get_block(block_number)
    timestamp = block['timestamp']
    print('Transazione POST completata. Risposta:', receipt)
    return {"receipt": receipt, "timestamp": timestamp}
