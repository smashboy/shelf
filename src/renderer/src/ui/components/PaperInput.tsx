import { Paper } from "@mui/material";
import type { InputProps } from "./Input";
import Input from "./Input";

export default function PaperInput(props: Omit<InputProps, "fullWidth">) {
  return (
    <Paper>
      <Input fullWidth {...props} />
    </Paper>
  );
}
