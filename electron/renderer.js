// renderer.js
document.getElementById("platformBtn").addEventListener("click", () => {
  const platform = window.electronAPI.getPlatform();
  document.getElementById("platform").textContent = platform;
});
