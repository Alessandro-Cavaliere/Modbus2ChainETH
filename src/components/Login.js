import { useRef, useState, useEffect } from "react";
import {
    faCheck,
    faTimes,
    faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import styles from "./styles/Login.module.css";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
const https = require('https');

const Login = ({handleLoggedUser}) => {
    const navigate = useNavigate();
    const userRef = useRef();
    const [cookies, setCookie] = useCookies(["accessToken"]);

    const [inputType, setInputType] = useState("password");
    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [pwd, setPwd] = useState("");

    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);

    const toggleInputType = () => {
        setInputType(inputType === "password" ? "text" : "password");
    };

    const handleChangeEmail = (e) => {
        setErrMsg("");
        setEmail(e.target.value);
    };

    const handleChangePassword = (e) => {
        setErrMsg("");
        setPwd(e.target.value);
    };

    useEffect(() => {
        setValidEmail(true); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                process.env.REACT_APP_MIDDLEWARE_BASE_URL + "login",
                {
                    email: email,
                    password: pwd,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_SECRET_APP}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    }
                }
            );
            console.log(response)
            const accessToken = response.data.token;
            setCookie('accessToken', accessToken, { secure: true, sameSite: 'strict' });
            toast.success("Correct credentials!", {
                onClose: () => {
                    handleNavigation()
                },
            });
            
        } catch (err) {
            console.log(err)
            if (err.response) {
                toast.error(err.response.data.error)
            } 
        }
    };



    const handleNavigation = async () => {
        navigate("/dashboard")
        setSuccess(true);
        handleLoggedUser(email)
        setEmail("");
        setPwd("");
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
                           Password
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
