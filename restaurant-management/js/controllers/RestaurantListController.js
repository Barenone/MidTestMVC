// =============================================
// Controller — RestaurantListController.js
// 職責：協調列表頁的 Model ↔ View
// =============================================

const RestaurantListController = (() => {

    // 取得有效餐廳（過濾軟刪除）— 商業邏輯放在 Controller
    function _getActive() {
        return RestaurantModel.getAll().filter(r => !r.isDeleted);
    }

    // 搜尋 + 篩選 + 排序
    function _filter({ keyword, category, sortBy }) {
        let list = _getActive();

        if (keyword.trim()) {
            const kw = keyword.trim().toLowerCase();
            list = list.filter(r =>
                r.name.toLowerCase().includes(kw) ||
                r.address.toLowerCase().includes(kw)
            );
        }

        if (category) {
            list = list.filter(r => r.categories.includes(category));
        }

        if (sortBy === 'rating') {
            list.sort((a, b) => b.averageRating - a.averageRating);
        } else if (sortBy === 'reviewCount') {
            list.sort((a, b) => b.reviewCount - a.reviewCount);
        } else {
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return list;
    }

    // 統計資料
    function _getStats() {
        const all = RestaurantModel.getAll();
        const active = all.filter(r => !r.isDeleted);
        const avg = active.length
            ? (active.reduce((s, r) => s + r.averageRating, 0) / active.length).toFixed(1)
            : '0.0';
        return {
            total: active.length,
            deleted: all.filter(r => r.isDeleted).length,
            avgRating: parseFloat(avg),
            totalReviews: active.reduce((s, r) => s + r.reviewCount, 0),
        };
    }

    // 重新渲染列表（篩選條件改變時呼叫）
    function _reload() {
        const filters = RestaurantListView.getFilterValues();
        const list = _filter(filters);
        RestaurantListView.renderTable(list);
    }

    // 刪除處理
    function _handleDelete(id) {
        if (!confirm('確定要刪除此餐廳嗎？（軟刪除，可還原）')) return;
        RestaurantModel.softDelete(id, 1); // adminID 暫時固定為 1
        RestaurantListView.renderStats(_getStats());
        _reload();
    }

    // 初始化（頁面載入時呼叫）
    function init() {
        RestaurantListView.renderStats(_getStats());
        RestaurantListView.bindFilterEvents(_reload);
        RestaurantListView.bindDeleteEvent(_handleDelete);
        _reload();
    }

    return { init };
})();

// 頁面載入後啟動
RestaurantListController.init();