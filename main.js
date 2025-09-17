window.onload = () => {
  // FIREBASE INIT
  const firebaseConfig = {
    apiKey: "AIzaSyBAf6jR_6A-YvWUCd_NsOWVeiybjBN2FbM",
    authDomain: "santtuclicker.firebaseapp.com",
    projectId: "santtuclicker",
    storageBucket: "santtuclicker.firebasestorage.app",
    messagingSenderId: "426586427950",
    appId: "1:426586427950:web:b44bb0caf7532014a805bf"
  };
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // GAME DATA
  let currentUser = null;
  let users = JSON.parse(localStorage.getItem("users")) || {};
  let shopItems = [
    { name: "Santtu Cursor", baseCost: 100, cookiesPerSec: 1, owned: 0 },
    { name: "Santtu Grandma", baseCost: 1000, cookiesPerSec: 10, owned: 0 },
    { name: "Santtu Factory", baseCost: 10000, cookiesPerSec: 100, owned: 0 },
    { name: "Santtu Bank", baseCost: 100000, cookiesPerSec: 1000, owned: 0 },
    { name: "Santtu Rocket", baseCost: 1000000, cookiesPerSec: 5000, owned: 0 }
  ];

  let ranks = [
    { name: "Gay Lanttu", img: "santtu.png", minCookies: 0 },
    { name: "Santtu1", img: "santtu1.png", minCookies: 10000 },
    { name: "Santtu2", img: "santtu2.png", minCookies: 100000 },
    { name: "Santtu3", img: "santtu3.png", minCookies: 1000000 },
    { name: "Santtu4", img: "santtu4.png", minCookies: 10000000 },
    { name: "Santtu5", img: "santtu5.png", minCookies: 1000000000 },
    { name: "Santtu6", img: "santtu6.png", minCookies: 999000000000000 }
  ];

  // DOM
  const loginScreen = document.getElementById("login-screen");
  const gameContainer = document.getElementById("game-container");
  const loginBtn = document.getElementById("login-btn");
  const loginMsg = document.getElementById("login-msg");
  const cookieBtn = document.getElementById("cookie-btn");
  const cookieCountEl = document.getElementById("cookie-count");
  const rankNameEl = document.getElementById("rank-name");
  const rankImgEl = document.getElementById("rank-img");
  const shopDiv = document.getElementById("shop-items");
  const leaderboardDiv = document.getElementById("leaderboard-list");
  const tabs = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const resetBtn = document.getElementById("reset-btn");
  const newPasswordInput = document.getElementById("new-password");
  const changePasswordBtn = document.getElementById("change-password-btn");

  // LOGIN
  loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!username || !password) return (loginMsg.textContent = "Enter username & password");

    if (!users[username]) {
      users[username] = { password, cookies: 0, upgrades: {} };
    }
    if (users[username].password !== password) return (loginMsg.textContent = "Wrong password!");

    currentUser = username;
    // restore shop
    if (users[currentUser].upgrades) {
      shopItems.forEach(item => {
        item.owned = users[currentUser].upgrades[item.name] || 0;
      });
    }
    loginScreen.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    renderShop();
    updateUI();
    updateLeaderboard();
  });

  // CLICK COOKIE
  cookieBtn.addEventListener("click", () => {
    if (!currentUser) return;
    users[currentUser].cookies += 1;
    saveUser();
    saveUserGlobal();
    updateUI();
  });

  // SHOP
  function renderShop() {
    shopDiv.innerHTML = "";
    shopItems.forEach((item, index) => {
      const cost = Math.floor(item.baseCost * Math.pow(1.15, item.owned));
      const div = document.createElement("div");
      div.innerHTML = `${item.name} - Owned: ${item.owned} <br> Cost: ${cost.toLocaleString()}`;
      const btn = document.createElement("button");
      btn.textContent = "Buy";
      btn.disabled = users[currentUser].cookies < cost;
      btn.onclick = () => buyItem(index);
      div.appendChild(document.createElement("br"));
      div.appendChild(btn);
      shopDiv.appendChild(div);
    });
  }

  function buyItem(index) {
    const item = shopItems[index];
    const cost = Math.floor(item.baseCost * Math.pow(1.15, item.owned));
    if (users[currentUser].cookies < cost) return;
    users[currentUser].cookies -= cost;
    item.owned++;
    users[currentUser].upgrades[item.name] = item.owned;
    saveUser();
    saveUserGlobal();
    renderShop();
    updateUI();
  }

  // SAVE
  function saveUser() {
    localStorage.setItem("users", JSON.stringify(users));
  }

  function saveUserGlobal() {
    if (!currentUser) return;
    db.collection("users").doc(currentUser).set({
      cookies: users[currentUser].cookies,
      upgrades: users[currentUser].upgrades
    });
  }

  // UI
  function updateUI() {
    if (!currentUser) return;
    cookieCountEl.textContent = users[currentUser].cookies.toLocaleString();
    const rank = ranks.slice().reverse().find(r => users[currentUser].cookies >= r.minCookies);
    rankNameEl.textContent = rank.name;
    rankImgEl.src = rank.img;
    renderShop();
  }

  // LEADERBOARD
  function updateLeaderboard() {
    db.collection("users").orderBy("cookies", "desc").limit(20).get().then(snapshot => {
      leaderboardDiv.innerHTML = "";
      let index = 0;
      snapshot.forEach(doc => {
        index++;
        const data = doc.data();
        const rank = ranks.slice().reverse().find(r => data.cookies >= r.minCookies);
        const div = document.createElement("div");
        div.textContent = `${index}. ${doc.id} - ${data.cookies.toLocaleString()} (${rank.name})`;
        leaderboardDiv.appendChild(div);
      });
    });
  }
  setInterval(updateLeaderboard, 2000);

  // TABS
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabContents.forEach(tc => tc.classList.add("hidden"));
      document.getElementById("tab-" + tab.dataset.tab).classList.remove("hidden");
    });
  });

  // PASSWORD CHANGE
  changePasswordBtn.addEventListener("click", () => {
    const newPass = newPasswordInput.value.trim();
    if (!newPass) return alert("Enter new password");
    users[currentUser].password = newPass;
    saveUser();
    alert("Password changed!");
    newPasswordInput.value = "";
  });

  // DELETE ACCOUNT
  resetBtn.addEventListener("click", () => {
    if (!confirm("Delete your account?")) return;
    db.collection("users").doc(currentUser).delete();
    delete users[currentUser];
    saveUser();
    currentUser = null;
    gameContainer.classList.add("hidden");
    loginScreen.classList.remove("hidden");
    alert("Account deleted!");
  });

  // AUTO ADD CPS
  setInterval(() => {
    if (!currentUser) return;
    const cps = shopItems.reduce((sum, i) => sum + i.cookiesPerSec * i.owned, 0);
    if (cps > 0) users[currentUser].cookies += cps;
    saveUser();
    saveUserGlobal();
    updateUI();
  }, 1000);
};
