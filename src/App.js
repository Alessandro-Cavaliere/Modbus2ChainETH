
import React, { useState } from "react";
import Login from "./components/Login";
import Registration from "./components/Registration";
import Dashboard from "./components/Dashboard";
import "react-toastify/dist/ReactToastify.css";
import styles from "./components/styles/Dashboard.module.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useCookies } from "react-cookie";

function App() {
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [loggedUser, setLoggedUser] = useState("")

  const handleLoggedUser = (email) => {
     setLoggedUser(email)
     console.log(email)
  };

  return (
    <div className={styles.dashboard}>
      <Routes>
        {!cookies.accessToken ? (
          <>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login handleLoggedUser={handleLoggedUser}/>} />
            <Route path="/registration" element={<Registration />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard user={loggedUser}/>} />
            <Route path="/login" element={<Navigate to="/dashboard" />} />
            <Route path="/registration" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
      <ToastContainer 
        style={{ width: "auto" }}
        position="bottom-center"
        autoClose={1000}
        theme="dark"
        pauseOnHover
      />
    </div>
  );
}

export default App;