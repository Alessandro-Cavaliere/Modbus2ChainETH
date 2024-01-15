import icon from "../assets/Modbus2ChainNoBackground.png";
import styles from "./styles/Navbar.module.css"
import { FaRegUserCircle } from "react-icons/fa";
import { BiLogOutCircle } from "react-icons/bi";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const navigate = useNavigate();

  const handleLogout = () => {
    setCookie('accessToken', null);
    setCookie('user',null)
    navigate("/");
  };

  return (
    <div className={styles.nav}>
      <div className={styles.userDiv}>
        <FaRegUserCircle style={{color:"white"}} size={50}/>
        <p className={styles.pstyle} style={{fontSize:20}}>{cookies.user}</p>
      </div>
      <div className={styles.logoDiv}>
        <img src={icon} style={{width:250}} alt="Modbus2Chain icon" />
        <p className={styles.pstyle}>Modbus
        <span className={styles.pstyleCenter}>2</span>
        Chain</p>
      </div>
      <BiLogOutCircle style={{color:"white",marginRight:80,cursor:"pointer"}} size={55} onClick={handleLogout}/>
    </div>
  );
};

export default Navbar;
