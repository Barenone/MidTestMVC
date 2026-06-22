// =============================================
// Controller — RestaurantDetailController.js
// 職責：協調詳情頁的 Model ↔ View
// =============================================

const RestaurantDetailController = (() => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // 儲存座標
    function _handleSaveCoord() {
        const coords = RestaurantDetailView.getCoords();
        const lat = coords.latitude ? parseFloat(coords.latitude) : null;
        const lng = coords.longitude ? parseFloat(coords.longitude) : null;

        // 簡單驗證
        if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
            alert('緯度格式不正確（需介於 -90 ~ 90）');
            return;
        }
        if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
            alert('經度格式不正確（需介於 -180 ~ 180）');
            return;
        }

        RestaurantModel.update(id, { latitude: lat, longitude: lng });
        alert('座標已儲存！');
    }

    // 軟刪除
    function _handleSoftDelete() {
        if (!confirm('確定要軟刪除此餐廳嗎？（可於後台還原）')) return;
        RestaurantModel.softDelete(id, 1); // adminID 暫時固定為 1
        alert('已刪除！');
        window.location.href = 'list.html';
    }

    // 初始化
    function init() {
        const data = id ? RestaurantModel.getByID(id) : null;

        if (!data || data.isDeleted) {
            RestaurantDetailView.renderNotFound();
            return;
        }

        RestaurantDetailView.renderActions(data.id);
        RestaurantDetailView.renderInfoRows(data);
        RestaurantDetailView.fillCoords(data.latitude, data.longitude);
        RestaurantDetailView.renderRating(data);
        RestaurantDetailView.bindSaveCoord(_handleSaveCoord);
        RestaurantDetailView.bindSoftDelete(_handleSoftDelete);
    }

    return { init };
})();

RestaurantDetailController.init();
