import axios, { isAxiosError } from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import BellIcon from "../assets/BellIcon";
import CloudIcon from "../assets/CloudIcon";
import SearchIcon from "../assets/SearchIcon";
import urls from "../utils/authURL";
import { userContext, notificationContext } from "../utils/context";
import { FILE, NOTIFICATION } from "../utils/customTypes";
import { returnToLoginPage } from "../utils/generalCommands/ReturnToLoginPage";
import SearchFile from "./dashboard/SearchFile";

const serverUrl: string =
  "http://localhost:5000" || "https://minicloud.onrender.com";

const socket = io(serverUrl);

function Header() {
  const { user } = useContext(userContext);
  const { notifications, setNotifications } = useContext(notificationContext);

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [files, setFiles] = useState<[FILE] | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    socket.on("receive-share-file", (data) => {
      setNotifications(data);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("alert-revoke-access", (data) => {
      setNotifications(data);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("alert-file-owner", (data) => {
      setNotifications(data);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("alert-owner-my-access-revoke", (data) => {
      setNotifications(data);
    });
  }, [socket]);

  async function getMyNotifications() {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${urls.notificationURL}`);

      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);

      if (isAxiosError(error)) {
        returnToLoginPage(error);
      }
      throw new Error(error);
    }
  }

  useEffect(() => {
    if (user?._id) {
      const data = getMyNotifications();
      data.then((notifications) => {
        setNotifications(notifications.notifications);
      });
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

  const unReadNotifications = notifications.filter(
    (notification: NOTIFICATION) => {
      const matchesFilter =
        notification.receiverEmail === user?.email && !notification.isRead;

      return matchesFilter;
    }
  );

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
            {!isLoading && unReadNotifications?.length > 0 && (
              <small>
                {unReadNotifications?.length > 9
                  ? "9+"
                  : unReadNotifications?.length}
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
