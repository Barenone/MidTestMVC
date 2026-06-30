const RestaurantFormController = (() => {
    const imageRules = {
        cover: {
            label: "餐廳封面圖",
            allowedTypes: ["image/jpeg"],
            maxBytes: 5 * 1024 * 1024,
            minWidth: 1200,
            width: 1200,
            height: 675,
            quality: 0.78
        },
        environment: {
            label: "餐廳環境圖",
            allowedTypes: ["image/jpeg"],
            maxBytes: 5 * 1024 * 1024,
            minWidth: 1200,
            width: 1200,
            height: 800,
            quality: 0.8
        }
    };

    let hoursDraft = [];
    let imageDraft = { cover: null, environments: [] };
    let onSaveCallback = null;

    function open({ restaurant = null, onSave }) {
        onSaveCallback = onSave;
        const root = document.getElementById("modalRoot");
        const data = restaurant ? JSON.parse(JSON.stringify(restaurant)) : RestaurantFormView.emptyRestaurant();
        hoursDraft = JSON.parse(JSON.stringify(data.hours));
        imageDraft = {
            cover: data.images?.cover || null,
            environments: Array.isArray(data.images?.environments) ? data.images.environments : []
        };
        root.innerHTML = RestaurantFormView.renderModal({ restaurant: data, tags: RestaurantModel.tags() });
        root.classList.add("open");
        root.setAttribute("aria-hidden", "false");
        RestaurantFormView.renderImagePreviews(imageDraft);
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
            if (action === "remove-image") removeImage(event.target.closest("[data-action]"));
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

        root.addEventListener("change", event => {
            const input = event.target.closest("[data-image-input]");
            if (input) handleImageFiles(input);
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

    async function handleImageFiles(input) {
        const type = input.dataset.imageInput;
        const files = [...input.files];
        if (!files.length) return;

        for (const file of files) {
            try {
                const processed = await processImage(file, imageRules[type]);
                if (type === "cover") {
                    imageDraft.cover = processed;
                } else {
                    imageDraft.environments.push(processed);
                }
                RestaurantApp.toast(`${imageRules[type].label}已轉成 WebP。`);
            } catch (error) {
                RestaurantApp.toast(error.message);
            }
        }

        input.value = "";
        RestaurantFormView.renderImagePreviews(imageDraft);
    }

    async function processImage(file, rule) {
        if (!rule.allowedTypes.includes(file.type)) {
            throw new Error(`${rule.label}只接受 JPG 格式。`);
        }
        if (file.size > rule.maxBytes) {
            throw new Error(`${rule.label}檔案不可超過 5MB。`);
        }

        const bitmap = await loadImageBitmap(file);
        if (bitmap.width < rule.minWidth) {
            throw new Error(`${rule.label}寬度至少需要 ${rule.minWidth}px，目前為 ${bitmap.width}px。`);
        }

        const dataUrl = cropToWebP(bitmap, rule);
        return {
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            name: file.name.replace(/\.[^.]+$/, ".webp"),
            sourceName: file.name,
            dataUrl,
            format: "WebP",
            width: rule.width,
            height: rule.height,
            bytes: estimateDataUrlBytes(dataUrl),
            createdAt: new Date().toISOString()
        };
    }

    function loadImageBitmap(file) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("圖片讀取失敗，請重新選擇檔案。"));
            image.src = URL.createObjectURL(file);
        });
    }

    function cropToWebP(image, rule) {
        const canvas = document.createElement("canvas");
        canvas.width = rule.width;
        canvas.height = rule.height;
        const context = canvas.getContext("2d");

        const targetRatio = rule.width / rule.height;
        const sourceRatio = image.width / image.height;
        let sx = 0;
        let sy = 0;
        let sw = image.width;
        let sh = image.height;

        if (sourceRatio > targetRatio) {
            sw = image.height * targetRatio;
            sx = (image.width - sw) / 2;
        } else {
            sh = image.width / targetRatio;
            sy = (image.height - sh) / 2;
        }

        context.drawImage(image, sx, sy, sw, sh, 0, 0, rule.width, rule.height);
        URL.revokeObjectURL(image.src);
        return canvas.toDataURL("image/webp", rule.quality);
    }

    function estimateDataUrlBytes(dataUrl) {
        const base64 = dataUrl.split(",")[1] || "";
        return Math.round(base64.length * 0.75);
    }

    function removeImage(button) {
        const type = button.dataset.imageType;
        const index = Number(button.dataset.imageIndex);
        if (type === "cover") imageDraft.cover = null;
        if (type === "environment") imageDraft.environments.splice(index, 1);
        RestaurantFormView.renderImagePreviews(imageDraft);
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
            notes: formData.get("notes").trim(),
            tags: selectedTags,
            hours: hoursDraft,
            images: imageDraft
        };

        const saved = RestaurantModel.saveRestaurant(record);
        close();
        RestaurantApp.toast(id ? "餐廳資料已更新。" : "已新增餐廳。");
        if (onSaveCallback) onSaveCallback(saved);
    }

    return { open, close, bindGlobalEvents };
})();
