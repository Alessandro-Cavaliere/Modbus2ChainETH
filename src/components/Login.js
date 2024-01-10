import { useRef, useState, useEffect, useContext } from "react";
import {
    faCheck,
    faTimes,
    faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import styles from "./styles/Login.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";

const Login = () => {
    const navigate = useNavigate();
    const userRef = useRef();
    const errRef = useRef();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const [confirm, setConfirm] = useState(queryParams.get("confirm"));
    const [activation, setActivation] = useState(queryParams.get("activation"));

    const LOGIN_URL = "/api/login";
    const VERIFY_OTP_URL = "/api/verifyOTP";

    const [verifyError, setVerifyError] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [accessToken, setAccessToken] = useState(null);
    const [show2FAForm, setShow2FAForm] = useState(false);
    const [is2FA, setIs2FA] = useState(false);
    const [failure, setFailure] = useState(false);
    const [inputType, setInputType] = useState("password");
    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [pwd, setPwd] = useState("");

    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [showRecover, setShowRecover] = useState(false);

    const [showResetFormPassword, setShowResetFormPassword] = useState(false);

    const toggleInputType = () => {
        setInputType(inputType === "password" ? "text" : "password");
    };

    const handleErrorSendEmail = () => {
        setFailure(false);
        setErrMsg("");
    };

    const handleConfirmation = () => {
        setConfirm("");
        navigate("/login");
    };

    const handleActivation = () => {
        setActivation("");
        navigate("/login");
    };

    const handleChangeEmail = (e) => {
        setErrMsg("");
        setEmail(e.target.value);
    };

    const handleChangePassword = (e) => {
        setErrMsg("");
        setPwd(e.target.value);
    };

    const handleVerifyToken = async () => {
        try {
            const response = await axios.post(
                "baseUrl" ,
                {
                    otp: authCode
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            console.log(response);
            return true;
        } catch (error) {
            console.log(error);
            setVerifyError(error.response.data.message);
            return false;
        }
    };

    useEffect(() => {
        setValidEmail(true); // Manteniamo la validazione dell'email qui se necessario
    }, []);

    const handleShowRecover = () => {
        setEmail("");
        setShowRecover(!showRecover);
    };

    const handleAuthCode = (event) => {
        setVerifyError("");
        let value = event.target.value;
        const regex = /^[0-9]{0,6}$/;
        if (regex.test(value)) {
            setAuthCode(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Verificare la validità dell'email, se necessario
        try {
            const response = await axios.post(
                "baseUrl" ,
                {
                    username: email,
                    password: pwd,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_SECRET_APP}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            const accessToken = response.data.data.token;
            let is2FALog = response.data.data.twofa;
            setAccessToken(accessToken);
            setIs2FA(is2FALog);
            
        } catch (err) {
            if (err.response) {
                setErrMsg(err.response.data.message);
            } else {
                setErrMsg(err.message);
            }
            errRef.current.focus();
        }
    };

    const handleNavigation = async (accessToken) => {
        if (is2FA === 1) {
            let isValid = await handleVerifyToken();
            console.log(isValid);
            if (!isValid) return;
        }
        navigate("/");
        setSuccess(true);
        setEmail("");
        setPwd("");
    };

    const handleSubmitSendEmail = async (e) => {
        e.preventDefault();
        // Verificare la validità dell'email, se necessario
        try {
            const response = await axios.post(
                "baseUrl" ,
                {
                    email: email,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_SECRET_APP}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            console.log(response);
            setShowResetFormPassword(true);
            setSuccess(true);
        } catch (err) {
            setFailure(true);
            if (err.response) setErrMsg(err.response.data.message);
            else {
                console.log(err);
                setErrMsg("Network Error, check your connection");
            }
        }
    };

    return (
        <>
            <div className={styles.specific_page}>
                <section className={styles.watermark}>
                    <div className={styles.formDiv}>
                        <h2 style={{ textAlign: "center" }}>Login</h2>

                        <label htmlFor="email" style={{ color: "#9f8b3b" }}>
                            Email:
                            <FontAwesomeIcon
                                icon={faCheck}
                                className={validEmail ? styles.valid : styles.hide}
                            />
                            <FontAwesomeIcon
                                icon={faTimes}
                                className={!validEmail || !email ? styles.hide : styles.invalid}
                            />
                        </label>
                        <input
                            type="text"
                            id="email"
                            className={styles.labelDiv}
                            ref={userRef}
                            autoComplete="off"
                            onChange={handleChangeEmail}
                            value={email}
                            required
                            aria-invalid={validEmail ? "false" : "true"}
                            aria-describedby="uidnote"
                            onFocus={() => setEmailFocus(true)}
                            onBlur={() => setEmailFocus(false)}
                        />
                        <p
                            id="uidnote"
                            className={
                                emailFocus && email && !validEmail
                                    ? styles.instructions
                                    : styles.offscreen
                            }
                        >
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Email
                        </p>

                        <label htmlFor="password" style={{ color: "#9f8b3b" }}>
                           Login
                        </label>
                        <div className={styles.flexDivPassword}>
                            <input
                                type={inputType}
                                id="password"
                                className={styles.labelDiv}
                                onChange={handleChangePassword}
                                value={pwd}
                                required
                                aria-describedby="pwdnote"
                            />
                            {inputType === "password" ? (
                                <AiOutlineEyeInvisible
                                    size={25}
                                    className={styles.AiOutlineEye}
                                    onClick={toggleInputType}
                                />
                            ) : (
                                <AiOutlineEye
                                    size={25}
                                    className={styles.AiOutlineEye}
                                    onClick={toggleInputType}
                                />
                            )}
                        </div>
                        <button
                            className={`${!validEmail ? styles.buttonDivDisabled : styles.buttonDiv}`}
                            disabled={!validEmail}
                            onClick={handleSubmit}
                        >
                            Sign in
                        </button>
                    </div>
                    
                </section>
            </div >
        </>
    );
};

export default Login;
