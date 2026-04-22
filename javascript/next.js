// ===== MAIN BOOKING SCRIPT =====
window.onload = function () {
  const dates = document.querySelectorAll(".date");
  const timeButtons = document.querySelectorAll(".time");
  const nextBtn = document.getElementById("nextBtn");
  const monthSpan = document.querySelector(".month");
  const yearSpan = document.querySelector(".year");
  const currentDayDiv = document.querySelector(".current-day");

  let selectedDate = "";
  let selectedTime = "";

  // ===== UPDATE RIGHT SIDE DATE =====
  function updateCurrentDay(dayNumber) {
    const month = monthSpan.textContent;
    const year = yearSpan.textContent;

    const dateObj = new Date(`${month} ${dayNumber}, ${year}`);

    // ✅ FIX: handle invalid date
    if (isNaN(dateObj)) return;

    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    currentDayDiv.textContent = `${weekday}, ${month} ${dayNumber}`;
  }

  // ===== DATE CLICK =====
  dates.forEach((date) => {
    date.addEventListener("click", () => {
      // remove active
      dates.forEach((d) => d.classList.remove("active"));
      date.classList.add("active");

      updateCurrentDay(date.textContent.trim());

      // ✅ FIX: fallback if no data-date
      selectedDate = date.dataset.date || "";

      const dateInput = document.getElementById("booking_date");
      if (dateInput) {
        dateInput.value = selectedDate;
      }

      checkReady();
    });
  });

  // ===== TIME CLICK =====
  timeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      timeButtons.forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");

      // ✅ FIX: fallback if no data-time
      selectedTime = btn.dataset.time || "";

      const timeInput = document.getElementById("booking_time");
      if (timeInput) {
        timeInput.value = selectedTime;
      }

      checkReady();
    });
  });

  // ===== SHOW BUTTON ONLY IF READY =====
  function checkReady() {
    if (selectedDate && selectedTime) {
      nextBtn.style.display = "block";
    } else {
      nextBtn.style.display = "none";
    }
  }

  // ===== NEXT BUTTON =====
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault(); // ✅ FIX: stop accidental reload

    if (!selectedDate || !selectedTime) {
      alert("Please select date and time!");
      return;
    }

    const form = document.querySelector("form");

    // ✅ FIX: check if form exists
    if (!form) {
      console.error("Form not found!");
      return;
    }

    form.submit();
  });
};
