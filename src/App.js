
import React from "react";
import Login from "./components/Login";
import Registration from "./components/Registration";
import Dashboard from "./components/Dashboard"; 

import styles from "./components/styles/Dashboard.module.css";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
function App() {
  return (
    <div className={styles.dashboard}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
      </Routes>
    </div>
  );
}

export default App;