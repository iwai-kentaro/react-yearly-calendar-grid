# react-yearly-calendar-grid

年間カレンダーを表示するReactコンポーネント。ドラッグ&ドロップでイベントの移動・リサイズが可能。

## インストール

```bash
npm install react-yearly-calendar-grid
```

## 基本的な使い方

```tsx
import { YearlyCalendar, CalendarEvent } from 'react-yearly-calendar-grid';

const events: CalendarEvent[] = [
  {
    id: '1',
    date: new Date(2026, 0, 15),
    title: '会議',
    category: 'work',
  },
  {
    id: '2',
    date: new Date(2026, 1, 10),
    endDate: new Date(2026, 1, 14),
    title: '出張',
    category: 'travel',
  },
];

const categoryColors = {
  work: '#2563eb',
  travel: '#16a34a',
};

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <YearlyCalendar
        year={2026}
        events={events}
        categoryColors={categoryColors}
        onEventClick={(event) => console.log('Clicked:', event)}
        onDateClick={(date, events) => console.log('Date:', date, events)}
        onEventMove={(event, newStart, newEnd) => {
          console.log('Moved:', event.title, 'to', newStart);
        }}
      />
    </div>
  );
}
```

## Props

| Prop | 型 | 必須 | 説明 |
|------|-----|------|------|
| `year` | `number` | ○ | 表示する年 |
| `events` | `CalendarEvent[]` | - | イベント配列 |
| `categoryColors` | `Record<string, string>` | - | カテゴリごとの色 |
| `theme` | `ThemeColors` | - | テーマカラー設定 |
| `onDateClick` | `(date: Date, events: CalendarEvent[]) => void` | - | 日付クリック時 |
| `onEventClick` | `(event: CalendarEvent) => void` | - | イベントクリック時 |
| `onEventMove` | `(event, newStartDate, newEndDate) => void` | - | イベント移動/リサイズ時 |

## CalendarEvent

```ts
interface CalendarEvent {
  id: string;          // 一意のID
  date: Date;          // 開始日
  endDate?: Date;      // 終了日（複数日イベントの場合）
  title: string;       // タイトル
  color?: string;      // 個別の色（categoryColorsより優先）
  category?: string;   // カテゴリ（categoryColorsで色を指定）
}
```

## 機能

### ドラッグ&ドロップ
イベントをドラッグして別の日に移動できます。複数日イベントは期間を維持したまま移動します。

### リサイズ
複数日イベントの上端/下端をドラッグして期間を伸縮できます。

### 月またぎ表示
複数月にまたがるイベントは各月に連続して表示されます。

## テーマカスタマイズ

```tsx
<YearlyCalendar
  year={2026}
  events={events}
  theme={{
    bgSunday: '#ffe4e6',       // 日曜日の背景色
    bgSaturday: '#e0f2fe',     // 土曜日の背景色
    buttonPrimary: '#059669',  // ボタン色
    tooltipBg: '#1f2937',      // ツールチップ背景
  }}
/>
```

### ThemeColors

| プロパティ | 説明 | デフォルト |
|-----------|------|-----------|
| `bgWhite` | 通常セル背景 | `#ffffff` |
| `bgGray50` | ホバー時背景 | `#f9fafb` |
| `bgGray100` | ヘッダー背景 | `#f3f4f6` |
| `bgSunday` | 日曜日背景 | `#fef2f2` |
| `bgSaturday` | 土曜日背景 | `#eff6ff` |
| `bgDropHighlight` | ドロップ先ハイライト | `rgba(191, 219, 254, 0.5)` |
| `borderDefault` | ボーダー色 | `#d1d5db` |
| `borderDropHighlight` | ドロップ先ボーダー | `#3b82f6` |
| `textPrimary` | メインテキスト | `#111827` |
| `textSecondary` | サブテキスト | `#4b5563` |
| `textMuted` | 薄いテキスト | `#6b7280` |
| `tooltipBg` | ツールチップ背景 | `#111827` |
| `tooltipText` | ツールチップ文字 | `#ffffff` |
| `buttonPrimary` | ボタン背景 | `#2563eb` |
| `buttonPrimaryHover` | ボタンホバー | `#1d4ed8` |
| `floatingDateBg` | ドラッグ中日付表示 | `#2563eb` |
| `resizeFloatingBg` | リサイズ中日付表示 | `#9333ea` |

## イベント移動の実装例

```tsx
import { useState, useCallback } from 'react';
import { YearlyCalendar, CalendarEvent } from 'react-yearly-calendar-grid';

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', date: new Date(2026, 0, 15), title: '予定1' },
  ]);

  const handleEventMove = useCallback(
    (event: CalendarEvent, newStartDate: Date, newEndDate: Date | undefined) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, date: newStartDate, endDate: newEndDate }
            : e
        )
      );
    },
    []
  );

  return (
    <YearlyCalendar
      year={2026}
      events={events}
      onEventMove={handleEventMove}
    />
  );
}
```

## 注意点

- コンテナに高さを指定してください（`height: 100vh` など）
- カレンダーは親要素いっぱいに広がります
- 依存ライブラリなし（React/ReactDOM のみ peerDependency）

## License

MIT
