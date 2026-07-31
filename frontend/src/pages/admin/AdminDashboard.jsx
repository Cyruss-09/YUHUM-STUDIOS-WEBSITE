import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env?.VITE_API_BASE || "";
const TABS = ["bookings", "reviews", "subscribers"];

export const AdminDashboard = ({ setActiveLink }) => {
  const { user, token, logout } = useAuth();
  const [tab, setTab] = useState("bookings");
  const [data, setData] = useState({
    bookings: [],
    reviews: [],
    subscribers: [],
  });
  const [loadingTab, setLoadingTab] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchTab = async () => {
      setLoadingTab(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/admin/${tab}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load data.");
        setData((prev) => ({ ...prev, [tab]: json[tab] || [] }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTab(false);
      }
    };

    fetchTab();
  }, [tab, token]);

  const handleLogout = () => {
    logout();
    setActiveLink("home");
  };

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl text-amber-950">
              Studio Admin Dashboard
            </h1>
            {user && (
              <p className="text-sm text-stone-500">
                Signed in as {user.email}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs uppercase tracking-wider px-4 py-2 rounded-md bg-amber-950 text-white hover:bg-amber-900 transition-colors"
          >
            Log Out
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${
                tab === t
                  ? "bg-amber-500 text-amber-950 font-semibold"
                  : "bg-amber-900/10 text-stone-600 hover:bg-amber-900/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {loadingTab && <p className="text-sm text-stone-500 mb-4">Loading…</p>}

        {!loadingTab && tab === "bookings" && (
          <BookingsTable rows={data.bookings} />
        )}
        {!loadingTab && tab === "reviews" && (
          <ReviewsTable rows={data.reviews} />
        )}
        {!loadingTab && tab === "subscribers" && (
          <SubscribersTable rows={data.subscribers} />
        )}
      </div>
    </div>
  );
};

const Th = ({ children }) => (
  <th className="text-left text-xs uppercase tracking-wider text-stone-500 px-3 py-2 border-b border-stone-200 whitespace-nowrap">
    {children}
  </th>
);

const Td = ({ children }) => (
  <td className="px-3 py-2 text-sm text-stone-700 border-b border-stone-100 align-top">
    {children}
  </td>
);

const EmptyState = ({ label }) => (
  <p className="text-sm text-stone-500 bg-white border border-stone-200 rounded-lg px-4 py-8 text-center">
    No {label} yet.
  </p>
);

const BookingsTable = ({ rows }) => {
  if (rows.length === 0) return <EmptyState label="bookings" />;
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-stone-200">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Package</Th>
            <Th>Studio</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th>Payment</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <Td>
                {[b.firstName, b.lastName].filter(Boolean).join(" ") || "—"}
              </Td>
              <Td>{b.package_title}</Td>
              <Td>{b.studio}</Td>
              <Td>
                {b.booking_date}
                {b.day_of_week ? ` (${b.day_of_week})` : ""}
              </Td>
              <Td>{b.booking_time || "—"}</Td>
              <Td>{b.phone || "—"}</Td>
              <Td>{b.email || "—"}</Td>
              <Td>{b.paymentMode || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReviewsTable = ({ rows }) => {
  if (rows.length === 0) return <EmptyState label="reviews" />;
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-stone-200">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <Th>Rating</Th>
            <Th>Equipment</Th>
            <Th>Privacy</Th>
            <Th>Props</Th>
            <Th>Backdrop</Th>
            <Th>Recommend</Th>
            <Th>Comments</Th>
            <Th>Email</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td>{r.overall_rating}/5</Td>
              <Td>{r.equipment_ease}/5</Td>
              <Td>{r.room_privacy}/5</Td>
              <Td>{r.props_selection}/5</Td>
              <Td>{r.favorite_backdrop || "—"}</Td>
              <Td>
                {r.recommend === true
                  ? "Yes"
                  : r.recommend === false
                    ? "No"
                    : "—"}
              </Td>
              <Td>
                <span className="block max-w-xs">{r.comments || "—"}</span>
              </Td>
              <Td>{r.user_email || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SubscribersTable = ({ rows }) => {
  if (rows.length === 0) return <EmptyState label="subscribers" />;
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-stone-200">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th>Subscribed</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <Td>{s.email}</Td>
              <Td>{s.status || "active"}</Td>
              <Td>
                {s.created_at
                  ? new Date(s.created_at).toLocaleDateString()
                  : "—"}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
