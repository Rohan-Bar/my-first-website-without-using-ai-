/* =========================================================
   CODESHIELD — LANDING PAGE JAVASCRIPT
========================================================= */


/* =========================================================
   HAMBURGER MENU
========================================================= */

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");


if (hamburger && mobileMenu) {

    hamburger.addEventListener("click", () => {

        const isOpen = mobileMenu.classList.toggle("open");

        hamburger.classList.toggle("active", isOpen);

        hamburger.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });


    /* =====================================================
       CLOSE MENU WHEN A LINK IS CLICKED
    ===================================================== */

    const menuLinks = mobileMenu.querySelectorAll("a");

    menuLinks.forEach(link => {

        link.addEventListener("click", () => {

            mobileMenu.classList.remove("open");

            hamburger.classList.remove("active");

            hamburger.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });


    /* =====================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ===================================================== */

    document.addEventListener("click", (event) => {

        const clickedInsideMenu =
            mobileMenu.contains(event.target);

        const clickedHamburger =
            hamburger.contains(event.target);


        if (
            mobileMenu.classList.contains("open") &&
            !clickedInsideMenu &&
            !clickedHamburger
        ) {

            mobileMenu.classList.remove("open");

            hamburger.classList.remove("active");

            hamburger.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

}


/* =========================================================
   CLOSE MOBILE MENU WITH ESC KEY
========================================================= */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        if (
            mobileMenu &&
            hamburger &&
            mobileMenu.classList.contains("open")
        ) {

            mobileMenu.classList.remove("open");

            hamburger.classList.remove("active");

            hamburger.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }

});


/* =========================================================
   NAVBAR SCROLL EFFECT
========================================================= */

const navbar = document.querySelector(".navbar");


if (navbar) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 10) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    });

}


/* =========================================================
   SMOOTH SCROLL FOR INTERNAL LINKS
========================================================= */

const internalLinks = document.querySelectorAll(
    'a[href^="#"]'
);


internalLinks.forEach(link => {

    link.addEventListener("click", (event) => {

        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }


        const target = document.querySelector(targetId);

        if (!target) {
            return;
        }


        event.preventDefault();


        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


/* =========================================================
   INITIALIZATION
========================================================= */

console.log("CodeShield frontend initialized.");