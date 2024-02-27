import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import axios from "axios";
import LockIcon from "../../../assets/LockIcon";
import ProfileIcon from "../../../assets/ProfileIcon";
import DatabaseIcon from "../../../assets/DatabaseIcon";
import ShareIcon from "../../../assets/ShareIcon";
import { userContext } from "../../../utils/context";
import { returnToLoginPage } from "../../../utils/generalCommands/ReturnToLoginPage";
import urls from "../../../utils/authURL";
import SmallLoader from "../../../UI/SmallLoader";

function Navigation({ handleCurrentNav, currentNav, handleNavOpen }) {
  const databasestyle = {
    backgroundColor: currentNav === 0 ? "rgb(42, 219, 110)" : "initial",
  };
  const profileStyle = {
    backgroundColor: currentNav === 1 ? "rgb(42, 219, 110)" : "initial",
  };

  const { setUser } = useContext(userContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function exitNavBar() {
    return handleNavOpen(false);
  }

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function logout() {
    setIsLoading(true);
    try {
      await axios.get(`${urls.authURL}/logout`);
      queryClient.clear();
      setUser({
        allocatedSpace: 0,
        usedSpace: 0,
        _id: "",
        name: "",
        email: "",
        isVerified: false,
      });
      setIsLoading(false);
      navigate("/auth/login");
    } catch (error) {
      setIsLoading(false);
      returnToLoginPage(error);
    }
  }

  return (
    <nav className="navigation">
      <ul>
        <li
          style={databasestyle}
          onClick={() => {
            handleCurrentNav(0);
            exitNavBar();
          }}
        >
          <span>
            <DatabaseIcon />
          </span>
          Database
        </li>
        <li
          style={profileStyle}
          onClick={() => {
            handleCurrentNav(1);
            exitNavBar();
          }}
        >
          <span>
            <ProfileIcon />
          </span>
          Profile
        </li>
        <Link to="/share-file/dashboard" className="shared-file-link link">
          <span>
            <ShareIcon />
          </span>
          Shared Files
        </Link>
        <li className="authentication">
          <span>
            <LockIcon />
          </span>
          Authentication
        </li>
        <li className="auth-1">
          <Link to="/auth/change-password" className="link">
            Change Password
          </Link>
        </li>
        <li className="auth-2">
          <Link to="/auth/delete-account" className="link">
            Delete Account
          </Link>
        </li>
        <li className="auth-3" onClick={logout}>
          Logout {isLoading && <SmallLoader />}
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
