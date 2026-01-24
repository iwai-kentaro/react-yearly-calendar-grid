import { CSSProperties } from "react";
import type { ThemeColors } from "./types";

// デフォルトテーマカラー
export const defaultTheme: Required<ThemeColors> = {
  // 背景色
  bgWhite: "#ffffff",
  bgGray50: "#f9fafb",
  bgGray100: "#f3f4f6",
  bgSunday: "#fef2f2",
  bgSaturday: "#eff6ff",
  bgDropHighlight: "rgba(191, 219, 254, 0.5)",

  // ボーダー
  borderDefault: "#d1d5db",
  borderDropHighlight: "#3b82f6",

  // テキスト
  textPrimary: "#111827",
  textSecondary: "#4b5563",
  textMuted: "#6b7280",

  // UI要素
  tooltipBg: "#111827",
  tooltipText: "#ffffff",
  dialogOverlay: "rgba(0, 0, 0, 0.3)",
  buttonPrimary: "#2563eb",
  buttonPrimaryHover: "#1d4ed8",
  floatingDateBg: "#2563eb",
  resizeFloatingBg: "#9333ea",
};

// テーマをマージするヘルパー
export function mergeTheme(custom?: ThemeColors): Required<ThemeColors> {
  if (!custom) return defaultTheme;
  return { ...defaultTheme, ...custom };
}

// スタイル生成関数
export function createStyles(theme: Required<ThemeColors>) {
  return {
    // コンテナ
    container: {
      width: "100%",
      height: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    } as CSSProperties,

    // フレックスコンテナ
    flexContainer: {
      display: "flex",
      width: "100%",
      flex: 1,
    } as CSSProperties,

    // 日付列（左側固定）
    dayColumn: {
      position: "sticky",
      left: 0,
      zIndex: 20,
      backgroundColor: theme.bgGray100,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
    } as CSSProperties,

    // 日付ヘッダーセル
    dayHeaderCell: {
      height: 24,
      border: `1px solid ${theme.borderDefault}`,
      backgroundColor: theme.bgGray100,
      padding: "0 4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 500,
      fontSize: 12,
      width: 32,
    } as CSSProperties,

    // 日付セル
    dayCell: {
      border: `1px solid ${theme.borderDefault}`,
      backgroundColor: theme.bgGray50,
      padding: "0 4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 500,
      fontSize: 12,
      width: 32,
    } as CSSProperties,

    // 月列
    monthColumn: {
      position: "relative",
      flex: 1,
      minWidth: 0,
    } as CSSProperties,

    // 月ヘッダー
    monthHeader: {
      height: 24,
      border: `1px solid ${theme.borderDefault}`,
      backgroundColor: theme.bgGray100,
      padding: "0 4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 500,
      fontSize: 12,
    } as CSSProperties,

    // カレンダーセル（基本）
    calendarCell: {
      border: `1px solid ${theme.borderDefault}`,
      position: "relative",
    } as CSSProperties,

    // イベントバーコンテナ
    eventBarContainer: {
      position: "absolute",
      top: 24,
      left: 0,
      right: "20%",
      padding: "0 2px",
      pointerEvents: "none",
      zIndex: 10,
    } as CSSProperties,

    // イベントバー
    eventBar: {
      position: "absolute",
      cursor: "grab",
      transition: "filter 0.15s, z-index 0.15s",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    } as CSSProperties,

    // ドロップインジケーター
    dropIndicator: {
      position: "absolute",
      left: 0,
      right: 0,
      pointerEvents: "none",
      zIndex: 50,
    } as CSSProperties,

    dropIndicatorInner: {
      height: "100%",
      border: `2px solid ${theme.borderDropHighlight}`,
      backgroundColor: theme.bgDropHighlight,
      borderRadius: 4,
    } as CSSProperties,

    // フローティング日付表示
    floatingDate: {
      position: "fixed",
      zIndex: 100,
      pointerEvents: "none",
      transform: "translateX(-50%)",
    } as CSSProperties,

    floatingDateContent: {
      backgroundColor: theme.floatingDateBg,
      color: theme.tooltipText,
      fontSize: 14,
      fontWeight: 700,
      borderRadius: 8,
      padding: "8px 12px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    } as CSSProperties,

    floatingDateSubtext: {
      fontSize: 12,
      fontWeight: 400,
      opacity: 0.8,
    } as CSSProperties,

    // リサイズ用フローティング表示
    resizeFloatingContent: {
      backgroundColor: theme.resizeFloatingBg,
      color: theme.tooltipText,
      fontSize: 14,
      fontWeight: 700,
      borderRadius: 8,
      padding: "8px 12px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    } as CSSProperties,

    // ツールチップ
    tooltip: {
      position: "fixed",
      zIndex: 200,
      pointerEvents: "none",
    } as CSSProperties,

    tooltipContent: {
      backgroundColor: theme.tooltipBg,
      color: theme.tooltipText,
      fontSize: 12,
      borderRadius: 4,
      padding: "6px 8px",
      whiteSpace: "nowrap",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    } as CSSProperties,

    tooltipTitle: {
      fontWeight: 500,
    } as CSSProperties,

    tooltipDate: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: 10,
      marginTop: 2,
    } as CSSProperties,

    // 確認ダイアログ
    dialogOverlay: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.dialogOverlay,
    } as CSSProperties,

    dialogContent: {
      backgroundColor: theme.bgWhite,
      borderRadius: 8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      padding: 16,
      maxWidth: 384,
      margin: "0 16px",
    } as CSSProperties,

    dialogTitle: {
      fontWeight: 700,
      color: theme.textPrimary,
      marginBottom: 8,
    } as CSSProperties,

    dialogBody: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 16,
    } as CSSProperties,

    dialogEventTitle: {
      fontWeight: 500,
      color: theme.textPrimary,
    } as CSSProperties,

    dialogDateLabel: {
      color: theme.textMuted,
    } as CSSProperties,

    dialogButtons: {
      display: "flex",
      gap: 8,
      justifyContent: "flex-end",
    } as CSSProperties,

    dialogCancelButton: {
      padding: "8px 16px",
      fontSize: 14,
      color: theme.textSecondary,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: 4,
      cursor: "pointer",
    } as CSSProperties,

    dialogConfirmButton: {
      padding: "8px 16px",
      fontSize: 14,
      color: theme.tooltipText,
      backgroundColor: theme.buttonPrimary,
      border: "none",
      borderRadius: 4,
      cursor: "pointer",
    } as CSSProperties,

    // リサイズハンドル
    resizeHandle: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 8,
      cursor: "ns-resize",
      opacity: 0,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    } as CSSProperties,

    resizeHandleTop: {
      top: 0,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    } as CSSProperties,

    resizeHandleBottom: {
      bottom: 0,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
    } as CSSProperties,

    // インジケーター（▲▼）
    indicator: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: 8,
      color: "rgba(255, 255, 255, 0.8)",
    } as CSSProperties,

    indicatorTop: {
      top: -6,
    } as CSSProperties,

    indicatorBottom: {
      bottom: -6,
    } as CSSProperties,

    // 縦書きタイトル
    verticalTitle: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      color: "#ffffff",
      fontWeight: 500,
      overflow: "hidden",
      writingMode: "vertical-rl",
    } as CSSProperties,

    // 横書きタイトル
    horizontalTitle: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 9,
      color: "#ffffff",
      fontWeight: 500,
      overflow: "hidden",
      padding: "0 2px",
    } as CSSProperties,

    truncate: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    } as CSSProperties,
  };
}

// セル背景色を取得
export function getCellBackgroundColor(
  theme: Required<ThemeColors>,
  isValidDay: boolean,
  isSunday: boolean,
  isSaturday: boolean,
  isHovered: boolean
): string {
  if (!isValidDay) return theme.bgGray100;
  if (isHovered) return theme.bgGray50;
  if (isSunday) return theme.bgSunday;
  if (isSaturday) return theme.bgSaturday;
  return theme.bgWhite;
}
