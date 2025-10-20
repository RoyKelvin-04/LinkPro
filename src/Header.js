import React, { useState, useEffect } from "react";
import "./Header.css";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import HeaderOption from "./HeaderOption";
import HomeIcon from "@mui/icons-material/Home";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import WorkIcon from "@mui/icons-material/Work";
import MessageIcon from "@mui/icons-material/Message";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useDispatch } from "react-redux";
import { logout } from "./features/userSlice";
import { auth } from "./firebase";

function Header({ setRecentSearch, setrecentSearchTerms, selectedSearchTerm }) {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState("");

  // ✅ When Sidebar term is clicked, update input
  useEffect(() => {
    if (selectedSearchTerm) {
      setSearchInput(selectedSearchTerm);
    }
  }, [selectedSearchTerm]);

  const logoutOfApp = () => {
    dispatch(logout());
    auth.signOut();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      let trimmed = searchInput.trim();
      if (trimmed.startsWith("#")) trimmed = trimmed.slice(1);

      if (trimmed) {
        setRecentSearch([trimmed]);
        setrecentSearchTerms((prev) => [trimmed, ...prev]);
      }
    }
  };

  const clearSearch = () => {
    setRecentSearch([]);
    setSearchInput("");
  };

  return (
    <div className="header">
      <div className="header_left">
        <img
          src="https://i.pinimg.com/originals/49/32/80/49328097f84b5b6d80ffe0c104e4f429.jpg"
          alt="LinkedIn logo"
        />

        <div className="header_search">
          <SearchIcon />
          <input
            placeholder="Search"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          {searchInput && (
            <button
              className="clear_search_button"
              onClick={clearSearch}
              title="Clear search and show all posts"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                marginLeft: "4px",
              }}
            >
              <ClearIcon style={{ fontSize: "18px", color: "gray" }} />
            </button>
          )}
        </div>
      </div>

      <div className="header_right">
        <HeaderOption Icon={HomeIcon} title="Home" />
        <HeaderOption Icon={SupervisorAccountIcon} title="My Network" />
        <HeaderOption Icon={WorkIcon} title="Jobs" />
        <HeaderOption Icon={MessageIcon} title="Messaging" />
        <HeaderOption Icon={NotificationsActiveIcon} title="Notifications" />
        <HeaderOption avatar={true} title="Me" onClick={logoutOfApp} />
      </div>
    </div>
  );
}

export default Header;
