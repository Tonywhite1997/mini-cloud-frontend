import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { format } from "date-fns";
import { io } from "socket.io-client";
import urls from "../../utils/authURL";
import { ERROR_DATA, NOTIFICATION } from "../../utils/customTypes";
import { userContext } from "../../utils/context";
import Loader from "../../UI/Loader";
import SmallLoader from "../../UI/SmallLoader";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";

const socket = io("http://localhost:5173");

function Notifications() {
  const { user } = useContext(userContext);
  const [notifications, setNotifications] = useState<[NOTIFICATION]>(
    [] as unknown as [NOTIFICATION]
  );
  const [error, setError] = useState<ERROR_DATA>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  // useEffect(() => {
  //   socket.on("receive-share-file", (data) => {
  //     setNotifications(data);
  //   });
  // }, [socket]);

  async function getMyNotifications() {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${urls.notificationURL}`);

      setNotifications(data.notifications);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        returnToLoginPage(error);
        if (
          error?.response?.data.status === 500 ||
          error?.response?.status === 500
        ) {
          return setError({
            isError: true,
            errorMsg: "something occured. try again",
          });
        }
        setError({ isError: true, errorMsg: error?.response?.data?.message });
      } else {
        setError({ isError: true, errorMsg: "something occured. try again" });
      }
    }
  }

  useEffect(() => {
    if (user?._id) {
      getMyNotifications();
    }
  }, [user?._id]);

  function formatDate(date: string) {
    return format(new Date(date), "MMMM d, yyyy HH:mm");
  }

  async function readMyNotifications() {
    try {
      const { data } = await axios.patch(`${urls.notificationURL}/read`);
      setNotifications(data.notifications);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        returnToLoginPage(error);
      }
    }
  }

  useEffect(() => {
    const unreadNotification = notifications.find(
      (notification: NOTIFICATION) => !notification?.isRead
    );
    if (unreadNotification) {
      readMyNotifications();
    }
  }, [notifications]);

  async function clearMyNotifications() {
    setIsClearing(true);
    try {
      await axios.delete(`${urls.notificationURL}/clear`);
      setNotifications([] as unknown as [NOTIFICATION]);
      setIsClearing(false);
    } catch (error) {
      setIsClearing(false);

      if (axios.isAxiosError(error)) {
        if (
          error?.response?.data.status === 500 ||
          error?.response?.status === 500
        ) {
          return setError({
            isError: true,
            errorMsg: "something occured. try again",
          });
        }
        setError({ isError: true, errorMsg: error?.response?.data?.message });
      } else {
        setError({ isError: true, errorMsg: "something occured. try again" });
      }
    }
  }

  return (
    <main className="notifications-container">
      <h3>Notifications</h3>
      {!isLoading && error?.isError && (
        <p className="error-msg">{error?.errorMsg}</p>
      )}
      {!isLoading && !error?.isError && notifications.length > 0 && (
        <button onClick={clearMyNotifications} className="clear-btn">
          {isClearing ? <SmallLoader /> : "Clear All"}
        </button>
      )}
      {isLoading && <Loader />}
      {!isLoading && !error?.isError && !notifications.length && (
        <p>no unread notifications</p>
      )}
      {!isLoading &&
        notifications.length > 0 &&
        notifications
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((notification: NOTIFICATION) => {
            return (
              <div key={notification?._id} className="notification">
                <p>{notification?.notification}</p>
                <div className="date">
                  <p>{formatDate(notification?.createdAt)}</p>
                </div>
              </div>
            );
          })}
    </main>
  );
}

export default Notifications;
