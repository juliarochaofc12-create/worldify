import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { styles } from "./styles";

type CardProdutoProps = {
  escuro?: boolean;
  imagem?: unknown;
  nome: string;
  preco: string;
};

export default function CardProduto({
  escuro = false,
  imagem,
  nome,
  preco,
}: CardProdutoProps) {
  return (
    <View style={[styles.card, escuro && styles.cardEscuro]}>
      <Image source={imagem as never} style={styles.image} />

      <Text style={[styles.name, escuro && styles.textoEscuro]}>{nome}</Text>

      <Text style={styles.price}>{preco}</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Ver detalhes</Text>
      </TouchableOpacity>
    </View>
  );
}
