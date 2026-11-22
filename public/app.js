// Ask the server how it is configured, then show it. textContent (not
// innerHTML) so a value like ATTENDEE can never inject markup.
fetch("/config.json")
  .then((r) => r.json())
  .then((c) => {
    document.getElementById("attendee").textContent = c.attendee;
    document.getElementById("host").textContent = c.host;
    document.getElementById("release").textContent = String(c.release).slice(0, 7);
    document.getElementById("started").textContent = new Date(c.startedAt).toLocaleTimeString();
    document.getElementById("bg").textContent = c.bgColor;
    document.documentElement.style.setProperty("--bg", c.bgColor);
  })
  .catch(() => { document.getElementById("attendee").textContent = "world"; });

// Purely client-side state: survives reloads in this browser only.
const countEl = document.getElementById("count");
let count = Number(localStorage.getItem("clicks") || 0);
countEl.textContent = count;
document.getElementById("clicker").addEventListener("click", () => {
  count += 1;
  countEl.textContent = count;
  localStorage.setItem("clicks", count);
});
