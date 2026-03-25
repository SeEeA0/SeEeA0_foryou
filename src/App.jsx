import { useMemo, useState } from "react";

const raidData = [
  {
    id: 1,
    name: "뮤츠",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
    start: "2026-03-01",
    end: "2026-03-07",
    cp: "54,148",
    boostedCp: "67,685",
    type: "에스퍼",
    tier: "전설 레이드"
  },
  {
    id: 2,
    name: "레쿠쟈",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    start: "2026-03-08",
    end: "2026-03-14",
    cp: "49,808",
    boostedCp: "62,260",
    type: "드래곤 / 비행",
    tier: "메가 / 전설 레이드"
  },
  {
    id: 3,
    name: "가이오가",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    start: "2026-03-15",
    end: "2026-03-21",
    cp: "54,411",
    boostedCp: "68,014",
    type: "물",
    tier: "전설 레이드"
  },
  {
    id: 4,
    name: "그란돈",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    start: "2026-03-22",
    end: "2026-03-31",
    cp: "54,411",
    boostedCp: "68,014",
    type: "땅",
    tier: "전설 레이드"
  }
];

const eventData = [
  {
    id: 101,
    title: "커뮤니티 데이",
    date: "2026-03-09",
    time: "14:00 - 17:00",
    desc: "특정 포켓몬 대량 출현, 특별 기술 가능"
  },
  {
    id: 102,
    title: "레이드 아워",
    date: "2026-03-11",
    time: "18:00 - 19:00",
    desc: "전설 레이드 집중 출현"
  },
  {
    id: 103,
    title: "스포트라이트 아워",
    date: "2026-03-17",
    time: "18:00 - 19:00",
    desc: "특정 포켓몬 출현 증가 + 보너스"
  },
  {
    id: 104,
    title: "커뮤니티 데이 클래식",
    date: "2026-03-23",
    time: "14:00 - 17:00",
    desc: "복각 커뮤니티 데이"
  }
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const prevLastDate = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevLastDate - i),
      currentMonth: false
    });
  }

  for (let day = 1; day <= lastDate; day++) {
    cells.push({
      date: new Date(year, month, day),
      currentMonth: true
    });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - (firstWeekday + lastDate) + 1;
    cells.push({
      date: new Date(year, month + 1, nextDay),
      currentMonth: false
    });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function sameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateInRange(target, start, end) {
  const targetTime = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  ).getTime();
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return targetTime >= startTime && targetTime <= endTime;
}

function App() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthMatrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  const weeklySummary = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const raids = raidData.filter((raid) => {
      const raidStart = new Date(raid.start);
      const raidEnd = new Date(raid.end);
      return raidStart <= endOfWeek && raidEnd >= startOfWeek;
    });

    const events = eventData.filter((event) => {
      const d = new Date(event.date);
      return d >= startOfWeek && d <= endOfWeek;
    });

    return { raids, events, startOfWeek, endOfWeek };
  }, [selectedDate]);

  const selectedDayRaids = raidData.filter((raid) =>
    isDateInRange(selectedDate, raid.start, raid.end)
  );

  const selectedDayEvents = eventData.filter((event) =>
    sameDate(new Date(event.date), selectedDate)
  );

  const monthLabel = `${year}년 ${month + 1}월`;

  const moveMonth = (diff) => {
    setCurrentDate(new Date(year, month + diff, 1));
  };

  return (
    <div className="app">
      <div className="container">
        <header className="hero">
          <div className="hero-top">
            <div>
              <p className="eyebrow">Pokémon GO Schedule</p>
              <h1>메인 첫 화면 = 상단 요약 + 캘린더</h1>
              <p className="hero-desc">
                이번 주 레이드 보스와 진행 중 이벤트를 한눈에 보고,
                아래에서 월간 캘린더를 확인할 수 있는 구조입니다.
              </p>
            </div>
            <div className="today-box">
              <span className="today-label">선택 날짜</span>
              <strong>
                {selectedDate.getFullYear()}.
                {String(selectedDate.getMonth() + 1).padStart(2, "0")}.
                {String(selectedDate.getDate()).padStart(2, "0")}
              </strong>
            </div>
          </div>

          <section className="summary-grid">
            <div className="panel">
              <div className="panel-head">
                <h2>이번 주 레이드 보스</h2>
                <span>
                  {formatDate(
                    weeklySummary.startOfWeek.toISOString().slice(0, 10)
                  )}{" "}
                  ~{" "}
                  {formatDate(
                    weeklySummary.endOfWeek.toISOString().slice(0, 10)
                  )}
                </span>
              </div>

              <div className="raid-list">
                {weeklySummary.raids.length > 0 ? (
                  weeklySummary.raids.map((raid) => (
                    <article className="raid-card" key={raid.id}>
                      <div className="raid-thumb">
                        <img src={raid.image} alt={raid.name} />
                      </div>
                      <div className="raid-info">
                        <div className="badge-row">
                          <span className="badge">{raid.tier}</span>
                          <span className="badge soft">{raid.type}</span>
                        </div>
                        <h3>{raid.name}</h3>
                        <p className="date-range">
                          {formatDate(raid.start)} ~ {formatDate(raid.end)}
                        </p>
                        <div className="stats">
                          <div>
                            <span>CP</span>
                            <strong>{raid.cp}</strong>
                          </div>
                          <div>
                            <span>부스트 CP</span>
                            <strong>{raid.boostedCp}</strong>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-box">이번 주 레이드 일정이 없습니다.</div>
                )}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>진행 중 이벤트</h2>
                <span>주간 이벤트 요약</span>
              </div>

              <div className="event-list">
                {weeklySummary.events.length > 0 ? (
                  weeklySummary.events.map((event) => (
                    <article className="event-item" key={event.id}>
                      <div className="event-date">
                        {formatDate(event.date)}
                      </div>
                      <div className="event-body">
                        <h3>{event.title}</h3>
                        <p>{event.time}</p>
                        <small>{event.desc}</small>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-box">이번 주 이벤트가 없습니다.</div>
                )}
              </div>
            </div>
          </section>
        </header>

        <section className="calendar-section">
          <div className="calendar-wrap">
            <div className="calendar-panel">
              <div className="calendar-head">
                <button onClick={() => moveMonth(-1)}>&lt;</button>
                <h2>{monthLabel}</h2>
                <button onClick={() => moveMonth(1)}>&gt;</button>
              </div>

              <div className="weekday-row">
                <span>일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
              </div>

              <div className="calendar-grid">
                {monthMatrix.map((week, weekIndex) =>
                  week.map((cell, dayIndex) => {
                    const dateKey = `${cell.date.getFullYear()}-${String(
                      cell.date.getMonth() + 1
                    ).padStart(2, "0")}-${String(cell.date.getDate()).padStart(
                      2,
                      "0"
                    )}`;

                    const raids = raidData.filter((raid) =>
                      isDateInRange(cell.date, raid.start, raid.end)
                    );
                    const events = eventData.filter((event) =>
                      sameDate(new Date(event.date), cell.date)
                    );

                    const isSelected = sameDate(cell.date, selectedDate);
                    const isToday = sameDate(cell.date, today);

                    return (
                      <button
                        key={`${dateKey}-${weekIndex}-${dayIndex}`}
                        className={[
                          "calendar-cell",
                          cell.currentMonth ? "" : "muted",
                          isSelected ? "selected" : "",
                          isToday ? "today" : ""
                        ].join(" ")}
                        onClick={() => setSelectedDate(cell.date)}
                      >
                        <div className="cell-top">
                          <span className="cell-date">{cell.date.getDate()}</span>
                        </div>

                        <div className="cell-items">
                          {raids.slice(0, 2).map((raid) => (
                            <span key={raid.id} className="dot raid-dot">
                              {raid.name}
                            </span>
                          ))}
                          {events.slice(0, 2).map((event) => (
                            <span key={event.id} className="dot event-dot">
                              {event.title}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <aside className="detail-panel">
              <div className="detail-head">
                <h2>선택 날짜 상세</h2>
                <p>
                  {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월{" "}
                  {selectedDate.getDate()}일
                </p>
              </div>

              <div className="detail-block">
                <h3>레이드 일정</h3>
                {selectedDayRaids.length > 0 ? (
                  selectedDayRaids.map((raid) => (
                    <div className="detail-card" key={raid.id}>
                      <strong>{raid.name}</strong>
                      <span>{raid.tier}</span>
                      <p>
                        기간: {formatDate(raid.start)} ~ {formatDate(raid.end)}
                      </p>
                      <p>CP: {raid.cp}</p>
                      <p>부스트 CP: {raid.boostedCp}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-box small">
                    해당 날짜 레이드 일정 없음
                  </div>
                )}
              </div>

              <div className="detail-block">
                <h3>이벤트 일정</h3>
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div className="detail-card" key={event.id}>
                      <strong>{event.title}</strong>
                      <span>{event.time}</span>
                      <p>{event.desc}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-box small">
                    해당 날짜 이벤트 일정 없음
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
