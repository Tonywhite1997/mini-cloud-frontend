import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import CancelIcon from "../../assets/CancelIcon";
import DeleteIcon from "../../assets/DeleteIcon";
import ShareIcon from "../../assets/ShareIcon";

import ViewIcon from "../../assets/ViewIcon";

import urls from "../../utils/authURL";

import SmallLoader from "../../UI/SmallLoader";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";

function FileOptions({ searchOptionsProps }) {
  const { setIsSearchOptionsOpen, selectedFile, setIsSearchOpen } =
    searchOptionsProps;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function deleteFileHandler() {
    setIsLoading(true);
    const { size, _id } = selectedFile;
    const operation: string = "delete";

    try {
      const { data } = await axios.delete(`${urls.fileURL}/${_id}`);
      if (data.status === "ok") {
        await axios.patch(`${urls.userURL}/update-used-space`, {
          fileSize: size,
          operation,
        });
        window.location.reload();
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      returnToLoginPage(error);
    }
  }

  function removeSearchOptions() {
    setIsSearchOptionsOpen(false);
    setIsSearchOpen(false);
  }

  return (
    <div className="search-backdrop">
      <div className="search-options">
        <div className="cancel-icon" onClick={() => removeSearchOptions()}>
          <CancelIcon />
        </div>
        <div className="selected-search-container">
          <div className="file-extension">
            <p>
              {selectedFile?.mimetype?.length > 4
                ? selectedFile?.fileName.split(".").slice(-1)
                : selectedFile?.mimetype}
            </p>
          </div>
          <p className="selected-file">
            {selectedFile?.fileName?.split(".")[0]}
          </p>
        </div>

        <Link
          to={`/files/${selectedFile._id}/display`}
          className="file-search-view"
          onClick={() => {
            removeSearchOptions();
          }}
        >
          <ViewIcon />
          <p>Open</p>
        </Link>

        <div
          className="file-search-remove"
          onClick={() => {
            deleteFileHandler();
          }}
        >
          <DeleteIcon />
          <p>Remove</p>
          {isLoading && <SmallLoader />}
        </div>

        <Link
          to={`/file/share-file/${selectedFile._id}`}
          className="file-search-share"
          onClick={() => {
            removeSearchOptions();
            setIsSearchOpen(false);
          }}
        >
          <ShareIcon />
          <p>Share</p>
        </Link>
      </div>
    </div>
  );
}

export default FileOptions;
