import React, { useEffect, useState } from "react";
import CancelIcon from "../../assets/CancelIcon";
import { FILE } from "../../utils/customTypes";
import SearchOption from "../options/SearchOptions";

function SearchFile({ setIsSearchOpen, files }) {
  const [searchString, setSearchString] = useState<string>("");
  const [matchedFiles, setMatchedFiles] = useState<[FILE] | null>(null);
  const [isSearchOptionsOpen, setIsSearchOptionsOpen] =
    useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FILE | null>(null);

  const searchRegex = new RegExp(searchString, "i");
  const res = searchString
    ? files.filter((obj: FILE) =>
        Object.values(obj).some((val) => searchRegex.test(val))
      )
    : [];

  useEffect(() => {
    if (searchString.length === 0) {
      setMatchedFiles(null);
    }
    setMatchedFiles(res);
  }, [searchString]);

  const seacrchOptionsProps = {
    setIsSearchOptionsOpen,
    isSearchOptionsOpen,
    selectedFile,
    setIsSearchOpen,
  };

  return (
    <div className="search">
      {isSearchOptionsOpen && (
        <SearchOption searchOptionsProps={seacrchOptionsProps} />
      )}
      <div onClick={() => setIsSearchOpen(false)}>
        <CancelIcon />
      </div>
      <input
        placeholder="search"
        value={searchString}
        onChange={(e) => {
          setSearchString(e.target.value);
        }}
      />
      <div>
        {matchedFiles?.length > 0 &&
          matchedFiles.map((file: FILE) => {
            return (
              <div key={file._id} className="file">
                <div className="file-name">{file?.fileName}</div>
                <div
                  className="toggle-icon"
                  onClick={() => {
                    setSelectedFile(file);
                    setIsSearchOptionsOpen(true);
                  }}
                >
                  &#8942;
                </div>
              </div>
            );
          })}
      </div>
      {!matchedFiles?.length && <p>no file found for search query</p>}
    </div>
  );
}

export default SearchFile;
