const RestaurantModel = (() => {
    const RESTAURANT_KEY = "restaurant_admin_restaurants_v4";
    const TAG_KEY = "restaurant_admin_tags_v4";

    const defaultHours = [
        { day: "一", open: true, slots: [{ start: "11:00", end: "14:00" }, { start: "17:00", end: "21:00" }] },
        { day: "二", open: true, slots: [{ start: "11:00", end: "21:00" }] },
        { day: "三", open: true, slots: [{ start: "11:00", end: "21:00" }] },
        { day: "四", open: true, slots: [{ start: "11:00", end: "21:00" }] },
        { day: "五", open: true, slots: [{ start: "11:00", end: "22:00" }] },
        { day: "六", open: true, slots: [{ start: "10:00", end: "22:00" }] },
        { day: "日", open: false, slots: [] }
    ];

    const imageDefaults = { cover: null, environments: [] };

    const activeSeeds = [
        [1, "築地拉麵", "大安區", "台北市大安區和平東路 216 號", "02-2731-1234", ["日式料理"], "alice", 2, 4.8, 62, "2025-03-15", "每週三晚餐時段需提早訂位。"],
        [2, "阿嬤的灶腳", "信義區", "台北市信義區松仁路 100 號", "02-2345-5678", ["台式料理"], "bob", 3, 4.3, 38, "2025-04-01", "禁止寵物入內。"],
        [3, "天母涮涮鍋", "士林區", "台北市士林區天母東路 200 號", "02-2871-9999", ["火鍋"], "carol", 4, 4.1, 51, "2025-04-20", ""],
        [4, "慢烤咖啡", "中山區", "台北市中山區南京東路 88 號", "02-2511-3322", ["咖啡廳", "早午餐"], "dora", 5, 4.7, 27, "2025-05-06", "6/30 下午包場，暫停一般座位。"],
        [8, "南港米食堂", "南港區", "台北市南港區經貿二路 66 號", "02-2788-1258", ["台式料理"], "gina", 10, 4.5, 44, "2025-05-11", "週末供餐至 20:30。"],
        [9, "仁愛小館", "大安區", "台北市大安區仁愛路四段 45 號", "02-2700-3344", ["台式料理"], "henry", 11, 4.2, 31, "2025-05-14", "店內座位較少，建議電話確認。"],
        [10, "松山韓味屋", "松山區", "台北市松山區八德路三段 120 號", "02-2577-8801", ["韓式料理"], "irene", 12, 4.4, 73, "2025-05-18", "小菜每日依現場供應調整。"],
        [11, "民生燒肉舖", "松山區", "台北市松山區民生東路五段 32 號", "02-2766-4399", ["燒烤"], "jack", 13, 4.6, 86, "2025-05-21", "兒童椅數量有限。"],
        [12, "晴光甜點室", "中山區", "台北市中山區雙城街 18 號", "02-2599-2300", ["甜點"], "kelly", 14, 4.9, 58, "2025-05-25", "每月第一個週一臨時公休。"],
        [13, "綠意蔬食", "中正區", "台北市中正區羅斯福路一段 90 號", "02-2399-7788", ["素食"], "leo", 15, 4.4, 47, "2025-05-29", "全店蛋奶素，純素需事先告知。"],
        [14, "河岸越南粉", "萬華區", "台北市萬華區貴陽街二段 51 號", "02-2388-7102", ["越南料理"], "mia", 16, 4.0, 19, "2025-06-02", "湯頭售完會提早打烊。"],
        [15, "象山泰香", "信義區", "台北市信義區松德路 168 號", "02-2722-9008", ["泰式料理"], "nick", 17, 4.6, 52, "2025-06-05", "辣度可調整。"],
        [16, "北投義麵坊", "北投區", "台北市北投區光明路 112 號", "02-2891-6620", ["義式料理"], "olivia", 18, 4.1, 36, "2025-06-09", "週二午餐時段暫停供應披薩。"],
        [17, "木柵早午餐", "文山區", "台北市文山區木柵路三段 77 號", "02-2939-5510", ["早午餐"], "peter", 19, 4.3, 64, "2025-06-13", "假日用餐限時 90 分鐘。"]
    ];

    const seedRestaurants = [
        ...activeSeeds.map(args => restaurantSeed(...args)),
        {
            ...restaurantSeed(5, "老王牛肉麵", "中正區", "台北市中正區汀州路 80 號", "02-2391-0000", ["台式料理"], "alice", 2, 3.5, 12, "2025-02-10", "店家回報已停止營業。"),
            isDeleted: true,
            deletedAt: "2025-05-20",
            deletedBy: "admin",
            deleteReason: "已歇業"
        },
        {
            ...restaurantSeed(6, "松江壽司店", "中山區", "台北市中山區松江路 18 號", "02-2500-1324", ["日式料理"], "eric", 8, 3.9, 18, "2025-01-12", "需重新確認菜單資訊。"),
            isDeleted: true,
            deletedAt: "2025-06-01",
            deletedBy: "admin",
            deleteReason: "資訊不實"
        },
        {
            ...restaurantSeed(7, "東區義式廚房", "大安區", "台北市大安區忠孝東路 72 號", "02-2777-9911", ["義式料理"], "frank", 9, 4.0, 21, "2025-03-09", "內容修正後可考慮解除停用。"),
            isDeleted: true,
            deletedAt: "2025-06-14",
            deletedBy: "admin",
            deleteReason: "違規內容"
        }
    ];

    const seedTags = [
        { id: 1, name: "台式料理", isDeleted: false },
        { id: 2, name: "日式料理", isDeleted: false },
        { id: 3, name: "韓式料理", isDeleted: false },
        { id: 4, name: "火鍋", isDeleted: false },
        { id: 5, name: "燒烤", isDeleted: false },
        { id: 6, name: "咖啡廳", isDeleted: false },
        { id: 7, name: "甜點", isDeleted: false },
        { id: 8, name: "早午餐", isDeleted: false },
        { id: 9, name: "素食", isDeleted: false },
        { id: 10, name: "義式料理", isDeleted: false },
        { id: 11, name: "越南料理", isDeleted: false },
        { id: 12, name: "泰式料理", isDeleted: false }
    ];

    function restaurantSeed(id, name, district, address, phone, tags, owner, memberId, rating, reviewCount, createdAt, notes = "") {
        return {
            id,
            name,
            city: "台北市",
            district,
            address,
            phone,
            tags,
            owner,
            memberId,
            rating,
            reviewCount,
            latitude: null,
            longitude: null,
            notes,
            createdAt,
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            deleteReason: "",
            hours: clone(defaultHours),
            images: clone(imageDefaults)
        };
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeRestaurant(record) {
        return {
            ...record,
            notes: record.notes || "",
            images: {
                cover: record.images?.cover || null,
                environments: Array.isArray(record.images?.environments) ? record.images.environments : []
            },
            hours: Array.isArray(record.hours) ? record.hours : clone(defaultHours)
        };
    }

    function init() {
        if (!localStorage.getItem(RESTAURANT_KEY)) {
            localStorage.setItem(RESTAURANT_KEY, JSON.stringify(seedRestaurants));
        }
        if (!localStorage.getItem(TAG_KEY)) {
            localStorage.setItem(TAG_KEY, JSON.stringify(seedTags));
        }
    }

    function read(key) {
        init();
        return JSON.parse(localStorage.getItem(key));
    }

    function write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function restaurants() {
        return read(RESTAURANT_KEY).map(normalizeRestaurant);
    }

    function tags() {
        return read(TAG_KEY);
    }

    function getRestaurant(id) {
        return restaurants().find(item => item.id === Number(id)) || null;
    }

    function saveRestaurant(data) {
        const list = restaurants();
        if (data.id) {
            const index = list.findIndex(item => item.id === Number(data.id));
            list[index] = normalizeRestaurant({ ...list[index], ...data });
            write(RESTAURANT_KEY, list);
            return list[index];
        }

        const nextId = list.length ? Math.max(...list.map(item => item.id)) + 1 : 1;
        const record = normalizeRestaurant({
            ...data,
            id: nextId,
            rating: 0,
            reviewCount: 0,
            owner: "admin",
            memberId: 1,
            createdAt: new Date().toISOString().slice(0, 10),
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            deleteReason: ""
        });
        list.unshift(record);
        write(RESTAURANT_KEY, list);
        return record;
    }

    function softDeleteRestaurant(id, reason = "違規內容") {
        const item = getRestaurant(id);
        if (!item) return null;
        return saveRestaurant({
            ...item,
            isDeleted: true,
            deletedAt: new Date().toISOString().slice(0, 10),
            deletedBy: "admin",
            deleteReason: reason
        });
    }

    function restoreRestaurant(id) {
        const item = getRestaurant(id);
        if (!item) return null;
        return saveRestaurant({ ...item, isDeleted: false, deletedAt: null, deletedBy: null, deleteReason: "" });
    }

    function hardDeleteRestaurant(id) {
        write(RESTAURANT_KEY, restaurants().filter(item => item.id !== Number(id)));
    }

    function addTag(name) {
        const normalized = name.trim();
        if (!normalized) return null;
        const list = tags();
        const existing = list.find(item => item.name === normalized);
        if (existing) {
            existing.isDeleted = false;
            write(TAG_KEY, list);
            return existing;
        }
        const nextId = list.length ? Math.max(...list.map(item => item.id)) + 1 : 1;
        const tag = { id: nextId, name: normalized, isDeleted: false };
        list.unshift(tag);
        write(TAG_KEY, list);
        return tag;
    }

    function toggleTag(id) {
        const list = tags();
        const tag = list.find(item => item.id === Number(id));
        if (!tag) return null;
        tag.isDeleted = !tag.isDeleted;
        write(TAG_KEY, list);
        return tag;
    }

    function tagUsage(name) {
        return restaurants().filter(item => !item.isDeleted && item.tags.includes(name)).length;
    }

    function stats() {
        const all = restaurants();
        const active = all.filter(item => !item.isDeleted);
        return {
            total: active.length,
            deleted: all.length - active.length,
            avgRating: active.length ? (active.reduce((sum, item) => sum + item.rating, 0) / active.length).toFixed(1) : "0.0",
            reviewCount: active.reduce((sum, item) => sum + item.reviewCount, 0)
        };
    }

    function resetDemoData() {
        localStorage.removeItem(RESTAURANT_KEY);
        localStorage.removeItem(TAG_KEY);
        init();
    }

    return {
        defaultHours,
        restaurants,
        tags,
        getRestaurant,
        saveRestaurant,
        softDeleteRestaurant,
        restoreRestaurant,
        hardDeleteRestaurant,
        addTag,
        toggleTag,
        tagUsage,
        stats,
        resetDemoData
    };
})();
