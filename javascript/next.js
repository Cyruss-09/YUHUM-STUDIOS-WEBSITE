document.addEventListener("DOMContentLoaded", function () {
  const dates = document.querySelectorAll(".date");
  const timeButtons = document.querySelectorAll(".time");
  const nextBtn = document.getElementById("nextBtn");
  const currentDayDiv = document.querySelector(".current-day");
  const monthSpan = document.querySelector(".month");
  const yearSpan = document.querySelector(".year");
  const form = document.querySelector("form");

  let selectedDate = "";
  let selectedTime = "";

  // GET DEFAULT ACTIVE DATE
  const defaultActive = document.querySelector(".date.active");
  if (defaultActive) {
    selectedDate = defaultActive.dataset.date;
    document.getElementById("booking_date").value = selectedDate;
  }

  // UPDATE RIGHT SIDE DATE
  function updateCurrentDay(dateString) {
    if (!dateString) return;

    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return;

    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const month = monthSpan.textContent;
    const year = yearSpan.textContent;

    currentDayDiv.textContent = `${weekday}, ${month} ${dateObj.getDate()}`;
  }

  // DATE CLICK
  dates.forEach((date) => {
    date.addEventListener("click", () => {
      dates.forEach((d) => d.classList.remove("active"));
      date.classList.add("active");

      selectedDate = date.dataset.date;

      document.getElementById("booking_date").value = selectedDate;

      updateCurrentDay(selectedDate);
      checkReady();
    });
  });

  // TIME CLICK
  timeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      timeButtons.forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");

      selectedTime = btn.dataset.time;

      document.getElementById("booking_time").value = selectedTime;

      checkReady();
    });
  });

  // ENABLE BUTTON ONLY IF READY
  function checkReady() {
    if (selectedDate && selectedTime) {
      nextBtn.style.display = "block";
      nextBtn.disabled = false;
    } else {
      nextBtn.style.display = "none";
    }
  }

  checkReady();

  nextBtn.addEventListener("click", () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time!");
      return;
    }

    // store temporary data
    sessionStorage.setItem("booking_date", selectedDate);
    sessionStorage.setItem("booking_time", selectedTime);

    // go to next page
    window.location.href = "bookdetails.html";
  });
});
