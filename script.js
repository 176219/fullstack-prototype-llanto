/* ================= DATABASE & STATE ================= */
const STORAGE_KEY = "ipt_demo_v1";

let db = {
  accounts: []
};

let currentUser = null;

/* ================= STORAGE ================= */
function loadDB() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
    db = JSON.parse(data);
  } else {
    // Seed admin account
    db.accounts.push({
      email: "admin@example.com",
      password: "Password123!",
      role: "admin",
      verified: true
    });
    saveDB();
  }
}

function saveDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/* ================= ROUTER ================= */
function navigate(route) {
  window.location.hash = route;
}

function router() {
  const route = location.hash.replace("#/", "") || "home";

  document.querySelectorAll(".page").forEach(p =>
    p.classList.remove("active")
  );

  // Protect routes
  if (!currentUser && ["profile", "requests", "accounts"].includes(route)) {
    navigate("login");
    return;
  }

  // Admin-only route
  if (route === "accounts" && currentUser?.role !== "admin") {
    navigate("home");
    return;
  }

  document.getElementById(route)?.classList.add("active");

  if (route === "profile") renderProfile();
  if (route === "accounts") renderAccounts();
}

window.addEventListener("hashchange", router);

/* ================= AUTH ================= */
function register() {
  const email = regEmail.value;
  const password = regPassword.value;

  db.accounts.push({ email, password, role: "user", verified: false });
  saveDB();

  localStorage.setItem("unverified_email", email);
  navigate("verify");
}

function verifyEmail() {
  const email = localStorage.getItem("unverified_email");
  const user = db.accounts.find(u => u.email === email);

  if (user) user.verified = true;
  saveDB();

  navigate("login");
}

function login() {
  const email = loginEmail.value;
  const password = loginPassword.value;

  const user = db.accounts.find(
    u => u.email === email && u.password === password && u.verified
  );

  if (!user) {
    alert("Invalid login credentials");
    return;
  }

  currentUser = user;
  localStorage.setItem("auth_token", email);

  document.body.classList.remove("not-authenticated");
  document.body.classList.add("authenticated");

  if (user.role === "admin") {
    document.body.classList.add("is-admin");
  }

  navigate("profile");
}

function logout() {
  currentUser = null;
  localStorage.removeItem("auth_token");

  document.body.className = "not-authenticated";
  navigate("home");
}

/* ================= RENDER ================= */
function renderProfile() {
  profileInfo.innerHTML = `
    <p><strong>Email:</strong> ${currentUser.email}</p>
    <p><strong>Role:</strong> ${currentUser.role}</p>
  `;
}

function renderAccounts() {
  accountsList.innerHTML = "";

  db.accounts.forEach(acc => {
    const li = document.createElement("li");
    li.textContent = `${acc.email} (${acc.role})`;
    accountsList.appendChild(li);
  });
}

/* ================= INIT ================= */
loadDB();

const token = localStorage.getItem("auth_token");
if (token) {
  currentUser = db.accounts.find(u => u.email === token);

  if (currentUser) {
    document.body.classList.replace("not-authenticated", "authenticated");

    if (currentUser.role === "admin") {
      document.body.classList.add("is-admin");
    }
  }
}

router();
