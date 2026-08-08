import { useState } from "react";
import { getCurrentUser, logoutUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const TABS = [];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-64 flex-col justify-between border-r border-gray-200 bg-white p-6">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
              A
            </span>
            <span className="text-lg font-semibold text-gray-900">Admin</span>
          </div>

          <nav className="flex flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-900">
              {user?.username || "Admin"}
            </div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {TABS.find((t) => t.key === activeTab)?.label}
          </h1>
        </header>
      </main>
    </div>
  );
}