import React, { forwardRef, useEffect, useState, useRef } from "react";
import "./Post.css";
import { Avatar } from "@mui/material";
import InputOption from "./InputOption";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import { db } from "./firebase";
import firebase from "firebase/compat/app";
import { useSelector } from "react-redux";
import { selectUser } from "./features/userSlice";
import { formatDistanceToNow } from "date-fns";

/* 🧩 Reply Component */
function ReplyItem({ postId, commentId, reply, currentUser }) {
  const { id: replyId, data } = reply;
  const [replyLikes, setReplyLikes] = useState(data?.likes || []);
  const [hasLikedReply, setHasLikedReply] = useState(false);

  useEffect(() => {
    setReplyLikes(data?.likes || []);
  }, [data]);

  useEffect(() => {
    setHasLikedReply(replyLikes.includes(currentUser.uid));
  }, [replyLikes, currentUser.uid]);

  const handleReplyLike = async () => {
    const replyRef = db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId)
      .collection("replies")
      .doc(replyId);

    if (hasLikedReply) {
      await replyRef.update({
        likes: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
      });
    } else {
      await replyRef.update({
        likes: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
      });
    }
  };

  return (
    <div className="reply_item">
      <Avatar src={data.userPhotoUrl}>{(data.userName || "U")[0]}</Avatar>
      <div className="reply_text">
        <h5>{data.userName}</h5>
        <p>{data.text}</p>
        <div className="reply_meta">
          <span className="reply_time">
            {data.timestamp?.toDate
              ? formatDistanceToNow(data.timestamp.toDate(), {
                  addSuffix: true,
                })
              : "just now"}
          </span>

          <span
            className={`reply_like ${hasLikedReply ? "liked" : ""}`}
            onClick={handleReplyLike}
            role="button"
            aria-label="like reply"
          >
            👍 {replyLikes.length > 0 ? replyLikes.length : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

/* 🧩 Main Post Component */
const Post = forwardRef(({ id, name, description, message, photoUrl }, ref) => {
  const user = useSelector(selectUser);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState({});
  const replyListeners = useRef([]);

  // 🔁 Post likes listener
  useEffect(() => {
    if (!id) return;
    const unsub = db
      .collection("posts")
      .doc(id)
      .onSnapshot((doc) => {
        setLikes(doc.data()?.likes || []);
      });
    return unsub;
  }, [id]);

  // 💬 Comments listener
  useEffect(() => {
    if (!id) return;
    const unsubComments = db
      .collection("posts")
      .doc(id)
      .collection("comments")
      .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) => {
        const fetchedComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setComments(fetchedComments);
      });
    return () => unsubComments();
  }, [id]);

  // 🧠 Replies listener
  useEffect(() => {
    if (!id) return;
    replyListeners.current.forEach((unsub) => unsub && unsub());
    replyListeners.current = [];

    comments.forEach((comment) => {
      const replyRef = db
        .collection("posts")
        .doc(id)
        .collection("comments")
        .doc(comment.id)
        .collection("replies")
        .orderBy("timestamp", "asc");

      const unsub = replyRef.onSnapshot((replySnap) => {
        setReplies((prev) => ({
          ...prev,
          [comment.id]: replySnap.docs.map((d) => ({
            id: d.id,
            data: d.data(),
          })),
        }));
      });

      replyListeners.current.push(unsub);
    });

    return () => {
      replyListeners.current.forEach((unsub) => unsub && unsub());
      replyListeners.current = [];
    };
  }, [comments, id]);

  useEffect(() => {
    setHasLiked(likes.includes(user.uid));
  }, [likes, user.uid]);

  // ❤️ Like post
  const handleLike = async () => {
    const postRef = db.collection("posts").doc(id);
    if (hasLiked) {
      await postRef.update({
        likes: firebase.firestore.FieldValue.arrayRemove(user.uid),
      });
    } else {
      await postRef.update({
        likes: firebase.firestore.FieldValue.arrayUnion(user.uid),
      });
    }
  };

  // 🧠 Like comment
  const handleCommentLike = async (commentId, hasLikedComment) => {
    const commentRef = db
      .collection("posts")
      .doc(id)
      .collection("comments")
      .doc(commentId);

    if (hasLikedComment) {
      await commentRef.update({
        likes: firebase.firestore.FieldValue.arrayRemove(user.uid),
      });
    } else {
      await commentRef.update({
        likes: firebase.firestore.FieldValue.arrayUnion(user.uid),
      });
    }
  };

  // ✏️ Comment CRUD
  const sendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    db.collection("posts")
      .doc(id)
      .collection("comments")
      .add({
        userName: user.displayName,
        userEmail: user.email,
        userPhotoUrl: user.photoUrl || "",
        text: commentInput,
        userId: user.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        likes: [],
      });
    setCommentInput("");
  };

  const deleteComment = (commentId) => {
    db.collection("posts")
      .doc(id)
      .collection("comments")
      .doc(commentId)
      .delete();
  };

  const startEdit = (commentId, text) => {
    setEditingCommentId(commentId);
    setEditText(text);
  };

  const saveEdit = (commentId) => {
    db.collection("posts")
      .doc(id)
      .collection("comments")
      .doc(commentId)
      .update({ text: editText, edited: true });
    setEditingCommentId(null);
    setEditText("");
  };

  // 💬 Reply
  const sendReply = (commentId) => {
    if (!replyText.trim()) return;
    db.collection("posts")
      .doc(id)
      .collection("comments")
      .doc(commentId)
      .collection("replies")
      .add({
        userName: user.displayName,
        userEmail: user.email,
        userPhotoUrl: user.photoUrl || "",
        text: replyText,
        userId: user.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        likes: [],
      });
    setReplyText("");
    setReplyingTo(null);
  };

  // 📤 Web Share API handler
  const handleShare = async () => {
    const shareText = `${message}\n\n— ${name}\n\nShared via MyApp`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check this post",
          text: shareText,
          url: window.location.href,
        });
        console.log("Post shared successfully!");
      } else {
        // Fallback for browsers that don't support Web Share API
        const encodedText = encodeURIComponent(shareText);
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
        window.open(whatsappUrl, "_blank");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div ref={ref} className="post">
      <div className="post_header">
        <Avatar src={photoUrl}>{name?.[0] || "U"}</Avatar>
        <div className="post_info">
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="post_body">
        <p>{message}</p>
      </div>

      <div className="post_buttons">
        <div onClick={handleLike}>
          <InputOption
            Icon={hasLiked ? ThumbUpAltIcon : ThumbUpAltOutlinedIcon}
            title={`${likes.length} Like${likes.length !== 1 ? "s" : ""}`}
            color={hasLiked ? "blue" : "gray"}
          />
        </div>

        <div onClick={() => setShowComments((v) => !v)}>
          <InputOption
            Icon={ChatOutlinedIcon}
            title={`${comments.length} Comment${
              comments.length !== 1 ? "s" : ""
            }`}
            color="gray"
          />
        </div>

        {/* ✅ Share button using Web Share API */}
        <div onClick={handleShare}>
          <InputOption Icon={ShareOutlinedIcon} title="Share" color="gray" />
        </div>

        <InputOption Icon={SendOutlinedIcon} title="Send" color="gray" />
      </div>

      {showComments && (
        <div className="comments_section">
          <form onSubmit={sendComment} className="comment_form">
            <Avatar src={user.photoUrl} />
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
            />
            <button type="submit">Post</button>
          </form>

          <div className="comments_list">
            {comments.map(({ id: commentId, data }) => {
              const commentLikes = data?.likes || [];
              const hasLikedComment = commentLikes.includes(user.uid);

              return (
                <div key={commentId} className="comment_item">
                  <Avatar src={data.userPhotoUrl}>
                    {(data.userName || "U")[0]}
                  </Avatar>
                  <div className="comment_text">
                    <div className="comment_header">
                      <h4>{data.userName}</h4>
                      <span className="comment_time">
                        {data.timestamp?.toDate
                          ? formatDistanceToNow(data.timestamp.toDate(), {
                              addSuffix: true,
                            })
                          : "just now"}
                        {data.edited && <em> • edited</em>}
                      </span>
                    </div>

                    {editingCommentId === commentId ? (
                      <div className="edit_comment">
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => saveEdit(commentId)}>
                          Save
                        </button>
                        <button onClick={() => setEditingCommentId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p>{data.text}</p>
                    )}

                    <div className="comment_actions">
                      <span
                        className={`comment_like ${
                          hasLikedComment ? "liked" : ""
                        }`}
                        onClick={() =>
                          handleCommentLike(commentId, hasLikedComment)
                        }
                      >
                        👍 {commentLikes.length > 0 ? commentLikes.length : ""}
                      </span>

                      {data.userId === user.uid &&
                        editingCommentId !== commentId && (
                          <>
                            <EditIcon
                              onClick={() => startEdit(commentId, data.text)}
                            />
                            <DeleteIcon
                              onClick={() => deleteComment(commentId)}
                            />
                          </>
                        )}
                      <ReplyIcon onClick={() => setReplyingTo(commentId)} />
                    </div>

                    <div className="replies_section">
                      {(replies[commentId] || []).map((reply) => (
                        <ReplyItem
                          key={reply.id}
                          postId={id}
                          commentId={commentId}
                          reply={reply}
                          currentUser={user}
                        />
                      ))}

                      {replyingTo === commentId && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            sendReply(commentId);
                          }}
                          className="reply_form"
                        >
                          <Avatar src={user.photoUrl} />
                          <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                          />
                          <button type="submit">Reply</button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default Post;
