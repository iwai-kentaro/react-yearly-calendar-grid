export interface CalendarEvent {
  id: string;
  date: Date;
  endDate?: Date; // 複数日イベントの終了日
  title: string;
  color?: string;
  category?: string;
}

// テーマカラー設定
export interface ThemeColors {
  // 背景色
  bgWhite?: string;
  bgGray50?: string;
  bgGray100?: string;
  bgSunday?: string;      // 日曜日の背景色
  bgSaturday?: string;    // 土曜日の背景色
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
  onDateClick?: (date: Date, events: CalendarEvent[]) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMove?: (event: CalendarEvent, newStartDate: Date, newEndDate: Date | undefined) => void;
  categoryColors?: Record<string, string>;
  theme?: ThemeColors;
  locale?: string;
}

export interface DayCellProps {
  date: Date | null;
  events: CalendarEvent[];
  isWeekend: boolean;
  onDateClick?: (date: Date, events: CalendarEvent[]) => void;
  onEventClick?: (event: CalendarEvent) => void;
}
