import { OutlinedInput as MUIInput, OutlinedInputProps as MUIInputProps } from "@mui/material";

export interface InputProps extends MUIInputProps {}

export default function Input(props: InputProps) {
  return <MUIInput {...props} />;
}
