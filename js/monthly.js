import {
  loadRecords,
  getKoreaToday,
  toKey,
  toDate,
  inRange,
  escapeHtml,
  sortRaids,
  chipClass,
  chipLabel,
  buildRaidCard,
  bindCpButtons,
  isAllowed
} from './common.js';

let allRecords = [];
let viewYear = 0;
let viewMonth = 0;
let selectedDateKey = '';

let dragState = {
  isDragging: false,
  startY: 0,
  currentY: 0,
  deltaY: 0
};

function formatShort(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
}

function getDisplayItemsForDate(records, date) {
  return records
    .filter(item =>
      (isAllowed(item, 'monthly') ||
        isAllowed(item, 'index') ||
        isAllowed(item, 'raid-now') ||
        isAllowed(item, 'weekly')) &&
      item.startDate &&
      item.endDate &&
      inRange(date, item.startDate, item.endDate)
    )
    .sort(sortRaids);
}

function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay()));

  const dates = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function getCalendarPrimaryItems(items) {
  const normal1 = items.find(item => !item.isShadow && item.label === '1성');
  const normal3 = items.find(item => !item.isShadow && item.label === '3성');
  const normal5 = items.find(item => !item.isShadow && ['5성', '6성', '7성'].includes(item.label));
  const mega = items.find(item => !item.isShadow && item.label === '메가');
  const dynamax = items.find(item => !item.isShadow && item.label === '다이맥스');
  const gigantamax = items.find(item => !item.isShadow && item.label === '거다이맥스');
  const shadow = items.find(item => item.isShadow);

  return [normal1, normal3, normal5, mega, dynamax, gigantamax, shadow].filter(Boolean);
}

function renderCalendar() {
  const today = getKoreaToday();
  const grid = document.getElementById('calendarGrid');
  const monthDates = getMonthMatrix(viewYear, viewMonth);

  document.getElementById('monthTitle').textContent = `${viewYear}년 ${viewMonth + 1}월`;

  grid.innerHTML = monthDates.map(date => {
    const items = getDisplayItemsForDate(allRecords, date);
    const outside = date.getMonth() !== viewMonth;
    const isToday = toKey(date) === toKey(today);
    const isSelected = toKey(date) === selectedDateKey;

    const primaryItems = getCalendarPrimaryItems(items);
    const visibleItem = primaryItems[0];
    const moreCount = Math.max(items.length - 1, 0);

    return `
      <button
        type="button"
        class="day-cell ${outside ? 'outside' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
        data-date="${toKey(date)}"
      >
        <div class="day-number">${date.getDate()}</div>
        ${visibleItem ? `<div class="day-main">${escapeHtml(visibleItem.isShadow ? `그림자 ${visibleItem.name}` : visibleItem.name || '-')}</div>` : ``}
        ${moreCount > 0 ? `<div class="day-more">+${moreCount}</div>` : ``}
        ${items.length ? `<div class="day-count">${items.length}개</div>` : ``}
      </button>
    `;
  }).join('');

  grid.querySelectorAll('[data-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDateKey = btn.dataset.date;
      const selectedDate = toDate(selectedDateKey);

      if (!selectedDate) return;

      if (selectedDate.getMonth() !== viewMonth || selectedDate.getFullYear() !== viewYear) {
        viewYear = selectedDate.getFullYear();
        viewMonth = selectedDate.getMonth();
      }

      renderCalendar();
      openModal(selectedDate);
    });
  });
}

function renderModalGroups(items, date) {
  if (!items.length) {
    return `<div class="empty-state">선택한 날짜에는 진행 중인 레이드가 없습니다.</div>`;
  }

  const normal = items.filter(item => !item.isShadow).sort(sortRaids);
  const shadow = items.filter(item => item.isShadow).sort(sortRaids);
  const dateKey = toKey(date);

  const renderGroup = (title, groupItems, sectionKey) => {
    if (!groupItems.length) {
      return `
        <div style="margin-bottom:12px;">
          <div style="font-size:16px;font-weight:900;letter-spacing:-.02em;margin-bottom:10px;">${title}</div>
          <div class="empty-state">해당 레이드가 없습니다.</div>
        </div>
      `;
    }

    return `
      <div style="margin-bottom:12px;">
        <div style="font-size:16px;font-weight:900;letter-spacing:-.02em;margin-bottom:10px;">${title}</div>
        ${groupItems.map((item, index) =>
          buildRaidCard(item, {
            sectionKey: `${sectionKey}-${index}`,
            index,
            dateKey,
            showCpButton: true,
            showDateRange: true,
            shadowDescription: '그림자 레이드 · 로켓단 스타일 적용',
            normalDescription: '선택한 날짜 기준 진행 중인 레이드입니다.'
          })
        ).join('')}
      </div>
    `;
  };

  return `
    ${renderGroup('일반 레이드', normal, 'monthly-normal')}
    ${renderGroup('그림자 레이드', shadow, 'monthly-shadow')}
  `;
}

function openModal(date) {
  const items = getDisplayItemsForDate(allRecords, date);
  const modal = document.getElementById('calendarModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const modalList = document.getElementById('modalList');
  const modalSheet = modal.querySelector('.modal-sheet');

  modalTitle.textContent = formatShort(date);
  modalSub.textContent = items.length
    ? `${items.length}개의 레이드가 진행됩니다`
    : '진행 중인 레이드가 없습니다';

  if (modalSheet) {
    modalSheet.style.transform = 'translateY(0px)';
    modalSheet.classList.remove('dragging');
  }

  modalList.innerHTML = renderModalGroups(items, date);

  bindCpButtons(document);

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('calendarModal');
  const modalSheet = modal.querySelector('.modal-sheet');

  if (modalSheet) {
    modalSheet.classList.remove('dragging');
    modalSheet.style.transform = 'translateY(0px)';
  }

  modal.classList.remove('show');
  document.body.style.overflow = '';
}

function bindModalDrag() {
  const modal = document.getElementById('calendarModal');
  const modalSheet = modal.querySelector('.modal-sheet');
  const modalHead = modal.querySelector('.modal-head');

  if (!modalSheet || !modalHead) return;

  const getY = (event) => {
    if (event.touches && event.touches.length) return event.touches[0].clientY;
    if (event.changedTouches && event.changedTouches.length) return event.changedTouches[0].clientY;
    return event.clientY;
  };

  const startDrag = (event) => {
    if (!modal.classList.contains('show')) return;
    dragState.isDragging = true;
    dragState.startY = getY(event);
    dragState.currentY = dragState.startY;
    dragState.deltaY = 0;
    modalSheet.classList.add('dragging');
  };

  const moveDrag = (event) => {
    if (!dragState.isDragging) return;

    dragState.currentY = getY(event);
    dragState.deltaY = Math.max(0, dragState.currentY - dragState.startY);

    modalSheet.style.transform = `translateY(${dragState.deltaY}px)`;

    if (event.cancelable) event.preventDefault();
  };

  const endDrag = () => {
    if (!dragState.isDragging) return;

    dragState.isDragging = false;
    modalSheet.classList.remove('dragging');

    if (dragState.deltaY > 120) {
      closeModal();
    } else {
      modalSheet.style.transform = 'translateY(0px)';
    }
  };

  modalHead.addEventListener('touchstart', startDrag, { passive: true });
  modalHead.addEventListener('mousedown', startDrag);

  window.addEventListener('touchmove', moveDrag, { passive: false });
  window.addEventListener('mousemove', moveDrag);

  window.addEventListener('touchend', endDrag);
  window.addEventListener('mouseup', endDrag);
}

function moveMonth(step) {
  const next = new Date(viewYear, viewMonth + step, 1);
  viewYear = next.getFullYear();
  viewMonth = next.getMonth();

  const firstDay = new Date(viewYear, viewMonth, 1);
  selectedDateKey = toKey(firstDay);

  renderCalendar();
}

function bindToolbar() {
  document.getElementById('prevMonthBtn').addEventListener('click', () => moveMonth(-1));
  document.getElementById('nextMonthBtn').addEventListener('click', () => moveMonth(1));
  document.getElementById('todayBtn').addEventListener('click', () => {
    const today = getKoreaToday();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    selectedDateKey = toKey(today);
    renderCalendar();
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.querySelector('.modal-bg').addEventListener('click', closeModal);
}

async function init() {
  const today = getKoreaToday();

  allRecords = await loadRecords();

  viewYear = today.getFullYear();
  viewMonth = today.getMonth();
  selectedDateKey = toKey(today);

  bindToolbar();
  bindModalDrag();
  renderCalendar();
}

init();
