import { openDB } from 'idb';

const DB_NAME = 'RevisitTrackerDB';
const STORE_NAME = 'sessions';
const DB_VERSION = 1;

// IndexedDB 초기화
const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

// 새로운 회차 추가
export const addSession = async (session) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add(session);
    await tx.done;
};

// 모든 회차 조회
export const getSessions = async () => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
};

// 특정 회차 조회 (id로 검색) → 새로운 기능 추가
export const getSessionById = async (id) => {
    const db = await initDB();
    return db.get(STORE_NAME, id);
};

// 기존 회차 수정 (업데이트) → 새로운 기능 추가
export const updateSession = async (session) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.put(session); // 기존 데이터를 덮어씀
    await tx.done;
};

// 특정 회차 삭제 (id 기준) → 기존의 clearSessions() 대신 추가
export const deleteSession = async (id) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.delete(id); // 특정 id의 회차만 삭제
    await tx.done;
};
