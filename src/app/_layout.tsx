// app/_layout.tsx ou seu arquivo de layout
import { Navegation } from "@/components/Navegation";
import { Slot } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function Layout() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        <Slot />
      </View>
      <Navegation />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1, // Ocupa a tela inteira
    backgroundColor: '#fff',
  },
  content: {
    flex: 1, // Garante que o Slot ocupe o espaço restante acima da barra
  }
});