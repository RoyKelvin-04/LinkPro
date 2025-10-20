import React from "react";
import "./Sidebar.css";
import { Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import { selectUser } from "./features/userSlice";

function Sidebar({ recentSearchTerms, onSelectSearch }) {
  const user = useSelector(selectUser);

  const recentItem = (topic) => (
    <div
      key={topic}
      className="sidebar_recentItem"
      onClick={() => onSelectSearch(topic)} // ✅ Send to parent when clicked
    >
      <span className="sidebar_hash">#</span>
      <p>{topic}</p>
    </div>
  );

  return (
    <div className="sidebar">
      <div className="sidebar_top">
        <img
          src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
          alt=""
        />
        <Avatar src={user.photoUrl} className="sidebar_avatar">
          {user.email[0]}
        </Avatar>
        <h2>{user.displayName}</h2>
        <h4>{user.email}</h4>
      </div>

      <div className="sidebar_stats">
        <div className="sidebar_stat">
          <p>Who viewed you</p>
          <p className="sidebar_statNumber">2,564</p>
        </div>
        <div className="sidebar_stat">
          <p>Views on post</p>
          <p className="sidebar_statNumber">2,000</p>
        </div>
      </div>

      <div className="sidebar_bottom">
        <p>Recent</p>
        {recentSearchTerms.slice(0, 5).map((recent) => recentItem(recent))}
      </div>
    </div>
  );
}

export default Sidebar;
