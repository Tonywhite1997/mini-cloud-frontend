import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BellIcon from "../assets/BellIcon";
import CloudIcon from "../assets/CloudIcon";
import SearchIcon from "../assets/SearchIcon";
import urls from "../utils/authURL";
import { userContext } from "../utils/context";
import { FILE, NOTIFICATION } from "../utils/customTypes";
import SearchFile from "./dashboard/SearchFile";

function Header() {
  const { user } = useContext(userContext);

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [files, setFiles] = useState<[FILE] | null>(null);
  const [notifications, setNotifications] = useState<[NOTIFICATION]>(
    [] as unknown as [NOTIFICATION]
  );

  async function getMyNotifications() {
    const { data } = await axios.get(`${urls.notificationURL}`);

    setNotifications(data.notifications);
  }

  useEffect(() => {
    if (user?._id) {
      getMyNotifications();
    }
  }, [user?._id]);

  async function getFiles() {
    try {
      const { data } = await axios.get(`${urls.fileURL}/files`);
      setFiles(data.files);
    } catch (error) {
      throw new Error(error?.response?.data.message);
    }
  }

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
      {user?._id && (
        <div className="header-icons">
          <div
            onClick={() => {
              getFiles();
              setIsSearchOpen(!isSearchOpen);
            }}
          >
            <SearchIcon />
          </div>
          <Link to="/user/notifications" className="bell-icon-container link">
            <BellIcon />
            {notifications.length > 0 && (
              <small>
                {notifications.length > 9 ? "9+" : notifications.length}
              </small>
            )}
          </Link>
        </div>
      )}
      {isSearchOpen && (
        <SearchFile setIsSearchOpen={setIsSearchOpen} files={files} />
      )}
    </header>
  );
}

export default Header;
