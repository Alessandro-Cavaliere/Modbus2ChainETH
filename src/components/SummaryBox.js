import React, { useEffect, useState } from "react";
import style from "./styles/SummaryBox.module.css"; // Assicurati che il file CSS sia presente nella stessa cartella
import { BeatLoader } from "react-spinners";
import { useCookies } from "react-cookie";
import axios from "axios";
const SummaryBox = ({
  title,
  temp,
  hum,
  backgroundColor,
  iconColor,
  emoij,
  handleNotarization
}) => {
  const [hover, setHover] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cookies, setCookie] = useCookies(["user"]);
  const [isValidator, setIsValidator] = useState(false);

  const handleMouseEnter = () => setHover(true);
  const handleMouseLeave = () => setHover(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const response = await axios.post(
            process.env.REACT_APP_MIDDLEWARE_BASE_URL + "is-validator",
            {
              email: cookies.user,
            },
            {
              headers: {
                Authorization: `Bearer ${cookies.accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );
          setIsValidator(response.data.result)
        } catch (err) {
          console.error(err);
          setIsValidator(false);
        }
    };

    fetchData();
  }, []);

  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
  };
  return (
    <div
      className={style.summaryBox}
      style={{ backgroundColor: backgroundColor }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={(e) => isValidator?handleNotarization(e, title):null}
    >
      <span className={style.liveIndicator}>MONITORING</span>
      <span className={style.icon} style={{ color: iconColor }}>
        {emoij}
      </span>{" "}
      {/* Sostituisci con la tua icona */}
      <div className={style.textContent}>
        <h2>{title}</h2>
        <p>
          {title === "Temperature" ? (
            temp ? (
              temp + " °C"
            ) : (
              <BeatLoader size={10} color="#FFF" />
            )
          ) : hum ? (
            hum + " %"
          ) : (
            <BeatLoader size={10} color="#FFF" />
          )}
        </p>
      </div>
      {hover && (
        <div
          className={style.notarizeText}
          style={isValidator?{
            left: mousePosition.x,
            top: mousePosition.y,
          }:
          {
            left: mousePosition.x,
            top: mousePosition.y,
            backgroundColor:"red"
          }
        }
        >
          {isValidator ? "✅Notarizza" : "❎Notarizza"}
        </div>
      )}
    </div>
  );
};

export default SummaryBox;
