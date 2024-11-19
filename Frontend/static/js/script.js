// Smooth scroll for the 'About' section
document.addEventListener('DOMContentLoaded', function () {
    const aboutLink = document.querySelector('a[href="#about"]');
    if (aboutLink) {
        aboutLink.addEventListener('click', function (event) {
            event.preventDefault();
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        });
    }
});
