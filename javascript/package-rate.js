const ratesLink = document.getElementById("ratesLink");
const ratesModal = document.getElementById("ratesModal");
const closeModal = document.getElementById("closeModal");

// Open the modal when clicking the navbar link
ratesLink.addEventListener("click", (e) => {
  e.preventDefault(); // Prevents navigating to the .html page
  ratesModal.style.display = "block";
  document.body.style.overflow = "hidden"; // Prevents background scrolling
});

// Close when clicking (X)
closeModal.addEventListener("click", () => {
  ratesModal.style.display = "none";
  document.body.style.overflow = "auto"; // Re-enables scrolling
});

// Close when clicking outside the content
window.addEventListener("click", (e) => {
  if (e.target === ratesModal) {
    ratesModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});
