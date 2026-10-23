import React from "react";
import { Switch, Text, View } from "react-native";

import { styles } from "./styles";

type LinhaOpcaoProps = {
  escuro?: boolean;
  texto: string;
  valor: boolean;
  aoAlterar?: (value: boolean) => void;
};

export default function LinhaOpcao({
  escuro = false,
  texto,
  valor,
  aoAlterar,
}: LinhaOpcaoProps) {
  return (
    <View style={[styles.optionRow, escuro && styles.optionRowEscuro]}>
      <Text style={[styles.optionLabel, escuro && styles.optionLabelEscuro]}>
        {texto}
      </Text>

      <Switch value={valor} onValueChange={aoAlterar} />
    </View>
  );
}
