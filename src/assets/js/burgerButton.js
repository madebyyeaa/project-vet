document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".burger");
    const navMenu = document.querySelector(".nav-menu");
  
    burger.addEventListener("click", function () {
      const expanded = burger.getAttribute("aria-expanded") === "true" || false;
      burger.setAttribute("aria-expanded", !expanded);
      burger.classList.toggle("toggle");
      navMenu.classList.toggle("active");
    });
  
    // Optional: klik di luar menu untuk menutup menu
    document.addEventListener("click", function (event) {
      if (
        !burger.contains(event.target) &&
        !navMenu.contains(event.target) &&
        navMenu.classList.contains("active")
      ) {
        burger.classList.remove("toggle");
        navMenu.classList.remove("active");
        burger.setAttribute("aria-expanded", false);
      }
    });
  });
  