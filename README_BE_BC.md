# Blockchain & Back-End Application

The project consists of a back-end based on Hyperledger Fabric, an enterprise blockchain platform, and middleware written in Python. The goal of the project is to provide a secure and reliable infrastructure for managing environmental data collected from IoT devices using the Modbus TCP protocol.

The middleware in Python is used to convert Modbus data into formats readable by the Hyperledger Fabric blockchain, thus enabling secure and reliable recording and management of environmental data.

The IoT device communication framework is written in Python and is part of the back-end. The project can be used in different contexts, such as for real-time environmental data management, tracking, or smart contract management. Due to its modularity and flexibility, the project can be easily adapted to the specific needs of different organizations.

In summary, the project provides a robust and secure infrastructure for managing environmental data taken from IoT devices using the Modbus TCP protocol, based on Hyperledger Fabric and middleware in Python.

## 📚 Pre-requisite
The following is the list of requirements for the application to function properly

 -  *Go-Ethereum (GETH) 1.13.x*
 -  *Python 3.x*
 -  *Node.js >= 16.x*

## 🛠️ Installation

Install all dependencies with ***pip***:

```pip
    pip install -r .\requirements.txt            
```

## ⚙️ Blockchain Configuration 
To create a private blockchain network using Geth, we need to do a few things first:

1. First of all you need to write your `genesis.json` file:

⬇️Below an example⬇️
```
    { 
    "config": {
        "chainId": 10002, //arbitrary number of your choice, as long as it does not coincide with existing public networks
        "homesteadBlock": 0,
        "eip150Block": 0,
        "eip155Block": 0,
        "eip158Block": 0,
        "byzantiumBlock": 0,
        "constantinopleBlock": 0,
        "petersburgBlock": 0,
        "istanbulBlock": 0,
        "muirGlacierBlock": 0,
        "berlinBlock": 0,
        "londonBlock": 0,
        "arrowGlacierBlock": 0,
        "grayGlacierBlock": 0,
        "clique": { 
            "period": 0, //it depends on the difficulty that you want for your network. Use zero if you want a transaction for every block avoiding the blockchain generating empty blocks over time.
            "epoch": 30000
        }
    },
    "difficulty": "1",
    "gasLimit": "800000000",
    "extradata": "0x0000000000000000000000000000000000000000000000000000000000000000<EthereumAddress_1_without_0x><EthereumAddress_1_without_0x>00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "alloc": { 
        "EthereumAddress_1_without_0x": { "balance": "100000000000000000000" } //It is advisable to enter a high balance (the balance is in fictitious ETH),
        "EthereumAddress_2_without_0x": { "balance": "100000000000000000000" }
        //You can enter the various validators you want to set here
    }
    }
```

Genesis is a very important configuration file in Geth and in general in a private network (like Hyperledger Besu), the latter, in our specific case, indicates to the network who the network validators are and other configurations that you can manage by setting the various fields.
The extradata field must be filled with the addresses of the various validators without the initial "0x" by concatenating the values from the sixty-fourth zero onwards (excluding the initial 0x), shown as in the code above.
In this project we use the clique field in the genesis file, in such a way as to enable a `PoA (Proof of Authority)` consensus.

For more details, see the official documentation here ➡️ [Private Network Docs](https://geth.ethereum.org/docs/fundamentals/private-network)

2. Generate new addresses to use them as validators (if you already have addresses, skip this part):

Run this command:
```
    geth account new --datadir data
```
This command, in addition to displaying the generated address, will ask you for a password with which to encrypt the private key associated with it, so that it can be saved safely on the device. 
The public address, if you want to make it validator, must be inserted, as anticipated, in the extradata field and in the alloc field.
You will also create a folder named `data` which in turn contains a folder named `keystore`, in which there will be all the encrypted keys that you will generate.

3. Initializing the Geth Database:

Now, after inserting the validator addresses into Genesis, we move on to creating a blockchain node that uses this Genesis block. To do this, first use `geth init` to import and set the canonical genesis block for the new chain. This requires the path to genesis.json to be passed as an argument.

```
    geth init --datadir node1 genesis.json   
```
You can run this command for as many blocks as you want, the important thing is to use different datadir names.


4. Set up a peer-to-peer network:

After creating your N blocks and your N folders, you can launch each node through this command, changing its ports and addresses.
```
    geth --datadir node1 --syncmode 'full' --port 30314 --networkid 10002 --miner.etherbase "EthereumAddress_1" --http --http.corsdomain '*' --authrpc.port 8552 --http.port 8546 --http.addr 127.0.0.1 --http.vhosts '*' --http.api admin,eth,miner,net,txpool,personal,web3 --ipcdisable  --mine --allow-insecure-unlock --unlock "EthereumAddress_1" console 
```

To understand why I use these flags, consult the documentation ➡️ [Command Line Options](https://geth.ethereum.org/docs/fundamentals/command-line-options)

Run this command for each node on different processes for proper functioning.

## 🚀 Usage
>To launch and run this application assumes proper configuration and setting of the IoT device architecture, middleware and the Geth Blockchain. 

To launch the application:
```python
    cd app
    python app.py          
```
or, if you want to use in dev-mode run from the root of the project:

```python
    python app/app.py          
```


    