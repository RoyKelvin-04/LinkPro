import React from "react";
import "./Widgets.css";
import InfoIcon from "@mui/icons-material/Info";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

function Widgets() {
  const newsArticle = (heading, subtitle) => (
    <div className="widgets_article">
      <div className="widgets_articleLeft">
        <FiberManualRecordIcon />
      </div>

      <div className="widgets_articleRight">
        <h4>{heading}</h4>
        <p>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="widgets">
      <div className="widgets_header">
        <h2>LinkPro News</h2>
        <InfoIcon />
      </div>

      {newsArticle("PAPA Raeact is  back", "Top news -9999 readers")}
      {newsArticle("Tesla looking for engineers", "Top news -9000 readers")}
      {newsArticle("Microsoft opens a New branch", "Top news -8800 readers")}
      {newsArticle("Use AI to your advantage", "Top news -8000 readers")}
    </div>
  );
}

export default Widgets;
