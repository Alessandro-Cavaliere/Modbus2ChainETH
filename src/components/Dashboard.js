import React, { useEffect, useRef, useState } from "react";
import styles from "./styles/Dashboard.module.css";
import Navbar from "./Navbar";
import SummaryBox from "./SummaryBox";
import axios from "axios";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
const https = require('https');

const Dashboard = ({user}) => {
  const [temp, setTemp] = useState("")
  const [hum, setHum] = useState("")
  const [latestNotarizedTemp, setLatestNotarizedTemp] = useState("")
  const [latestNotarizedHum, setLatestNotarizedHum] = useState("")
  const [latestTransaction, setLatestTransaction] = useState("")
  const [loading, setLoading] = useState(false)
  const [cookies, setCookie] = useCookies(["accessToken"]);

  const notarizedInputRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_MIDDLEWARE_BASE_URL}protected`
        );
        console.log(response);
        setTemp(response.data.random_number); // Assicurati di impostare il dato che ti interessa
      } catch (err) {
        console.error(err);
        if (err.response) {
          toast.error(err.response.data.error);
        }
      }
    };

    //fetchData();
  });

  const handleNotarization = async(e,flag,data) => {
      if(flag === "Temperature"){
        setLoading(true)
        e.preventDefault();
        try {
            const response = await axios.post(
                process.env.REACT_APP_MIDDLEWARE_BASE_URL + "notarize-temperature",
                {
                    email: 2,
                    password: 2,
                },
                {
                    headers: {
                        Authorization: `Bearer ${cookies.accessToken}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    }
                }
            );
            setLatestNotarizedTemp(response.data.temperature)
            setLatestTransaction(response.data.blockchain_receipt.hash)
            setLoading(false)
            toast.success("Temperature succsessfull notarized!", {
                onClose: () => {
                  notarizedInputRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                },
            });  
          } catch (err) {
            console.log(err)
            if (err.response) {
                toast.error(err.response.data.error)
            } 
        }
      } else {
        setLoading(true)
        e.preventDefault();
        try {
          const response = await axios.get(
            process.env.REACT_APP_MIDDLEWARE_BASE_URL + "protected"
          );
          //setLatestNotarizedHum(response.data.humidity)
          //setLatestTransaction(response.data.blockchain_receipt.hash)
          setLoading(false)
          toast.success("Humidity succsessfull notarized!", {
              onClose: () => {
                notarizedInputRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            },
          });  
        } catch (err) {
            console.log(err)
            if (err.response) {
                toast.error(err.response.data.error)
            } 
        }
      }
  };

  return (
    <>
    <Navbar user={user}/>
    <div className={`${styles.dashboard} ${styles["dashboard-container"]}`}>
      <div className={styles.buttonContainer}>
        <div className={styles.buttonChildContainer}>
          <SummaryBox
            title="Temperature"
            count={30}
            backgroundColor="#D7A70C"
            emoij={"🌡️"}
            temp={temp}
            handleNotarization={handleNotarization}
          />
          <SummaryBox
            title="Humidity"
            count={30}
            backgroundColor="#7B629E" 
            emoij={"💧"}
            handleNotarization={handleNotarization}
          />
        </div>
      </div>

      <div style={{marginTop:50}} ref={notarizedInputRef}>
      <h1>tabell</h1>
        <th>
          <tr>

          </tr>
        </th>
      </div>

      
    </div>
    </>
  );
};

export default Dashboard;
