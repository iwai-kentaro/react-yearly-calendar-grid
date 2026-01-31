"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import type { YearlyCalendarProps, CalendarEvent, Holiday } from "./types";
import { createStyles, mergeTheme, getCellBackgroundColor, defaultTheme } from "./styles";

const MONTHS_JA = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MIN_ROW_HEIGHT = 20;
const HEADER_HEIGHT = 24;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isSunday(year: number, month: number, day: number): boolean {
  return new Date(year, month, day).getDay() === 0;
}

function isSaturday(year: number, month: number, day: number): boolean {
  return new Date(year, month, day).getDay() === 6;
}

interface MonthSpan {
  event: CalendarEvent;
  startDay: number;
  endDay: number;
  isStart: boolean;
  isEnd: boolean;
}

function getMonthSpans(
  events: CalendarEvent[],
  year: number,
  month: number
): MonthSpan[] {
  const spans: MonthSpan[] = [];
  const daysInMonth = getDaysInMonth(year, month);

  events.forEach((event) => {
    const startDate = event.date;
    const endDate = event.endDate || event.date;

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth, 23, 59, 59);

    if (startDate > monthEnd || endDate < monthStart) {
      return;
    }

    const spanStart = startDate >= monthStart ? startDate.getDate() : 1;
    const spanEnd = endDate <= monthEnd ? endDate.getDate() : daysInMonth;

    spans.push({
      event,
      startDay: spanStart,
      endDay: spanEnd,
      isStart:
        startDate.getFullYear() === year && startDate.getMonth() === month,
      isEnd: endDate.getFullYear() === year && endDate.getMonth() === month,
    });
  });

  return spans;
}

function calculateLanes(spans: MonthSpan[]): Map<string, number> {
  const laneMap = new Map<string, number>();
  const lanes: { endDay: number }[] = [];
  const sorted = [...spans].sort((a, b) => a.startDay - b.startDay);

  sorted.forEach((span) => {
    let laneIndex = lanes.findIndex((lane) => lane.endDay < span.startDay);
    if (laneIndex === -1) {
      laneIndex = lanes.length;
      lanes.push({ endDay: span.endDay });
    } else {
      lanes[laneIndex].endDay = span.endDay;
    }
    laneMap.set(span.event.id, laneIndex);
  });

  return laneMap;
}

export function YearlyCalendar({
  year,
  events = [],
  holidays = [],
  onDateClick,
  onDateDoubleClick,
  onDateRangeSelect,
  onEventClick,
  onEventMove,
  highlightRange,
  categoryColors = {},
  theme: customTheme,
  showWeekday = false,
  locale = "en",
}: YearlyCalendarProps) {
  // テーマをマージ
  const theme = useMemo(() => mergeTheme(customTheme), [customTheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  // ロケールに応じた表示
  const isJa = locale === "ja";
  const MONTHS = isJa ? MONTHS_JA : MONTHS_EN;
  const WEEKDAYS = isJa ? WEEKDAYS_JA : WEEKDAYS_EN;

  const containerRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(MIN_ROW_HEIGHT);

  useEffect(() => {
    const updateRowHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const calculatedHeight = Math.floor(
          (containerHeight - HEADER_HEIGHT) / 31
        );
        setRowHeight(Math.max(calculatedHeight, MIN_ROW_HEIGHT));
      }
    };

    updateRowHeight();
    window.addEventListener("resize", updateRowHeight);
    return () => window.removeEventListener("resize", updateRowHeight);
  }, []);

  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [dragOverCell, setDragOverCell] = useState<{
    month: number;
    day: number;
  } | null>(null);
  const [dragPosition, setDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dragGrabOffsetY, setDragGrabOffsetY] = useState<number>(0);
  const [dragCardHeight, setDragCardHeight] = useState<number>(0);
  const [pendingMove, setPendingMove] = useState<{
    event: CalendarEvent;
    newStartDate: Date;
    newEndDate: Date | undefined;
    isResize?: boolean;
  } | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<{
    event: CalendarEvent;
    x: number;
    y: number;
  } | null>(null);
  const [resizingEvent, setResizingEvent] = useState<{
    event: CalendarEvent;
    edge: "start" | "end";
  } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    month: number;
    day: number;
  } | null>(null);
  const [hoveredEventBar, setHoveredEventBar] = useState<string | null>(null);
  const [hoveredResizeHandle, setHoveredResizeHandle] = useState<{
    eventId: string;
    edge: "start" | "end";
  } | null>(null);
  const [hoveredCancelButton, setHoveredCancelButton] = useState(false);
  const [hoveredConfirmButton, setHoveredConfirmButton] = useState(false);

  // モバイル判定（タッチデバイス）
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  // モバイル用：タップで固定表示するツールチップ
  const [tappedEvent, setTappedEvent] = useState<{
    event: CalendarEvent;
    x: number;
    y: number;
    bottom: number;
  } | null>(null);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // タップツールチップ外クリックで閉じる
  useEffect(() => {
    if (!tappedEvent) return;
    const handleTouchOutside = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-mobile-tooltip]")) return;
      setTappedEvent(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-mobile-tooltip]")) return;
      setTappedEvent(null);
    };
    document.addEventListener("touchstart", handleTouchOutside);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("touchstart", handleTouchOutside);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tappedEvent]);

  // Range selection state
  const [rangeSelectionStart, setRangeSelectionStart] = useState<{
    month: number;
    day: number;
  } | null>(null);
  const [rangeSelectionEnd, setRangeSelectionEnd] = useState<{
    month: number;
    day: number;
  } | null>(null);
  const isRangeSelecting = rangeSelectionStart !== null;

  // 祝日をマップに変換（高速検索用）
  const holidayMap = useMemo(() => {
    const map = new Map<string, Holiday>();
    holidays.forEach((holiday) => {
      const dateKey = `${holiday.date.getFullYear()}-${holiday.date.getMonth()}-${holiday.date.getDate()}`;
      map.set(dateKey, holiday);
    });
    return map;
  }, [holidays]);

  const isHoliday = (month: number, day: number): boolean => {
    const dateKey = `${year}-${month}-${day}`;
    return holidayMap.has(dateKey);
  };

  const getHoliday = (month: number, day: number): Holiday | undefined => {
    const dateKey = `${year}-${month}-${day}`;
    return holidayMap.get(dateKey);
  };

  const monthSpans = useMemo(() => {
    const result: MonthSpan[][] = [];
    for (let month = 0; month < 12; month++) {
      result.push(getMonthSpans(events, year, month));
    }
    return result;
  }, [events, year]);

  const laneMaps = useMemo(() => {
    return monthSpans.map((spans) => calculateLanes(spans));
  }, [monthSpans]);

  // 各月のレーン数（重なっているカードの数）
  const maxLanes = useMemo(() => {
    return laneMaps.map((laneMap) => {
      let max = 0;
      laneMap.forEach((lane) => {
        max = Math.max(max, lane + 1);
      });
      return Math.max(max, 1);
    });
  }, [laneMaps]);

  // リサイズ中のプレビュー範囲を計算
  const resizePreviewSpans = useMemo(() => {
    if (!resizingEvent || !dragOverCell) return null;

    const { event, edge } = resizingEvent;
    const dropDate = new Date(year, dragOverCell.month, dragOverCell.day);

    let newStartDate = new Date(event.date);
    let newEndDate = new Date(event.endDate || event.date);

    if (edge === "start") {
      if (dropDate <= newEndDate) {
        newStartDate = dropDate;
      }
    } else {
      if (dropDate >= newStartDate) {
        newEndDate = dropDate;
      }
    }

    const spans = new Map<number, MonthSpan>();
    for (let month = 0; month < 12; month++) {
      const daysInMonth = getDaysInMonth(year, month);
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month, daysInMonth, 23, 59, 59);

      if (newStartDate > monthEnd || newEndDate < monthStart) continue;

      const spanStart = newStartDate >= monthStart ? newStartDate.getDate() : 1;
      const spanEnd =
        newEndDate <= monthEnd ? newEndDate.getDate() : daysInMonth;

      spans.set(month, {
        event,
        startDay: spanStart,
        endDay: spanEnd,
        isStart:
          newStartDate.getFullYear() === year &&
          newStartDate.getMonth() === month,
        isEnd:
          newEndDate.getFullYear() === year && newEndDate.getMonth() === month,
      });
    }

    return spans;
  }, [resizingEvent, dragOverCell, year]);

  const getEventColor = (event: CalendarEvent): string => {
    if (event.color) return event.color;
    if (event.category && categoryColors[event.category]) {
      return categoryColors[event.category];
    }
    return "#3b82f6";
  };

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const startDate = event.date;
      const endDate = event.endDate || event.date;
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
        const existing = map.get(dateKey) || [];
        map.set(dateKey, [...existing, event]);
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [events]);

  const getEventsForDate = (month: number, day: number): CalendarEvent[] => {
    const dateKey = `${year}-${month}-${day}`;
    return eventsByDate.get(dateKey) || [];
  };

  const handleCellClick = (month: number, day: number) => {
    if (!onDateClick) return;
    const daysInMonth = getDaysInMonth(year, month);
    if (day > daysInMonth) return;
    const date = new Date(year, month, day);
    const cellEvents = getEventsForDate(month, day);
    onDateClick(date, cellEvents);
  };

  const handleCellDoubleClick = (month: number, day: number) => {
    if (!onDateDoubleClick) return;
    const daysInMonth = getDaysInMonth(year, month);
    if (day > daysInMonth) return;
    const date = new Date(year, month, day);
    const cellEvents = getEventsForDate(month, day);
    onDateDoubleClick(date, cellEvents);
  };

  // Range selection helpers
  const dateToNumber = (month: number, day: number): number => {
    return new Date(year, month, day).getTime();
  };

  const isInSelectionRange = (month: number, day: number): boolean => {
    // Check active drag selection
    if (rangeSelectionStart && rangeSelectionEnd) {
      const cellDate = dateToNumber(month, day);
      const startDate = dateToNumber(rangeSelectionStart.month, rangeSelectionStart.day);
      const endDate = dateToNumber(rangeSelectionEnd.month, rangeSelectionEnd.day);
      const minDate = Math.min(startDate, endDate);
      const maxDate = Math.max(startDate, endDate);
      if (cellDate >= minDate && cellDate <= maxDate) return true;
    }
    return false;
  };

  const isInHighlightRange = (month: number, day: number): boolean => {
    if (!highlightRange) return false;
    const cellDate = new Date(year, month, day).getTime();
    const startDate = highlightRange.start.getTime();
    const endDate = highlightRange.end.getTime();
    const minDate = Math.min(startDate, endDate);
    const maxDate = Math.max(startDate, endDate);
    return cellDate >= minDate && cellDate <= maxDate;
  };

  const handleRangeSelectStart = useCallback(
    (month: number, day: number) => {
      if (!onDateRangeSelect) return;
      if (draggingEvent || resizingEvent) return;
      setRangeSelectionStart({ month, day });
      setRangeSelectionEnd({ month, day });
    },
    [onDateRangeSelect, draggingEvent, resizingEvent]
  );

  const handleRangeSelectMove = useCallback(
    (month: number, day: number) => {
      if (!rangeSelectionStart) return;
      setRangeSelectionEnd({ month, day });
    },
    [rangeSelectionStart]
  );

  const handleRangeSelectEnd = useCallback(() => {
    if (!rangeSelectionStart || !rangeSelectionEnd || !onDateRangeSelect) {
      setRangeSelectionStart(null);
      setRangeSelectionEnd(null);
      return;
    }

    const startDate = new Date(year, rangeSelectionStart.month, rangeSelectionStart.day);
    const endDate = new Date(year, rangeSelectionEnd.month, rangeSelectionEnd.day);

    // Ensure start is before end
    const [finalStart, finalEnd] = startDate <= endDate
      ? [startDate, endDate]
      : [endDate, startDate];

    onDateRangeSelect(finalStart, finalEnd);
    setRangeSelectionStart(null);
    setRangeSelectionEnd(null);
  }, [rangeSelectionStart, rangeSelectionEnd, year, onDateRangeSelect]);

  const handleDragStart = useCallback(
    (
      e: React.DragEvent,
      event: CalendarEvent,
      monthIndex: number,
      spanStartDay: number
    ) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", event.id);

      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const dayOffset = Math.floor(clickY / rowHeight);
      const grabDay = spanStartDay + dayOffset;

      setDragGrabOffsetY(clickY);
      setDragCardHeight(rect.height);
      const grabDate = new Date(year, monthIndex, grabDay);
      const startDate = event.date;
      const offsetDays = Math.floor(
        (grabDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      setDragOffset(offsetDays);

      requestAnimationFrame(() => {
        setDraggingEvent(event);
      });
    },
    [year, rowHeight]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, month: number, day: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (draggingEvent && dragGrabOffsetY > 0) {
        const dayOffset = Math.floor(dragGrabOffsetY / rowHeight);
        let cardTopDay = day - dayOffset;
        let cardTopMonth = month;

        while (cardTopDay < 1 && cardTopMonth > 0) {
          cardTopMonth--;
          cardTopDay += getDaysInMonth(year, cardTopMonth);
        }
        let daysInMonth = getDaysInMonth(year, cardTopMonth);
        while (cardTopDay > daysInMonth && cardTopMonth < 11) {
          cardTopDay -= daysInMonth;
          cardTopMonth++;
          daysInMonth = getDaysInMonth(year, cardTopMonth);
        }
        cardTopDay = Math.max(
          1,
          Math.min(cardTopDay, getDaysInMonth(year, cardTopMonth))
        );

        setDragOverCell({ month: cardTopMonth, day: cardTopDay });
      } else {
        setDragOverCell({ month, day });
      }
      setDragPosition({ x: e.clientX, y: e.clientY });
    },
    [draggingEvent, dragGrabOffsetY, year, rowHeight]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverCell(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (draggingEvent && onEventMove && dragOverCell) {
        const newStartDate = new Date(
          year,
          dragOverCell.month,
          dragOverCell.day
        );

        let newEndDate: Date | undefined;
        if (draggingEvent.endDate) {
          const duration =
            draggingEvent.endDate.getTime() - draggingEvent.date.getTime();
          newEndDate = new Date(newStartDate.getTime() + duration);
        }

        // 同じ日付への移動はスキップ
        if (newStartDate.getTime() !== draggingEvent.date.getTime()) {
          setPendingMove({
            event: draggingEvent,
            newStartDate,
            newEndDate,
            isResize: false,
          });
        }
      }
      setDragOverCell(null);
      setDragPosition(null);
      setDraggingEvent(null);
      setDragOffset(0);
    },
    [draggingEvent, dragOverCell, year, onEventMove]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingEvent(null);
    setDragOverCell(null);
    setDragPosition(null);
    setDragGrabOffsetY(0);
    setDragCardHeight(0);
  }, []);

  const handleConfirmMove = useCallback(() => {
    if (pendingMove && onEventMove) {
      onEventMove(
        pendingMove.event,
        pendingMove.newStartDate,
        pendingMove.newEndDate
      );
    }
    setPendingMove(null);
  }, [pendingMove, onEventMove]);

  const handleCancelMove = useCallback(() => {
    setPendingMove(null);
  }, []);

  const handleResizeStart = useCallback(
    (e: React.DragEvent, event: CalendarEvent, edge: "start" | "end") => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", `resize-${event.id}`);
      requestAnimationFrame(() => {
        setResizingEvent({ event, edge });
      });
    },
    []
  );

  const handleResizeDrop = useCallback(
    (month: number, day: number) => {
      if (!resizingEvent || !onEventMove) return;

      const { event, edge } = resizingEvent;
      const dropDate = new Date(year, month, day);

      let newStartDate = event.date;
      let newEndDate = event.endDate || event.date;

      if (edge === "start") {
        if (dropDate <= newEndDate) {
          newStartDate = dropDate;
        }
      } else {
        if (dropDate >= newStartDate) {
          newEndDate = dropDate;
        }
      }

      const finalEndDate =
        newStartDate.getTime() === newEndDate.getTime()
          ? undefined
          : newEndDate;

      // 変更がない場合はスキップ
      const startChanged = newStartDate.getTime() !== event.date.getTime();
      const endChanged = finalEndDate?.getTime() !== event.endDate?.getTime();
      if (startChanged || endChanged) {
        setPendingMove({
          event,
          newStartDate,
          newEndDate: finalEndDate,
          isResize: true,
        });
      }

      setResizingEvent(null);
      setDragOverCell(null);
      setDragPosition(null);
    },
    [resizingEvent, year, onEventMove]
  );

  const handleResizeEnd = useCallback(() => {
    setResizingEvent(null);
    setDragOverCell(null);
    setDragPosition(null);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setResizingEvent(null);
      setDraggingEvent(null);
      setDragOverCell(null);
      setDragPosition(null);
      setDragGrabOffsetY(0);
      setDragCardHeight(0);
      setDragOffset(0);
      // End range selection on global mouse up
      if (rangeSelectionStart) {
        handleRangeSelectEnd();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("dragend", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("dragend", handleGlobalMouseUp);
    };
  }, [rangeSelectionStart, handleRangeSelectEnd]);

  const getWeekdayName = (month: number, day: number) => {
    const date = new Date(year, month, day);
    return WEEKDAYS[date.getDay()];
  };

  return (
    <div ref={containerRef} style={styles.container}>
      {/* ドラッグ中のフローティング日付表示 */}
      {draggingEvent &&
        dragOverCell &&
        dragPosition &&
        (() => {
          const cardTop = dragPosition.y - dragGrabOffsetY;
          const cardBottom = cardTop + dragCardHeight;
          const showBelow = cardTop < 80;
          return (
            <div
              style={{
                ...styles.floatingDate,
                left: dragPosition.x,
                top: showBelow ? cardBottom + 8 : cardTop - 8,
                transform: showBelow
                  ? "translateX(-50%)"
                  : "translateX(-50%) translateY(-100%)",
              }}
            >
              <div style={styles.floatingDateContent}>
                <div>
                  {isJa
                    ? `${dragOverCell.month + 1}月${dragOverCell.day}日(${getWeekdayName(dragOverCell.month, dragOverCell.day)})`
                    : `${MONTHS[dragOverCell.month]} ${dragOverCell.day} (${getWeekdayName(dragOverCell.month, dragOverCell.day)})`}
                </div>
                <div style={styles.floatingDateSubtext}>
                  {draggingEvent.title}
                </div>
              </div>
            </div>
          );
        })()}

      {/* リサイズ中のフローティング日付表示 */}
      {resizingEvent && dragOverCell && dragPosition && (
        <div
          style={{
            ...styles.floatingDate,
            left: dragPosition.x,
            top: dragPosition.y - 50,
          }}
        >
          <div style={styles.resizeFloatingContent}>
            <div>
              {isJa
                ? `${resizingEvent.edge === "start" ? "開始日：" : "終了日："}${dragOverCell.month + 1}月${dragOverCell.day}日(${getWeekdayName(dragOverCell.month, dragOverCell.day)})`
                : `${resizingEvent.edge === "start" ? "Start: " : "End: "}${MONTHS[dragOverCell.month]} ${dragOverCell.day} (${getWeekdayName(dragOverCell.month, dragOverCell.day)})`}
            </div>
            <div style={styles.floatingDateSubtext}>
              {resizingEvent.event.title}
            </div>
          </div>
        </div>
      )}

      <div style={styles.flexContainer}>
        {/* 日付列 */}
        <div style={styles.dayColumn}>
          <div style={styles.dayHeaderCell}>{isJa ? "日" : "Day"}</div>
          {DAYS.map((day) => (
            <div key={day} style={{ ...styles.dayCell, height: rowHeight }}>
              {day}
            </div>
          ))}
        </div>

        {/* 月ごとの列 */}
        {MONTHS.map((monthName, monthIndex) => {
          const daysInMonth = getDaysInMonth(year, monthIndex);
          const spans = monthSpans[monthIndex];
          const laneMap = laneMaps[monthIndex];
          const laneCount = maxLanes[monthIndex]; // この月のレーン数

          return (
            <div key={monthIndex} style={styles.monthColumn}>
              {/* 月ヘッダー */}
              <div style={styles.monthHeader}>{monthName}</div>

              {/* 日付セル（背景） */}
              {DAYS.map((day) => {
                const isValidDay = day <= daysInMonth;
                const sunday = isValidDay && isSunday(year, monthIndex, day);
                const saturday =
                  isValidDay && isSaturday(year, monthIndex, day);
                const holiday = isValidDay && isHoliday(monthIndex, day);
                const isHovered =
                  hoveredCell?.month === monthIndex && hoveredCell?.day === day;
                const isInRange = isValidDay && isInSelectionRange(monthIndex, day);
                const isHighlighted = isValidDay && isInHighlightRange(monthIndex, day);

                return (
                  <div
                    key={day}
                    style={{
                      ...styles.calendarCell,
                      height: rowHeight,
                      backgroundColor: isInRange
                        ? "rgba(59, 130, 246, 0.3)"
                        : isHighlighted
                        ? "rgba(59, 130, 246, 0.2)"
                        : getCellBackgroundColor(
                            theme,
                            isValidDay,
                            sunday,
                            saturday,
                            isHovered && isValidDay && !isRangeSelecting,
                            holiday
                          ),
                      cursor: isValidDay ? "pointer" : "default",
                      userSelect: "none",
                    }}
                    onClick={() =>
                      isValidDay && !isRangeSelecting && handleCellClick(monthIndex, day)
                    }
                    onDoubleClick={() =>
                      isValidDay && handleCellDoubleClick(monthIndex, day)
                    }
                    onMouseDown={() =>
                      isValidDay && handleRangeSelectStart(monthIndex, day)
                    }
                    onMouseEnter={() => {
                      if (isValidDay) {
                        setHoveredCell({ month: monthIndex, day });
                        if (isRangeSelecting) {
                          handleRangeSelectMove(monthIndex, day);
                        }
                      }
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                    onDragOver={(e) =>
                      isValidDay && handleDragOver(e, monthIndex, day)
                    }
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      if (!isValidDay) return;
                      if (resizingEvent) {
                        handleResizeDrop(monthIndex, day);
                      } else {
                        handleDrop(e);
                      }
                    }}
                  >
                    {/* 曜日表示 */}
                    {showWeekday && isValidDay && (
                      <span style={styles.weekdayLabel}>
                        {getWeekdayName(monthIndex, day)}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* ドロップインジケーター */}
              {(draggingEvent || resizingEvent) &&
                dragOverCell?.month === monthIndex &&
                dragOverCell.day <= daysInMonth && (
                  <div
                    style={{
                      ...styles.dropIndicator,
                      top: 24 + (dragOverCell.day - 1) * rowHeight,
                      height: rowHeight,
                    }}
                  >
                    <div style={styles.dropIndicatorInner} />
                  </div>
                )}

              {/* イベントバー */}
              <div style={styles.eventBarContainer}>
                {spans.map((span) => {
                  const laneIndex = laneMap.get(span.event.id) || 0;
                  // この月のレーン数に応じた幅（重なりがある場合のみ分割）
                  const laneWidth = 100 / laneCount;
                  const left = laneIndex * laneWidth;

                  const isDraggingThis = draggingEvent?.id === span.event.id;
                  const isResizingThis =
                    resizingEvent?.event.id === span.event.id;

                  let displaySpan = span;
                  if (isResizingThis && resizePreviewSpans) {
                    const previewSpan = resizePreviewSpans.get(monthIndex);
                    if (previewSpan) {
                      displaySpan = previewSpan;
                    } else {
                      return null;
                    }
                  }

                  const displayStartDay = displaySpan.startDay;
                  const displayEndDay = displaySpan.endDay;
                  const top = (displayStartDay - 1) * rowHeight + 2;
                  const height =
                    (displayEndDay - displayStartDay + 1) * rowHeight - 4;
                  const spanDays = displayEndDay - displayStartDay + 1;

                  const isInteractive = !draggingEvent && !resizingEvent;
                  const isHovered = hoveredEventBar === span.event.id;

                  return (
                    <div
                      key={span.event.id}
                      style={{
                        ...styles.eventBar,
                        top,
                        left: `${left}%`,
                        width: `calc(${laneWidth}% - 4px)`,
                        height,
                        backgroundColor: getEventColor(span.event),
                        borderRadius: `${span.isStart ? 4 : 0}px ${span.isStart ? 4 : 0}px ${span.isEnd ? 4 : 0}px ${span.isEnd ? 4 : 0}px`,
                        opacity: isDraggingThis ? 0.3 : 1,
                        border: isResizingThis
                          ? "2px dashed rgba(255, 255, 255, 0.8)"
                          : "none",
                        zIndex: isResizingThis ? 30 : isHovered ? 50 : 10,
                        filter: isHovered ? "brightness(1.1)" : "none",
                        pointerEvents: isInteractive ? "auto" : "none",
                      }}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(
                          e,
                          span.event,
                          monthIndex,
                          span.startDay
                        )
                      }
                      onDragEnd={handleDragEnd}
                      onMouseEnter={(e) => {
                        setHoveredEventBar(span.event.id);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredEvent({
                          event: span.event,
                          x: rect.right + 8,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredEventBar(null);
                        setHoveredEvent(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isTouchDevice) {
                          // モバイル：タップでツールチップ表示
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTappedEvent({
                            event: span.event,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            bottom: rect.bottom,
                          });
                        } else {
                          // PC：直接編集
                          onEventClick?.(span.event);
                        }
                      }}
                    >
                      {/* 前月から続くインジケーター */}
                      {!span.isStart && (
                        <div style={{ ...styles.indicator, ...styles.indicatorTop }}>
                          ▲
                        </div>
                      )}

                      {/* 縦書きタイトル（2日以上） */}
                      {span.isStart && spanDays >= 2 && (
                        <div style={styles.verticalTitle}>
                          <span
                            style={{
                              ...styles.truncate,
                              maxHeight: "100%",
                              padding: "0 2px",
                            }}
                          >
                            {span.event.title}
                          </span>
                        </div>
                      )}

                      {/* 横書きタイトル（1日のみ） */}
                      {span.isStart && spanDays === 1 && (
                        <div style={styles.horizontalTitle}>
                          <span style={styles.truncate}>{span.event.title}</span>
                        </div>
                      )}

                      {/* 翌月へ続くインジケーター */}
                      {!span.isEnd && (
                        <div style={{ ...styles.indicator, ...styles.indicatorBottom }}>
                          ▼
                        </div>
                      )}

                      {/* リサイズハンドル */}
                      {isInteractive && (
                        <>
                          {span.isStart && (
                            <div
                              style={{
                                ...styles.resizeHandle,
                                ...styles.resizeHandleTop,
                                opacity:
                                  hoveredResizeHandle?.eventId === span.event.id &&
                                  hoveredResizeHandle?.edge === "start"
                                    ? 1
                                    : 0,
                              }}
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleResizeStart(e, span.event, "start");
                              }}
                              onDragEnd={handleResizeEnd}
                              onMouseEnter={() =>
                                setHoveredResizeHandle({
                                  eventId: span.event.id,
                                  edge: "start",
                                })
                              }
                              onMouseLeave={() => setHoveredResizeHandle(null)}
                            />
                          )}
                          {span.isEnd && (
                            <div
                              style={{
                                ...styles.resizeHandle,
                                ...styles.resizeHandleBottom,
                                opacity:
                                  hoveredResizeHandle?.eventId === span.event.id &&
                                  hoveredResizeHandle?.edge === "end"
                                    ? 1
                                    : 0,
                              }}
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleResizeStart(e, span.event, "end");
                              }}
                              onDragEnd={handleResizeEnd}
                              onMouseEnter={() =>
                                setHoveredResizeHandle({
                                  eventId: span.event.id,
                                  edge: "end",
                                })
                              }
                              onMouseLeave={() => setHoveredResizeHandle(null)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {/* リサイズで新たに追加される月のプレビュースパン */}
                {resizingEvent &&
                  resizePreviewSpans &&
                  resizePreviewSpans.has(monthIndex) &&
                  !spans.some((s) => s.event.id === resizingEvent.event.id) &&
                  (() => {
                    const previewSpan = resizePreviewSpans.get(monthIndex)!;
                    // 元のイベントがあった月のレーンを取得
                    let originalLaneIndex = 0;
                    for (let m = 0; m < 12; m++) {
                      const lane = laneMaps[m].get(resizingEvent.event.id);
                      if (lane !== undefined) {
                        originalLaneIndex = lane;
                        break;
                      }
                    }
                    // プレビュー月のレーン数を使用
                    const previewLaneCount = maxLanes[monthIndex];
                    const laneWidth = 100 / previewLaneCount;
                    const left = Math.min(originalLaneIndex, previewLaneCount - 1) * laneWidth;
                    const top = (previewSpan.startDay - 1) * rowHeight + 2;
                    const height =
                      (previewSpan.endDay - previewSpan.startDay + 1) *
                        rowHeight -
                      4;

                    return (
                      <div
                        key={`preview-${resizingEvent.event.id}`}
                        style={{
                          ...styles.eventBar,
                          top,
                          left: `${left}%`,
                          width: `calc(${laneWidth}% - 4px)`,
                          height,
                          backgroundColor: getEventColor(resizingEvent.event),
                          borderRadius: `${previewSpan.isStart ? 4 : 0}px ${previewSpan.isStart ? 4 : 0}px ${previewSpan.isEnd ? 4 : 0}px ${previewSpan.isEnd ? 4 : 0}px`,
                          border: "2px dashed rgba(255, 255, 255, 0.8)",
                          opacity: 0.7,
                          zIndex: 30,
                        }}
                      >
                        {!previewSpan.isStart && (
                          <div style={{ ...styles.indicator, ...styles.indicatorTop }}>
                            ▲
                          </div>
                        )}
                        {!previewSpan.isEnd && (
                          <div style={{ ...styles.indicator, ...styles.indicatorBottom }}>
                            ▼
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* ホバーツールチップ（PC用） */}
      {hoveredEvent && !isTouchDevice && !draggingEvent && !resizingEvent && (
        <div
          style={{
            ...styles.tooltip,
            left: hoveredEvent.x,
            top: hoveredEvent.y,
          }}
        >
          <div style={styles.tooltipContent}>
            <div style={styles.tooltipTitle}>{hoveredEvent.event.title}</div>
            {hoveredEvent.event.description && (
              <div style={styles.tooltipDescription}>{hoveredEvent.event.description}</div>
            )}
            <div style={styles.tooltipDate}>
              {hoveredEvent.event.date.toLocaleDateString(isJa ? "ja-JP" : "en-US", {
                month: "short",
                day: "numeric",
                weekday: "short",
              })}
              {hoveredEvent.event.endDate && (
                <>
                  {isJa ? " 〜 " : " - "}
                  {hoveredEvent.event.endDate.toLocaleDateString(isJa ? "ja-JP" : "en-US", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* タップツールチップ（モバイル用） */}
      {tappedEvent && !draggingEvent && !resizingEvent && (() => {
        // 上にスペースが足りない場合は下に表示
        const showBelow = tappedEvent.y < 100;
        return (
        <div
          data-mobile-tooltip
          style={{
            position: "fixed",
            zIndex: 200,
            left: tappedEvent.x,
            top: showBelow ? tappedEvent.bottom : tappedEvent.y,
            transform: showBelow
              ? "translate(-50%, 8px)"
              : "translate(-50%, -100%) translateY(-8px)",
          }}
        >
          <div style={{
            backgroundColor: theme.tooltipBg,
            color: theme.tooltipText,
            fontSize: 12,
            borderRadius: 8,
            padding: "8px 10px",
            whiteSpace: "pre-wrap",
            maxWidth: 280,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}>
            <div style={styles.tooltipTitle}>{tappedEvent.event.title}</div>
            {tappedEvent.event.description && (
              <div style={styles.tooltipDescription}>{tappedEvent.event.description}</div>
            )}
            <div style={styles.tooltipDate}>
              {tappedEvent.event.date.toLocaleDateString(isJa ? "ja-JP" : "en-US", {
                month: "short",
                day: "numeric",
                weekday: "short",
              })}
              {tappedEvent.event.endDate && (
                <>
                  {isJa ? " 〜 " : " - "}
                  {tappedEvent.event.endDate.toLocaleDateString(isJa ? "ja-JP" : "en-US", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </>
              )}
            </div>
            {onEventClick && (
              <button
                data-mobile-tooltip
                onClick={() => {
                  onEventClick(tappedEvent.event);
                  setTappedEvent(null);
                }}
                style={{
                  marginTop: 6,
                  width: "100%",
                  padding: "5px 0",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: theme.buttonPrimary,
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {isJa ? "編集" : "Edit"}
              </button>
            )}
          </div>
        </div>
        );
      })()}

      {/* 移動/リサイズ確認ダイアログ */}
      {pendingMove && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogContent}>
            <h3 style={styles.dialogTitle}>
              {pendingMove.isResize
                ? (isJa ? "期間を変更しますか？" : "Change duration?")
                : (isJa ? "予定を移動しますか？" : "Move event?")}
            </h3>
            <div style={styles.dialogBody}>
              <div style={styles.dialogEventTitle}>{pendingMove.event.title}</div>
              <div style={{ marginTop: 4 }}>
                <span style={styles.dialogDateLabel}>{isJa ? "変更前：" : "From: "}</span>
                {pendingMove.event.date.toLocaleDateString(isJa ? "ja-JP" : "en-US", {
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
                {pendingMove.event.endDate && (
                  <>
                    {isJa ? " 〜 " : " - "}
                    {pendingMove.event.endDate.toLocaleDateString(isJa ? "ja-JP" : "en-US", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </>
                )}
              </div>
              <div style={{ marginTop: 4 }}>
                <span style={styles.dialogDateLabel}>{isJa ? "変更後：" : "To: "}</span>
                {pendingMove.newStartDate.toLocaleDateString(isJa ? "ja-JP" : "en-US", {
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
                {pendingMove.newEndDate && (
                  <>
                    {isJa ? " 〜 " : " - "}
                    {pendingMove.newEndDate.toLocaleDateString(isJa ? "ja-JP" : "en-US", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </>
                )}
              </div>
            </div>
            <div style={styles.dialogButtons}>
              <button
                onClick={handleCancelMove}
                style={{
                  ...styles.dialogCancelButton,
                  backgroundColor: hoveredCancelButton
                    ? theme.bgGray100
                    : "transparent",
                }}
                onMouseEnter={() => setHoveredCancelButton(true)}
                onMouseLeave={() => setHoveredCancelButton(false)}
              >
                {isJa ? "キャンセル" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmMove}
                style={{
                  ...styles.dialogConfirmButton,
                  backgroundColor: hoveredConfirmButton
                    ? theme.buttonPrimaryHover
                    : theme.buttonPrimary,
                }}
                onMouseEnter={() => setHoveredConfirmButton(true)}
                onMouseLeave={() => setHoveredConfirmButton(false)}
              >
                {pendingMove.isResize
                  ? (isJa ? "変更する" : "Change")
                  : (isJa ? "移動する" : "Move")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
