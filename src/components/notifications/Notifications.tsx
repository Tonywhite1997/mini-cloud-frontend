import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import TimeAgo from "timeago-react";
import urls from "../../utils/authURL";
import { ERROR_DATA, NOTIFICATION } from "../../utils/customTypes";
import { userContext, notificationContext } from "../../utils/context";
import Loader from "../../UI/Loader";
import SmallLoader from "../../UI/SmallLoader";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";

function Notifications() {
  const { user } = useContext(userContext);

  const { notifications, setNotifications } = useContext(notificationContext);

  const [error, setError] = useState<ERROR_DATA>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

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

    setTimeout(() => {
      if (unreadNotification) {
        readMyNotifications();
      }
    }, 3000);
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

  const myNotifications = notifications.filter((notification: NOTIFICATION) => {
    const matchesFilter = notification.receiverEmail === user?.email;

    return matchesFilter;
  });

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
        // notifications.length > 0 &&
        // notifications
        myNotifications.length > 0 &&
        myNotifications
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((notification: NOTIFICATION) => {
            return (
              <div
                key={notification?._id}
                className="notification"
                style={{
                  backgroundColor: notification?.isRead
                    ? "#eaf0e9"
                    : "rgb(42, 219, 110)",
                }}
              >
                <p>{notification?.notification}</p>
                <div className="date">
                  <p>
                    <TimeAgo datetime={notification?.createdAt} />
                  </p>
                </div>
              </div>
            );
          })}
    </main>
  );
}

export default Notifications;
