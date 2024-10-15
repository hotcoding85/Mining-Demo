const dbName = 'hmesolutions';
const dbVersion = 1;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
    
        request.onerror = () => {
            reject('Error opening database');
        };
    
        request.onsuccess = () => {
            resolve(request.result);
        };
    
        request.onupgradeneeded = (event) => {
            const db = request.result;
            if (!db.objectStoreNames.contains('myStore')) {
                // Use a key-value store where key is a string and value is an array
                db.createObjectStore('myStore');
            }
        };
    });
};
  
export const addOrUpdateData = async (key: string, data: any): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('myStore', 'readwrite');
    const store = transaction.objectStore('myStore');
    
    store.put(data, key);  // Provide key as a separate argument
  
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
  
export const getDataByKey = async (key: string): Promise<any> => {
    const db = await openDB();
    const transaction = db.transaction('myStore', 'readonly');
    const store = transaction.objectStore('myStore');
  
    return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};