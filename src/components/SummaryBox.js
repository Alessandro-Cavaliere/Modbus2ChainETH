import React, { useState } from 'react';
import style from './styles/SummaryBox.module.css'; // Assicurati che il file CSS sia presente nella stessa cartella

const SummaryBox = ({ title, temp, hum, backgroundColor, iconColor, emoij, handleNotarization }) => {
  const [hover, setHover] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = () => setHover(true);
  const handleMouseLeave = () => setHover(false);
  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    });
  };
  return (
    <div className={style.summaryBox} style={{ backgroundColor: backgroundColor }} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave} 
        onMouseMove={handleMouseMove}
        onClick={(e)=>handleNotarization(e,title, title === "Temperature"? temp : hum)}
    >
      <span className={style.liveIndicator}>LIVE MONITORING</span>  
      <span className={style.icon} style={{ color: iconColor }}>{emoij}</span> {/* Sostituisci con la tua icona */}
      <div className={style.textContent}>
        <h2>{title}</h2>
        <p>{title === "Temperature"? temp+" °C": hum+" %"}</p>
      </div>
      {hover && (
        <div 
          className={style.notarizeText}
          style={{
            left: mousePosition.x,
            top: mousePosition.y
          }}
        >
          ✅Notarizza
        </div>
      )}
    </div>
  );
};

export default SummaryBox;