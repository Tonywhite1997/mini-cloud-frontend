import axios from "axios";
import { io } from "socket.io-client";
import React, { ChangeEvent, useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../../UI/Loader";
import SmallLoader from "../../../UI/SmallLoader";
import urls from "../../../utils/authURL";
import { ERROR_DATA, FILE } from "../../../utils/customTypes";
import { returnToLoginPage } from "../../../utils/generalCommands/ReturnToLoginPage";
import { userContext } from "../../../utils/context";

const serverUrl: string = urls.onlineSocket;

const socket = io(serverUrl);

interface SHAREDFILEDATA {
  fileID: string;
  canRename: boolean;
  canDelete: boolean;
  canDownload: boolean;
}

function ShareFile() {
  const { user } = useContext(userContext);

  const { fileID } = useParams();
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [sharedFileData, setSharedFileData] = useState<SHAREDFILEDATA>({
    fileID: fileID || "",
    canRename: false,
    canDelete: false,
    canDownload: false,
  });

  const [error, setError] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingFile, setIsFetchingFile] = useState<boolean>(false);
  const [file, setFile] = useState<FILE>(null);

  async function fetchFile() {
    setIsFetchingFile(true);

    const { data } = await axios.get(`${urls.fileURL}/${fileID}`);
    setFile(data.file);

    setIsFetchingFile(false);
    try {
    } catch (error) {
      throw new Error(error);
    }
  }

  useEffect(() => {
    fetchFile();
  }, []);

  function selectUserActionsToFile(
    e: ChangeEvent<HTMLInputElement>,
    name: string
  ) {
    setSharedFileData((prevData) => {
      return {
        ...prevData,
        [name]: e.target.checked,
      };
    });
  }

  async function shareFile() {
    setIsLoading(true);
    if (!recipientEmail.trim()) {
      setError({ isError: true, errorMsg: "A valid email is required" });
      return;
    }

    const dataPayload = {
      ...sharedFileData,
      filename: file?.fileName,
      recipientEmail,
    };
    const notificationMsg = `User with email: ${user?.email} shared a file with you.`;

    try {
      await axios.post(`${urls.sharedFileURL}/share`, {
        dataPayload,
      });

      const { data } = await axios.post(`${urls.notificationURL}/send`, {
        receiverEmail: recipientEmail,
        message: notificationMsg,
      });

      socket.emit("share-file", {
        data: data.notifications,
        userID: recipientEmail,
      });
      setIsLoading(false);
      window.location.assign("/share-file/dashboard");
    } catch (error) {
      setIsLoading(false);
      returnToLoginPage(error);

      if (axios.isAxiosError(error)) {
        setError({
          isError: true,
          errorMsg: error?.response?.data.message,
        });
      } else {
        setError({ isError: true, errorMsg: "something occured" });
      }
    }
  }

  if (isFetchingFile) {
    return <Loader />;
  }

  return (
    <main className="share-file">
      <h3>
        Sharing <span className="filename">{file?.fileName} </span>
        with another validated user
      </h3>
      <div className="recipient">
        <label htmlFor="recipient">Enter the recepient email</label>
        <input
          type="email"
          id="recipient"
          placeholder="recipient email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
        {error.isError && <p className="error-msg">{error.errorMsg}</p>}
      </div>
      <label className="action-label">
        Choose what this user can do with this file.
        <br /> Note that once you share a file, the user can always open its
        content:
        <br /> You can't change the "open" default setting.
      </label>
      <div className="accesses">
        <div className="action">
          <input
            type="checkbox"
            name="canRename"
            checked={sharedFileData.canRename}
            onChange={(e) => {
              selectUserActionsToFile(e, "canRename");
            }}
          />
          <p>Rename</p>
        </div>

        <div className="action">
          <input
            type="checkbox"
            name="canDelete"
            checked={sharedFileData.canDelete}
            onChange={(e) => {
              selectUserActionsToFile(e, "canDelete");
            }}
          />
          <p>Delete</p>
        </div>

        <div className="action">
          <input
            type="checkbox"
            name="canDownload"
            checked={sharedFileData.canDownload}
            onChange={(e) => {
              selectUserActionsToFile(e, "canDownload");
            }}
          />
          <p>Download</p>
        </div>
      </div>
      <div className="buttons">
        <button onClick={shareFile}>
          {isLoading ? <SmallLoader /> : "share"}
        </button>
      </div>
    </main>
  );
}

export default ShareFile;
