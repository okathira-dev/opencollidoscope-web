import { createTheme } from "@mui/material/styles";

// Collidoscopeの雰囲気に合わせたカスタムテーマを定義
const theme = createTheme({
  palette: {
    primary: {
      main: "#FF003C", // 赤系のメインカラー (Wave 1)
    },
    secondary: {
      main: "#FFCC00", // 黄系のセカンダリカラー (Wave 2)
    },
    background: {
      default: "#1A1A1A", // 暗い背景色
      paper: "#2C2C2C", // カードなどの背景色
    },
    text: {
      primary: "#FFFFFF", // 白いテキスト
      secondary: "#B0B0B0", // 薄いテキスト
    },
  },
  typography: {
    fontFamily: '"Roboto Mono", monospace', // モノスペースフォントを優先
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#FFFFFF",
    },
    h6: {
      fontSize: "1.2rem",
      fontWeight: 500,
      color: "#FFFFFF",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // ボタンのテキストを大文字にしない
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          // ノブのスタイルをカスタマイズ
          backgroundColor: "#FFFFFF",
          border: "2px solid currentColor",
          "&:hover, &.Mui-focusVisible": {
            boxShadow: "0px 0px 0px 8px rgba(255, 255, 255, 0.16)",
          },
          "&.Mui-active": {
            boxShadow: "0px 0px 0px 14px rgba(255, 255, 255, 0.16)",
          },
        },
        track: {
          backgroundColor: "#FF003C", // トラックの色をメインカラーに
        },
        rail: {
          backgroundColor: "#B0B0B0", // レールの色
        },
      },
    },
  },
});

export default theme;
