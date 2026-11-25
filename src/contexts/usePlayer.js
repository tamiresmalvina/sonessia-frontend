import { useContext } from "react";
import { PlayerContext } from "./PlayerContextInstance.js";

export function usePlayer() {
  const contexto = useContext(PlayerContext);
  if (!contexto) {
    throw new Error("usePlayer deve ser utilizado dentro de um PlayerProvider.");
  }
  return contexto;
}
