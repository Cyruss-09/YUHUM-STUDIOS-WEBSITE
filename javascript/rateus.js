const stars = document.querySelectorAll(".star");
const ratingInput = document.getElementById("rating");

let currentRating = 0;

stars.forEach((star) => {
  star.addEventListener("click", () => {
    currentRating = star.dataset.value;

    // ✅ SAVE TO FORM INPUT
    ratingInput.value = currentRating;

    updateStars(currentRating);
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
