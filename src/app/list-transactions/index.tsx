import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal, Alert
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Plus, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle,
  Filter, Calendar as CalendarIcon, Tag, X, ChevronLeft, ChevronRight
} from "lucide-react-native";
import { styles } from "./styles";
import { colors } from "@/theme/colors";

// --- FIREBASE IMPORTS ---
import { db } from "@/config/firebaseConfig";
import {
  collection, query, orderBy, limit, getDocs, startAfter, where, deleteDoc, doc
} from "firebase/firestore";

// Tipagem dos dados vindos do Firebase
interface TransactionData {
  id: string;
  titulo: string; // Mapeado de 'title'
  valor: number;  // Mapeado de 'amount'
  data: string;   // Mapeado de 'date'
  type: 'entrada' | 'saida';
  originalDate: string; // Para ordenação
}

export default function ListTransactions() {
  const router = useRouter();

  // --- ESTADOS DE DADOS ---
  const [data, setData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true); // Loading inicial
  const [loadingMore, setLoadingMore] = useState(false); // Loading do scroll
  const [lastVisible, setLastVisible] = useState<any>(null); // Cursor para paginação do Firebase

  // --- ESTADOS DE FILTRO ---
  const [activeFilter, setActiveFilter] = useState('Todas');

  // --- ESTADOS DO MODAL DE DATA ---
  const [isDateModalVisible, setDateModalVisible] = useState(false);
  const [dateFilterLabel, setDateFilterLabel] = useState('Data');

  // --- ESTADOS DO CALENDÁRIO CUSTOMIZADO ---
  const [viewDate, setViewDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // ============================================================================
  // LÓGICA DE BUSCA NO FIREBASE
  // ============================================================================

  const fetchTransactions = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const transactionsRef = collection(db, "transactions");

      // Array de restrições da query
      const constraints: any[] = [
        orderBy("date", "desc"),
        limit(10)
      ];

      // Aplica o filtro BEFORE do orderBy se possível, mas no Firestore v9 modular
      // a ordem dentro do array não quebra, mas precisamos do INDICE.
      if (activeFilter === 'Entradas') {
        // Atenção: Certifique-se que no banco está salvo como 'entrada' (minúsculo)
        constraints.push(where("type", "==", "entrada"));
      } else if (activeFilter === 'Saídas') {
        constraints.push(where("type", "==", "saida"));
      }

      // Se for paginação, adiciona o startAfter
      if (isLoadMore && lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      // Cria a query final espalhando as restrições
      const q = query(transactionsRef, ...constraints);

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } else {
        if (isLoadMore) setLastVisible(null);
      }

      const fetchedData: TransactionData[] = querySnapshot.docs.map(doc => {
        const item = doc.data();
        const dateObj = new Date(item.date);
        const dateFormatted = dateObj.toLocaleDateString('pt-BR');

        return {
          id: doc.id,
          titulo: item.title,
          valor: item.amount,
          data: dateFormatted,
          originalDate: item.date,
          type: item.type
        };
      });

      // --- FILTRAGEM LOCAL DE DATA (MANTIDA) ---
      let finalData = fetchedData;
      if (startDate) {
        finalData = finalData.filter(item => {
          const itemDate = new Date(item.originalDate);
          itemDate.setHours(0, 0, 0, 0);

          if (endDate) {
            return itemDate >= startDate && itemDate <= endDate;
          }
          return itemDate.getTime() === startDate.getTime();
        });
      }

      if (isLoadMore) {
        setData(prev => [...prev, ...finalData]);
      } else {
        setData(finalData);
      }

    } catch (error: any) {
      console.error("Erro detalhado:", error);

      // DICA DE OURO: O erro do Firebase contém o link para criar o índice
      if (error.message.includes("indexes")) {
        Alert.alert(
          "Erro de Configuração",
          "Falta criar um índice no Firebase. Olhe o terminal (console) para pegar o link."
        );
      } else {
        Alert.alert("Erro", "Não foi possível carregar o extrato.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Recarregar quando a tela ganha foco (Voltou da edição/criação)
  useFocusEffect(
    useCallback(() => {
      // Reseta paginação e recarrega
      setLastVisible(null);
      fetchTransactions(false);
    }, [activeFilter, startDate, endDate]) // Recarrega se mudar filtro ou datas
  );

  // Função para carregar mais (Scroll Infinito)
  const loadMoreData = () => {
    if (!loadingMore && lastVisible) {
      fetchTransactions(true);
    }
  };

  // Função para Excluir
  const handleDelete = (id: string) => {
    Alert.alert("Excluir", "Tem certeza que deseja apagar esta transação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "transactions", id));
            // Remove da lista localmente para não precisar recarregar tudo
            setData(prev => prev.filter(item => item.id !== id));
          } catch (error) {
            Alert.alert("Erro", "Falha ao excluir.");
          }
        }
      }
    ]);
  };

  // ============================================================================
  // LÓGICA DO CALENDÁRIO (MANTIDA)
  // ============================================================================
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  const changeMonth = (increment: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setViewDate(newDate);
  };

  const handleDayPress = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    selected.setHours(0, 0, 0, 0);

    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
    } else {
      if (selected < startDate) {
        setEndDate(startDate);
        setStartDate(selected);
      } else {
        setEndDate(selected);
      }
    }
  };

  const renderCalendarGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayEmpty} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month, d);
      currentDate.setHours(0, 0, 0, 0);
      const isStart = startDate && currentDate.getTime() === startDate.getTime();
      const isEnd = endDate && currentDate.getTime() === endDate.getTime();
      const isInRange = startDate && endDate && currentDate > startDate && currentDate < endDate;
      const isSelected = isStart || isEnd;

      let cellStyle: any = [styles.dayCell];
      let textStyle: any = [styles.dayText];

      if (isInRange) cellStyle.push(styles.dayInRange);
      if (isStart && endDate) cellStyle.push(styles.daySelectedStart);
      else if (isEnd) cellStyle.push(styles.daySelectedEnd);
      else if (isStart && !endDate) cellStyle.push(styles.daySelectedSingle);
      if (isSelected) textStyle.push(styles.dayTextSelected);

      days.push(
        <TouchableOpacity
          key={d}
          style={cellStyle}
          onPress={() => handleDayPress(d)}
          activeOpacity={0.7}
        >
          <Text style={textStyle}>{d}</Text>
        </TouchableOpacity>
      );
    }
    return <View style={styles.daysGrid}>{days}</View>;
  };

  const applyFilter = () => {
    if (startDate) {
      const startFmt = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (endDate) {
        const endFmt = endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        setDateFilterLabel(`${startFmt} - ${endFmt}`);
      } else {
        setDateFilterLabel(startFmt);
      }
      setActiveFilter('Data');
      // A chamada do useFocusEffect cuidará de recarregar os dados
    }
    setDateModalVisible(false);
  };

  const clearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setDateFilterLabel('Data');
    if (activeFilter === 'Data') setActiveFilter('Todas');
    setDateModalVisible(false);
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  const renderItem = ({ item }: { item: TransactionData }) => {
    const isNegative = item.valor < 0;

    return (
      <View style={styles.card}>
        <View style={{ marginRight: 12 }}>
          {isNegative ? <ArrowDownCircle color="#E74C3C" size={24} /> : <ArrowUpCircle color="#27AE60" size={24} />}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.data}>{item.data}</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={[styles.valor, { color: isNegative ? '#E74C3C' : '#27AE60' }]}>
            R$ {Math.abs(item.valor).toFixed(2)}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({ pathname: '/transactions', params: { id: item.id } })}
          >
            <Pencil size={18} color={colors.blue[400]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FDECEA' }]}
            onPress={() => handleDelete(item.id)}
          >
            <Trash2 size={18} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFilterItem = (label: string, Icon: any, displayLabel?: string) => {
    const isActive = activeFilter === label || (label === 'Data' && activeFilter === 'Data');
    return (
      <TouchableOpacity
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => label === 'Data' ? setDateModalVisible(true) : setActiveFilter(label)}
      >
        <Icon size={14} color={isActive ? colors.white : '#666'} />
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{displayLabel || label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Extrato</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/transactions')}>
          <Plus size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Nova</Text>
        </TouchableOpacity>
      </View>

      {/* FILTROS */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {renderFilterItem('Todas', Filter)}
          {renderFilterItem('Entradas', ArrowUpCircle)}
          {renderFilterItem('Saídas', ArrowDownCircle)}
          {renderFilterItem('Data', CalendarIcon, dateFilterLabel)}
          {renderFilterItem('Categoria', Tag)}
        </ScrollView>
      </View>

      {/* LISTA */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.blue[500]} />
          <Text style={{ marginTop: 10, color: '#666' }}>Carregando extrato...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: '#999' }}>Nenhuma transação encontrada.</Text>
            </View>
          }
          ListFooterComponent={() => loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.blue[500]} />
            </View>
          ) : null}
        />
      )}

      {/* MODAL DE CALENDÁRIO */}
      <Modal
        visible={isDateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o período</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.calHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calNavBtn}>
                <ChevronLeft size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.calMonthName}>
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calNavBtn}>
                <ChevronRight size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {weekDays.map((day, index) => (
                <Text key={index} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>

            {renderCalendarGrid()}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
                <Text style={styles.applyButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilter}>
                <Text style={styles.clearButtonText}>Limpar seleção</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}