import React, { useState, useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { colors } from "@/theme/colors";

// --- IMPORTS DO GRÁFICO ---
import { BarChart } from "react-native-chart-kit";

// --- FIREBASE IMPORTS ---
import { db } from "@/config/firebaseConfig";
import { collection, query, orderBy, getDocs, limit, where } from "firebase/firestore";

interface TransactionData {
  id: string;
  titulo: string;
  valor: number;
  data: string;
}

const screenWidth = Dimensions.get("window").width;

// Função auxiliar para pegar os últimos 7 dias
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

  // Estados
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estado do Gráfico (Inicializado com placeholder)
  const [chartData, setChartData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const transactionsRef = collection(db, "transactions");
      // Buscamos as ultimas 50 para garantir que cobrimos a semana
      const q = query(transactionsRef, orderBy("date", "desc"), limit(50));
      const querySnapshot = await getDocs(q);

      let somaTotal = 0;
      const transactions: TransactionData[] = [];
      const dailyMap: { [key: string]: number } = {};

      querySnapshot.forEach((doc) => {
        const item = doc.data();
        const valor = Number(item.amount);

        // 1. Somar ao Saldo Total (Considera positivo e negativo)
        somaTotal += valor;

        const dateObj = new Date(item.date);
        // Chave para agrupar: "07/01"
        const dateKey = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        // 2. Prepara lista de transações recentes (Lista de baixo)
        transactions.push({
          id: doc.id,
          titulo: item.title,
          valor: valor,
          data: dateObj.toLocaleDateString('pt-BR'),
        });

        // 3. Agrupa valores por Data para o Gráfico
        // Nota: Para gráfico de barras de "gastos/movimentação", geralmente usamos valor absoluto (Math.abs)
        // ou somamos tudo. Aqui vou somar os valores absolutos para mostrar "intensidade" de uso.
        if (dailyMap[dateKey]) {
          dailyMap[dateKey] += Math.abs(valor);
        } else {
          dailyMap[dateKey] = Math.abs(valor);
        }
      });

      setTotalBalance(somaTotal);
      setRecentTransactions(transactions.slice(0, 3)); // Pega as 3 mais recentes

      // --- LÓGICA REFINADA DO GRÁFICO (Últimos 7 dias contínuos) ---
      const last7Days = getLast7Days();
      const chartLabels: string[] = [];
      const chartValues: number[] = [];

      last7Days.forEach((date) => {
        const key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        chartLabels.push(key); // Ex: "01/01"
        // Se tiver valor no mapa, usa. Se não, é 0.
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

  // RenderItem movido para dentro
  const renderItem = ({ item }: { item: TransactionData }) => {
    return (
      <View style={styles.item}>
        <View>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.data}>{item.data}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.valor, { color: item.valor < 0 ? '#E74C3C' : '#27AE60' }]}>
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
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>

      {/* Header com Gradiente + Gráfico */}
      <LinearGradient colors={[colors.blue[500], colors.blue[800]]} style={styles.container}>

        {/* Saldo Principal */}
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

        {/* --- GRÁFICO AQUI --- */}
        <View style={{ marginTop: 25, alignItems: 'center' }}>
          {!loading && chartData && (
            <BarChart
              data={chartData}
              width={screenWidth - 20}
              height={200}
              yAxisLabel="DD" // Removi R$ do eixo Y para limpar, já que as barras são pequenas
              yAxisSuffix="ss"
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
                // decimalPlaces: 0,
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

      {/* Lista de Transações */}
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

const styles = StyleSheet.create({
  container: {
    height: 450, // Altura ajustada
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
    color: '#333'
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
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  titulo: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  valor: { fontSize: 16, fontWeight: 'bold' },
  data: { color: '#999', fontSize: 12, marginTop: 4 },
});