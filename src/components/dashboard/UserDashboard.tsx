import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import FileSection from "./dashboard-sections/FileSection";
import Navigation from "./dashboard-sections/Navigation";
import { userContext } from "../../utils/context";
import VerifyAccountNotification from "../VerifyAccountNotification";
import OpenNavIcon from "../../assets/OpenNavIcon";
import CancelIcon from "../../assets/CancelIcon";

function UserDashboard() {
  const { user, isLogIn } = useContext(userContext);
  const [isnavOpen, setIsNavOpen] = useState<boolean>(false);
  const [clientWidth, setClientWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setClientWidth(window.innerWidth);
    });
    return () => {
      window.removeEventListener("resize", () => {
        setClientWidth(window.innerWidth);
      });
    };
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogIn && !user?._id) {
      navigate("/auth/login");
    }
  }, [user?._id, isLogIn]);

  const isVerified = user?.isVerified || false;

  return (
    <main className="dashboard">
      {user?._id && !isVerified && <VerifyAccountNotification />}
      {clientWidth < 650 && (
        <div className="nav-icons-container">
          <div
            className="open-nav-container"
            onClick={() => setIsNavOpen((currentState) => !currentState)}
          >
            {!isnavOpen && <OpenNavIcon />}
          </div>

          <div
            className="close-nav-container"
            onClick={() => setIsNavOpen((currentState) => !currentState)}
          >
            {isnavOpen && <CancelIcon />}
          </div>
        </div>
      )}
      <div
        className="dashboard-action-section"
        style={{ height: isVerified && "100%" }}
      >
        {isnavOpen && clientWidth < 650 && (
          <Navigation handleNavOpen={setIsNavOpen} />
        )}
        {!isnavOpen && clientWidth >= 650 && (
          <Navigation handleNavOpen={setIsNavOpen} />
        )}

        <div className="container">
          <FileSection />
        </div>
      </div>
    </main>
  );
}

export default UserDashboard;
