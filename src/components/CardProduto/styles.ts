import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },

  cardEscuro: {
    backgroundColor: "#1e1e1e",
  },

  image: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
  },

  textoEscuro: {
    color: "#f5f5f5",
  },

  price: {
    fontSize: 14,
    color: "#2563eb",
    marginBottom: 10,
  },

  button: {
    height: 40,
    minWidth: 140,
    backgroundColor: "#2563eb",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
