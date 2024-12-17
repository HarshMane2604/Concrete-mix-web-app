document.querySelectorAll(".dropdown-input").forEach((dropdownInput) => {
  const dropdownOptions = dropdownInput.nextElementSibling;

  dropdownInput.addEventListener("click", () => {
    dropdownOptions.style.display =
      dropdownOptions.style.display === "block" ? "none" : "block";
  });
});

function selectOption(element, option) {
  const dropdownInput = element.closest(".dropdown-container").querySelector(".dropdown-input");
  dropdownInput.value = option;
  dropdownInput.nextElementSibling.style.display = "none";
  dropdownInput.style.border = "2.4px solid #fdaaaa";
  dropdownInput.style.color = "#ff6161";
}

document.addEventListener("click", function (event) {
  document.querySelectorAll(".dropdown-options").forEach((dropdownOptions) => {
    if (!event.target.closest(".dropdown-container")) {
      dropdownOptions.style.display = "none";
    }
  });
});
