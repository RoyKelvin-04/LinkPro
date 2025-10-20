import React, { useEffect, useState, useMemo } from "react";
import "./Feed.css";
import CreateIcon from "@mui/icons-material/Create";
import InputOption from "./InputOption";
import ImageIcon from "@mui/icons-material/Image";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CalendarViewDayIcon from "@mui/icons-material/CalendarViewDay";
import Post from "./Post";
import { db } from "./firebase";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { useSelector } from "react-redux";
import { selectUser } from "./features/userSlice";
import FlipMove from "react-flip-move";

function Feed({ recentSearch }) {
  const user = useSelector(selectUser);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = db
      .collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) =>
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        )
      );

    return () => unsubscribe();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const sendPost = async (e) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    setUploading(true);

    let mediaUrl = "";
    let mediaType = "";

    if (file) {
      try {
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(
          `posts/${user.uid}/${Date.now()}_${file.name}`
        );
        await fileRef.put(file);
        mediaUrl = await fileRef.getDownloadURL();

        if (file.type.startsWith("image/")) mediaType = "image";
        else if (file.type.startsWith("video/")) mediaType = "video";
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload file. Please try again.");
      }
    }

    await db.collection("posts").add({
      name: user.displayName,
      description: user.email,
      message: input,
      photoUrl: user.photoUrl || "",
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      mediaUrl,
      mediaType,
      likes: [],
    });

    setInput("");
    setFile(null);
    setPreview(null);
    setUploading(false);
  };

  // ✅ Compute filtered posts
  const filteredPosts = useMemo(() => {
    if (!recentSearch.length) return posts; // show all if nothing searched

    const latestSearch = recentSearch[0].toLowerCase(); // newest search
    const hashtag = `#${latestSearch}`;

    return posts.filter(({ data }) =>
      data.message?.toLowerCase().includes(hashtag)
    );
  }, [posts, recentSearch]);

  return (
    <div className="feed">
      <div className="feed_inputContainer">
        <div className="feed_input">
          <CreateIcon />
          <form onSubmit={sendPost}>
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              type="text"
              placeholder="What do you want to talk about?"
            />
          </form>
        </div>

        {preview && (
          <div className="media_preview">
            {file.type.startsWith("image/") ? (
              <img src={preview} alt="Preview" />
            ) : (
              <video src={preview} controls />
            )}
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              Remove
            </button>
          </div>
        )}

        <div className="feed_inputOptions">
          <InputOption Icon={ImageIcon} title="Photo" color="#70B5F9" />
          <InputOption Icon={SubscriptionsIcon} title="Video" color="#E7A33E" />
          <InputOption Icon={EventNoteIcon} title="Event" color="#C0CBC0" />
          <InputOption
            Icon={CalendarViewDayIcon}
            title="Write article"
            color="#7FC15E"
          />
        </div>
      </div>

      {/* ✅ Show filtered posts */}
      <FlipMove>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(({ id, data }) => (
            <Post
              key={id}
              id={id}
              name={data.name}
              description={data.description}
              message={data.message}
              photoUrl={data.photoUrl}
              mediaUrl={data.mediaUrl}
              mediaType={data.mediaType}
            />
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            No posts found for this hashtag.
          </p>
        )}
      </FlipMove>
    </div>
  );
}

export default Feed;
