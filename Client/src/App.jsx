import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage.jsx";
import Register from "./Pages/Register.jsx";
import Login from "./Pages/Login.jsx";
import VerifyEmail from "./Pages/VerifyEmail.jsx";
import Main from "./Pages/Main.jsx";
import Profile from "./Pages/Profile.jsx";
import GroupSettings from "./Pages/GroupSettings.jsx";
import Admin from './Pages/Admin.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/group/:id" element={<GroupSettings />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
