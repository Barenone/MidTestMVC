const RestaurantDetailController = (() => {
    function show(id, { deleted = false } = {}) {
        const restaurant = RestaurantModel.getRestaurant(id);
        RestaurantApp.setTitle(deleted ? "停用餐廳詳細" : "餐廳詳細");
        RestaurantApp.setActions("");
        RestaurantApp.mount(RestaurantDetailView.render(restaurant, { deleted }));
    }

    function handleAction(action, id, target = null) {
        if (action === "back-list") RestaurantApp.showList();
        if (action === "back-deleted") RestaurantApp.showDeleted();
        if (action === "edit" || action === "edit-deleted") {
            const wasDeleted = action === "edit-deleted";
            RestaurantFormController.open({
                restaurant: RestaurantModel.getRestaurant(id),
                onSave: saved => show(saved.id, { deleted: wasDeleted })
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
        if (action === "view-image") openImage(id, target);
        if (action === "view-environment-gallery") openEnvironmentGallery(id);
    }

    function bindGlobalEvents() {
        const root = document.getElementById("modalRoot");
        root.addEventListener("click", event => {
            const close = event.target.closest("[data-action='close-modal']");
            if (close) closeModal();
            if (event.target === root && root.classList.contains("open")) closeModal();
        });
    }

    function openImage(id, target) {
        const restaurant = RestaurantModel.getRestaurant(id);
        if (!restaurant || !target) return;
        const type = target.dataset.imageType;
        const index = Number(target.dataset.imageIndex || 0);
        const image = type === "cover"
            ? restaurant.images?.cover
            : restaurant.images?.environments?.[index];
        if (!image) return;
        openModal(RestaurantDetailView.renderSingleImageModal(image));
    }

    function openEnvironmentGallery(id) {
        const restaurant = RestaurantModel.getRestaurant(id);
        const images = restaurant?.images?.environments || [];
        if (!images.length) return;
        openModal(RestaurantDetailView.renderGalleryModal(images));
    }

    function openModal(html) {
        const root = document.getElementById("modalRoot");
        root.innerHTML = html;
        root.classList.add("open");
        root.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
        const root = document.getElementById("modalRoot");
        root.classList.remove("open");
        root.setAttribute("aria-hidden", "true");
        root.innerHTML = "";
    }

    return { show, handleAction, bindGlobalEvents };
})();
