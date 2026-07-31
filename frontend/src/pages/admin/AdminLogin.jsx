import React from "react";
import { LoginForm } from "../../components/LoginForm";
import { useAuth } from "../../context/AuthContext";

// No react-router-dom in this project — navigation goes through the
// setActiveLink prop, same as your other pages.
export const AdminLogin = ({ setActiveLink }) => {
  const { logout } = useAuth();

  // /api/auth/login doesn't distinguish "admin login" vs "customer login" —
  // it just authenticates. So a non-admin CAN successfully log in here; we
  // just don't let them stay.
  const handleSuccess = (user) => {
    if (user.role !== "admin") {
      logout();
      alert("This login is for studio admins only.");
      return;
    }
    // TODO: add an "admin-dashboard" page + entry in App.jsx's validPages
    // before this will actually go anywhere useful.
    setActiveLink("admin-dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-amber-950">
      <h1 className="font-serif text-2xl text-white mb-6 tracking-wide uppercase">
        Studio Admin
      </h1>
      <LoginForm submitLabel="Enter Dashboard" onSuccess={handleSuccess} />
    </div>
  );
};
