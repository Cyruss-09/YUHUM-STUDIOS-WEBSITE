// ===== MAIN BOOKING SCRIPT =====
window.onload = function () {
  // ===== SELECTORS =====
  const dates = document.querySelectorAll(".date");
  const timeButtons = document.querySelectorAll(".time");
  const nextBtn = document.getElementById("nextBtn");
  const monthSpan = document.querySelector(".month");
  const yearSpan = document.querySelector(".year");
  const currentDayDiv = document.querySelector(".current-day");

  // ===== FUNCTION: UPDATE RIGHT SIDE DATE =====
  function updateCurrentDay(dayNumber) {
    const month = monthSpan.textContent;
    const year = yearSpan.textContent;

    const dateObj = new Date(`${month} ${dayNumber}, ${year}`);
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    currentDayDiv.textContent = `${weekday}, ${month} ${dayNumber}`;
  }

  // ===== DATE CLICK =====
  dates.forEach((date) => {
    date.addEventListener("click", () => {
      dates.forEach((d) => d.classList.remove("active"));
      date.classList.add("active");

      updateCurrentDay(date.textContent.trim());
    });
  });

  // ===== TIME BUTTON CLICK =====
  timeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      nextBtn.style.display = "block";
    });
  });

  nextBtn.addEventListener("click", () => {
    window.location.href = "bookdetails.html";
  });
};
