import { db } from "@/config/firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDoc
} from "firebase/firestore";

export interface Transaction {
  id?: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'entrada' | 'saida';
}

export const addTransaction = async (data: Transaction) => {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar:", error);
    throw error;
  }
};

export const getTransactions = async () => {
  try {
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    return transactions;
  } catch (error) {
    console.error("Erro ao buscar:", error);
    throw error;
  }
};

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  try {
    const docRef = doc(db, "transactions", id);
    const dataToUpdate: any = { ...data };

    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key] === undefined) {
        delete dataToUpdate[key];
      }
    });

    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    throw error;
  }
};

export const getTransactionById = async (id: string) => {
  try {
    const docRef = doc(db, "transactions", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Transaction;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar transação por ID:", error);
    throw error;
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    await deleteDoc(doc(db, "transactions", id));
  } catch (error) {
    console.error("Erro ao deletar:", error);
    throw error;
  }
};