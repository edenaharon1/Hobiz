import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // ייבוא ה-Provider
import Login from "./Login";
import SignUp from "./SignUp";
import Home from "./Home";
import UserProfile from "./UserProfile";

const clientId = "569640409434-4pjdbccv7ffncci0bok69f13cukrbfgf.apps.googleusercontent.com"; // מזהה הלקוח שלך

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={clientId}> {/* עטיפת כל האפליקציה */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} /> {/* דף הכניסה */}
          <Route path="/signup" element={<SignUp />} /> {/* דף ההרשמה */}
          <Route path="/home" element={<Home />} /> {/* דף הבית */}
          <Route path="/userprofile" element={<UserProfile />} /> {/* דף פרופיל המשתמש */}
          <Route path="/login" element={<Login />} /> {/* הגדרת נתיב /login */}
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
