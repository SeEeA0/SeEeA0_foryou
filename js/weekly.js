import {
  loadRecords,
  getKoreaToday,
  toKey,
  pad,
  inRange,
  splitShadowGroups,
  buildRaidCard,
  bindCpButtons
} from './common.js';

let records = [];
let weekDates = [];
let selectedIndex = 0;

function getWeekStart(today) {
  const d = new Date(today);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(today) {
  const start = getWeekStart(today);
  const dates = [];

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }

  return dates;
}

function getDayItems(date) {
  return records
    .filter(item => Array.isArray(item.showPages) && (item.showPages.includes('weekly') || item.showPages.includes('index') || item.showPages.includes('raid-now')))
    .filter(item => item.startDate && item.endDate)
    .filter(item => inRange(date, item.startDate, item.endDate));
}

function renderDateCurrent() {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const selectedDate = weekDates[selectedIndex];
  const wrap = document.getElementById('dateCurrent');
  if (!wrap || !selectedDate) return;

  wrap.innerHTML = `
    <div class="date-current-inner">
      <div class="date-current-weekday">${days[selectedDate.getDay()]}</div>
      <div class="date-current-day">${selectedDate.getDate()}</div>
      <div class="date-current-full">${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일</div>
    </div>
  `;
}

function renderWeekDots(today) {
  const wrap = document.getElementById('weekDots');
  if (!wrap) return;

  wrap.innerHTML = weekDates.map((date, index) => {
    const isToday = toKey(date) === toKey(today);
    const isActive = index === selectedIndex;

    return `
      <button
        type="button"
        class="week-dot ${isToday ? 'today' : ''} ${isActive ? 'active' : ''}"
        data-index="${index}"
        aria-label="${date.getMonth() + 1}월 ${date.getDate()}일 선택"
      ></button>
    `;
  }).join('');

  wrap.querySelectorAll('[data-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedIndex = Number(btn.dataset.index);
      updateSelectedDay(today);
    });
  });
}

function renderNavButtons() {
  const prevBtn = document.getElementById('prevDateBtn');
  const nextBtn = document.getElementById('nextDateBtn');
  if (!prevBtn || !nextBtn) return;

  prevBtn.disabled = selectedIndex <= 0;
  nextBtn.disabled = selectedIndex >= weekDates.length - 1;
}

function renderGroupSection(title, subtitle, items, sectionKey, dateKey) {
  if (!items.length) {
    return `
      <section class="group-section">
        <div class="group-head">
          <div class="group-title">${title}</div>
          <div class="group-sub">${subtitle}</div>
        </div>
        <div class="empty-box">해당 레이드가 없습니다.</div>
      </section>
    `;
  }

  return `
    <section class="group-section">
      <div class="group-head">
        <div class="group-title">${title}</div>
        <div class="group-sub">${subtitle}</div>
      </div>
      <div class="raid-grid">
        ${items.map((item, index) =>
          buildRaidCard(item, {
            sectionKey: `${sectionKey}-${index}`,
            index,
            dateKey,
            showCpButton: true,
            showDateRange: true,
            shadowDescription: '이 날짜에 진행 중인 그림자 레이드입니다.',
            normalDescription: '이 날짜에 진행 중인 레이드입니다.'
          })
        ).join('')}
      </div>
    </section>
  `;
}

function renderSelectedDay() {
  const wrap = document.getElementById('weekList');
  const selectedDate = weekDates[selectedIndex];
  if (!wrap || !selectedDate) return;

  const dayItems = getDayItems(selectedDate);
  const { normal, shadow } = splitShadowGroups(dayItems);
  const dateKey = toKey(selectedDate);
  const daysKor = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  wrap.innerHTML = `
    <div class="selected-day-wrap">
      <section class="day-card">
        <div class="day-head">
          <div class="day-left">
            <div class="day-badge">
              <div class="day-num">${selectedDate.getDate()}</div>
              <div class="day-week">${daysKor[selectedDate.getDay()].replace('요일', '')}</div>
            </div>
            <div>
              <div class="day-title">${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 ${daysKor[selectedDate.getDay()]}</div>
            </div>
          </div>
          <div class="day-chip">${dateKey}</div>
        </div>

        ${renderGroupSection('일반 레이드', '1성 · 3성 · 5성 · 메가 · 다이맥스 · 거다이맥스', normal, 'weekly-normal', dateKey)}
        ${renderGroupSection('그림자 레이드', '그림자 1성 · 그림자 3성 · 그림자 5성', shadow, 'weekly-shadow', dateKey)}
      </section>
    </div>
  `;

  bindCpButtons(document);
}

function updateSelectedDay(today) {
  renderDateCurrent();
  renderWeekDots(today);
  renderNavButtons();
  renderSelectedDay();
}

function bindNavButtons(today) {
  const prevBtn = document.getElementById('prevDateBtn');
  const nextBtn = document.getElementById('nextDateBtn');
  if (!prevBtn || !nextBtn) return;

  prevBtn.addEventListener('click', () => {
    if (selectedIndex <= 0) return;
    selectedIndex -= 1;
    updateSelectedDay(today);
  });

  nextBtn.addEventListener('click', () => {
    if (selectedIndex >= weekDates.length - 1) return;
    selectedIndex += 1;
    updateSelectedDay(today);
  });
}

async function init() {
  try {
    const today = getKoreaToday();
    weekDates = getWeekDates(today);
    records = await loadRecords();

    const todayIndex = weekDates.findIndex(date => toKey(date) === toKey(today));
    selectedIndex = todayIndex >= 0 ? todayIndex : 0;

    bindNavButtons(today);
    updateSelectedDay(today);
  } catch (error) {
    console.error(error);
  }
}

init();
