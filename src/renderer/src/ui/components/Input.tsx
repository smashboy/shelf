import { OutlinedInput as MUIInput, OutlinedInputProps as MUIInputProps } from "@mui/material";

interface InputProps extends MUIInputProps {}

export default function Input(props: InputProps) {
  return <MUIInput {...props} />;
}
