// components/database.ts
import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // Se já existe uma instância, retorna ela
  if (dbInstance) {
    return dbInstance;
  }

  // Evita múltiplas inicializações simultâneas
  if (isInitializing) {
    // Aguarda a inicialização terminar
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return getDatabase();
  }

  isInitializing = true;
  try {
    console.log('Abrindo conexão com o banco...');
    dbInstance = await SQLite.openDatabaseAsync('mangadb');
    
    // Configurações iniciais
    await dbInstance.execAsync(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
    `);
    
    console.log('Banco conectado com sucesso!');
    return dbInstance;
  } catch (error) {
    console.error('Erro ao abrir banco:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

// Função para fechar o banco (usar apenas quando o app for encerrado)
export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    try {
      await dbInstance.closeAsync();
      dbInstance = null;
      console.log('Banco fechado');
    } catch (error) {
      console.error('Erro ao fechar banco:', error);
    }
  }
};