let nightModeToggle = document.querySelector('.color-toggle');
let isNightMode = 0;

window.addEventListener('DOMContentLoaded', (event) => {
    if (localStorage.getItem('isNightMode') == 1) {
        toggleNightMode();
    } else if (localStorage.getItem('isNightMode') == null && window.matchMedia('(prefers-color-scheme: dark)')) {
        toggleNightMode();
        localStorage.setItem('isNightMode', 1);
    } else {
        localStorage.setItem('isNightMode', 0);
    }
});

function toggleNightMode() {
    if (isNightMode == 0) {
        isNightMode = 1;
        localStorage.setItem('isNightMode', 1);
    } else {
        isNightMode = 0;
        localStorage.setItem('isNightMode', 0);
    }
    document.body.classList.toggle('night-mode');
}