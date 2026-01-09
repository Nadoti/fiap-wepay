import React, { useState, useCallback } from "react";
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { colors } from "@/theme/colors";

import { BarChart } from "react-native-chart-kit";

import { db } from "@/config/firebaseConfig";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { styles } from "./styles";

interface TransactionData {
  id: string;
  titulo: string;
  valor: number;
  data: string;
}

const screenWidth = Dimensions.get("window").width;

const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
};

export default function Index() {
  const router = useRouter();

  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const transactionsRef = collection(db, "transactions");
      const q = query(transactionsRef, orderBy("date", "desc"), limit(50));
      const querySnapshot = await getDocs(q);

      let somaTotal = 0;
      const transactions: TransactionData[] = [];
      const dailyMap: { [key: string]: number } = {};

      querySnapshot.forEach((doc) => {
        const item = doc.data();
        const valor = Number(item.amount);

        somaTotal += valor;

        const dateObj = new Date(item.date);
        const dateKey = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        transactions.push({
          id: doc.id,
          titulo: item.title,
          valor: valor,
          data: dateObj.toLocaleDateString('pt-BR'),
        });

        if (dailyMap[dateKey]) {
          dailyMap[dateKey] += Math.abs(valor);
        } else {
          dailyMap[dateKey] = Math.abs(valor);
        }
      });

      setTotalBalance(somaTotal);
      setRecentTransactions(transactions.slice(0, 3));

      const last7Days = getLast7Days();
      const chartLabels: string[] = [];
      const chartValues: number[] = [];

      last7Days.forEach((date) => {
        const key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        chartLabels.push(key);
        chartValues.push(dailyMap[key] || 0);
      });
      console.log('2212121', chartValues)
      setChartData({
        labels: chartLabels,
        datasets: [{ data: chartValues }]
      });

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const renderItem = ({ item }: { item: TransactionData }) => {
    return (
      <View style={styles.item}>
        <View>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.data}>{item.data}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.valor, { color: item.valor < 0 ? colors.red[400] : colors.green[500] }]}>
            R$ {Math.abs(item.valor).toFixed(2)}
          </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/transactions', params: { id: item.id } })}>
            <Text style={{ color: colors.blue[500], fontSize: 12, marginTop: 4 }}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>

      <LinearGradient colors={[colors.blue[500], colors.blue[800]]} style={styles.container}>

        <View style={styles.billingContent}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.textMoney}>
              R$ {totalBalance.toFixed(2).replace('.', ',')}
            </Text>
          )}
          <Text style={styles.billingTotal}>Saldo atual</Text>
        </View>

        <View style={{ marginTop: 25, alignItems: 'center' }}>
          {!loading && chartData && (
            <BarChart
              data={chartData}
              width={screenWidth - 20}
              height={200}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero={true}
              withInnerLines={false}
              showBarTops={false}
              withHorizontalLabels={false}
              showValuesOnTopOfBars={true}
              chartConfig={{
                backgroundGradientFrom: colors.blue[200],
                backgroundGradientFromOpacity: 0.4,
                backgroundGradientTo: colors.blue[200],
                backgroundGradientToOpacity: 0.4,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                barPercentage: 0.7,

                propsForLabels: {
                  fontSize: 10,
                  fontWeight: "bold"
                },
                fillShadowGradient: colors.white,
                fillShadowGradientOpacity: 1,
              }}
              style={{
                borderRadius: 16,
                paddingRight: 0,
              }}
            />
          )}
        </View>

      </LinearGradient>

      <View style={{ flex: 1 }}>
        <View style={styles.contentTransactions}>
          <Text style={styles.textTransaction}>Transações recentes</Text>
          <TouchableOpacity onPress={() => router.push('/list-transactions')}>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color={colors.blue[500]} />
        ) : (
          <FlatList
            data={recentTransactions}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}