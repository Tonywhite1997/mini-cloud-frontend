import React, { useContext } from "react";
import { Link } from "react-router-dom";
import CloudIcon from "../assets/CloudIcon";
import { userContext } from "../utils/context";

function Header() {
  const { user } = useContext(userContext);

  return (
    <header className="header">
      <div className="header-logo">
        <Link
          to={user?._id ? "/user/dashboard" : "/auth/login"}
          className="logo-link"
        >
          <CloudIcon />
          <p>MiniCloud</p>
        </Link>
      </div>
    </header>
  );
}

export default Header;
