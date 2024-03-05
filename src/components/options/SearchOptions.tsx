import React, { useContext, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useMutation } from "react-query";
import CancelIcon from "../../assets/CancelIcon";
import DeleteIcon from "../../assets/DeleteIcon";
import DownloadIcon from "../../assets/DownloadIcon";
import ViewIcon from "../../assets/ViewIcon";
import MoveIcon from "../../assets/MoveIcon";
import RenameIcon from "../../assets/RenameIcon";
import urls from "../../utils/authURL";
import { FILE } from "../../utils/customTypes";
import { userContext } from "../../utils/context";
import { fileContext } from "../../utils/context";
import { downloadFileSetup } from "../../utils/downloadSetup";
import SmallLoader from "../../UI/SmallLoader";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";
import ShareIcon from "../../assets/ShareIcon";

function FileOptions({ searchOptionsProps }) {
  const {
    setIsSearchOptionsOpen,
    isSearchOptionsOpen,
    selectedFile,
    setIsSearchOpen,
  } = searchOptionsProps;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  //   console.log(isSearchOptionsOpen);
  //   console.log(selectedFile);

  //   const [isDownloadError, setIsDownloadError] = useState<boolean>(false);

  //   console.log(selectedFile);

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

  //   async function downloadFile() {
  //     downloadFileSetup(
  //       url,
  //       selectedFile,
  //       closeFileOptions,
  //       setIsDownloadError,
  //       setIsDownloadLoading
  //     );
  //   }

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

        {/* <div className="folder-options-rename" onClick={openFileRenameBox}>
          <RenameIcon />
          <p>Rename</p>
        </div> */}

        {/* <Link
          to={`/file/share-file/${selectedFile.id}/${selectedFile.name}`}
          className="folder-options-share"
        >
          <ShareIcon />
          <p>Share</p>
        </Link> */}

        {/* <div className="folder-options-move" onClick={openMoveFileBox}>
          <MoveIcon />
          <p>Move</p>
        </div> */}

        {/* <div className="file-options-download">
          <DownloadIcon />
          <p onClick={downloadFile}>Download</p>
          {isDownloadLoading && <SmallLoader />}
        </div> */}

        {/* {isDownloadError && (
          <p
            style={{
              textAlign: "center",
              fontWeight: "400",
              color: "rgb(232, 50, 50)",
            }}
          >
            Error occured. Please try again later
          </p>
        )} */}
      </div>
    </div>
  );
}

export default FileOptions;
