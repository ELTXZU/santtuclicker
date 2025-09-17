// ---------- FIREBASE SETUP ----------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------- DATA ----------
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || {};
let leaderboard = [];

// ---------- RANKS ----------
const ranks = [
    { name: "Gay Lanttu", img: "santtu.png", minCookies: 0 },
    { name: "Santtu1", img: "santtu1.png", minCookies: 10000 },
    { name: "Santtu2", img: "santtu2.png", minCookies: 100000 },
    { name: "Santtu3", img: "santtu3.png", minCookies: 1000000 },
    { name: "Santtu4", img: "santtu4.png", minCookies: 10000000 },
    { name: "Santtu5", img: "santtu5.png", minCookies: 1000000000 },
    { name: "Santtu6", img: "santtu6.png", minCookies: 999000000000000 }
];

// ---------- SHOP ITEMS ----------
const shopItems = [
    { name: "Santtu Cursor", baseCost: 100, cookiesPerSec: 1, owned: 0 },
    { name: "Santtu Grandma", baseCost: 1000, cookiesPerSec: 10, owned: 0 },
    { name: "Santtu Factory", baseCost: 10000, cookiesPerSec: 100, owned: 0 },
    { name: "Santtu Bank", baseCost: 1000000, cookiesPerSec: 1000, owned: 0 },
    { name: "Santtu Space Station", baseCost: 100000000, cookiesPerSec: 10000, owned: 0 },
    { name: "Santtu Rocket", baseCost: 500000000, cookiesPerSec: 50000, owned: 0 },
    { name: "Santtu Robot", baseCost: 2000000000, cookiesPerSec: 200000, owned: 0 },
    { name: "Santtu AI", baseCost: 10000000000, cookiesPerSec: 1000000, owned: 0 },
    { name: "Santtu Galaxy", baseCost: 50000000000, cookiesPerSec: 5000000, owned: 0 },
    { name: "Santtu Universe", baseCost: 1000000000000, cookiesPerSec: 50000000, owned: 0 },
    { name: "Santtu Multiverse", baseCost: 10000000000000, cookiesPerSec: 500000000, owned: 0 },
    { name: "Santtu Infinity", baseCost: 10000000000000000, cookiesPerSec: 1000000000, owned: 0 }
];

// ---------- LOGIN ----------
const loginScreen = document.getElementById('login-screen');
const gameContainer = document.getElementById('game-container');
const loginBtn = document.getElementById('login-btn');
const loginMsg = document.getElementById('login-msg');

loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) return loginMsg.textContent = "Enter username & password";

    if (!users[username]) {
        // create new local account
        users[username] = { password, cookies: 0, upgrades: {} };
        localStorage.setItem('users', JSON.stringify(users));
        loginMsg.textContent = "Account created!";
    }

    if (users[username].password !== password) {
        return loginMsg.textContent = "Wrong password!";
    }

    currentUser = username;
    loadUser();
});

// ---------- LOAD USER ----------
function loadUser() {
    loginScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    updateCookies();
    updateLeaderboardGlobal();
    renderShop();
}

// ---------- COOKIE CLICK ----------
const cookieBtn = document.getElementById('cookie-btn');
cookieBtn.addEventListener('click', () => {
    users[currentUser].cookies += 1;
    saveUser();
    saveUserGlobal();
    updateCookies();
    updateLeaderboardGlobal();
});

function updateCookies() {
    document.getElementById('cookie-count').textContent = users[currentUser].cookies.toLocaleString();
}

// ---------- SHOP ----------
const shopDiv = document.getElementById('shop-items');

function renderShop() {
    shopDiv.innerHTML = '';
    shopItems.forEach((item, index) => {
        const cost = Math.floor(item.baseCost * Math.pow(1.15, item.owned));
        const canBuy = users[currentUser].cookies >= cost;
        const div = document.createElement('div');
        div.classList.add('shop-item');
        div.innerHTML = `
            <h3>${item.name}</h3>
            <p>Cost: ${cost.toLocaleString()}</p>
            <p>Owned: ${item.owned}</p>
            <button ${canBuy ? '' : 'disabled'} onclick="buyItem(${index})">Buy</button>
        `;
        shopDiv.appendChild(div);
    });
}

window.buyItem = function(index) {
    const item = shopItems[index];
    const cost = Math.floor(item.baseCost * Math.pow(1.15, item.owned));
    if (users[currentUser].cookies >= cost) {
        users[currentUser].cookies -= cost;
        item.owned++;
        saveUser();
        saveUserGlobal();
        updateCookies();
        renderShop();
        updateLeaderboardGlobal();
    }
};

// ---------- SAVE USER (LOCAL) ----------
function saveUser() {
    localStorage.setItem('users', JSON.stringify(users));
}

// ---------- SAVE USER (GLOBAL) ----------
function saveUserGlobal() {
    const userData = {
        cookies: users[currentUser].cookies,
        upgrades: shopItems.reduce((acc, item) => { acc[item.name] = item.owned; return acc }, {}),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection('users').doc(currentUser).set(userData)
      .then(() => console.log("Saved globally"))
      .catch(err => console.error(err));
}

// ---------- GLOBAL LEADERBOARD ----------
function updateLeaderboardGlobal() {
    db.collection('users').orderBy('cookies', 'desc').limit(20).get()
      .then(snapshot => {
          const list = document.getElementById('leaderboard-list');
          list.innerHTML = '';
          let index = 0;
          snapshot.forEach(doc => {
              index++;
              const data = doc.data();
              const rank = ranks.slice().reverse().find(r => data.cookies >= r.minCookies);
              const div = document.createElement('div');
              div.style.display = "flex";
              div.style.alignItems = "center";
              div.style.justifyContent = "center";
              div.style.margin = "5px";
              div.innerHTML = `
                  <span style="margin-right:10px">${index}.</span>
                  <img src="images/${rank.img}" width="50" style="margin-right:10px">
                  <strong>${doc.id}</strong> - ${data.cookies.toLocaleString()} cookies
                  <span style="margin-left:10px">(${rank.name})</span>
              `;
              list.appendChild(div);
          });
      });
}

// ---------- SETTINGS ----------
document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm("Reset all progress?")) {
        delete users[currentUser];
        localStorage.setItem('users', JSON.stringify(users));
        db.collection('users').doc(currentUser).delete()
          .then(() => location.reload())
          .catch(err => console.error(err));
    }
});

// ---------- TABS ----------
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabContents.forEach(tc => tc.classList.add('hidden'));
        document.getElementById('tab-' + tab.dataset.tab).classList.remove('hidden');
        if(tab.dataset.tab === "leaderboard") updateLeaderboardGlobal();
    });
});

// ---------- AUTO COOKIE PER SEC ----------
setInterval(() => {
    const cps = shopItems.reduce((sum, item) => sum + (item.cookiesPerSec * item.owned), 0);
    users[currentUser].cookies += cps;
    saveUser();
    saveUserGlobal();
    updateCookies();
    updateLeaderboardGlobal();
}, 1000);
