export async function submitReview(formData) {
  const sanitizedData = {
    userEmail: formData.userEmail.trim() || null,
    overallRating: Number(formData.overallRating) || 0,
    equipmentEase: Number(formData.equipmentEase) || 0,
    roomPrivacy: Number(formData.roomPrivacy) || 0,
    propsSelection: Number(formData.propsSelection) || 0,
    favoriteBackdrop: formData.favoriteBackdrop || null,
    comments: formData.comments || null,
    recommend: formData.recommend,
  };

  const response = await fetch("http://localhost:5000/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sanitizedData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server responded with status ${response.status}`);
  }

  return data;
}