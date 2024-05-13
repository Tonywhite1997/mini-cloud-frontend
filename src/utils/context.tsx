import React, { createContext, ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import urls from "./authURL";
import {
  FILE,
  FileContextType,
  NOTIFICATION,
  Notification_Context,
  USER,
  UserContextType,
} from "./customTypes";
import { returnToLoginPage } from "./generalCommands/ReturnToLoginPage";

const initialUser = {
  allocatedSpace: 0,
  usedSpace: 0,
  _id: "",
  name: "",
  email: "",
  isVerified: false,
};
const initialFile = {
  fileName: "",
  _id: "",
  link: "",
  size: 0,
  folder: "",
  mimetype: "",
};

const serverUrl: string =
  "http://localhost:5000" || "https://minicloud.onrender.com";

const socket = io(serverUrl);

export const userContext = createContext<UserContextType>({
  isLogIn: false,
  user: initialUser,
  setIsLogIn: () => {
    false;
  },
  setUser: () => {},
  isError: false,
});

export const fileContext = createContext<FileContextType>({
  fileProviderData: initialFile,
  setFileProviderData: () => {
    initialFile;
  },
});

export const notificationContext = createContext<Notification_Context>({
  notifications: [] as unknown as [NOTIFICATION],
  setNotifications: () => {
    [];
  },
});

interface ChildrenProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: ChildrenProps) => {
  const [isLogIn, setIsLogIn] = useState(false);
  const [isError, setIsError] = useState(false);

  const [user, setUser] = useState<USER>(initialUser);

  const persistLogin = async () => {
    setIsLogIn(true);
    try {
      const { data } = await axios.get(`${urls.authURL}/check-if-login`);
      setUser(data?.user);
      socket.emit("add-user", data?.user?.email);
      setIsLogIn(false);
    } catch (error) {
      setIsLogIn(false);
      setIsError(true);
      returnToLoginPage(error);
    }
  };

  const location = useLocation();

  const unCheckRoutes = [
    "auth/forgot-password",
    "auth/register",
    "auth/reset-password",
  ];

  let shouldAuthCheckRun = unCheckRoutes.some((route: string) => {
    return location.pathname.includes(route);
  });

  useEffect(() => {
    if (!shouldAuthCheckRun) {
      persistLogin();
    }
  }, [shouldAuthCheckRun]);

  return (
    <>
      <userContext.Provider
        value={{ user, setUser, isLogIn, setIsLogIn, isError }}
      >
        {children}
      </userContext.Provider>
    </>
  );
};

export const FileProvider = ({ children }: ChildrenProps) => {
  const [fileProviderData, setFileProviderData] = useState<FILE>(initialFile);

  return (
    <fileContext.Provider value={{ fileProviderData, setFileProviderData }}>
      {children}
    </fileContext.Provider>
  );
};

export const NotificationProvider = ({ children }: ChildrenProps) => {
  const [notifications, setNotifications] = useState<[NOTIFICATION]>(
    [] as unknown as [NOTIFICATION]
  );

  return (
    <notificationContext.Provider
      value={{
        notifications,
        setNotifications,
      }}
    >
      {children}
    </notificationContext.Provider>
  );
};
