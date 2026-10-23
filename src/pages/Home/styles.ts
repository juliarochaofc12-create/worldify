import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d5baba",
  },

  containerEscuro: {
    backgroundColor: "#121212",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  logo: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  tituloEscuro: {
    color: "#f5f5f5",
  },

  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },

  textoEscuro: {
    color: "#cccccc",
  },
});
