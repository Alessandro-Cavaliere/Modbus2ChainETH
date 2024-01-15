#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

"""
Main script

Do your stuff here, this file is similar to the loop() function on Arduino

Create a Modbus TCP client (slave) which can be requested for data or set with
specific values by a host device.

The TCP port and IP address can be choosen freely. The register definitions of
the client can be defined by the user.
"""

# system packages
import time
import urequests as requests
from package.umodbus import tcp
from sensors_data import read_humidity_once,read_temperature_once,detect_motion

IS_DOCKER_MICROPYTHON = False
try:
    import network
except ImportError:
    IS_DOCKER_MICROPYTHON = True
    import json


# ===============================================
if IS_DOCKER_MICROPYTHON is False:
    # connect to a network
    station = network.WLAN(network.STA_IF)
    if station.active() and station.isconnected():
        station.disconnect()
        time.sleep(1)
    station.active(False)
    time.sleep(1)
    station.active(True)

    # station.connect('SSID', 'PASSWORD')
    station.connect('Alex', 'miciona97')
    time.sleep(1)

    while True:
        print('Waiting for WiFi connection...')
        if station.isconnected():
            print('Connected to WiFi.')
            print(station.ifconfig())
            break
        time.sleep(2)

# ===============================================
# TCP Slave setup
tcp_port = 502              # port to listen to

if IS_DOCKER_MICROPYTHON:
    local_ip = station.ifconfig()[0]    # static Docker IP address
else:
    # set IP address of the MicroPython device explicitly
    # local_ip = '192.168.4.1'    # IP address
    # or get it from the system after a connection to the network has been made
    local_ip = station.ifconfig()[0]

# ModbusTCP can get TCP requests from a host device to provide/set data
client = tcp.ModbusTCP()
is_bound = False

# check whether client has been bound to an IP and port
is_bound = client.get_bound_status()
print(is_bound)
print(local_ip)

if not is_bound:
    client.bind(local_ip=local_ip, local_port=tcp_port)

import socket
import machine

def ping(host, port=80, timeout=1000):
    addr_info = socket.getaddrinfo(host, port)
    addr = addr_info[0][-1]

    s = socket.socket()
    s.settimeout(timeout / 1000)

    start_time = time.ticks_ms()
    try:
        s.connect(addr)
        s.close()
        return time.ticks_diff(time.ticks_ms(), start_time)
    except:
        return None

# ===============================================
# CALLBACK FUNCTIONS FOR COIL

def my_coil_set_cb(reg_type, address, val):
    print("Sto settando il registro MOVEMENT_HANDLE COILS {} dopo la chiamata write del Master con il valore [{}]". format(address,val))
    movement_coils_val = register_definitions["COILS"]["MOVEMENT_HANDLE"]['val']
    
    print("Settaggio MOVEMENT_HANDLE COILS for MOVEMENT with {}". format(movement_coils_val))
    client.set_hreg(address=42, value=movement_coils_val)  #Setting of MOVEMENT_HANDLE for MOVEMENT
    

def my_coil_get_cb(reg_type, address, val):
    print("Sto restituendo il registro MOVEMENT_HANDLE COILS {} dopo la chiamata get del Master. CURRENTLY: {}". format(address,val))

    print("Rilevamento movimenti dal sensore...")
    mov=detect_motion(1)
    print("Movimento rilevato? -> {}". format(mov))
    client.set_hreg(address=42, value=mov)

# ===============================================


# ===============================================
# CALLBACK FUNCTIONS FOR HUMIDITY

def my_holding_register_set_temperature(reg_type, address, val):
    print("Sto settando il registro TEMPERATURE HREGS {} dopo la chiamata write del Master con il valore [{}]". format(address,val))
    temperature_hreg_val = register_definitions["HREGS"]["TEMPERATURE_HREG"]['val']
    
    print("Settaggio TEMP HREG for TEMPERATURE with {}". format(temperature_hreg_val))
    client.set_hreg(address=93, value=temperature_hreg_val)  #Setting of TEMP_HREG for temperature
    
def my_holding_register_get_temperature(reg_type, address, val):
    print("Sto restituendo il registro TEMPERATURE HREGS {} dopo la chiamata get del Master. CURRENTLY: {}". format(address,val))

    print("Prelevo i dati dal sensore...")
    x=read_temperature_once(0)
    print("Temperatura restituita: {}°C". format(x))
    client.set_hreg(address=96, value=x)

# ===============================================


# ===============================================
# CALLBACK FUNCTIONS FOR HUMIDITY

def my_holding_register_set_humidity(reg_type, address, val):
    print("Sto settando il registro HUMIDITY HREGS {} dopo la chiamata write del Master con il valore [{}]". format(address,val))
    humidity_hreg_val = register_definitions["HREGS"]["HUMIDITY_HREG"]['val']
    
    print("Settaggio TEMP HREG for HUMIDITY with {}". format(humidity_hreg_val))
    client.set_hreg(address=94, value=humidity_hreg_val)  #Setting of TEMP_HREG for humidity


def my_holding_register_get_humidity(reg_type, address, val):
    print("Sto restituendo il registro HUMIDITY HREGS {} dopo la chiamata get del Master. CURRENTLY: {}". format(address,val))
    
    print("Prelevo i dati dal sensore...")
    x=read_humidity_once(0)
    print("Temperatura restituita: {} °C". format(x))
    client.set_hreg(address=95, value=x)

# ===============================================
 
# ===============================================
# TEMPORARY REGISTERS CALLBACK FUNCTIONS FOR TEMPERATURE

def my_holding_register_set_temp_temperature(reg_type, address, val):
    print("Sto settando il registro **TEMPORANEO** TEMPERATURE HREGS {} dopo la chiamata write del Master con il valore [{}]". format(address,val))
    

def my_holding_register_get_temp_temperature(reg_type, address, val):
    print("Sto restituendo il registro **TEMPORANEO** TEMPERATURE HREGS {} dopo la chiamata get del Master. CURRENTLY: {}". format(address,val))
    
# ===============================================   
  
# ===============================================
# TEMPORARY REGISTERS CALLBACK FUNCTIONS FOR HUMIDITY

def my_holding_register_set_temp_humidity(reg_type, address, val):
    print("Sto settando il registro **TEMPORANEO** HUMIDITY HREGS {} dopo la chiamata write del Master con il valore [{}]". format(address,val))
    
def my_holding_register_get_temp_humidity(reg_type, address, val):
    print("Sto restituendo il registro **TEMPORANEO** HUMIDITY HREGS {} dopo la chiamata get del Master. CURRENTLY: {}". format(address,val))

# ===============================================

def my_discrete_inputs_register_get_cb(reg_type, address, val):
    print('Custom callback, called on getting {} at {}, currently: {}'.
          format(reg_type, address, val))


def my_inputs_register_get_cb(reg_type, address, val):
    # usage of global isn't great, but okay for an example
    global client

    print('Custom callback, called on getting {} at {}, currently: {}'.
          format(reg_type, address, val))

    # any operation should be as short as possible to avoid response timeouts
    new_val = val[0] + 1

    # It would be also possible to read the latest ADC value at this time
    # adc = machine.ADC(12)     # check MicroPython port specific syntax
    # new_val = adc.read()

    client.set_ireg(address=address, value=new_val)
    print('Incremented current value by +1 before sending response')


def reset_data_registers_cb(reg_type, address, val):
    # usage of global isn't great, but okay for an example
    global client
    global register_definitions

    print('Resetting register data to default values ...')
    client.setup_registers(registers=register_definitions)
    print('Default values restored')

def my_holding_register_set_temp_register(reg_type, address, val):
    print('Custom callback, called on getting {} at {}, currently: {}'.
          format(reg_type, address, val))
    print("FATTO")

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

# alternatively the register definitions can also be loaded from a JSON file
# this is always done if Docker is used for testing purpose in order to keep
# the client registers in sync with the test registers
if IS_DOCKER_MICROPYTHON:
    with open('registers/example.json', 'r') as file:
        register_definitions = json.load(file)
        
# ===============================================
# add callbacks for different Modbus functions

#MOVEMENT COILS CALLBACKS
register_definitions['COILS']['MOVEMENT_HANDLE']['on_set_cb'] = my_coil_set_cb
register_definitions['COILS']['MOVEMENT_HANDLE']['on_get_cb'] = my_coil_get_cb

#TEMPERATURE CALLBACKS
register_definitions['HREGS']['TEMPERATURE_HREG']['on_set_cb'] = my_holding_register_set_temperature
register_definitions['HREGS']['TEMPERATURE_HREG']['on_get_cb'] = my_holding_register_get_temperature


#HUMIDITY CALLBACKS
register_definitions['HREGS']['HUMIDITY_HREG']['on_set_cb'] = my_holding_register_set_humidity
register_definitions['HREGS']['HUMIDITY_HREG']['on_get_cb'] = my_holding_register_get_humidity


#TEMP REG CALLBACKS FOR TEMPERATURE
register_definitions['HREGS']['TEMP_HREG_TEMPERTURE']['on_set_cb'] = my_holding_register_set_temp_temperature
register_definitions['HREGS']['TEMP_HREG_TEMPERTURE']['on_get_cb'] = my_holding_register_get_temp_temperature


#TEMP REG CALLBACKS FOR HUMIDITY
register_definitions['HREGS']['TEMP_HREG_HUMIDITY']['on_set_cb'] = my_holding_register_set_temp_humidity
register_definitions['HREGS']['TEMP_HREG_HUMIDITY']['on_get_cb'] = my_holding_register_get_temp_humidity


print('Setting up registers ...')
# use the defined values of each register type provided by register_definitions
client.setup_registers(registers=register_definitions)
# alternatively use dummy default values (True for bool regs, 999 otherwise)
# client.setup_registers(registers=register_definitions, use_default_vals=True)
print('Register setup done')

print('Serving as TCP client on {}:{}'.format(local_ip, tcp_port))

while True:
    try:
        result = client.process()
    except KeyboardInterrupt:
        print('KeyboardInterrupt, stopping TCP client...')
        break
    except Exception as e:
        print('Exception during execution: {}'.format(e))

print("Finished providing/accepting data as client")

