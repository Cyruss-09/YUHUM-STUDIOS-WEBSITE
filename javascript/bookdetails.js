document.addEventListener("DOMContentLoaded", function () {
    // Grab the stored data
    const savedDate = sessionStorage.getItem("booking_date");
    const savedTime = sessionStorage.getItem("booking_time");

    // Inject them into hidden inputs in the FINAL form
    if (savedDate && savedTime) {
        document.getElementById("final_booking_date").value = savedDate;
        document.getElementById("final_booking_time").value = savedTime;
    } else {
        alert("Session expired. Please select a date and time again.");
        window.location.href = "book.html";
    }
});