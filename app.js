// ----------------------------------------
// ELEMENTS
// ----------------------------------------
const startPage = document.getElementById("startPage");
const testPage = document.getElementById("testPage");

const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

const timerDisplay = document.getElementById("timer");

// ----------------------------------------
// GLOBALS
// ----------------------------------------
let drawings = [];
let currentIndex = 0;
let totalQuestions = 18;

let timerSeconds = 600; // 10 minutes

let drawing = false;

// ----------------------------------------
// LOAD ALL IMAGE NAMES
// ----------------------------------------
let complexImgs = [];
let simpleImgs  = [];

for (let i = 1; i <= totalQuestions; i++) {
    complexImgs.push(`q${i}.png`);
    simpleImgs.push(`simple${i}.png`);
}

// ----------------------------------------
// LOAD COMPLEX BACKGROUND IMAGE
// ----------------------------------------
function loadBackground() {
    const img = new Image();
    img.src = complexImgs[currentIndex];

    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
}

// ----------------------------------------
// CANVAS DRAWING
// ----------------------------------------
canvas.addEventListener("mousedown", () => { drawing = true; });
canvas.addEventListener("mouseup", () => { drawing = false; ctx.beginPath(); });
canvas.addEventListener("mousemove", drawLine);

function drawLine(e) {
    if (!drawing) return;

    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    ctx.lineCap = "round";

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

// ----------------------------------------
// TIMER
// ----------------------------------------
function startTimer() {
    let interval = setInterval(() => {
        if (timerSeconds <= 0) {
            clearInterval(interval);
            submitTest();
        }

        let min = Math.floor(timerSeconds / 60);
        let sec = timerSeconds % 60;
        timerDisplay.textContent = `${min}:${sec < 10 ? "0" + sec : sec}`;

        timerSeconds--;
    }, 1000);
}

// ----------------------------------------
// START TEST
// ----------------------------------------
document.getElementById("startBtn").onclick = () => {
    startPage.style.display = "none";
    testPage.style.display = "block";

    loadBackground();
    startTimer();
};

// ----------------------------------------
// CLEAR CANVAS
// ----------------------------------------
document.getElementById("clearBtn").onclick = () => {
    loadBackground();
};

// ----------------------------------------
// NEXT QUESTION
// ----------------------------------------
document.getElementById("nextBtn").onclick = () => {

    // save drawing for this question
    drawings.push({
        user_image: canvas.toDataURL("image/png").split(",")[1], // strip prefix
        correct_image: simpleImgs[currentIndex] // matches simple1–simple18
    });

    currentIndex++;

    if (currentIndex >= totalQuestions) {
        alert("All 18 questions completed. Press SUBMIT.");
        currentIndex = totalQuestions - 1; // prevent overflow
        return;
    }

    loadBackground();
};

// ----------------------------------------
// SUBMIT TEST
// ----------------------------------------
document.getElementById("submitBtn").onclick = submitTest;

async function submitTest() {
    if (drawings.length !== totalQuestions) {
        alert("Please complete all 18 questions before submitting.");
        return;
    }

    const payload = { answers: drawings };

    try {
        let response = await fetch("http://127.0.0.1:8000/score_all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        let result = await response.json();

        alert(`FINAL SCORE: ${result.total_score} / ${totalQuestions}`);
        console.log("Result details:", result);

    } catch (err) {
        console.error(err);
        alert("Error: Backend unreachable. Make sure backend is running.");
    }
}

// Safe helper to get element (logs and returns null if missing)
function getEl(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`${id} not found in DOM`);
    return el;
}

// Ensure handlers run after DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    // Replace these IDs with the real ones from your HTML
    const submitBtn = getEl("submitButtonId");
    const someTarget = getEl("targetElementId");

    if (submitBtn) {
        submitBtn.addEventListener("click", function submitTest(event) {
            // Example: guard any element usage
            const input = getEl("someInputId");
            if (!input) return; // abort if required element missing

            // existing submitTest logic (move original code here,
            // replace direct document.getElementById(...) with getEl(...))
            // ...existing code...
        });
    }

    // If you have other bindings that previously ran too early, move them here
    // ...existing code...
});
