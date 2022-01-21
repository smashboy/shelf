import { styled } from "@mui/material";

const Bar = styled("div")(() => ({
  backgroundColor: "#0d0d0d",
  "-webkit-app-region": "drag",
  width: "100%",
  position: "sticky",
  zIndex: 100000000000000,
  height: "env(titlebar-area-height, var(--fallback-title-bar-height))",
}));

export default function Titlebar() {
  return <Bar />;
}
