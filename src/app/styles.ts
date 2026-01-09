import { colors } from "@/theme/colors";
import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
  container: {
    height: 450,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    marginBottom: 20,
    paddingTop: 60,
  },
  billingContent: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40
  },
  textMoney: {
    fontSize: 40,
    color: colors.white,
    fontWeight: 'bold',
  },
  billingTotal: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8
  },
  contentTransactions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  textTransaction: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.black
  },
  seeAllText: {
    fontSize: 14,
    color: colors.blue[500],
    fontWeight: "600"
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: colors.gray[100]
  },
  titulo: { fontWeight: 'bold', fontSize: 16, color: colors.black },
  valor: { fontSize: 16, fontWeight: 'bold' },
  data: { color: colors.gray[600], fontSize: 12, marginTop: 4 },
});