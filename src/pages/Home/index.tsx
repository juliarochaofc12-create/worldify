import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

import { styles } from "./styles";

type HomeProps = {
  escuro?: boolean;
};

export default function Home({ escuro = false }: HomeProps) {
  const [quantidade, setQuantidade] = useState(1);

  return (
    <ScrollView
      style={[styles.container, escuro && styles.containerEscuro]}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity
        onPress={() => setQuantidade((valorAtual) => Math.max(1, valorAtual + 1))}
      >
        <Text>{quantidade}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
