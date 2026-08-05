import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Use this to gate a page in App.jsx's render block, e.g.:
//   {activeLink === "account" && (
//     <ProtectedRoute setActiveLink={handlePageChange}>
//       <Account />
//     </ProtectedRoute>
//   )}
//   {activeLink === "admin-dashboard" && (
//     <ProtectedRoute role="admin" setActiveLink={handlePageChange}>
//       <AdminDashboard />
//     </ProtectedRoute>
//   )}
export const ProtectedRoute = ({ children, role, setActiveLink }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setActiveLink(role === "admin" ? "admin-login" : "login");
    } else if (role && user.role !== role) {
      setActiveLink("home");
    }
  }, [user, loading, role, setActiveLink]);

  if (loading || !user || (role && user.role !== role)) return null;

  return children;
};
