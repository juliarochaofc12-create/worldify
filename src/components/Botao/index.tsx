import React from "react";
import { Text, TouchableOpacity } from "react-native";

import { styles } from "./styles";

type BotaoProps = {
  texto: string;
  aoPressionar?: () => void;
};

export default function Botao({ texto, aoPressionar }: BotaoProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={aoPressionar}>
      <Text style={styles.buttonText}>{texto}</Text>
    </TouchableOpacity>
  );
}
