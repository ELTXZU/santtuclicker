// ---------- DATA ----------
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || {};
let leaderboard = [];

// ---------- SHOP ITEMS (expanded) ----------
const shopItems = [
    { name: "Santtu Cursor", baseCost: 100, cookiesPerSec: 1, owned: 0 },
    { name: "Santtu Grandma", baseCost: 1000, cookiesPerSec: 10, owned: 0 },
    { name: "Santtu Factory", baseCost: 100000, cookiesPerSec: 100, owned: 0 },
    { name: "Santtu Bank", baseCost: 1000000, cookiesPerSec: 1000, owned: 0 },
    { name: "Santtu Space Station", baseCost: 10000000, cookiesPerSec: 10000, owned: 0 },
    { name: "Santtu Rocket", baseCost: 50000000, cookiesPerSec: 50000, owned: 0 },
    { name: "Santtu Robot", baseCost: 200000000, cookiesPerSec: 200000, owned: 0 },
    { name: "Santtu AI", baseCost: 1000000000, cookiesPerSec: 1000000, owned: 0 },
    { name: "Santtu Galaxy", baseCost: 50000000000, cookiesPerSec: 5000000, owned: 0 },
    { name: "Santtu Universe", baseCost: 100000000000, cookiesPerSec: 50000000, owned: 0 },
    { name: "Santtu Multiverse", baseCost: 1000000000000, cookiesPerSec: 500000000, owned: 0 },
    { name: "Santtu Infinity", baseCost: 100000000000000, cookiesPerSec: 1000000000, owned: 0 }
];

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
        // create new account
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
    updateLeaderboard();
    renderShop();
}

// ---------- COOKIE CLICK ----------
const cookieBtn = document.getElementById('cookie-btn');
cookieBtn.addEventListener('click', () => {
    users[currentUser].cookies += 1;
    saveUser();
    updateCookies();
    updateLeaderboard();
});

function updateCookies() {
    document.getElementById('cookie-count').textContent = users[currentUser].cookies;
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
            <p>Cost: ${cost}</p>
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
        updateCookies();
        renderShop();
        updateLeaderboard();
    }
};

// ---------- LEADERBOARD (improved) ----------
function updateLeaderboard() {
    leaderboard = [];
    for (let user in users) {
        const cookies = users[user].cookies;
        const rank = ranks.slice().reverse().find(r => cookies >= r.minCookies);
        leaderboard.push({ username: user, cookies, rank: rank.img, rankName: rank.name });
    }

    leaderboard.sort((a,b) => b.cookies - a.cookies);

    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    leaderboard.forEach((u, index) => {
        const div = document.createElement('div');
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        div.style.margin = "5px";
        div.innerHTML = `
            <span style="margin-right:10px">${index + 1}.</span>
            <img src="${u.rank}" width="50" style="margin-right:10px">
            <strong>${u.username}</strong> - ${u.cookies.toLocaleString()} cookies
            <span style="margin-left:10px">(${u.rankName})</span>
        `;
        list.appendChild(div);
    });
}

// ---------- SETTINGS ----------
document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm("Reset all progress?")) {
        delete users[currentUser];
        localStorage.setItem('users', JSON.stringify(users));
        location.reload();
    }
});

// ---------- TABS ----------
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabContents.forEach(tc => tc.classList.add('hidden'));
        document.getElementById('tab-' + tab.dataset.tab).classList.remove('hidden');
    });
});

// ---------- SAVE USER ----------
function saveUser() {
    localStorage.setItem('users', JSON.stringify(users));
}

// ---------- AUTO COOKIE PER SEC ----------
setInterval(() => {
    const cps = shopItems.reduce((sum, item) => sum + (item.cookiesPerSec * item.owned), 0);
    users[currentUser].cookies += cps;
    saveUser();
    updateCookies();
    updateLeaderboard();
}, 1000);
