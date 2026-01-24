"use client";

import { useState, useCallback } from "react";
import { YearlyCalendar, CalendarEvent } from "react-yearly-calendar-grid";

// サンプルイベントデータ
const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    date: new Date(2026, 0, 15),
    title: "練習試合",
    category: "practice",
  },
  {
    id: "2",
    date: new Date(2026, 0, 22),
    title: "公式戦",
    category: "official",
  },
  { id: "3", date: new Date(2026, 1, 5), title: "練習", category: "training" },
  {
    id: "4",
    date: new Date(2026, 1, 11),
    endDate: new Date(2026, 1, 14),
    title: "春季大会",
    category: "official",
  },
  { id: "5", date: new Date(2026, 2, 20), title: "卒団式", category: "event" },
  {
    id: "6",
    date: new Date(2026, 3, 5),
    endDate: new Date(2026, 3, 6),
    title: "新入団歓迎会",
    category: "event",
  },
  {
    id: "7",
    date: new Date(2026, 4, 3),
    endDate: new Date(2026, 4, 10),
    title: "春季リーグ",
    category: "official",
  },
  {
    id: "8",
    date: new Date(2026, 6, 20),
    endDate: new Date(2026, 6, 23),
    title: "夏合宿",
    category: "training",
  },
  {
    id: "9",
    date: new Date(2026, 7, 15),
    endDate: new Date(2026, 7, 18),
    title: "夏季大会",
    category: "official",
  },
  {
    id: "10",
    date: new Date(2026, 7, 28),
    endDate: new Date(2026, 8, 3),
    title: "秋季強化",
    category: "training",
  },
  {
    id: "11",
    date: new Date(2026, 4, 5),
    endDate: new Date(2026, 5, 7),
    title: "練習試合",
    category: "practice",
  },
];

const categoryColors: Record<string, string> = {
  official: "#dc2626",
  practice: "#2563eb",
  training: "#16a34a",
  event: "#9333ea",
};

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

  const handleDateClick = (date: Date, events: CalendarEvent[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
  };

  const handleEventClick = (event: CalendarEvent) => {
    alert(
      `イベント: ${event.title}\n日付: ${event.date.toLocaleDateString("ja-JP")}${event.endDate ? ` 〜 ${event.endDate.toLocaleDateString("ja-JP")}` : ""}`,
    );
  };

  const handleEventMove = useCallback(
    (
      event: CalendarEvent,
      newStartDate: Date,
      newEndDate: Date | undefined,
    ) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, date: newStartDate, endDate: newEndDate }
            : e,
        ),
      );
    },
    [],
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ヘッダー：年切り替え（中央）+ 凡例（右上） */}
      <header className="shrink-0 z-30 bg-white shadow-md px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">年間スケジュール</h1>

        {/* 年切り替え（中央） */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium hover:bg-gray-200 hover:shadow-sm transition-all"
          >
            ◀
          </button>
          <span className="text-xl font-bold min-w-[90px] text-center text-gray-800">
            {selectedYear}年
          </span>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium hover:bg-gray-200 hover:shadow-sm transition-all"
          >
            ▶
          </button>
        </div>

        {/* 凡例（右上） */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: categoryColors.official }}
            />
            <span className="text-xs font-medium text-gray-700">公式戦</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: categoryColors.practice }}
            />
            <span className="text-xs font-medium text-gray-700">練習試合</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: categoryColors.training }}
            />
            <span className="text-xs font-medium text-gray-700">練習</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: categoryColors.event }}
            />
            <span className="text-xs font-medium text-gray-700">イベント</span>
          </div>
        </div>
      </header>

      {/* カレンダー（全幅・画面いっぱい・余白付き） */}
      <div className="flex-1 bg-white overflow-auto p-4 pb-8">
        <YearlyCalendar
          year={selectedYear}
          events={events}
          categoryColors={categoryColors}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventMove={handleEventMove}
        />
      </div>

      {/* 選択した日付の詳細（フローティング） */}
      {selectedDate && (
        <div className="fixed bottom-4 right-4 z-40 rounded-lg border bg-white p-3 shadow-lg max-w-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {selectedDate.toLocaleDateString("ja-JP", {
                month: "short",
                day: "numeric",
                weekday: "short",
              })}
            </h2>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </div>
          {selectedEvents.length > 0 ? (
            <ul className="mt-1 space-y-0.5 text-xs">
              {selectedEvents.map((event) => (
                <li key={event.id} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        event.category && categoryColors[event.category]
                          ? categoryColors[event.category]
                          : "#3b82f6",
                    }}
                  />
                  {event.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-gray-500">予定なし</p>
          )}
        </div>
      )}
    </div>
  );
}
