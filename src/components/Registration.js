import { useRef, useState, useEffect } from "react";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import styles from "./styles/Registration.module.css";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineEyeInvisible } from "react-icons/ai";

const Registration = () => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
  const REGISTER_URL = "/api/createUser";
  const RESTORE_URL = "/api/restoreUser";

  const userRef = useRef();
  const errRef = useRef();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [inputType, setInputType] = useState("password");
  const [confirmInputType, setConfirmInputType] = useState("password");
  const [registrationMessage, setRegistrationMessage] = useState("");

  const [seed, setSeed] = useState("");
  const navigate = useNavigate();

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [pwd, matchPwd]);

  const toggleInputType = () => {
    setInputType(inputType === "password" ? "text" : "password");
  };

  const toggleConfirmInputType = () => {
    setConfirmInputType(
      confirmInputType === "password" ? "text" : "password"
    );
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const isPwdValid = PWD_REGEX.test(pwd);

    if (!isPwdValid) {
      setErrMsg("errpr");
      setLoading(false);
      return;
    }

    
  };

  return (
    <>
        <div className={styles.specific_page}>
          <section className={styles.watermark}>
            <p
              ref={errRef}
              className={
                errMsg ? styles.errmsg : styles.offscreen
              }
              aria-live="assertive"
            >
              {errMsg}
            </p>
            <form
              onSubmit={handleSubmit}
              className={styles.formDiv}
            >
              <h2 style={{ textAlign: "center" }}>
                Sign up
              </h2>

              <label
                htmlFor="name"
                style={{ color: "#9f8b3b" }}
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                className={styles.labelDiv}
                autoComplete="off"
                onChange={(e) =>
                  setName(e.target.value)
                }
                value={name}
                required
                aria-describedby="uidnote"
              />

              <label
                htmlFor="surname"
                style={{ color: "#9f8b3b" }}
              >
                Surname
              </label>
              <input
                type="text"
                id="surname"
                className={styles.labelDiv}
                autoComplete="off"
                onChange={(e) =>
                  setSurname(e.target.value)
                }
                value={surname}
                required
                aria-describedby="uidnote"
              />

              <label
                htmlFor="email"
                style={{ color: "#9f8b3b" }}
              >
                Email:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={
                    validEmail
                      ? styles.valid
                      : styles.hide
                  }
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  className={
                    validEmail || !email
                      ? styles.hide
                      : styles.invalid
                  }
                />
              </label>
              <input
                type="text"
                id="email"
                className={styles.labelDiv}
                ref={userRef}
                autoComplete="off"
                onChange={(e) =>
                  setEmail(e.target.value)
                }
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
                <FontAwesomeIcon
                  icon={faInfoCircle}
                />
                Email
              </p>

              <label
                htmlFor="password"
                style={{ color: "#9f8b3b" }}
              >
                Password:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={
                    validPwd
                      ? styles.valid
                      : styles.hide
                  }
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  className={
                    validPwd || !pwd
                      ? styles.hide
                      : styles.invalid
                  }
                />
              </label>
              <div className={styles.flexDivPassword}>
                <input
                  type={inputType}
                  id="password"
                  className={styles.labelDiv}
                  onChange={(e) =>
                    setPwd(e.target.value)
                  }
                  value={pwd}
                  required
                  aria-invalid={validPwd ? "false" : "true"}
                  aria-describedby="pwdnote"
                  onFocus={() => setPwdFocus(true)}
                  onBlur={() => setPwdFocus(false)}
                />
            
               
              </div>
              <p
                id="pwdnote"
                className={
                  pwdFocus && !validPwd
                    ? styles.instructions
                    : styles.offscreen
                }
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                />{" "}
                Password{" "}
                <span aria-label="exclamation mark">
                  !
                </span>{" "}
                <span aria-label="at symbol">@</span>{" "}
                <span aria-label="hashtag">#</span>{" "}
                <span aria-label="dollar sign">$</span>{" "}
                <span aria-label="percent">%</span>
              </p>

              <label
                htmlFor="confirm_pwd"
                style={{ color: "#9f8b3b" }}
              >
                Confirm Password
                <FontAwesomeIcon
                  icon={faCheck}
                  className={
                    validMatch && matchPwd
                      ? styles.valid
                      : styles.hide
                  }
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  className={
                    validMatch || !matchPwd
                      ? styles.hide
                      : styles.invalid
                  }
                />
              </label>
              <div className={styles.flexDivPassword}>
                <input
                  type={confirmInputType}
                  id="confirm_pwd"
                  className={styles.labelDiv}
                  onChange={(e) =>
                    setMatchPwd(e.target.value)
                  }
                  value={matchPwd}
                  required
                  aria-invalid={validMatch ? "false" : "true"}
                  aria-describedby="confirmnote"
                  onFocus={() => setMatchFocus(true)}
                  onBlur={() => setMatchFocus(false)}
                />
                {confirmInputType === "password" ? (
                  <AiOutlineEyeInvisible
                    size={25}
                    className={styles.AiOutlineEye}
                    onClick={toggleConfirmInputType}
                  />
                ) : (
                  <AiOutlineEye
                    size={25}
                    className={styles.AiOutlineEye}
                    onClick={toggleConfirmInputType}
                  />
                )}
              </div>
              <p
                id="confirmnote"
                className={
                  matchFocus && !validMatch
                    ? styles.instructions
                    : styles.offscreen
                }
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                />
                Confirm Password
              </p>

              <button
                className={`${
                  !validPwd || !validMatch || !validEmail
                    ? styles.buttonDivDisabled
                    : styles.buttonDiv
                }`}
                disabled={
                  !validPwd || !validMatch || !validEmail
                    ? true
                    : false
                }
              >
                Sign Up
              </button>
              <p>
                Already Registered?
                <span className={styles.line}>
                  <a
                    href="/login"
                    style={{ marginLeft: 8 }}
                  >
                    Sign In
                  </a>
                </span>
              </p>
            </form>
          </section>
        </div>
    </>
  );
};

export default Registration;