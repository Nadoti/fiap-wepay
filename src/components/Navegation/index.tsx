import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";
import { House, List } from "lucide-react-native";
import { styles } from "./styles";

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
          {isActive && <Text style={styles.activeText}>{label}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

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
        <NavItem route="/list-transactions" Icon={List} label="Extrato" />
      </LinearGradient>
    </View>
  );
}

