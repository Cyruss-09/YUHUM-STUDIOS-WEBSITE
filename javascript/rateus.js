const stars = document.querySelectorAll(".star");
const ratingText = document.getElementById("ratingText");

let currentRating = 0;

stars.forEach((star) => {
  star.addEventListener("click", () => {
    currentRating = star.dataset.value;
    updateStars(currentRating);
    ratingText.textContent = `You rated ${currentRating} star(s)`;
  });

  star.addEventListener("mouseover", () => {
    updateStars(star.dataset.value, true);
  });

  star.addEventListener("mouseleave", () => {
    updateStars(currentRating);
  });
});

function updateStars(rating, isHover = false) {
  stars.forEach((star) => {
    star.classList.remove("active", "hover");
    if (star.dataset.value <= rating) {
      star.classList.add(isHover ? "hover" : "active");
    }
  });
}
