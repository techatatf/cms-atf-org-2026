document.querySelectorAll("[data-quiz]").forEach((quiz) => {
  quiz.addEventListener("submit", (event) => {
    event.preventDefault();

    const selected = quiz.querySelector("input[type='radio']:checked");
    const feedback = quiz.querySelector("[data-feedback]");

    if (!feedback) return;

    if (!selected) {
      feedback.textContent = "Choose an answer first.";
      feedback.className = "quiz-feedback incorrect";
      return;
    }

    const correct = selected.dataset.correct === "true";
    feedback.textContent = correct
      ? (selected.dataset.success ?? "Correct.")
      : (selected.dataset.retry ?? "Not quite. Re-read the section and try again.");
    feedback.className = `quiz-feedback ${correct ? "correct" : "incorrect"}`;
  });
});
