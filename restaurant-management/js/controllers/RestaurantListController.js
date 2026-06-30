const RestaurantApp = (() => {
    const app = () => document.getElementById("app");
    const title = () => document.getElementById("pageTitle");
    const actions = () => document.getElementById("pageActions");

    function init() {
        RestaurantModel.restaurants();
        bindNavigation();
        bindAppEvents();
        RestaurantFormController.bindGlobalEvents();
        showList();
    }

    function mount(html) {
        app().innerHTML = html;
        updateDeletedBadge();
    }

    function setTitle(text) {
        title().innerHTML = `<span>□</span>${text}`;
    }

    function setActions(html) {
        actions().innerHTML = html;
    }

    function setActive(route) {
        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.toggle("active", item.dataset.route === route);
        });
    }

    function bindNavigation() {
        document.querySelectorAll("[data-route]").forEach(button => {
            button.addEventListener("click", () => {
                if (button.dataset.route === "list") showList();
                if (button.dataset.route === "tags") showTags();
                if (button.dataset.route === "deleted") showDeleted();
            });
        });
    }

    function bindAppEvents() {
        app().addEventListener("input", event => {
            if (["searchInput", "cityFilter", "districtFilter", "tagFilter", "sortSelect"].includes(event.target.id)) renderFilteredList();
            if (["deletedSearchInput", "deletedCityFilter", "deletedReasonFilter"].includes(event.target.id)) renderFilteredDeleted();
        });
        app().addEventListener("change", event => {
            if (["searchInput", "cityFilter", "districtFilter", "tagFilter", "sortSelect"].includes(event.target.id)) renderFilteredList();
            if (["deletedSearchInput", "deletedCityFilter", "deletedReasonFilter"].includes(event.target.id)) renderFilteredDeleted();
        });
        app().addEventListener("click", event => {
            const actionTarget = event.target.closest("[data-action]");
            const row = event.target.closest("tr[data-id]");
            if (actionTarget) {
                event.stopPropagation();
                handleAction(actionTarget.dataset.action, actionTarget.dataset.id);
                return;
            }
            if (row && document.getElementById("restaurantRows")) RestaurantDetailController.show(row.dataset.id);
            if (row && document.getElementById("deletedRows")) RestaurantDetailController.show(row.dataset.id, { deleted: true });
        });
    }

    function handleAction(action, id) {
        if (["back-list", "back-deleted", "edit", "soft-delete", "restore", "hard-delete"].includes(action)) {
            RestaurantDetailController.handleAction(action, id);
        }
        if (action === "detail") RestaurantDetailController.show(id);
        if (action === "deleted-detail") RestaurantDetailController.show(id, { deleted: true });
        if (action === "toggle-tag") {
            RestaurantModel.toggleTag(id);
            showTags();
        }
    }

    function showList() {
        setActive("list");
        setTitle("餐廳一覽");
        setActions(`
            <button class="btn" id="exportBtn">□ 匯出</button>
            <button class="btn btn-primary" id="addRestaurantBtn">□ 新增餐廳</button>
        `);
        actions().querySelector("#addRestaurantBtn").addEventListener("click", () => {
            RestaurantFormController.open({ onSave: showList });
        });
        actions().querySelector("#exportBtn").addEventListener("click", () => toast("原型已模擬匯出動作。"));
        const restaurants = filterRestaurants(false);
        mount(RestaurantListView.renderList({ stats: RestaurantModel.stats(), restaurants, tags: RestaurantModel.tags() }));
    }

    function renderFilteredList() {
        const body = document.getElementById("restaurantRows");
        if (!body) return;
        body.innerHTML = RestaurantListView.restaurantRows(filterRestaurants(false));
    }

    function showDeleted() {
        setActive("deleted");
        setTitle("停用餐廳一覽");
        setActions("");
        const restaurants = filterRestaurants(true);
        mount(RestaurantListView.renderDeleted({ restaurants }));
    }

    function renderFilteredDeleted() {
        const body = document.getElementById("deletedRows");
        if (!body) return;
        body.innerHTML = RestaurantListView.deletedRows(filterRestaurants(true));
    }

    function showTags() {
        setActive("tags");
        setTitle("餐廳標籤一覽");
        setActions("");
        mount(RestaurantListView.renderTags(RestaurantModel.tags()));
        document.getElementById("addTagBtn").addEventListener("click", addTagFromInput);
        document.getElementById("newTagInput").addEventListener("keydown", event => {
            if (event.key === "Enter") addTagFromInput();
        });
    }

    function addTagFromInput() {
        const input = document.getElementById("newTagInput");
        RestaurantModel.addTag(input.value);
        toast("標籤已新增。");
        showTags();
    }

    function filterRestaurants(deleted) {
        let list = RestaurantModel.restaurants().filter(item => item.isDeleted === deleted);

        const keyword = document.getElementById(deleted ? "deletedSearchInput" : "searchInput")?.value.trim().toLowerCase() || "";
        const city = document.getElementById(deleted ? "deletedCityFilter" : "cityFilter")?.value || "";
        const district = document.getElementById("districtFilter")?.value || "";
        const selectedTag = document.getElementById("tagFilter")?.value || "";
        const reason = document.getElementById("deletedReasonFilter")?.value || "";
        const sort = document.getElementById("sortSelect")?.value || "newest";

        if (keyword) {
            list = list.filter(item => `${item.name} ${item.address}`.toLowerCase().includes(keyword));
        }
        if (city) list = list.filter(item => item.city === city);
        if (!deleted && district) list = list.filter(item => item.district === district);
        if (!deleted && selectedTag) list = list.filter(item => item.tags.includes(selectedTag));
        if (deleted && reason) list = list.filter(item => item.deleteReason === reason);

        if (deleted) list.sort((a, b) => new Date(b.deletedAt || b.createdAt) - new Date(a.deletedAt || a.createdAt));
        else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
        else if (sort === "review") list.sort((a, b) => b.reviewCount - a.reviewCount);
        else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return list;
    }

    function updateDeletedBadge() {
        document.getElementById("deletedCount").textContent = RestaurantModel.stats().deleted;
    }

    function toast(message) {
        const el = document.getElementById("toast");
        el.textContent = message;
        el.classList.add("show");
        window.clearTimeout(toast.timer);
        toast.timer = window.setTimeout(() => el.classList.remove("show"), 1800);
    }

    return { init, mount, setTitle, setActions, showList, showDeleted, toast };
})();
