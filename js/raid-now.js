import {
  loadRecords,
  getKoreaToday,
  toKey,
  filterByPageAndDate,
  splitShadowGroups,
  buildRaidCard,
  bindCpButtons
} from './common.js';

const FILTERS = ['전체', '1성', '3성', '5성', '6성', '7성', '메가', '다이맥스', '거다이맥스', '그림자'];

let currentFilter = '전체';
let allItems = [];

function renderFilters() {
  const wrap = document.getElementById('filterRow');
  if (!wrap) return;

  wrap.innerHTML = FILTERS.map(label => `
    <button class="filter-btn ${label === currentFilter ? 'active' : ''}" data-filter="${label}">
      ${label}
    </button>
  `).join('');

  wrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      renderFilters();
      renderRaidSections();
    });
  });
}

function getFilteredItems() {
  if (currentFilter === '전체') return allItems;
  if (currentFilter === '그림자') return allItems.filter(item => item.isShadow);
  return allItems.filter(item => item.label === currentFilter);
}

function renderGrid(targetId, items, sectionKey) {
  const wrap = document.getElementById(targetId);
  if (!wrap) return;

  const dateKey = toKey(getKoreaToday());

  if (!items.length) {
    wrap.innerHTML = `<div class="empty-box">현재 조건에 맞는 레이드가 없습니다.</div>`;
    return;
  }

  wrap.innerHTML = items.map((item, index) =>
    buildRaidCard(item, {
      sectionKey,
      index,
      dateKey,
      showCpButton: true,
      showDateRange: true
    })
  ).join('');
}

function renderRaidSections() {
  const filtered = getFilteredItems();
  const { normal, shadow } = splitShadowGroups(filtered);

  renderGrid('normalRaidGrid', normal, 'raid-now-normal');
  renderGrid('shadowRaidGrid', shadow, 'raid-now-shadow');
  bindCpButtons(document);
}

async function init() {
  try {
    const today = getKoreaToday();
    const records = await loadRecords();
    allItems = filterByPageAndDate(records, 'raid-now', today);

    renderFilters();
    renderRaidSections();
  } catch (error) {
    console.error(error);
  }
}

init();
