import { useState } from "react";
import BookingsTab from "./tabs/BookingsTab";
import ReviewsTab from "./tabs/ReviewsTab";
import RescheduleTab from "./tabs/RescheduleTab";
import { getCurrentUser, logoutUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const TABS = [
  { key: "bookings", label: "Bookings" },
  { key: "reviews", label: "Reviews" },
  { key: "reschedule", label: "Reschedule Requests" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">A</span>
          <span>Admin</span>
        </div>

        <nav className="admin-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`admin-nav-item ${activeTab === tab.key ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-name">{user?.username || "Admin"}</div>
            <div className="admin-user-email">{user?.email}</div>
          </div>
          <button className="admin-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-content-header">
          <h1>{TABS.find((t) => t.key === activeTab)?.label}</h1>
        </header>

        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "reschedule" && <RescheduleTab />}
      </main>
    </div>
  );
}