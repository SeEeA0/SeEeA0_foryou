import raidData from "../data/raids.json" assert { type: "json" };

const weekListEl = document.getElementById("weekList");
const weekDotsEl = document.getElementById("weekDots");
const dateCurrentEl = document.getElementById("dateCurrent");
const prevBtn = document.getElementById("prevDateBtn");
const nextBtn = document.getElementById("nextDateBtn");

const today = new Date();
let currentIndex = 0;
let weekDates = [];

/* =========================
   날짜 생성
========================= */
function getWeekDates() {
  const start = new Date(today);
  start.setDate(today.getDate() - 3);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/* =========================
   날짜 포맷
========================= */
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatDisplay(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getWeekday(date) {
  return ["일","월","화","수","목","금","토"][date.getDay()];
}

/* =========================
   보스 아이콘
========================= */
function renderBossIcons(label) {
  let count = 1;

  if (label === "3성") count = 3;
  if (label === "5성") count = 5;
  if (label === "메가") count = 1;

  return `
    <div class="boss-icons">
      ${Array.from({ length: count }).map(() => `
        <img src="./images/boss-icons/boss.png" class="boss-icon">
      `).join("")}
    </div>
  `;
}

/* =========================
   알 아이콘
========================= */
function getEggIcon(label, isShadow) {
  if (isShadow) {
    return `./images/eggs/egg-shadow-${label.replace("성","")}.png`;
  }

  if (label === "메가") return "./images/eggs/egg-mega.png";

  return `./images/eggs/egg-${label.replace("성","")}.png`;
}

/* =========================
   카드 생성
========================= */
function createCard(raid) {
  return `
    <div class="raid-card ${raid.isShadow ? "shadow-theme" : ""}">
      <div class="raid-main">
        <div class="raid-thumb">
          ${raid.isShadow ? `<img src="./images/eggs/shadow-flame.png" class="shadow-flame">` : ""}
          <img src="${raid.image}" class="pokemon-img">
        </div>

        <div>
          <div class="raid-name">${raid.name}</div>
          <div class="raid-desc">이 날짜에 진행 중인 레이드입니다.</div>
        </div>
      </div>
    </div>
  `;
}

/* =========================
   섹션 생성
========================= */
function createSection(title, raids, isShadow = false) {
  if (!raids.length) return "";

  const tierClass =
    title === "1성" ? "tier-1" :
    title === "3성" ? "tier-3" :
    title === "5성" ? "tier-5" :
    title === "메가" ? "tier-mega" :
    "tier-shadow";

  const eggIcon = getEggIcon(title, isShadow);

  return `
    <section class="tier-section ${tierClass}">
      <div class="tier-header">
        <div class="tier-left">
          <div class="tier-egg-wrap">
            ${isShadow ? `<img src="./images/eggs/shadow-flame.png" class="tier-shadow-flame">` : ""}
            <img src="${eggIcon}" class="tier-egg">
          </div>
          <div class="tier-title">${isShadow ? "그림자 레이드" : `${title} 레이드`}</div>
        </div>

        <div class="tier-right">
          ${renderBossIcons(title)}
        </div>
      </div>

      <div class="tier-body">
        <div class="raid-grid">
          ${raids.map(createCard).join("")}
        </div>
      </div>
    </section>
  `;
}

/* =========================
   렌더링
========================= */
function renderDay(date) {
  const todayStr = formatDate(date);

  const raids = raidData.records.filter(r =>
    todayStr >= r.startDate && todayStr <= r.endDate
  );

  const normal = raids.filter(r => !r.isShadow);
  const shadow = raids.filter(r => r.isShadow);

  const tier1 = normal.filter(r => r.label === "1성");
  const tier3 = normal.filter(r => r.label === "3성");
  const tier5 = normal.filter(r => r.label === "5성");
  const mega = normal.filter(r => r.label === "메가");

  weekListEl.innerHTML = `
    <div class="selected-day-wrap">
      <div class="day-card">
        <div class="day-head">
          <div class="day-left">
            <div class="day-badge">
              <div class="day-num">${date.getDate()}</div>
              <div class="day-week">${getWeekday(date)}</div>
            </div>

            <div class="day-title">
              ${formatDisplay(date)} ${getWeekday(date)}요일
            </div>
          </div>
        </div>

        ${createSection("1성", tier1)}
        ${createSection("3성", tier3)}
        ${createSection("5성", tier5)}
        ${createSection("메가", mega)}
        ${createSection("그림자", shadow, true)}
      </div>
    </div>
  `;
}

/* =========================
   날짜 UI
========================= */
function renderDots() {
  weekDotsEl.innerHTML = weekDates.map((d, i) => `
    <div class="week-dot ${i === currentIndex ? "active" : ""}" data-index="${i}"></div>
  `).join("");

  document.querySelectorAll(".week-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      currentIndex = +dot.dataset.index;
      update();
    });
  });
}

function renderCurrentDate() {
  const d = weekDates[currentIndex];

  dateCurrentEl.innerHTML = `
    <div class="date-current-inner">
      <div class="date-current-weekday">${getWeekday(d)}</div>
      <div class="date-current-day">${d.getDate()}</div>
      <div class="date-current-full">${formatDisplay(d)}</div>
    </div>
  `;
}

/* =========================
   업데이트
========================= */
function update() {
  renderDots();
  renderCurrentDate();
  renderDay(weekDates[currentIndex]);
}

/* =========================
   이벤트
========================= */
prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    update();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < 6) {
    currentIndex++;
    update();
  }
});

/* =========================
   INIT
========================= */
weekDates = getWeekDates();
currentIndex = 3;

update();
