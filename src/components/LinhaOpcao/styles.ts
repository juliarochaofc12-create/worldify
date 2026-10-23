import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  optionRowEscuro: {
    borderBottomColor: "#2a2a2a",
  },

  optionLabel: {
    fontSize: 15,
  },

  optionLabelEscuro: {
    color: "#f5f5f5",
  },
});
