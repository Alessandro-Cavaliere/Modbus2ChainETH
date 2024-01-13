import { useCallback, useState } from "react";
import styles from "./styles/Transaction.module.css"
import { Button, Col, Row } from "react-bootstrap";
const Transaction = (e) => {
    const [transactions, setTransactions] = useState([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [tooltipText, setTooltipText] = useState("");
    const tableRowClassName = isHovered ? styles.hovered : "";
    const [copyPopupVisible, setCopyPopupVisible] = useState(false);
    const [copyPopupText, setCopyPopupText] = useState("");
    const [copyPopupPosition, setCopyPopupPosition] = useState({
      top: 0,
      left: 0,
    });

    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
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
    return(
        <>
        {loading ? (
            <div>
              <ClipLoader size={40} color="#001e66" />
            </div>
          ) : (
            <>
            {transactions.length == 0 ? (
                <div className={styles.divNoTx}>
                  <p className={styles.pStyle}>
                    {t("History.noTxFound")}
                    <b className={styles.coinType}>
                      {" "}
                      {currentAddress.substring(0, 4) +
                        "..." +
                        currentAddress.substring(currentAddress.length - 5)}
                    </b>
                  </p>
                </div>
              ) : (
                <div
                  className={styles.table_container}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                >
                  <p style={{ textAlign: "center" }}>{t("History.txList")}</p>
                  <table>
                    <thead>
                      <tr>
                        <th
                          style={{ color: "var(--color-darkgoldenrod)" }}
                          onMouseEnter={() =>
                            handleMouseOver("Transaction ID")
                          }
                          onMouseLeave={handleMouseOut}
                        >
                          TxID
                        </th>
                        <th
                          onMouseEnter={() =>
                            handleMouseOver("Validator Address")
                          }
                          onMouseLeave={handleMouseOut}
                        >
                          Validator Address
                        </th>
    
                        <th
                          style={{ color: "var(--color-darkgoldenrod)" }}
                          onMouseEnter={() => handleMouseOver("Value")}
                          onMouseLeave={handleMouseOut}
                        >
                          Value
                        </th>
                        <th
                          onMouseEnter={() => handleMouseOver("Date")}
                          onMouseLeave={handleMouseOut}
                        >
                          Date
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
                            onMouseOver={() => handleMouseOver(item.tx)}
                            onMouseOut={handleMouseOut}
                            onClick={(event) => handleCopyClick(item.tx, event, "tx")}
                            style={{ cursor: "pointer" }}
                          >
                            {item.tx}
                          </td>
                          <td
                            onMouseOver={() => handleMouseOver(item.from_address)}
                            onMouseOut={handleMouseOut}
                            onClick={(event) =>
                              handleCopyClick(item.from_address, event)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {item.from_address}
                          </td>
                          <td
                            onMouseOver={() =>
                              handleMouseOver(item.destination_address)
                            }
                            onMouseOut={handleMouseOut}
                            onClick={(event) =>
                              handleCopyClick(item.destination_address, event)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {item.destination_address}
                          </td>
                          {item.chain === item.token ? (
                            <td
                              onMouseOver={() => handleMouseOver(item.chain)}
                              onMouseOut={handleMouseOut}
                            >
                              {item.chain}
                            </td>
                          ) : (
                            <td
                              onMouseOver={() => handleMouseOver(item.token)}
                              onMouseOut={handleMouseOut}
                            >
                              {item.token}
                            </td>
                          )}
                          <td
                            onMouseOver={() => handleMouseOver(item.amount)}
                            onMouseOut={handleMouseOut}
                          >
                            {item.amount}
                          </td>
                          <td
                            onMouseOver={() => handleMouseOver(item.data_insert)}
                            onMouseOut={handleMouseOut}
                          >
                            {formatDate(item.data_insert)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Row>
                    <Col xs={6} md={6} lg={6} xl={6}>
                      <Button
                      >
                        Next
                      </Button>
                    </Col>
                    <Col xs={6} md={6} lg={6} xl={6} className="text-right">
                      <Button
                        
                      >
                        Prev
                      </Button>
                    </Col>
                  </Row>
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
     )
};

export default Transaction