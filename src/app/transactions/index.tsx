import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft, Save
} from "lucide-react-native";

import { styles } from "./styles";
import { colors } from "@/theme/colors";
import { addTransaction, updateTransaction, getTransactionById } from "@/services/transactionService";

const CATEGORIES = ["Aluguel", "Salário", "Supermercado", "Lazer", "Transporte", "Saúde", "Outros"];

export default function Transactions() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"entrada" | "saida">("saida");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [errors, setErrors] = useState<{ title?: string, amount?: string, category?: string }>({});

  useEffect(() => {
    if (isEditing) {
      loadTransactionData();
    }
  }, [params.id]);

  const loadTransactionData = async () => {
    if (!params.id) return;

    setFetchingData(true);
    try {
      const data = await getTransactionById(params.id as string);

      if (data) {
        setTitle(data.title);
        setAmount(Math.abs(data.amount).toFixed(2).replace('.', ','));

        if (data.type) {
          setType(data.type);
        } else {
          setType(data.amount < 0 ? 'saida' : 'entrada');
        }

        setCategory(data.category);
      } else {
        Alert.alert("Erro", "Transação não encontrada.");
        router.back();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar dados para edição.");
      router.back();
    } finally {
      setFetchingData(false);
    }
  };

  const validate = () => {
    let isValid = true;
    let newErrors = {};

    if (!title.trim()) {
      newErrors = { ...newErrors, title: "O título é obrigatório" };
      isValid = false;
    }

    const cleanAmount = amount.replace(',', '.');
    if (!amount || isNaN(Number(cleanAmount)) || Number(cleanAmount) <= 0) {
      newErrors = { ...newErrors, amount: "Insira um valor válido maior que zero" };
      isValid = false;
    }

    if (!category) {
      newErrors = { ...newErrors, category: "Selecione uma categoria" };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const valorNumerico = parseFloat(amount.replace(',', '.'));
      const finalAmount = type === 'saida' ? -Math.abs(valorNumerico) : Math.abs(valorNumerico);

      const transactionData = {
        title,
        amount: finalAmount,
        category,
        type,
        ...(isEditing ? {} : { date: new Date().toISOString() }),
      };

      if (isEditing && params.id) {
        await updateTransaction(params.id as string, transactionData);
        Alert.alert("Sucesso", "Transação atualizada!");
      } else {
        await addTransaction({
          ...transactionData,
          date: new Date().toISOString()
        } as any);
        Alert.alert("Sucesso", "Transação criada!");
      }

      router.back();

    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao salvar os dados.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.blue[500]} />
        <Text style={{ marginTop: 10, color: colors.gray[500] }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.blue[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Editar Transação" : "Nova Transação"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'entrada' && styles.typeButtonActive]}
            onPress={() => setType('entrada')}
          >
            <Text style={[styles.typeText, type === 'entrada' && { color: colors.green[500] }]}>Entrada</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'saida' && styles.typeButtonActive]}
            onPress={() => setType('saida')}
          >
            <Text style={[styles.typeText, type === 'saida' && { color: colors.red[400] }]}>Saída</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputError]}
          placeholder="0,00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder="Ex: Aluguel, Salário..."
          value={title}
          onChangeText={setTitle}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Save size={20} color={colors.white} />
              <Text style={styles.submitText}>
                {isEditing ? "Atualizar" : "Salvar Transação"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}