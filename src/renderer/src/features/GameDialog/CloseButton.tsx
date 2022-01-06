import { MdClose as CloseIcon } from "react-icons/md";
import IconButton from "@/ui/components/IconButton";
import { useGame } from "@/storage/GameStore";

export default function CloseButton() {
  const { close } = useGame();

  return (
    <IconButton onClick={close} sx={{ position: "absolute", top: 10, right: 10, zIndex: 11 }}>
      <CloseIcon />
    </IconButton>
  );
}
