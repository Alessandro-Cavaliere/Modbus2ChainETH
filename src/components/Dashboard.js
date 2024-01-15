import React, { useEffect, useRef, useState } from "react";
import styles from "./styles/Dashboard.module.css";
import Navbar from "./Navbar";
import SummaryBox from "./SummaryBox";
import axios from "axios";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Transactions from "./Transactions";
import { Modal } from "react-bootstrap";
import { ClipLoader } from "react-spinners";
const Dashboard = ({user}) => {
  const [temp, setTemp] = useState("")
  const [hum, setHum] = useState("")
  const [latestNotarizedTemp, setLatestNotarizedTemp] = useState("")
  const [latestNotarizedHum, setLatestNotarizedHum] = useState("")
  const [latestTransaction, setLatestTransaction] = useState("")
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const notarizedInputRef = useRef(null);

  const fetchHum = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_MIDDLEWARE_BASE_URL + "view-humidity",
        {
          headers: {
            Authorization: `Bearer ${cookies.accessToken}`,
          },
        }
      );

      setHum(response.data.humidity);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchHum, 12000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchTemp = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_MIDDLEWARE_BASE_URL + "view-temperature",
        {
          headers: {
            Authorization: `Bearer ${cookies.accessToken}`,
          },
        }
      );

      // Aggiorna i dati nel tuo stato
      setTemp(response.data.temperature);
    } catch (err) {
      console.error(err);

    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchTemp, 13000);

    return () => clearInterval(intervalId);
  }, []);

  const handleNotarization = async(e,flag) => {
      if(flag === "Temperature"){
        handleShow()
        e.preventDefault();
        try {
            const response = await axios.post(
                process.env.REACT_APP_MIDDLEWARE_BASE_URL + "notarize-temperature",
                {
                    email: cookies.user,
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
            handleClose()
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
            handleClose()
            if (err.response) {
                toast.error(err.response.data.error)
            } 
        }
      } else {
        handleShow()
        e.preventDefault();
        try {
          const response = await axios.post(
            process.env.REACT_APP_MIDDLEWARE_BASE_URL + "notarize-humidity",
            {
              email: cookies.user,
            },
            {
              headers: {
                Authorization: `Bearer ${cookies.accessToken}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                }
            }
          );
          setLatestNotarizedHum(response.data.humidity)
          setLatestTransaction(response.data.blockchain_receipt.hash)
          handleClose()
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
            handleClose()
            if (err.response) {
                toast.error(err.response.data.error)
            } 
        }
      }
  };

  return (
    <>
    <Navbar/>
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
            latestTransaction={latestTransaction}
          />
          <SummaryBox
            title="Humidity"
            count={30}
            backgroundColor="#7B629E"
            hum={hum} 
            emoij={"💧"}
            handleNotarization={handleNotarization}
            latestTransaction={latestTransaction}
          />
        </div>
      </div>
      <Transactions email={user} notarizedInputRef={notarizedInputRef}/>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header style={{justifyContent:"center"}}>
          <Modal.Title style={{color: "red",fontWeight: "bold"}}>Notarization</Modal.Title>
        </Modal.Header>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%"}}>
        <ClipLoader size={40} color="#000" className={styles.clip} />
        <Modal.Body style={{fontSize:25, color:"black"}}>Notarization in progress... <br></br> Waiting the validator signing the transaction</Modal.Body>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default Dashboard;
