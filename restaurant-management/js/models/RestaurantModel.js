// =============================================
// Model — RestaurantModel.js
// 職責：資料結構定義 + localStorage 存取
// 不碰 DOM、不做商業驗證、不管畫面
// =============================================

const RestaurantModel = (() => {

    const STORAGE_KEY = 'mvc_restaurants';

    // 種子假資料
    const _seed = [
        {
            id: 1,
            name: '築地拉麵',
            address: '台北市大安區忠孝東路四段 216 號',
            phone: '02-2731-1234',
            businessHours: '週一～週日 11:30–21:30',
            latitude: 25.0412,
            longitude: 121.5468,
            memberID: 2,
            memberName: 'alice',
            averageRating: 4.8,
            reviewCount: 62,
            categories: ['日式料理'],
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            createdAt: '2025-03-15T14:22:00',
        },
        {
            id: 2,
            name: '阿嬤的灶腳',
            address: '台北市信義區松仁路 100 號',
            phone: '02-2345-5678',
            businessHours: '週二～週日 10:00–20:00',
            latitude: null,
            longitude: null,
            memberID: 3,
            memberName: 'bob',
            averageRating: 4.3,
            reviewCount: 38,
            categories: ['台式料理', '早午餐'],
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            createdAt: '2025-04-01T09:10:00',
        },
        {
            id: 3,
            name: '天母涮涮鍋',
            address: '台北市士林區中山北路七段 200 號',
            phone: '02-2871-9999',
            businessHours: '週一～週日 11:00–22:00',
            latitude: 25.1012,
            longitude: 121.5246,
            memberID: 4,
            memberName: 'carol',
            averageRating: 4.1,
            reviewCount: 51,
            categories: ['火鍋'],
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            createdAt: '2025-04-20T16:30:00',
        },
        {
            id: 4,
            name: '老王牛肉麵',
            address: '台北市中正區羅斯福路二段 80 號',
            phone: '02-2391-0000',
            businessHours: '週一～週六 11:00–19:00',
            latitude: null,
            longitude: null,
            memberID: 2,
            memberName: 'alice',
            averageRating: 3.5,
            reviewCount: 12,
            categories: ['台式料理'],
            isDeleted: true,
            deletedAt: '2025-05-20T10:00:00',
            deletedBy: 1,
            createdAt: '2025-02-10T11:00:00',
        },
    ];

    // 初始化：第一次載入時寫入種子資料
    function _init() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_seed));
        }
    }

    // 讀取全部（含已刪除）
    function getAll() {
        _init();
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
    }

    // 依 ID 取單筆
    function getByID(id) {
        return getAll().find(r => r.id === Number(id)) || null;
    }

    // 新增
    function create(data) {
        const all = getAll();
        const newID = all.length > 0 ? Math.max(...all.map(r => r.id)) + 1 : 1;
        const record = {
            ...data,
            id: newID,
            averageRating: 0,
            reviewCount: 0,
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            createdAt: new Date().toISOString(),
        };
        all.push(record);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return record;
    }

    // 更新
    function update(id, data) {
        const all = getAll();
        const idx = all.findIndex(r => r.id === Number(id));
        if (idx === -1) return null;
        all[idx] = { ...all[idx], ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return all[idx];
    }

    // 軟刪除
    function softDelete(id, adminMemberID) {
        return update(id, {
            isDeleted: true,
            deletedAt: new Date().toISOString(),
            deletedBy: adminMemberID,
        });
    }

    // 還原
    function restore(id) {
        return update(id, { isDeleted: false, deletedAt: null, deletedBy: null });
    }

    // 永久刪除
    function hardDelete(id) {
        const all = getAll().filter(r => r.id !== Number(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }

    return { getAll, getByID, create, update, softDelete, restore, hardDelete };
})();