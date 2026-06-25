const RestaurantFormController = (() => {
    let hoursDraft = [];
    let onSaveCallback = null;

    function open({ restaurant = null, onSave }) {
        onSaveCallback = onSave;
        const root = document.getElementById("modalRoot");
        const data = restaurant ? JSON.parse(JSON.stringify(restaurant)) : RestaurantFormView.emptyRestaurant();
        hoursDraft = JSON.parse(JSON.stringify(data.hours));
        root.innerHTML = RestaurantFormView.renderModal({ restaurant: data, tags: RestaurantModel.tags() });
        root.classList.add("open");
        root.setAttribute("aria-hidden", "false");
    }

    function close() {
        const root = document.getElementById("modalRoot");
        root.classList.remove("open");
        root.setAttribute("aria-hidden", "true");
        root.innerHTML = "";
    }

    function bindGlobalEvents() {
        const root = document.getElementById("modalRoot");
        root.addEventListener("click", event => {
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (!action) return;

            if (action === "close-modal") close();
            if (action === "copy-first-day") copyFirstDay();
            if (action === "toggle-day") toggleDay(event.target);
            if (action === "add-slot") addSlot(event.target);
            if (action === "remove-slot") removeSlot(event.target);
        });

        root.addEventListener("click", event => {
            const choice = event.target.closest("[data-tag]");
            if (choice) choice.classList.toggle("active");
        });

        root.addEventListener("input", event => {
            const slotInput = event.target.closest("[data-field]");
            if (!slotInput) return;
            const row = slotInput.closest("[data-day-index]");
            const slot = slotInput.closest("[data-slot-index]");
            hoursDraft[Number(row.dataset.dayIndex)].slots[Number(slot.dataset.slotIndex)][slotInput.dataset.field] = slotInput.value;
        });

        root.addEventListener("submit", event => {
            event.preventDefault();
            save(event.target);
        });
    }

    function copyFirstDay() {
        if (!hoursDraft[0]) return;
        const monday = JSON.parse(JSON.stringify(hoursDraft[0]));
        hoursDraft = hoursDraft.map(day => ({ ...day, open: monday.open, slots: JSON.parse(JSON.stringify(monday.slots)) }));
        renderHours();
    }

    function toggleDay(input) {
        const row = input.closest("[data-day-index]");
        const index = Number(row.dataset.dayIndex);
        hoursDraft[index].open = input.checked;
        if (input.checked && !hoursDraft[index].slots.length) {
            hoursDraft[index].slots = [{ start: "11:00", end: "21:00" }];
        }
        renderHours();
    }

    function addSlot(button) {
        const row = button.closest("[data-day-index]");
        const index = Number(row.dataset.dayIndex);
        hoursDraft[index].slots.push({ start: "17:00", end: "21:00" });
        renderHours();
    }

    function removeSlot(button) {
        const row = button.closest("[data-day-index]");
        const slot = button.closest("[data-slot-index]");
        const dayIndex = Number(row.dataset.dayIndex);
        const slotIndex = Number(slot.dataset.slotIndex);
        if (hoursDraft[dayIndex].slots.length > 1) {
            hoursDraft[dayIndex].slots.splice(slotIndex, 1);
            renderHours();
        }
    }

    function renderHours() {
        const container = document.getElementById("hoursForm");
        if (!container) return;
        container.innerHTML = hoursDraft.map((day, index) => RestaurantFormView.hourRow(day, index)).join("");
    }

    function save(form) {
        const formData = new FormData(form);
        const selectedTags = [...document.querySelectorAll("#tagChoices .choice.active")].map(item => item.dataset.tag);
        if (!selectedTags.length) {
            RestaurantApp.toast("請至少選擇一個標籤。");
            return;
        }

        const id = formData.get("id");
        const old = id ? RestaurantModel.getRestaurant(id) : {};
        const record = {
            ...old,
            id: id ? Number(id) : undefined,
            name: formData.get("name").trim(),
            phone: formData.get("phone").trim(),
            city: formData.get("city"),
            district: formData.get("district"),
            address: formData.get("address").trim(),
            tags: selectedTags,
            hours: hoursDraft
        };

        const saved = RestaurantModel.saveRestaurant(record);
        close();
        RestaurantApp.toast(id ? "餐廳資料已更新。" : "已新增餐廳。");
        if (onSaveCallback) onSaveCallback(saved);
    }

    return { open, close, bindGlobalEvents };
})();
