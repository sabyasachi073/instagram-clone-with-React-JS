import React, { useEffect, useState } from "react";
import "./App.css";
import Post from "./Post";
import { db, auth } from "./firebase";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button, Input } from "@material-ui/core";
import ImageUpload from "./ImageUpload";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null); // Keeps tract of users who logged in
  const [verifiedUser, setVerifiedUser] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      // Listens to any single authentication change happens i.e. any log in log out happens

      if (authUser) {
        // User has logged in...
        setUser(authUser); // It keeps user logged in even if he refresh
      } else {
        // User has logged out...
        setUser(null);
      }
    });

    return () => {
      // Perform some cleanup actions
      unsubscribe();
    };
  }, [user, username]);

  useEffect(() => {
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        // Every time a new post is added, this code is fired
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);

  const signUp = (event) => {
    event.preventDefault();

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((error) => alert(error.message));

    setOpen(false); // Closes the module once user is signed up
  };

  const signIn = (event) => {
    event.preventDefault();

    // Authenticating the signin and throws error (catch part) if credentials were invalid
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));

    setOpenSignIn(false); // It closes the module once user is signed in
  };

  useEffect(() => {
    console.log(auth.currentUser);
  }, []);

  const verifyEmail = () => {
    auth.currentUser
      .sendEmailVerification()
      .then(() => {
        alert("Verification email has been sent to your email id.");
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  };

  const resetPassword = () => {
    if (!email) {
      alert("Please enter your email in the email field to proceed.");
      return;
    }

    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        alert(
          "Password reset email sent! Check your email to reset your password."
        );
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  };

  // Return by App.js
  return (
    <div className="App">
      <Modal
        open={open}
        onClose={() => setOpen(false)} // If outside of modal is clicked then the modal closes due to this line
      >
        <div style={modalStyle} className={classes.paper}>
          <center>
            <form className="app__signup">
              <img
                className="app__headerImage"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png"
                alt="Icon"
              />

              {/* src="https://airequipmentllc.com/wp-content/uploads/2019/12/instagram-icon.png" */}

              <Input
                type="text"
                placeholder="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />

              <Input
                type="text"
                placeholder="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                type="password"
                placeholder="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <Button onClick={signUp}>Sign Up</Button>
            </form>
          </center>
        </div>
      </Modal>

      {/* Modal for Sign in */}
      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)} // If outside of modal is clicked then the modal closes due to this line
      >
        <div style={modalStyle} className={classes.paper}>
          <center>
            <form className="app__signup">
              <img
                className="app__headerImage"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png"
                alt="Icon"
              />

              <Input
                type="text"
                placeholder="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                type="password"
                placeholder="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <Button onClick={signIn}>Sign In</Button>
              <br />
              <a className="signin__forgotpassword" onClick={resetPassword}>
                Forgot Password?
              </a>
            </form>
          </center>
        </div>
      </Modal>

      <div className="app__header">
        <img
          className="app__headerImage"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png"
          alt="logo"
        />

        {user ? (
          <Button onClick={() => auth.signOut()}>Logout</Button>
        ) : (
          <div className="app__loginContainer">
            <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
            <Button onClick={() => setOpen(true)}>Sign Up</Button>
          </div>
        )}
      </div>

      <div className="app__posts">
        {posts.map(({ id, post }) => (
          <Post
            key={id}
            postId={id}
            user={user}
            username={post.username}
            caption={post.caption}
            imageUrl={post.imageUrl}
          />
        ))}
      </div>

      <div className="app__upload">
        {user?.displayName ? (
          auth.currentUser.emailVerified ? (
            <ImageUpload username={user.displayName} />
          ) : (
            <div>
              <h3>Please verify your email to continue</h3>
              <Button onClick={verifyEmail}>Verify</Button>
            </div>
          )
        ) : (
          <h3>Sorry you need to login to upload</h3>
        )}
      </div>

      {/* 
      <Post
        username="Sabyasachi"
        caption="This WORLD is a jungle. You either fight or run forever..."
        imageUrl="https://source.unsplash.com/IDO_a-dxrCY/"
      />
      <Post
        username="Sabyasachi"
        caption="A promise of a new tomorrow..."
        imageUrl="https://source.unsplash.com/lsoogGC_5dg/"
      />
      <Post
        username="Themachilles"
        caption="Beautiful things don’t ask for attention..."
        imageUrl="https://source.unsplash.com/iQRKBNKyRpo/"
      />
      <Post
        username="Sabyasachi"
        caption="“If we surrendered to earth’s intelligence we could rise up rooted, like trees.” ~ Rainer Maria Rilke"
        imageUrl="https://source.unsplash.com/-f0YLss50Bs/"
      />
      <Post
        username="Christopher"
        caption="The clouds of unique shapes resembles a mind which is unique in itself... "
        imageUrl="https://source.unsplash.com/uNnUdZILKB0/"
      />
      <Post
        username="Sabyasachi"
        caption="“Do hard work in silence and let your new car make some noise” "
        imageUrl="https://source.unsplash.com/JAUNXDmuQiY/"
      />
      <Post
        username="Achilles"
        caption="Spider webs are perfect at portraying strength, beauty, and fear all into one picture."
        imageUrl="https://source.unsplash.com/MfxIc3dfzwc/"
      />
      <Post
        username="Themachilles"
        caption="This beauty has no words to explain..."
        imageUrl="https://source.unsplash.com/jry08NjZgmI/"
      /> */}
    </div>
  );
}

export default App;
