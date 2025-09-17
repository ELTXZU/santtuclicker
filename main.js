window.onload = () => {

    // ---------- DATA ----------
    let currentUser = null;
    let users = JSON.parse(localStorage.getItem('users')) || {};
    let shopItems = [
        { name: "Santtu Cursor", baseCost: 100, cookiesPerSec: 1, owned: 0 },
        { name: "Santtu Grandma", baseCost: 1000, cookiesPerSec: 10, owned: 0 },
        { name: "Santtu Factory", baseCost: 10000, cookiesPerSec: 100, owned: 0 },
        { name: "Santtu Bank", baseCost: 100000, cookiesPerSec: 1000, owned: 0 },
        { name: "Santtu Space Station", baseCost: 1000000, cookiesPerSec: 10000, owned: 0 },
        { name: "Santtu Rocket", baseCost: 5000000, cookiesPerSec: 50000, owned: 0 }
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

    // ---------- DOM ----------
    const loginScreen = document.getElementById('login-screen');
    const gameContainer = document.getElementById('game-container');
    const loginBtn = document.getElementById('login-btn');
    const loginMsg = document.getElementById('login-msg');
    const cookieBtn = document.getElementById('cookie-btn');
    const cookieCountEl = document.getElementById('cookie-count');
    const rankNameEl = document.getElementById('rank-name');
    const rankImgEl = document.getElementById('rank-img');
    const shopDiv = document.getElementById('shop-items');
    const leaderboardDiv = document.getElementById('leaderboard-list');
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const resetBtn = document.getElementById('reset-btn');
    const newPasswordInput = document.getElementById('new-password');
    const changePasswordBtn = document.getElementById('change-password-btn');

    // ---------- LOGIN ----------
    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if(!username || !password) return loginMsg.textContent = "Enter username & password";

        if(!users[username]) {
            users[username] = { password, cookies: 0, upgrades: {} };
            localStorage.setItem('users', JSON.stringify(users));
            loginMsg.textContent = "Account created!";
        }

        if(users[username].password !== password) return loginMsg.textContent = "Wrong password!";

        currentUser = username;
        loginScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        renderShop();
        updateUI();
        updateLeaderboardGlobal();
    });

    // ---------- COOKIE CLICK ----------
    cookieBtn.addEventListener('click', () => {
        if(!currentUser) return;
        users[currentUser].cookies += 1;
        saveUser();
        saveUserGlobal();
        updateUI();
    });

    // ---------- SHOP ----------
    function renderShop() {
        shopDiv.innerHTML = '';
        shopItems.forEach((item,index)=>{
            const cost = Math.floor(item.baseCost * Math.pow(1.15,item.owned));
            const btn = document.createElement('button');
            btn.textContent = `Buy (${cost.toLocaleString()})`;
            btn.disabled = !currentUser || users[currentUser].cookies < cost;
            btn.onclick = ()=>buyItem(index);
            const div = document.createElement('div');
            div.textContent = `${item.name} - Owned: ${item.owned}`;
            div.appendChild(document.createElement('br'));
            div.appendChild(btn);
            shopDiv.appendChild(div);
        });
    }

    function buyItem(index){
        const item = shopItems[index];
        const cost = Math.floor(item.baseCost * Math.pow(1.15,item.owned));
        if(!currentUser || users[currentUser].cookies<cost) return;
        users[currentUser].cookies -= cost;
        item.owned++;
        saveUser();
        saveUserGlobal();
        renderShop();
        updateUI();
        updateLeaderboardGlobal();
    }

    // ---------- SAVE ----------
    function saveUser(){
        localStorage.setItem('users',JSON.stringify(users));
    }

    function saveUserGlobal(){
        if(!currentUser) return;
        const userData = {
            cookies: users[currentUser].cookies,
            upgrades: shopItems.reduce((acc,i)=>{acc[i.name]=i.owned;return acc},{})
        };
        db.collection('users').doc(currentUser).set(userData).catch(err=>console.error(err));
    }

    // ---------- UPDATE UI ----------
    function updateUI(){
        if(!currentUser) return;
        cookieCountEl.textContent = users[currentUser].cookies.toLocaleString();
        const rank = ranks.slice().reverse().find(r=>users[currentUser].cookies>=r.minCookies);
        rankNameEl.textContent = rank.name;
        rankImgEl.src = rank.img;
        renderShop();
    }

    // ---------- LEADERBOARD ----------
    function updateLeaderboardGlobal(){
        db.collection('users').orderBy('cookies','desc').limit(20).get()
          .then(snapshot=>{
              leaderboardDiv.innerHTML='';
              let index=0;
              snapshot.forEach(doc=>{
                  index++;
                  const data = doc.data();
                  const rank = ranks.slice().reverse().find(r=>data.cookies>=r.minCookies);
                  const div = document.createElement('div');
                  div.textContent = `${index}. ${doc.id} - ${data.cookies.toLocaleString()} (${rank.name})`;
                  leaderboardDiv.appendChild(div);
              });
          });
    }

    // ---------- TABS ----------
    tabs.forEach(tab=>{
        tab.addEventListener('click',()=>{
            tabContents.forEach(tc=>tc.classList.add('hidden'));
            document.getElementById('tab-'+tab.dataset.tab).classList.remove('hidden');
            if(tab.dataset.tab==="leaderboard") updateLeaderboardGlobal();
        });
    });

    // ---------- PASSWORD CHANGE ----------
    changePasswordBtn.addEventListener('click',()=>{
        const newPass = newPasswordInput.value.trim();
        if(!currentUser || !newPass) return alert("Enter new password");
        users[currentUser].password = newPass;
        saveUser();
        alert("Password changed!");
        newPasswordInput.value='';
    });

    // ---------- DELETE ACCOUNT ----------
    resetBtn.addEventListener('click',()=>{
        if(!currentUser) return;
        if(!confirm("Delete your account?")) return;
        delete users[currentUser];
        localStorage.setItem('users',JSON.stringify(users));
        db.collection('users').doc(currentUser).delete()
          .then(()=> location.reload())
          .catch(err=>console.error(err));
    });

    // ---------- AUTO COOKIE PER SEC ----------
    setInterval(()=>{
        if(!currentUser) return;
        const cps = shopItems.reduce((sum,i)=>sum + i.cookiesPerSec*i.owned,0);
        if(cps>0) users[currentUser].cookies += cps;
        updateUI();
        saveUser();
        saveUserGlobal();
    },1000);

    // ---------- UI REFRESH LOOP ----------
    setInterval(()=>{
        updateUI();
    },100); // updates cookie count & shop every 100ms

};
