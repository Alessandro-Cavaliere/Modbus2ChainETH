import { useCallback, useEffect, useState } from "react";
import styles from "./styles/Transaction.module.css";
import { Button, Col, Row } from "react-bootstrap";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import axios from "axios";
import { useCookies } from "react-cookie";
import { format } from "url";
const Transactions = ({ notarizedInputRef }) => {
  const [transactions, setTransactions] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipText, setTooltipText] = useState("");
  const tableRowClassName = isHovered ? styles.hovered : "";
  const [copyPopupVisible, setCopyPopupVisible] = useState(false);
  const [copyPopupText, setCopyPopupText] = useState("");
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [copyPopupPosition, setCopyPopupPosition] = useState({
    top: 0,
    left: 0,
  });

  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const giorno = date.getDate();
    const mese = date.getMonth() + 1;
    const anno = date.getFullYear();
    const ore = date.getHours();
    const minuti = date.getMinutes();
    const secondi = date.getSeconds();
    const formatted = `${giorno}/${mese}/${anno} ${ore}:${minuti}:${secondi}`;
    return formatted;
  }

  const handleCopyClick = (text, event, type) => {
    navigator.clipboard.writeText(text);
    setCopyPopupText(text);

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    setCopyPopupPosition({ top: mouseY, left: mouseX });
    setCopyPopupVisible(true);

    setTimeout(() => {
      setCopyPopupVisible(false);
    }, 2000);
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTooltipText("");
  }, []);

  const handleMouseMove = (e) => {
    setTooltipPosition({ top: e.clientY + 10, left: e.clientX + 10 });
  };

  const handleMouseOver = useCallback((text) => {
    setIsHovered(true);
    setTooltipText(text);
  }, []);

  const handleMouseOut = useCallback(() => {
    setIsHovered(false);
    setTooltipText("");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.post(
          process.env.REACT_APP_MIDDLEWARE_BASE_URL + "get-transactions",
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
        setLoading(false)
        setTransactions(response.data.transactions);
        console.log(transactions);
      } catch (err) {
        console.error(err);
        setLoading(false)
        if (err.response) {
          toast.error(err.response.data.error);
        } else {
          toast.error("Si è verificato un errore nella richiesta.");
        }
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {loading ? (
        <div className={styles.divLoading}>
            <p className={styles.pStyleTitle}>Loading... </p>
            <ClipLoader size={40} color="#FFF" />
        </div>
      ) : (
        <>
          {transactions.length == 0 ? (
            <div className={styles.divNoTx}>
              <p className={styles.pStyleTitle} >Transaction List</p>
              <p className={styles.pStyle}>
                No transactions found for
                <b className={styles.coinType}> {cookies.user}</b>
              </p>
            </div>
          ) : (
            <div
              className={styles.table_container}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              <p className={styles.pStyleTitle} >Transaction List</p>
              <table ref={notarizedInputRef}>
                <thead>
                  <tr>
                    <th
                      style={{ color: "#f8312f" }}
                      onMouseEnter={() => handleMouseOver("Transaction ID")}
                      onMouseLeave={handleMouseOut}
                    >
                      TxID
                    </th>
                    <th
                      onMouseEnter={() => handleMouseOver("Validator Address")}
                      onMouseLeave={handleMouseOut}
                    >
                      Validator Address
                    </th>

                    <th
                      onMouseLeave={handleMouseOut}
                    >
                      Block Number
                    </th>
                    <th
                      onMouseEnter={() => handleMouseOver("Date")}
                      onMouseLeave={handleMouseOut}
                    >
                      Timestamp
                    </th>
                  </tr>
                </thead>
                {copyPopupVisible && (
                  <div
                    className={styles.copyPopup}
                    style={{
                      top: copyPopupPosition.top,
                      left: copyPopupPosition.left,
                    }}
                  >
                    Copied: {copyPopupText}
                  </div>
                )}
                <tbody>
                  {transactions.map((item, i) => (
                    <tr key={i} className={tableRowClassName}>
                      <td
                        onMouseOver={() => handleMouseOver(item.txID)}
                        onMouseOut={handleMouseOut}
                        onClick={(event) =>
                          handleCopyClick(item.txID, event, "tx")
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {item.txID}
                      </td>
                      <td
                        onMouseOver={() =>
                          handleMouseOver(item.validator_address)
                        }
                        onMouseOut={handleMouseOut}
                        onClick={(event) =>
                          handleCopyClick(item.validator_address, event)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {item.validator_address}
                      </td>
                      <td
                        onMouseOver={() => handleMouseOver(item.block_number)}
                        onMouseOut={handleMouseOut}
                      >
                        {item.block_number}
                      </td>
                      <td
                        onMouseOver={() => handleMouseOver(formatDate(item.timestamp))}
                        onMouseOut={handleMouseOut}
                      >
                        {formatDate(item.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {showTooltip && (
                <div
                  className={styles.tooltip}
                  style={{
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                  }}
                >
                  {tooltipText}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Transactions;
