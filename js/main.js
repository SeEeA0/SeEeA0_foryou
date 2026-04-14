import {
  loadRecords,
  getKoreaToday,
  toKey,
  escapeHtml,
  isAllowed,
  inRange
} from './common.js';

const WEEKDAY_EVENTS = {
  0: {
    day: '일요일',
    title: '루어 선데이',
    image: '/images/weekday/sunday.png',
    summary: '일요일에는 향로와 여러 종류의 루어모듈 지속 시간이 최대 2배가 됩니다.',
    points: [
      '향로 지속 시간 증가',
      '루어모듈 / 아이스 / 허브 / 마그네틱 / 레이니 루어모듈 지속 시간 최대 2배'
    ],
    note: ''
  },
  1: {
    day: '월요일',
    title: '패스트패스 먼데이 · 맥스 먼데이',
    image: '/images/weekday/monday.png',
    summary: 'GO패스 포인트 보너스와 파워스폿 관련 보너스가 적용되는 날입니다.',
    points: [
      'GO패스와 이벤트 GO패스 태스크 완료 시 GO포인트 2배',
      '파워스폿 갱신 간격 단축 및 월요일에 더 많은 파워스폿 등장',
      '맥스배틀 로테이션에 다른 다이맥스 포켓몬 등장',
      '맥스배틀 이용 가능 시간: 한국시간 06:00 ~ 21:00'
    ],
    note: '파워스폿 수는 맥스 먼데이·맥스배틀 데이가 아닐 때 더 적어질 수 있습니다.'
  },
  2: {
    day: '화요일',
    title: '쇼케이스 투스데이',
    image: '/images/weekday/tuesday.png',
    summary: '화요일에는 다양한 포켓스톱 쇼케이스가 열립니다.',
    points: [
      '최대 20개 카테고리의 포켓스톱 쇼케이스 진행',
      '매주 로그인해 어떤 포켓몬을 자랑할 수 있는지 확인',
      '쇼케이스 진행 시간: 한국시간 10:00 ~ 20:00'
    ],
    note: ''
  },
  3: {
    day: '수요일',
    title: '레이드 아워 수요일',
    image: '/images/weekday/wednesday.png',
    summary: '전설 레이드배틀과 메가 레이드 보스가 돌아가며 바뀌는 핵심 요일입니다.',
    points: [
      '매주 하루 시작 시 전설 / 메가 레이드 보스 로테이션 변경',
      '한국시간 18:00 ~ 19:00 레이드 아워 진행',
      '레이드 아워에는 전설 레이드배틀 보스 포켓몬이 등장'
    ],
    note: ''
  },
  4: {
    day: '목요일',
    title: 'GO배틀리그 썰스데이',
    image: '/images/weekday/thursday.png',
    summary: '배틀리그 보상과 플레이 가능 횟수가 늘어나는 날입니다.',
    points: [
      '배틀 승리 리워드 별의모래 최대 4배 (세트 종료 시 리워드 제외)',
      '하루 최대 플레이 횟수 5세트 → 10세트',
      '총 50세트 플레이 가능'
    ],
    note: ''
  },
  5: {
    day: '금요일',
    title: '우정 프라이데이',
    image: '/images/weekday/friday.png',
    summary: '교환 관련 보너스가 집중되는 날입니다.',
    points: [
      '특별한 교환 최대 2회 가능',
      '모든 교환이 반짝반짝 교환이 될 확률 증가',
      '교환에 필요한 별의모래 최대 10% 감소',
      '트레이너 레벨 31 이상: 교환 시 포켓몬의 사탕XL 2개 확정'
    ],
    note: '위 보너스는 대면 교환에만 적용됩니다.'
  },
  6: {
    day: '토요일',
    title: '정기 요일 이벤트 없음',
    image: '/images/weekday/saturday.png',
    summary: '토요일은 별도 고정 요일 이벤트 안내가 없습니다.',
    points: [
      '진행 중인 이벤트 / 레이드 일정 중심으로 확인해 주세요.'
    ],
    note: '단, 글로벌 Pokémon GO Fest / Pokémon GO 와일드 에리어 / Pokémon GO Tour 주간에는 데일리 디스커버리가 진행되지 않을 수 있습니다.'
  }
};

const BOOST_ICON_MAP = {
  '맑음': '/images/boost/sunny.png',
  '쾌청': '/images/boost/sunny.png',
  '비': '/images/boost/rainy.png',
  '눈': '/images/boost/snow.png',
  '안개': '/images/boost/fog.png',
  '흐림': '/images/boost/cloudy.png',
  '강풍': '/images/boost/windy.png',
  '바람': '/images/boost/windy.png',
  'sunny': '/images/boost/sunny.png',
  'rainy': '/images/boost/rainy.png',
  'snow': '/images/boost/snow.png',
  'fog': '/images/boost/fog.png',
  'cloudy': '/images/boost/cloudy.png',
  'windy': '/images/boost/windy.png'
};

function formatKoreanDate(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
}

function chipClass(item) {
  if (item.isShadow) return 'pink';
  if (item.label === '5성' || item.label === '6성' || item.label === '7성') return 'blue';
  if (item.label === '3성') return 'yellow';
  if (item.label === '1성') return 'green';
  if (item.label === '메가') return 'purple';
  if (item.label === '다이맥스' || item.label === '거다이맥스') return 'gray';
  return 'gray';
}

function getHotClass(item) {
  if (item.isShadow) return 'hot-fallback';
  if (item.label === '5성' || item.label === '6성' || item.label === '7성') return 'hot-legend';
  if (item.label === '메가') return 'hot-mega';
  return 'hot-fallback';
}

function getHotOrder(item) {
  if (item.isShadow) {
    if (item.label === '1성') return 110;
    if (item.label === '3성') return 120;
    if (item.label === '5성') return 130;
    if (item.label === '6성') return 140;
    if (item.label === '7성') return 150;
    if (item.label === '메가') return 160;
    if (item.label === '다이맥스') return 170;
    if (item.label === '거다이맥스') return 180;
    return 199;
  }

  if (item.label === '1성') return 10;
  if (item.label === '3성') return 20;
  if (item.label === '5성') return 30;
  if (item.label === '6성') return 40;
  if (item.label === '7성') return 50;
  if (item.label === '메가') return 60;
  if (item.label === '다이맥스') return 70;
  if (item.label === '거다이맥스') return 80;
  return 99;
}

function sortHotItems(items) {
  return [...items].sort((a, b) => {
    const orderDiff = getHotOrder(a) - getHotOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
  });
}

function getTodayItems(records, today) {
  return records.filter(item =>
    (isAllowed(item, 'index') || isAllowed(item, 'raid-now')) &&
    item.startDate &&
    item.endDate &&
    inRange(today, item.startDate, item.endDate)
  );
}

function getHotRaidItems(records, today) {
  const currentItems = getTodayItems(records, today);

  const primary = currentItems.filter(item =>
    !item.isShadow &&
    ['5성', '6성', '7성', '메가', '다이맥스', '거다이맥스'].includes(item.label)
  );

  const fallback = currentItems.filter(item =>
    !item.isShadow &&
    ['3성', '1성'].includes(item.label)
  );

  const shadowFallback = currentItems.filter(item => item.isShadow);

  if (primary.length) return sortHotItems(primary).slice(0, 3);
  if (fallback.length) return sortHotItems(fallback).slice(0, 3);
  return sortHotItems(shadowFallback).slice(0, 3);
}

function resolveBoostIcon(text, explicitIcon = '') {
  if (explicitIcon && String(explicitIcon).trim()) return explicitIcon;

  const raw = String(text || '').trim();
  const lower = raw.toLowerCase();

  return BOOST_ICON_MAP[raw] || BOOST_ICON_MAP[lower] || '';
}

function createBoostBadge(text, explicitIcon = '') {
  if (!text) return '';

  const icon = resolveBoostIcon(text, explicitIcon);

  return `
    <div class="boost-badge">
      ${icon ? `<img src="${escapeHtml(icon)}" alt="${escapeHtml(text)}">` : ''}
      <span>${escapeHtml(text)}</span>
    </div>
  `;
}

function renderTop(today) {
  const sub = document.getElementById('topbarSub');
  const monthBadge = document.getElementById('monthBadge');

  if (sub) sub.textContent = formatKoreanDate(today);
  if (monthBadge) monthBadge.textContent = `${today.getMonth() + 1}월`;
}

function renderWeekdayTabs(selectedDay) {
  const wrap = document.getElementById('weekdayTabs');
  if (!wrap) return;

  const names = ['일', '월', '화', '수', '목', '금', '토'];

  wrap.innerHTML = names.map((name, idx) => `
    <button class="weekday-tab ${idx === selectedDay ? 'active' : ''}" data-day="${idx}">
      ${name}요일
    </button>
  `).join('');

  wrap.querySelectorAll('.weekday-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      renderWeekdayCard(Number(btn.dataset.day));
    });
  });
}

function renderWeekdayCard(dayIndex) {
  const data = WEEKDAY_EVENTS[dayIndex] || WEEKDAY_EVENTS[6];

  const dayBadge = document.getElementById('weekdayDayBadge');
  const title = document.getElementById('weekdayTitle');
  const summary = document.getElementById('weekdaySummary');
  const sub = document.getElementById('weekdaySub');
  const image = document.getElementById('weekdayImage');
  const points = document.getElementById('weekdayPoints');
  const note = document.getElementById('weekdayNote');

  if (dayBadge) dayBadge.textContent = data.day;
  if (title) title.textContent = data.title;
  if (summary) summary.textContent = data.summary;
  if (sub) sub.textContent = `${data.day} 기준 반복 보너스 안내`;

  if (image) {
    image.src = data.image || '';
    image.alt = data.title || '요일 이벤트 이미지';
  }

  if (points) {
    points.innerHTML = (data.points || []).map(text => `
      <div class="weekday-point">${escapeHtml(text)}</div>
    `).join('');
  }

  if (note) {
    if (data.note) {
      note.style.display = 'block';
      note.textContent = data.note;
    } else {
      note.style.display = 'none';
      note.textContent = '';
    }
  }

  renderWeekdayTabs(dayIndex);
}

function renderNowSection(records, today) {
  const wrap = document.getElementById('nowGrid');
  if (!wrap) return;

  const items = getHotRaidItems(records, today);

  if (!items.length) {
    wrap.innerHTML = `<div class="empty-box">현재 진행 중인 HOT 레이드가 없습니다.</div>`;
    return;
  }

  wrap.innerHTML = items.map(item => {
    const boostBadges = [
      createBoostBadge(item.boost, item.boostIcon),
      createBoostBadge(item.boost2, item.boostIcon2)
    ].join('');

    return `
      <a href="./raid-now.html" class="now-card ${getHotClass(item)}">
        <div class="now-head">
          <span class="now-chip chip ${chipClass(item)}">
            ${escapeHtml(item.isShadow ? `그림자 ${item.label}` : item.label || '-')}
          </span>
          <span class="hot-badge">HOT</span>
        </div>

        <div class="now-main">
          <div class="now-thumb">
            ${
              item.image
                ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">`
                : `<span style="font-size:24px;">🖼️</span>`
            }
          </div>
          <div>
            <div class="now-name">${escapeHtml(item.name || '-')}</div>
            <div class="now-meta">
              일반 CP ${escapeHtml(item.cpMin || '-')} ~ ${escapeHtml(item.cpMax || '-')}<br>
              부스트 CP ${escapeHtml(item.boostedCpMin || '-')} ~ ${escapeHtml(item.boostedCpMax || '-')}
            </div>
          </div>
        </div>

        ${boostBadges ? `<div class="boost-row">${boostBadges}</div>` : ''}
      </a>
    `;
  }).join('');
}

async function init() {
  try {
    const records = await loadRecords();
    const today = getKoreaToday();

    renderTop(today);
    renderWeekdayCard(today.getDay());
    renderNowSection(records, today);
  } catch (error) {
    console.error(error);
  }
}

init();
