const RestaurantDetailController = (() => {
    function show(id, { deleted = false } = {}) {
        const restaurant = RestaurantModel.getRestaurant(id);
        RestaurantApp.setTitle(deleted ? "停用餐廳詳細" : "餐廳詳細");
        RestaurantApp.setActions("");
        RestaurantApp.mount(RestaurantDetailView.render(restaurant, { deleted }));
    }

    function handleAction(action, id) {
        if (action === "back-list") RestaurantApp.showList();
        if (action === "back-deleted") RestaurantApp.showDeleted();
        if (action === "edit") {
            RestaurantFormController.open({
                restaurant: RestaurantModel.getRestaurant(id),
                onSave: saved => show(saved.id)
            });
        }
        if (action === "soft-delete") {
            const reason = prompt("請輸入停用原因", "違規內容") || "違規內容";
            RestaurantModel.softDeleteRestaurant(id, reason);
            RestaurantApp.toast("餐廳已移至停用餐廳一覽。");
            RestaurantApp.showDeleted();
        }
        if (action === "restore") {
            RestaurantModel.restoreRestaurant(id);
            RestaurantApp.toast("已解除停用。");
            RestaurantApp.showList();
        }
        if (action === "hard-delete") {
            if (!confirm("永久刪除後將無法在此原型中還原，確定刪除？")) return;
            RestaurantModel.hardDeleteRestaurant(id);
            RestaurantApp.toast("已永久刪除。");
            RestaurantApp.showDeleted();
        }
    }

    return { show, handleAction };
})();
