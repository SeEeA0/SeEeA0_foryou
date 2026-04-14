import {
  loadRecords,
  getKoreaToday,
  toKey,
  filterByPageAndDate,
  splitShadowGroups,
  buildRaidCard,
  bindCpButtons
} from './common.js';

function renderPreview(targetId, items, sectionKey, limit = 4) {
  const wrap = document.getElementById(targetId);
  if (!wrap) return;

  const todayKey = toKey(getKoreaToday());
  const sliced = items.slice(0, limit);

  if (!sliced.length) {
    wrap.innerHTML = `<div class="empty-box">표시할 레이드가 없습니다.</div>`;
    return;
  }

  wrap.innerHTML = sliced.map((item, index) =>
    buildRaidCard(item, {
      sectionKey,
      index,
      dateKey: todayKey,
      showCpButton: false,
      showDateRange: true,
      shadowDescription: '현재 진행 중인 그림자 레이드입니다.',
      normalDescription: '현재 진행 중인 레이드 정보입니다.'
    })
  ).join('');
}

async function init() {
  try {
    const today = getKoreaToday();
    const records = await loadRecords();
    const items = filterByPageAndDate(records, 'index', today);
    const { normal, shadow } = splitShadowGroups(items);

    renderPreview('mainNormalRaidGrid', normal, 'main-normal', 4);
    renderPreview('mainShadowRaidGrid', shadow, 'main-shadow', 4);
    bindCpButtons(document);
  } catch (error) {
    console.error(error);
  }
}

init();
