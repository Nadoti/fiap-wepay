import { colors } from "@/theme/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 40,
    gap: 10,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  navButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    height: 45,
    paddingHorizontal: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  activeCircle: {
    backgroundColor: colors.white,
  },
  activeText: {
    color: colors.blue[500],
    fontWeight: "bold",
    fontSize: 14,
  },
});