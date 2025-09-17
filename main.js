let santtuPoints = 0;
let clickPower = 1;
let autoClickPower = 0;
let multiClick = 0;
let lastClicks = [];
let comboMultiplier = 1;
let lanttus = [];
let nextLanttuId = 1;

let clickCost = 50;
let autoCost = 100;

const santtu = document.getElementById('santtu');
const pointsEl = document.getElementById('santtu_points');
const clickPowerEl = document.getElementById('click_power');
const autoPowerEl = document.getElementById('auto_click_power');
const clickCostEl = document.getElementById('click_cost');
const autoCostEl = document.getElementById('auto_cost');
const comboText = document.getElementById('comboText');
const signature = document.getElementById('signature');
const lanttuContainer = document.getElementById('lanttuContainer');

// click santtu
santtu.addEventListener('click', () => {
    lastClicks.push(Date.now());
    if(lastClicks.length > 5) lastClicks.shift();

    const now = Date.now();
    if(lastClicks.length === 5 && now - lastClicks[0] <= 2000){
        comboMultiplier = 2;
        comboText.textContent = 'Combo: x2 🎉';
        setTimeout(() => { comboMultiplier = 1; comboText.textContent='Combo: x1'; }, 2000);
    }

    let gain = clickPower + multiClick * comboMultiplier;
    santtuPoints += gain;
    pointsEl.textContent = santtuPoints;

    const r = Math.floor(Math.random()*206)+50;
    const g = Math.floor(Math.random()*206)+50;
    const b = Math.floor(Math.random()*206)+50;
    santtu.style.filter = `drop-shadow(0 0 15px rgb(${r},${g},${b})) hue-rotate(${Math.random()*360}deg)`;
});

// upgrade click
document.getElementById('upgradeClick').addEventListener('click', () => {
    if(santtuPoints >= clickCost){
        santtuPoints -= clickCost;
        clickPower += 1;
        clickCost = Math.floor(clickCost * 1.5);
        pointsEl.textContent = santtuPoints;
        clickPowerEl.textContent = clickPower;
        clickCostEl.textContent = clickCost;
    }
});

// upgrade auto
document.getElementById('upgradeAuto').addEventListener('click', () => {
    if(santtuPoints >= autoCost){
        santtuPoints -= autoCost;
        autoClickPower += 1;
        autoCost = Math.floor(autoCost * 1.5);
        pointsEl.textContent = santtuPoints;
        autoPowerEl.textContent = autoClickPower;
        autoCostEl.textContent = autoCost;
    }
});

// multi click
document.getElementById('upgradeMulti').addEventListener('click', () => {
    if(santtuPoints >= 200){
        santtuPoints -= 200;
        multiClick += 1;
        pointsEl.textContent = santtuPoints;
    }
});

// add lanttu
document.getElementById('addLanttu').addEventListener('click', () => {
    if(santtuPoints >= 50){
        santtuPoints -= 50;
        lanttus.push({id: nextLanttuId++, power: 1});
        pointsEl.textContent = santtuPoints;
        renderLanttus();
    }
});

// upgrade lanttu
function upgradeLanttu(id){
    for(let l of lanttus){
        if(l.id === id && santtuPoints >= 50){
            santtuPoints -= 50;
            l.power += 1;
            pointsEl.textContent = santtuPoints;
            renderLanttus();
            break;
        }
    }
}

function renderLanttus(){
    lanttuContainer.innerHTML = '';
    lanttus.forEach(l => {
        const img = document.createElement('img');
        img.src = 'santtu.png';
        img.classList.add('small-lanttu');
        img.title = `Power: ${l.power}`;
        img.addEventListener('click', ()=> upgradeLanttu(l.id));
        lanttuContainer.appendChild(img);
    });
}

// auto click + lanttus
setInterval(() => {
    santtuPoints += autoClickPower;
    for(let l of lanttus){
        santtuPoints += l.power;
    }
    pointsEl.textContent = santtuPoints;
}, 1000);

// rainbow signature
let hue = 0;
setInterval(() => {
    signature.style.color = `hsl(${hue},100%,50%)`;
    hue = (hue + 2) % 360;
}, 100);
