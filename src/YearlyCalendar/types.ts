export interface CalendarEvent {
  id: string;
  date: Date;
  endDate?: Date; // 複数日イベントの終了日
  title: string;
  description?: string;
  color?: string;
  category?: string;
}

export interface Holiday {
  date: Date;
  name: string;
}

// テーマカラー設定
export interface ThemeColors {
  // 背景色
  bgWhite?: string;
  bgGray50?: string;
  bgGray100?: string;
  bgSunday?: string;      // 日曜日の背景色
  bgSaturday?: string;    // 土曜日の背景色
  bgHoliday?: string;     // 祝日の背景色
  bgDropHighlight?: string; // ドロップ先ハイライト

  // ボーダー
  borderDefault?: string;
  borderDropHighlight?: string;

  // テキスト
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;

  // UI要素
  tooltipBg?: string;
  tooltipText?: string;
  dialogOverlay?: string;
  buttonPrimary?: string;
  buttonPrimaryHover?: string;
  floatingDateBg?: string;
  resizeFloatingBg?: string;
}

export interface YearlyCalendarProps {
  year: number;
  events?: CalendarEvent[];
  holidays?: Holiday[];
  onDateClick?: (date: Date, events: CalendarEvent[]) => void;
  onDateDoubleClick?: (date: Date, events: CalendarEvent[]) => void;
  onDateRangeSelect?: (startDate: Date, endDate: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMove?: (event: CalendarEvent, newStartDate: Date, newEndDate: Date | undefined) => void;
  highlightRange?: { start: Date; end: Date } | null;
  categoryColors?: Record<string, string>;
  theme?: ThemeColors;
  locale?: string;
  showWeekday?: boolean; // 各セルの右上に曜日を表示
}

export interface DayCellProps {
  date: Date | null;
  events: CalendarEvent[];
  isWeekend: boolean;
  onDateClick?: (date: Date, events: CalendarEvent[]) => void;
  onEventClick?: (event: CalendarEvent) => void;
}
