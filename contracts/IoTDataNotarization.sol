// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IoTDataNotarization {
    struct TemperatureRecord {
        uint temperature;
        uint timestamp;
    }

    struct HumidityRecord {
        uint humidity;
        uint timestamp; 
    }

    struct Device {
        TemperatureRecord temperatureRecord;
        HumidityRecord humidityRecord;
    }

    mapping(string => Device) public devices;

    //Limit thresholds for Event Logs
    uint public temperatureThreshold;
    uint public humidityThreshold;

    //Events
    event TemperatureAlert(string deviceId, uint temperature);
    event HumidityAlert(string deviceId, uint humidity);

    //Functions to set thresholds
    function setTemperatureThreshold(uint _temperatureThreshold) public {
        temperatureThreshold = _temperatureThreshold;
    }

    function setHumidityThreshold(uint _humidityThreshold) public {
        humidityThreshold = _humidityThreshold;
    }

    //Functions for notarizing data
    function recordTemperature(string memory deviceId, uint temperature) public {
        TemperatureRecord memory tempRecord = TemperatureRecord(temperature, block.timestamp);
        devices[deviceId].temperatureRecord = tempRecord;

        if(temperature >= temperatureThreshold) {
            emit TemperatureAlert(deviceId, temperature);
        }
    }

    function recordHumidity(string memory deviceId, uint humidity) public {
        HumidityRecord memory humidRecord = HumidityRecord(humidity, block.timestamp);
        devices[deviceId].humidityRecord = humidRecord;

        if(humidity >= humidityThreshold) {
            emit HumidityAlert(deviceId, humidity);
        }
    }

    //Functions for reading laetst notarized data
    function readTemperatureRecord(string memory deviceId) public view returns (TemperatureRecord memory) {
        return devices[deviceId].temperatureRecord;
    }

    function readHumidityRecord(string memory deviceId) public view returns (HumidityRecord memory) {
        return devices[deviceId].humidityRecord;
    }
}
