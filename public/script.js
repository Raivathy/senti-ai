async function analyze() {
  const text = document.getElementById("text").value;
  const result = document.getElementById("result");
  const fill = document.getElementById("fill");

  if (!text.trim()) {
    result.innerText = "⚠️ Please enter some text";
    fill.style.width = "0%";
    return;
  }

  result.innerText = "Analyzing with AI...";
  fill.style.width = "0%";

  const response = await fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await response.json();

  result.innerText = `Sentiment: ${data.sentiment} ${data.emoji}`;
  fill.style.width = `${data.confidence * 100}%`;
}
