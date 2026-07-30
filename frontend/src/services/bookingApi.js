// All backend I/O for the booking flow lives here. Components/hooks never
// call fetch() directly — they call this function and handle the result.
// Swapping the endpoint, adding auth headers, retry logic, etc. only
// touches this file.
export async function submitBooking(payload) {
  const response = await fetch("http://localhost:5000/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return { ok: response.ok, result };
}
