import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { useRouter, usePathname } from "expo-router"; // Importamos o usePathname
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";
import { House, List, BanknoteArrowUp } from "lucide-react-native"; // Adicionei mais ícones

export function Navegation() {
  const router = useRouter();
  const pathname = usePathname();

  const NavItem = ({ route, Icon, label }: { route: string, Icon: any, label: string }) => {
    const isActive = pathname === route;

    return (
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push(route)}
        activeOpacity={0.7}
      >
        <View style={[styles.circle, isActive && styles.activeCircle]}>
          <Icon
            size={20}
            color={isActive ? colors.blue[500] : colors.white}
          />
          {isActive && (
            <Text style={styles.activeText}>{label}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  console.log('pathname', pathname)
  if (pathname === '/transactions') {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[colors.blue[400], colors.blue[800]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <NavItem route="/" Icon={House} label="Home" />
        <NavItem route="/list-transactions" Icon={List} label="Transações" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
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
    shadowColor: "#000",
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
    color: colors.blue[500], // Texto na cor do tema
    fontWeight: "bold",
    fontSize: 14,
  },
});