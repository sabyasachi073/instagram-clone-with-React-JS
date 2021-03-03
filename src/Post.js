import React, { useEffect, useState } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import { db } from "./firebase";
import firebase from "firebase";

function Post({ user, postId, username, caption, imageUrl }) {
  // user => signed in user
  // username => user who wrote the post

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let unsubscribe;
    if (postId) {
      unsubscribe = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
          // console.log(snapshot.docs.map((doc) => doc.data()));
          // console.log(comments);
        });
    }

    return () => {
      unsubscribe();
    };
  }, [postId]);

  const postComment = (event) => {
    event.preventDefault();

    db.collection("posts").doc(postId).collection("comments").add({
      username: user.displayName,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setComment("");
  };

  return (
    <div className="post">
      <div className="post__header">
        <Avatar
          className="post__avatar"
          alt="Themis"
          src="/static/images/avatar/1.jpg"
        />

        <h3>{username}</h3>
      </div>

      <img class="post__image" src={imageUrl} alt="Post_image" />

      <h4 className="post__text">
        <strong>{username}</strong>: {caption}
      </h4>

      <div className="post__comments">
        {comments.map((comment) => (
          <div>
            <strong>{comment.username}</strong>: {comment.text}
          </div>
        ))}
      </div>

      {user && (
        <form className="post__commentBox">
        <input
          className="post__input"
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className="post__button"
          disabled={!comment}
          type="submit"
          onClick={postComment}
        >
          Post
        </button>
      </form>
      )}
    </div>
  );
}

export default Post;
