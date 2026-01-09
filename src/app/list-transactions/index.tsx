import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal, Alert
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Plus, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle,
  Filter, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight
} from "lucide-react-native";
import { styles } from "./styles";
import { colors } from "@/theme/colors";
import { db } from "@/config/firebaseConfig";
import {
  collection, query, orderBy, limit, getDocs, startAfter, where, deleteDoc, doc
} from "firebase/firestore";

interface TransactionData {
  id: string;
  titulo: string;
  valor: number;
  data: string;
  type: 'entrada' | 'saida';
  originalDate: string;
}

export default function ListTransactions() {
  const router = useRouter();

  const [data, setData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [isDateModalVisible, setDateModalVisible] = useState(false);
  const [dateFilterLabel, setDateFilterLabel] = useState('Data');
  const [viewDate, setViewDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fetchTransactions = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const transactionsRef = collection(db, "transactions");
      const constraints: any[] = [orderBy("date", "desc"), limit(10)];

      if (activeFilter === 'Entradas') constraints.push(where("type", "==", "entrada"));
      else if (activeFilter === 'Saídas') constraints.push(where("type", "==", "saida"));

      if (isLoadMore && lastVisible) constraints.push(startAfter(lastVisible));

      const q = query(transactionsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } else {
        if (isLoadMore) setLastVisible(null);
      }

      const fetchedData: TransactionData[] = querySnapshot.docs.map(doc => {
        const item = doc.data();
        return {
          id: doc.id,
          titulo: item.title,
          valor: item.amount,
          data: new Date(item.date).toLocaleDateString('pt-BR'),
          originalDate: item.date,
          type: item.type
        };
      });

      let finalData = fetchedData;
      if (startDate) {
        finalData = finalData.filter(item => {
          const itemDate = new Date(item.originalDate);
          itemDate.setHours(0, 0, 0, 0);
          if (endDate) return itemDate >= startDate && itemDate <= endDate;
          return itemDate.getTime() === startDate.getTime();
        });
      }

      setData(prev => isLoadMore ? [...prev, ...finalData] : finalData);
    } catch (error: any) {
      if (error.message.includes("indexes")) {
        Alert.alert("Erro de Índice", "Crie o índice no Firebase console para este filtro.");
      } else {
        Alert.alert("Erro", "Falha ao carregar dados.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLastVisible(null);
      fetchTransactions(false);
    }, [activeFilter, startDate, endDate])
  );

  const loadMoreData = () => {
    if (!loadingMore && lastVisible) fetchTransactions(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Excluir", "Deseja apagar esta transação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "transactions", id));
            setData(prev => prev.filter(item => item.id !== id));
          } catch {
            Alert.alert("Erro", "Falha ao excluir.");
          }
        }
      }
    ]);
  };

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

    for (let i = 0; i < firstDay; i++) days.push(<View key={`empty-${i}`} style={styles.dayEmpty} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month, d);
      currentDate.setHours(0, 0, 0, 0);
      const isStart = startDate && currentDate.getTime() === startDate.getTime();
      const isEnd = endDate && currentDate.getTime() === endDate.getTime();
      const isInRange = startDate && endDate && currentDate > startDate && currentDate < endDate;
      const isSelected = isStart || isEnd;

      days.push(
        <TouchableOpacity
          key={d}
          style={[styles.dayCell, isInRange && styles.dayInRange, isStart && endDate && styles.daySelectedStart, isEnd && styles.daySelectedEnd, isStart && !endDate && styles.daySelectedSingle]}
          onPress={() => handleDayPress(d)}
        >
          <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{d}</Text>
        </TouchableOpacity>
      );
    }
    return <View style={styles.daysGrid}>{days}</View>;
  };

  const applyFilter = () => {
    if (startDate) {
      const startFmt = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      setDateFilterLabel(endDate ? `${startFmt} - ${endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : startFmt);
      setActiveFilter('Data');
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

  const renderItem = ({ item }: { item: TransactionData }) => (
    <View style={styles.card}>
      <View style={{ marginRight: 12 }}>
        {item.valor < 0 ? <ArrowDownCircle color={colors.red[400]} size={24} /> : <ArrowUpCircle color={colors.green[500]} size={24} />}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.data}>{item.data}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.valor, { color: item.valor < 0 ? colors.red[400] : colors.green[500] }]}>
          R$ {Math.abs(item.valor).toFixed(2)}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '/transactions', params: { id: item.id } })}>
          <Pencil size={18} color={colors.blue[400]} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.red[100] }]} onPress={() => handleDelete(item.id)}>
          <Trash2 size={18} color={colors.red[400]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Extrato</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/transactions')}>
          <Plus size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Nova</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          <TouchableOpacity style={[styles.filterChip, activeFilter === 'Todas' && styles.filterChipActive]} onPress={() => setActiveFilter('Todas')}>
            <Filter size={14} color={activeFilter === 'Todas' ? colors.white : colors.gray[500]} />
            <Text style={[styles.filterText, activeFilter === 'Todas' && styles.filterTextActive]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, activeFilter === 'Entradas' && styles.filterChipActive]} onPress={() => setActiveFilter('Entradas')}>
            <ArrowUpCircle size={14} color={activeFilter === 'Entradas' ? colors.white : colors.gray[500]} />
            <Text style={[styles.filterText, activeFilter === 'Entradas' && styles.filterTextActive]}>Entradas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, activeFilter === 'Saídas' && styles.filterChipActive]} onPress={() => setActiveFilter('Saídas')}>
            <ArrowDownCircle size={14} color={activeFilter === 'Saídas' ? colors.white : colors.gray[500]} />
            <Text style={[styles.filterText, activeFilter === 'Saídas' && styles.filterTextActive]}>Saídas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, activeFilter === 'Data' && styles.filterChipActive]} onPress={() => setDateModalVisible(true)}>
            <CalendarIcon size={14} color={activeFilter === 'Data' ? colors.white : colors.gray[500]} />
            <Text style={[styles.filterText, activeFilter === 'Data' && styles.filterTextActive]}>{dateFilterLabel}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.blue[500]} />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: colors.gray[600] }}>Nenhuma transação.</Text>}
          ListFooterComponent={() => loadingMore ? <ActivityIndicator color={colors.blue[500]} style={{ margin: 20 }} /> : null}
        />
      )}

      <Modal visible={isDateModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Período</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}><X size={24} color={colors.gray[500]} /></TouchableOpacity>
            </View>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)}><ChevronLeft size={20} color={colors.black} /></TouchableOpacity>
              <Text style={styles.calMonthName}>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
              <TouchableOpacity onPress={() => changeMonth(1)}><ChevronRight size={20} color={colors.black} /></TouchableOpacity>
            </View>
            <View style={styles.weekDaysContainer}>
              {weekDays.map((day, i) => <Text key={i} style={styles.weekDayText}>{day}</Text>)}
            </View>
            {renderCalendarGrid()}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilter}><Text style={styles.applyButtonText}>Confirmar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilter}><Text style={styles.clearButtonText}>Limpar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}