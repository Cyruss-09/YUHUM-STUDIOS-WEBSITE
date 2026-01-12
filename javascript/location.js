document.addEventListener("DOMContentLoaded", () => {
  const toggleIcon = document.getElementById("toggleIcon");
  const locationInput = document.getElementById("locationInput");
  const directionsLink = document.getElementById("directionsLink");

  let isOpen = false;

  function toggleDirections() {
    isOpen = !isOpen;
    directionsLink.classList.toggle("show", isOpen);
    toggleIcon.classList.toggle("flip", isOpen);
  }

  toggleIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDirections();
  });

  locationInput.addEventListener("click", toggleDirections);
});
