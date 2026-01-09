import { db } from "@/config/firebaseConfig"; // Removido 'storage'
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

// Tipagem da Transação (Sem receiptUrl)
export interface Transaction {
  id?: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'entrada' | 'saida';
}

// 1. Salvar Transação (Create)
// Removido o argumento 'localImageUri'
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

// 2. Buscar Transações (Read)
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

// 3. Atualizar (Update)
// Removido o argumento 'newImageUri'
export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  try {
    const docRef = doc(db, "transactions", id);
    
    // Cria uma cópia dos dados para podermos modificar com segurança
    const dataToUpdate: any = { ...data };

    // Removemos qualquer chave que esteja como 'undefined' antes de enviar ao Firebase
    // Isso evita o erro "Unsupported field value: undefined"
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

// 4. Buscar por ID
export const getTransactionById = async (id: string) => {
  try {
    const docRef = doc(db, "transactions", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Transaction;
    } else {
      console.log("Documento não encontrado!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar transação por ID:", error);
    throw error;
  }
};

// 5. Deletar (Caso precise)
export const deleteTransaction = async (id: string) => {
  try {
    await deleteDoc(doc(db, "transactions", id));
  } catch (error) {
    console.error("Erro ao deletar:", error);
    throw error;
  }
};