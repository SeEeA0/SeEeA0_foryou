const DATA_URL = './raid-data.json';
const ROCKET_ICON = './images/rocket-r.png';
const DEFAULT_SHADOW_BG = './images/shadow-flame.png';

const BOOST_ICON_MAP = {
  '맑음': './images/boost/sunny.png',
  '쾌청': './images/boost/sunny.png',
  '비': './images/boost/rainy.png',
  '눈': './images/boost/snow.png',
  '안개': './images/boost/fog.png',
  '흐림': './images/boost/cloudy.png',
  '강풍': './images/boost/windy.png',
  '바람': './images/boost/windy.png',
  'windy': './images/boost/windy.png',
  'fog': './images/boost/fog.png',
  'sunny': './images/boost/sunny.png',
  'rainy': './images/boost/rainy.png',
  'snow': './images/boost/snow.png',
  'cloudy': './images/boost/cloudy.png'
};

const TYPE_ICON_NUMBER_MAP = {
  '노말': 1,
  '불꽃': 2,
  '불': 2,
  '물': 3,
  '전기': 4,
  '풀': 5,
  '얼음': 6,
  '격투': 7,
  '벌레': 7,
  '독': 8,
  '땅': 9,
  '비행': 10,
  '페어리': 11,
  '바위': 13,
  '고스트': 14,
  '드래곤': 15,
  '악': 16,
  '강철': 17,
  '에스퍼': 18
};

const LABEL_ORDER = {
  '1성': 10,
  '3성': 20,
  '5성': 30,
  '6성': 40,
  '7성': 50,
  '메가': 60,
  '다이맥스': 70,
  '거다이맥스': 80
};

export {
  DATA_URL,
  ROCKET_ICON,
  DEFAULT_SHADOW_BG,
  BOOST_ICON_MAP,
  TYPE_ICON_NUMBER_MAP,
  LABEL_ORDER
};

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function pad(n) {
  return String(n).padStart(2, '0');
}

export function toDate(str) {
  if (!str) return null;
  const [y, m, d] = String(str).split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getKoreaNow() {
  const now = new Date();
  const koreaString = now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
  return new Date(koreaString);
}

export function getKoreaToday() {
  const today = getKoreaNow();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function inRange(date, startStr, endStr) {
  const start = toDate(startStr);
  const end = toDate(endStr);
  if (!start || !end) return false;
  const t = toDate(toKey(date)).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export async function loadRecords() {
  const res = await fetch(DATA_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`raid-data.json load failed: ${res.status}`);
  }

  const parsed = await res.json();

  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.records)) return parsed.records;
  if (Array.isArray(parsed.items)) return parsed.items;

  return [];
}

export function isAllowed(item, page) {
  return Array.isArray(item.showPages) && item.showPages.includes(page);
}

export function getLabelOrder(label = '') {
  return LABEL_ORDER[label] ?? 999;
}

export function sortRaids(a, b) {
  const aShadow = !!a.isShadow;
  const bShadow = !!b.isShadow;

  if (aShadow !== bShadow) {
    return aShadow ? 1 : -1;
  }

  const labelDiff = getLabelOrder(a.label) - getLabelOrder(b.label);
  if (labelDiff !== 0) return labelDiff;

  return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
}

export function chipClass(item) {
  if (item.isShadow) return 'chip-shadow';
  if (item.label === '1성') return 'chip-green';
  if (item.label === '3성') return 'chip-yellow';
  if (item.label === '5성') return 'chip-blue';
  if (item.label === '6성') return 'chip-blue';
  if (item.label === '7성') return 'chip-blue';
  if (item.label === '메가') return 'chip-purple';
  if (item.label === '다이맥스') return 'chip-gray';
  if (item.label === '거다이맥스') return 'chip-gray';
  return 'chip-gray';
}

export function chipLabel(item) {
  return item.isShadow ? `그림자 ${item.label || ''}`.trim() : (item.label || '-');
}

export function normalizeBoostArray(item) {
  const values = [];

  if (typeof item.boost === 'string' && item.boost.trim()) values.push(item.boost.trim());
  if (typeof item.boost2 === 'string' && item.boost2.trim()) values.push(item.boost2.trim());

  if (Array.isArray(item.boosts)) {
    item.boosts.forEach(v => {
      const text = String(v || '').trim();
      if (text) values.push(text);
    });
  }

  return [...new Set(values)];
}

export function normalizeTypeArray(item) {
  const values = [];

  if (typeof item.type === 'string' && item.type.trim()) values.push(item.type.trim());
  if (typeof item.type2 === 'string' && item.type2.trim()) values.push(item.type2.trim());

  if (Array.isArray(item.types)) {
    item.types.forEach(v => {
      const text = String(v || '').trim();
      if (text) values.push(text);
    });
  }

  return [...new Set(values)];
}

export function resolveBoostIcon(text, explicitIcon = '') {
  if (explicitIcon && String(explicitIcon).trim()) return explicitIcon;
  const raw = String(text || '').trim();
  return BOOST_ICON_MAP[raw] || BOOST_ICON_MAP[raw.toLowerCase()] || '';
}

export function getTypeIconPath(typeText, explicitIcon = '') {
  if (explicitIcon && String(explicitIcon).trim()) return explicitIcon;
  const number = TYPE_ICON_NUMBER_MAP[String(typeText || '').trim()];
  return number ? `./icons/${number}.png` : '';
}

export function filterByPageAndDate(records, page, date) {
  return records
    .filter(item => (isAllowed(item, page) || isAllowed(item, 'index')))
    .filter(item => item.startDate && item.endDate)
    .filter(item => inRange(date, item.startDate, item.endDate))
    .sort(sortRaids);
}

export function renderTypePills(item) {
  const types = normalizeTypeArray(item);
  if (!types.length) return '';

  const icons = [item.typeIcon || '', item.typeIcon2 || ''];

  return `
    <div class="type-row">
      ${types.map((type, idx) => {
        const icon = getTypeIconPath(type, icons[idx] || '');
        return `
          <span class="type-pill">
            ${icon ? `<img src="${escapeHtml(icon)}" class="type-icon" alt="${escapeHtml(type)}">` : ''}
            <span>${escapeHtml(type)}</span>
          </span>
        `;
      }).join('')}
    </div>
  `;
}

export function renderBoostPills(item) {
  const boosts = normalizeBoostArray(item);
  if (!boosts.length) return '';

  return `
    <div class="boost-row">
      ${boosts.map((boost, idx) => {
        const explicitIcon = idx === 0 ? item.boostIcon : item.boostIcon2;
        const icon = resolveBoostIcon(boost, explicitIcon);
        return `
          <span class="boost-pill">
            ${icon ? `<img src="${escapeHtml(icon)}" class="boost-icon" alt="${escapeHtml(boost)}">` : ''}
            <span>${escapeHtml(boost)}</span>
          </span>
        `;
      }).join('')}
    </div>
  `;
}

export function buildRaidCard(item, options = {}) {
  const {
    sectionKey = 'raid',
    index = 0,
    dateKey = '',
    showCpButton = true,
    showDateRange = true,
    shadowDescription = '현재 진행 중인 그림자 레이드입니다.',
    normalDescription = '현재 진행 중인 레이드 정보입니다.'
  } = options;

  const shadowTheme = item.isShadow ? 'shadow-theme' : '';
  const chip = chipClass(item);
  const cpTableId = `cp-table-${sectionKey}-${index}-${dateKey}`;

  return `
    <article class="raid-card ${shadowTheme}">
      ${item.isShadow ? `<img src="${escapeHtml(ROCKET_ICON)}" class="rocket-badge" alt="로켓단">` : ''}
      <div class="raid-content">
        <div class="raid-head">
          <span class="raid-chip ${chip}">${escapeHtml(chipLabel(item))}</span>
          ${
            showDateRange
              ? `
                <div class="raid-period">
                  ${(item.startDate || '').replaceAll('-', '.')}<br>
                  ${(item.endDate || '').replaceAll('-', '.')}
                </div>
              `
              : ''
          }
        </div>

        <div class="raid-main">
          <div class="raid-thumb">
            ${
              item.isShadow
                ? `<img src="${escapeHtml(item.shadowBg || DEFAULT_SHADOW_BG)}" class="shadow-flame" alt="">`
                : ''
            }
            ${
              item.image
                ? `<img src="${escapeHtml(item.image)}" class="pokemon-img" alt="${escapeHtml(item.name || '')}">`
                : `<span style="font-size:28px; position:relative; z-index:2;">🖼️</span>`
            }
          </div>

          <div>
            <div class="raid-name">${escapeHtml(item.name || '-')}</div>
            <div class="raid-desc">
              ${item.isShadow ? shadowDescription : normalDescription}
            </div>
          </div>
        </div>

        <div class="info-stack">
          ${renderTypePills(item)}

          <div class="meta-row">
            ${
              (item.cpMin || item.cpMax)
                ? `<span class="meta-pill">CP ${escapeHtml(item.cpMin || '-')} ~ ${escapeHtml(item.cpMax || '-')}</span>`
                : ''
            }
            ${
              (item.boostedCpMin || item.boostedCpMax)
                ? `<span class="meta-pill">부스트 ${escapeHtml(item.boostedCpMin || '-')} ~ ${escapeHtml(item.boostedCpMax || '-')}</span>`
                : ''
            }
          </div>

          ${renderBoostPills(item)}
        </div>

        ${
          showCpButton && item.cpTableImage
            ? `
              <div class="card-bottom">
                <div class="action-row">
                  <button class="action-btn primary" type="button" data-cptable-target="${cpTableId}">CP표 보기</button>
                </div>
              </div>

              <div class="cp-table-panel" id="${cpTableId}">
                <img src="${escapeHtml(item.cpTableImage)}" alt="${escapeHtml(item.name || '')} CP표">
              </div>
            `
            : ''
        }
      </div>
    </article>
  `;
}

export function bindCpButtons(root = document) {
  root.querySelectorAll('[data-cptable-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.dataset.cptableTarget);
      if (!panel) return;
      const isOpen = panel.classList.contains('show');
      panel.classList.toggle('show', !isOpen);
      btn.textContent = isOpen ? 'CP표 보기' : 'CP표 닫기';
    });
  });
}

export function splitShadowGroups(items) {
  return {
    normal: items.filter(item => !item.isShadow).sort(sortRaids),
    shadow: items.filter(item => item.isShadow).sort(sortRaids)
  };
}
