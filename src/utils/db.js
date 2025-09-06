// utils/db.js
// 시음회 재방문 트래커 - IndexedDB 유틸
// - 새 스토어(sessions_v2)로 무손실 복사(업그레이드/런타임 폴백 모두 지원)
// - add: id 없이 add(), update: 기존 조회 후 id 포함하여 put()
// - 값은 항상 plain object(JSON 복제)로 put하여 Proxy/동결 객체 문제 방지

const DB_NAME = 'sieum-revisit';
const DB_VERSION = 3; // 스키마 변경 시 올리되, 불필요하게 자주 올릴 필요는 없음
const STORE_OLD = 'sessions';
const STORE_NEW = 'sessions_v2';

let ACTIVE_STORE = null; // 실제로 사용할 스토어명('sessions_v2' 또는 'sessions')

// -------------------- 작은 유틸 --------------------
const isBrowser = typeof window !== 'undefined' && !!window.indexedDB;

function clonePlain(obj) {
    // Proxy/순환참조 방지용 plain 객체로 복제
    return JSON.parse(JSON.stringify(obj));
}

function toArrayOfStrings(v) {
    if (Array.isArray(v)) return v.map(String);
    if (v == null) return [];
    return [String(v)];
}

function reqDone(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function countStore(db, name) {
    if (!db.objectStoreNames.contains(name)) return 0;
    const t = db.transaction([name], 'readonly');
    const req = t.objectStore(name).count();
    const n = await reqDone(req);
    return n || 0;
}

// 새 스토어가 비어 있고, 구 스토어에 데이터가 있으면 런타임에서 복사
async function ensureMigratedAtRuntime(db) {
    if (!db.objectStoreNames.contains(STORE_NEW) || !db.objectStoreNames.contains(STORE_OLD)) return;

    const newCnt = await countStore(db, STORE_NEW);
    if (newCnt > 0) return; // 이미 복사됨

    const tRO = db.transaction([STORE_OLD], 'readonly');
    const allOld = await reqDone(tRO.objectStore(STORE_OLD).getAll());
    const rows = Array.isArray(allOld) ? allOld : [];
    if (rows.length === 0) return;

    const tRW = db.transaction([STORE_NEW], 'readwrite');
    const newStore = tRW.objectStore(STORE_NEW);

    await Promise.all(
        rows.map((row) => {
            const v = clonePlain(row);
            // 충돌 방지를 위해 id 제거 → 새 스토어에서 autoIncrement로 부여
            if ('id' in v) delete v.id;
            v.participants = toArrayOfStrings(v.participants);
            const r = newStore.add(v);
            return reqDone(r);
        })
    );
}

// 데이터가 실제로 있는 쪽을 우선 선택
async function decideActiveStore(db) {
    const newCnt = await countStore(db, STORE_NEW);
    if (newCnt > 0) return STORE_NEW;
    const oldCnt = await countStore(db, STORE_OLD);
    if (oldCnt > 0) return STORE_OLD;
    // 둘 다 비어있다면 새 스토어가 있으면 그쪽으로
    return db.objectStoreNames.contains(STORE_NEW) ? STORE_NEW : STORE_OLD;
}

// -------------------- DB 오픈 & 업그레이드 --------------------
function openDB() {
    if (!isBrowser) {
        throw new Error('IndexedDB is not available in this environment.');
    }

    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = () => {
            const db = req.result;
            const upgradeTx = req.transaction;

            // 새 스토어 생성 여부 체크
            const needCreateNew = !db.objectStoreNames.contains(STORE_NEW);
            if (needCreateNew) {
                db.createObjectStore(STORE_NEW, { keyPath: 'id', autoIncrement: true });
            }

            // 새 스토어가 "이번 업그레이드에서 막 생성"된 경우에만 구 스토어에서 복사
            if (needCreateNew && db.objectStoreNames.contains(STORE_OLD)) {
                try {
                    const oldStore = upgradeTx.objectStore(STORE_OLD);
                    const newStore = upgradeTx.objectStore(STORE_NEW);

                    const cursorReq = oldStore.openCursor();
                    cursorReq.onsuccess = (e) => {
                        const cursor = e.target.result;
                        if (!cursor) return;

                        const v = clonePlain(cursor.value || {});
                        if ('id' in v) delete v.id; // autoIncrement 충돌 방지
                        v.participants = toArrayOfStrings(v.participants);

                        newStore.add(v);
                        cursor.continue();
                    };
                    cursorReq.onerror = (e) => {
                        console.warn('[IDB] migration cursor error:', e?.target?.error);
                    };
                } catch (err) {
                    console.warn('[IDB] migration skipped:', err);
                }
            }
        };

        req.onsuccess = async () => {
            const db = req.result;
            try {
                // 런타임 폴백 복사(필요 시)
                await ensureMigratedAtRuntime(db);
                // 실제 사용할 스토어 결정
                ACTIVE_STORE = await decideActiveStore(db);
            } catch (e) {
                console.warn('[IDB] post-open tasks failed:', e);
            }
            resolve(db);
        };

        req.onerror = () => reject(req.error);
    });
}

async function tx(mode = 'readonly') {
    const db = await openDB();
    const storeName = ACTIVE_STORE || (db.objectStoreNames.contains(STORE_NEW) ? STORE_NEW : STORE_OLD);
    const t = db.transaction(storeName, mode);
    return { db, store: t.objectStore(storeName), t };
}

// -------------------- CRUD API --------------------
export async function getSessions() {
    const { db, store } = await tx('readonly');
    try {
        const all = await reqDone(store.getAll());
        return (all || []).map((s) => ({
            ...s,
            participants: toArrayOfStrings(s.participants),
        }));
    } finally {
        db.close();
    }
}

export async function addSession(payload) {
    const { db, store } = await tx('readwrite');
    try {
        // add 시에는 절대 id를 포함하지 않음 (autoIncrement 활용)
        const value = clonePlain({
            name: String(payload?.name ?? ''),
            date: payload?.date ?? null, // 'YYYY-MM-DD' 또는 null
            participants: toArrayOfStrings(payload?.participants),
        });
        await reqDone(store.add(value));
        return true;
    } finally {
        db.close();
    }
}

export async function updateSession(id, patch) {
    const { db, store } = await tx('readwrite');
    try {
        const key = typeof id === 'number' ? id : Number(id);
        // 기존 레코드 조회
        const existing = await reqDone(store.get(key));
        if (!existing) throw new Error('Session not found');

        // 병합: id는 반드시 포함(기존 유지), participants는 배열 보정
        const merged = clonePlain({
            ...existing,
            ...patch,
            id: existing.id,
            name: String(patch?.name ?? existing.name ?? ''),
            date: patch?.date ?? existing.date ?? null,
            participants: toArrayOfStrings(patch?.participants ?? existing.participants),
        });

        await reqDone(store.put(merged)); // key 인자 없이 put(value) — keyPath 사용
        return true;
    } finally {
        db.close();
    }
}

export async function deleteSession(id) {
    const { db, store } = await tx('readwrite');
    try {
        const key = typeof id === 'number' ? id : Number(id);
        await reqDone(store.delete(key));
        return true;
    } finally {
        db.close();
    }
}

// (옵션) 단건 조회
export async function getSessionById(id) {
    const { db, store } = await tx('readonly');
    try {
        const key = typeof id === 'number' ? id : Number(id);
        const row = await reqDone(store.get(key));
        return row ? { ...row, participants: toArrayOfStrings(row.participants) } : null;
    } finally {
        db.close();
    }
}
