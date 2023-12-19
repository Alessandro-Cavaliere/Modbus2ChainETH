import React, { useState } from "react";
import styles from "./styles/Dashboard.module.css";

const Dashboard = () => {
  const [values, setValues] = useState({
    TEMPERATURA: null,
    "UMIDITA'": null,
    ALLARME: null,
    "SENSORE DI MOVIMENTO": null,
  });

  const handleButtonClick = (buttonName) => {
    setValues({
      ...values,
      [buttonName]: Math.floor(Math.random() * 100),
    });
  };

  const renderTables = () => {
    return (
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {["TEMPERATURA", "UMIDITA'", "ALLARME", "SENSORE DI MOVIMENTO"].map(
          (name) => (
            <table key={name}>
              <thead>
                <tr>
                  <th className={styles.whiteBoxText}>{name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.whiteBoxText}>
                    {values[name] !== null ? `${values[name]}` : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          )
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.dashboard} ${styles["dashboard-container"]}`}>
      <div className={styles.whiteBox}>
        <h1>MODBUS2CHAIN</h1>
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.myButton} onClick={() => handleButtonClick("TEMPERATURA")}>
          TEMPERATURA
        </button>
        <button className={styles.myButton} onClick={() => handleButtonClick("UMIDITA'")}>
          UMIDITA'
        </button>
        <button className={styles.myButton} onClick={() => handleButtonClick("ALLARME")}>
          ALLARME
        </button>
        <button className={styles.myButton} onClick={() => handleButtonClick("SENSORE DI MOVIMENTO")}>
          SENSORE DI MOVIMENTO
        </button>
      </div>
      <div className={styles.tableContainer}>
        {renderTables()}
      </div>
    </div>
  );
};

export default Dashboard;
