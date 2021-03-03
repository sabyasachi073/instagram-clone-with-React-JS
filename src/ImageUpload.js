import React, { useState } from "react";
import { Button } from "@material-ui/core";
import firebase from "firebase";
import { storage, db } from "./firebase";
import "./ImageUpload.css";

function ImageUpload({ username }) {
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");

  const handleChange = (e) => {
    if (e.target.files[0]) {
      // get the first file that user selcted (sometimes user selects multiple files)

      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image); // Getting the image and upload it in the images file in the firebase storage

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // progress function...
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        // Error function...
        console.log(error);
        alert(error.message);
      },
      () => {
        // Complete function - after uploading completes what needs to be done
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL() // This will get the download link of the image we uploaded
          .then((url) => {
            // post image inside db
            db.collection("posts").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),

              caption: caption ,
              imageUrl: url,
              username: username,
            });

            setProgress(0);
            setCaption("");
            setImage(null);
          });
      }
    );
  };

  return (
    <div className="imageupload">
      <progress className="imageupload__progress" value={progress} max="100" />
      <input
        type="text"
        placeholder="Enter a caption..."
        onChange={(event) => setCaption(event.target.value)}
        value={caption}
      />
      <input type="file" onChange={handleChange} />
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
}

export default ImageUpload;
