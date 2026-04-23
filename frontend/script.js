// 🔥 Page reload debug
window.addEventListener("beforeunload", function () {
  console.log("Page reloading...");
});

// ================= LOGIN =================
async function login() {
  console.log("Login clicked");

  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!mobile || !password) {
    document.getElementById("error").innerText = "Please fill all fields";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mobile, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("farmerId", data.user._id);
      alert("Login Successful");
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("error").innerText = data.message;
    }

  } catch (err) {
    console.log(err);
    document.getElementById("error").innerText = "Server error";
  }
}

// ================= REGISTER =================
async function register() {
  console.log("Register clicked");

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !mobile || !password) {
    document.getElementById("msg").innerText = "All fields required";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, mobile, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Your Farmer ID: " + data.farmerId);
      window.location.href = "login.html";
    } else {
      document.getElementById("msg").innerText = data.message;
    }

  } catch (err) {
    console.log(err);
    document.getElementById("msg").innerText = "Server error";
  }
}

// ================= NAVIGATION =================
function goToRegister() {
  window.location.href = "register.html";
}

function goToLogin() {
  window.location.href = "login.html";
}

function goToUpload() {
  window.location.href = "upload.html";
}

function goToApply() {
  window.location.href = "apply.html";
}

function goToStatus() {
  window.location.href = "status.html";
}

async function uploadImage() {

  console.log("🔥 BUTTON CLICKED");

  const fileInput = document.getElementById("imageInput");

  if (!fileInput.files.length) {
    alert("Select file first ❌");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    console.log("📤 Sending request...");

    const res = await fetch("http://localhost:5000/api/app/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    // 🔥 DEBUG (MOST IMPORTANT)
    console.log("FULL RESPONSE:", data);

    // ✅ SAFE DISPLAY
    if (data.result) {
      document.getElementById("msg").innerText =
        "Result: " + data.result;
    } else if (data.error) {
      document.getElementById("msg").innerText =
        "Error: " + data.error;
    } else {
      document.getElementById("msg").innerText =
        "No result from server ❌";
    }

    // 🔥 redirect logic
    if (data.result === "Damaged") {
      setTimeout(() => {
        window.location.href = "claim.html";
      }, 1500);
    }

  } catch (err) {
    console.log("❌ ERROR:", err);
    document.getElementById("msg").innerText =
      "Server error ❌";
  }
}
// ================= SUBMIT APPLICATION =================
async function submitApplication() {
  if (!damageDetected) {
    alert("Upload image first ❌");
    return;
  }

  const farmerId = localStorage.getItem("farmerId");

  const data = {
    farmerId,
    farmerName: document.getElementById("farmerName").value,
    crop: document.getElementById("cropName").value,
    damage: document.getElementById("damageType").value,
    landSize: document.getElementById("landSize").value,
    location: document.getElementById("location").value
  };

  const res = await fetch("http://localhost:5000/api/app/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  document.getElementById("formMsg").innerText = result.message;

  loadStatus();
}

// ================= LOAD STATUS =================
async function loadStatus() {
  const farmerId = localStorage.getItem("farmerId");

  const res = await fetch(
    `http://localhost:5000/api/app/status/${farmerId}`
  );

  const apps = await res.json();

  const table = document.getElementById("statusTable");
  table.innerHTML = "";

  apps.forEach(app => {
    table.innerHTML += `
      <tr>
        <td>${app.crop}</td>
        <td>${app.damage}</td>
        <td>${app.patwariStatus}</td>
        <td>${app.insuranceStatus}</td>
        <td>${app.bankStatus}</td>
      </tr>
    `;
  });
}

async function loadData() {
  const res = await fetch("http://localhost:5000/api/app/status/all");
  const data = await res.json();

  const table = document.getElementById("data");

  data.forEach(app => {
    table.innerHTML += `
      <tr>
        <td>${app.name}</td>
        <td>${app.crop_name}</td>
        <td>${app.damage_type}</td>
        <td>${app.patwariStatus}</td>
      </tr>
    `;
  });
}

loadData();