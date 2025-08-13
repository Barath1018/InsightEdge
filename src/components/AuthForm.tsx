import React, { useState, useEffect } from "react";
import { auth, googleProvider, firestore } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

interface Props {
  isSignup?: boolean;
}

const AuthForm: React.FC<Props> = ({ isSignup = false }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (isSignup) {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, {
          displayName: username,
        });

        await setDoc(doc(firestore, "users", userCredential.user.uid), {
          name,
          username,
          email,
        });

        navigate("/");
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/");
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(firestore, "users", user.uid),
        {
          name: user.displayName || "",
          username: user.displayName?.split(" ").join("").toLowerCase() || "",
          email: user.email,
        },
        { merge: true }
      );

      navigate("/");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto mt-10 p-4 border rounded-lg">
      <h1 className="text-xl font-bold text-center">{isSignup ? "Sign Up" : "Login"}</h1>

      {isSignup && (
        <>
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </>
      )}

      <input
        className="border p-2 rounded"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 rounded"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isSignup && (
        <input
          className="border p-2 rounded"
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      )}

      <button className="bg-blue-500 text-white py-2 rounded" onClick={handleAuth}>
        {isSignup ? "Sign Up" : "Login"}
      </button>

      <div className="text-center text-sm text-gray-500">or</div>

      <button className="bg-red-500 text-white py-2 rounded" onClick={handleGoogle}>
        Continue with Google
      </button>
    </div>
  );
};

export default AuthForm;
