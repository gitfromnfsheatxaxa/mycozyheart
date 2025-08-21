const gallery = document.getElementById("gallery");
const introScreen = document.getElementById("intro-screen");
const bgMusic = document.getElementById("bg-music");

const BOT_TOKEN = "5564814493:AAE-fW4LsvsR5azRSdOu24GRpEiuFxt3Em8"; 
const CHAT_ID = "-1001756381397";

// Track visit start time
const visitStart = Date.now();

function getDeviceInfo() {
  const ua = navigator.userAgent;

  let deviceType = "Unknown";
  if (/mobile/i.test(ua)) {
    deviceType = "Phone";
  } else if (/tablet/i.test(ua)) {
    deviceType = "Tablet";
  } else {
    deviceType = "PC";
  }

  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { deviceType, os, ua };
}

async function sendVisitorData(extra = "") {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    const ip = data.ip;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const time = new Date().toLocaleString();

    const { deviceType, os, ua } = getDeviceInfo();

    const message = `👀 New Visitor:
🌍 IP: ${ip}
📅 Time: ${time}
🖥️ Screen: ${width}x${height}
📱 Device: ${deviceType}
⚙️ OS: ${os}
🔎 UA: ${ua}
${extra}`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });
  } catch (err) {
    console.error("Failed to send visitor data:", err);
  }
}

// Send when page loads
sendVisitorData();

// Send session duration when leaving page
window.addEventListener("beforeunload", () => {
  const duration = Math.floor((Date.now() - visitStart) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const sessionMsg = `⏱️ Session Duration: ${minutes}m ${seconds}s`;
  navigator.sendBeacon(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    JSON.stringify({ chat_id: CHAT_ID, text: sessionMsg })
  );
});

document.body.addEventListener("click", () => {
  introScreen.classList.add("hidden");
  gallery.classList.remove("hidden");
  document.body.classList.remove("intro-active");

  bgMusic.volume = 0.5;
  bgMusic.play().catch((e) => {
    console.warn("Autoplay failed:", e);
  });
});

// Render gallery
photoData.forEach(({ id, img }) => {
  if (!img || typeof img !== "string" || !img.trim()) return;

  const ext = img.split('.').pop().toLowerCase();
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'heic'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

  const isValidImage = imageExtensions.includes(ext);
  const isValidVideo = videoExtensions.includes(ext);

  if (!isValidImage && !isValidVideo) return;

  const container = document.createElement("div");
  container.className = "gallery-item";

  if (isValidVideo) {
    const video = document.createElement("video");
    video.src = img;
    video.controls = true;
    video.setAttribute("preload", "metadata");
    video.setAttribute("playsinline", "");

    video.onerror = () => {
      container.remove();
      console.warn(`Skipping broken video: ${img}`);
    };

    video.onloadedmetadata = () => {
      container.appendChild(video);
      gallery.appendChild(container);
    };

  } else if (isValidImage) {
    const image = document.createElement("img");
    image.src = img;
    image.alt = `Image ${id}`;

    image.onerror = () => {
      container.remove();
      console.warn(`Skipping broken image: ${img}`);
    };

    container.appendChild(image);
    gallery.appendChild(container);
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".gallery-item").forEach(item => {
  observer.observe(item);
});

function lightCandle() {
  const msg = document.querySelector(".candle-message");
  msg.classList.remove("hidden");
  msg.classList.add("visible");
  setTimeout(() => {
    msg.classList.remove("visible");
    msg.classList.add("hidden");
  }, 4000);
}

// Star background
const canvas = document.getElementById("stars-bg");
const ctx = canvas.getContext("2d");
let stars = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.2,
    alpha: Math.random()
  });
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.fill();
    star.alpha += (Math.random() - 0.5) * 0.05;
    star.alpha = Math.min(1, Math.max(0.1, star.alpha));
  }
  requestAnimationFrame(drawStars);
}
drawStars();
