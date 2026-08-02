import React from "react";
import { LoginForm } from "../../components/LoginForm";
// No react-router-dom in this project — App.jsx drives pages via
// activeLink + window.location.hash, so navigation happens by calling
// setActiveLink (passed down the same way Book/OurStory/Rateus get it).
export const CustomerLogin = ({ setActiveLink }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-stone-50">
      <h1 className="font-serif text-2xl text-amber-950 mb-6">Welcome back</h1>
      <LoginForm submitLabel="Log In" onSuccess={() => setActiveLink("home")} />
      {/*
        TODO: no signup page exists yet. Once you build one, add "register"
        to App.jsx's validPages and render it, then this becomes:
        <button onClick={() => setActiveLink("register")}>Sign up</button>
      */}
    </div>
  );
};
