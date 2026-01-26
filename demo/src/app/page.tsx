"use client";

import { useState, useCallback } from "react";
import { YearlyCalendar, CalendarEvent } from "react-yearly-calendar-grid";

// Sample event data
const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    date: new Date(2026, 0, 15),
    title: "Team Meeting",
    category: "meeting",
  },
  {
    id: "2",
    date: new Date(2026, 0, 22),
    title: "Conference",
    category: "conference",
  },
  { id: "3", date: new Date(2026, 1, 5), title: "Workshop", category: "training" },
  {
    id: "4",
    date: new Date(2026, 1, 11),
    endDate: new Date(2026, 1, 14),
    title: "Project Sprint",
    category: "project",
  },
  { id: "5", date: new Date(2026, 2, 20), title: "Review", category: "meeting" },
  {
    id: "6",
    date: new Date(2026, 3, 5),
    endDate: new Date(2026, 3, 6),
    title: "Team Building",
    category: "event",
  },
  {
    id: "7",
    date: new Date(2026, 4, 3),
    endDate: new Date(2026, 4, 10),
    title: "Development Phase",
    category: "project",
  },
  {
    id: "8",
    date: new Date(2026, 6, 20),
    endDate: new Date(2026, 6, 23),
    title: "Summer Training",
    category: "training",
  },
  {
    id: "9",
    date: new Date(2026, 7, 15),
    endDate: new Date(2026, 7, 18),
    title: "Annual Conference",
    category: "conference",
  },
  {
    id: "10",
    date: new Date(2026, 7, 28),
    endDate: new Date(2026, 8, 3),
    title: "Planning Week",
    category: "project",
  },
  {
    id: "11",
    date: new Date(2026, 4, 5),
    endDate: new Date(2026, 5, 7),
    title: "Long Project",
    category: "project",
  },
];

const categoryColors: Record<string, string> = {
  conference: "#dc2626",
  meeting: "#2563eb",
  training: "#16a34a",
  event: "#9333ea",
  project: "#f59e0b",
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
      `Event: ${event.title}\nDate: ${event.date.toLocaleDateString("en-US")}${event.endDate ? ` - ${event.endDate.toLocaleDateString("en-US")}` : ""}`,
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
      {/* Header: Year switcher (center) + Legend (right) */}
      <header className="shrink-0 z-30 bg-white shadow-md px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Yearly Schedule</h1>

        {/* Year switcher (center) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium hover:bg-gray-200 hover:shadow-sm transition-all"
          >
            ◀
          </button>
          <span className="text-xl font-bold min-w-[90px] text-center text-gray-800">
            {selectedYear}
          </span>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium hover:bg-gray-200 hover:shadow-sm transition-all"
          >
            ▶
          </button>
        </div>

        {/* Legend (right) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: categoryColors.conference }}
            />
            <span className="text-xs font-medium text-gray-700">Conference</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: categoryColors.meeting }}
            />
            <span className="text-xs font-medium text-gray-700">Meeting</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: categoryColors.training }}
            />
            <span className="text-xs font-medium text-gray-700">Training</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: categoryColors.event }}
            />
            <span className="text-xs font-medium text-gray-700">Event</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: categoryColors.project }}
            />
            <span className="text-xs font-medium text-gray-700">Project</span>
          </div>
        </div>
      </header>

      {/* Calendar (full width) */}
      <div className="flex-1 bg-white overflow-auto p-4 pb-8">
        <YearlyCalendar
          year={selectedYear}
          events={events}
          categoryColors={categoryColors}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventMove={handleEventMove}
          showWeekday={true}
        />
      </div>

      {/* Selected date details (floating) */}
      {selectedDate && (
        <div className="fixed bottom-4 right-4 z-40 rounded-lg border bg-white p-3 shadow-lg max-w-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {selectedDate.toLocaleDateString("en-US", {
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
            <p className="mt-1 text-xs text-gray-500">No events</p>
          )}
        </div>
      )}
    </div>
  );
}
