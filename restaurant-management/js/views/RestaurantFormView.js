const RestaurantFormView = (() => {
    function renderModal({ restaurant, tags }) {
        const isEdit = Boolean(restaurant?.id);
        const data = restaurant || emptyRestaurant();
        const activeTags = tags.filter(item => !item.isDeleted);

        return `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
                <div class="modal-head">
                    <h2 id="modalTitle">${isEdit ? "編輯餐廳" : "新增餐廳"}</h2>
                    <button class="btn btn-icon" data-action="close-modal" aria-label="關閉">×</button>
                </div>
                <form id="restaurantForm">
                    <input type="hidden" name="id" value="${data.id || ""}">
                    <div class="modal-body">
                        <section class="form-section">
                            <h3>基本資料</h3>
                            <div class="form-grid">
                                ${field("餐廳名稱", "name", data.name, true)}
                                ${field("電話", "phone", data.phone)}
                                ${selectField("縣市", "city", data.city, ["台北市"], true)}
                                ${selectField("行政區", "district", data.district, ["大安區", "信義區", "士林區", "中山區", "中正區", "南港區", "松山區", "萬華區", "北投區", "文山區"], true)}
                            </div>
                            ${field("詳細地址", "address", data.address, true)}
                            ${textareaField("備註", "notes", data.notes, "例如：幾月幾號臨時不定期公休、禁止寵物入內等。")}
                            <p class="hint">備註對應 Restaurants.Notes，最多建議 1000 字。</p>
                        </section>

                        <section class="form-section">
                            <h3>標籤</h3>
                            <div class="choice-grid" id="tagChoices">
                                ${activeTags.map(tag => `
                                    <button type="button" class="choice ${data.tags.includes(tag.name) ? "active" : ""}" data-tag="${tag.name}">${tag.name}</button>
                                `).join("")}
                            </div>
                        </section>

                        <section class="form-section">
                            <h3>營業時間</h3>
                            <button type="button" class="btn" data-action="copy-first-day">□ 套用週一至全週</button>
                            <div class="hours-form" id="hoursForm">
                                ${data.hours.map((day, index) => hourRow(day, index)).join("")}
                            </div>
                        </section>

                        <section class="form-section">
                            <h3>餐廳圖片</h3>
                            <div class="image-manager">
                                ${imageUploader({
                                    key: "cover",
                                    title: "餐廳封面圖",
                                    spec: "JPG，寬度至少 1200px，5MB 以內，裁切 1200 × 675，輸出 WebP 品質 78",
                                    accept: "image/jpeg",
                                    multiple: false
                                })}
                                ${imageUploader({
                                    key: "environment",
                                    title: "餐廳環境圖",
                                    spec: "JPG，寬度至少 1200px，5MB 以內，裁切 1200 × 800，輸出 WebP 品質 80，可多張管理",
                                    accept: "image/jpeg",
                                    multiple: true
                                })}
                            </div>
                            <div id="coverPreview" class="image-preview-list"></div>
                            <div id="environmentPreview" class="image-preview-list"></div>
                        </section>
                    </div>
                    <div class="modal-foot">
                        <button type="button" class="btn" data-action="close-modal">取消</button>
                        <button type="submit" class="btn btn-primary">□ ${isEdit ? "儲存變更" : "新增餐廳"}</button>
                    </div>
                </form>
            </div>
        `;
    }

    function emptyRestaurant() {
        return {
            name: "",
            phone: "",
            city: "台北市",
            district: "",
            address: "",
            notes: "",
            tags: [],
            hours: JSON.parse(JSON.stringify(RestaurantModel.defaultHours)),
            images: { cover: null, environments: [] }
        };
    }

    function field(label, name, value = "", required = false) {
        return `
            <label class="field">
                <span>${label}${required ? ` <b class="required">*</b>` : ""}</span>
                <input class="input" name="${name}" value="${escapeAttr(value ?? "")}" ${required ? "required" : ""}>
            </label>
        `;
    }

    function textareaField(label, name, value = "", placeholder = "") {
        return `
            <label class="field">
                <span>${label}</span>
                <textarea class="textarea" name="${name}" maxlength="1000" placeholder="${escapeAttr(placeholder)}">${escapeText(value ?? "")}</textarea>
            </label>
        `;
    }

    function selectField(label, name, value, options, required = false) {
        return `
            <label class="field">
                <span>${label}${required ? ` <b class="required">*</b>` : ""}</span>
                <select class="select" name="${name}" ${required ? "required" : ""}>
                    <option value="">請選擇</option>
                    ${options.map(option => `<option ${option === value ? "selected" : ""}>${option}</option>`).join("")}
                </select>
            </label>
        `;
    }

    function hourRow(day, index) {
        return `
            <div class="hour-form-row" data-day-index="${index}">
                <strong>週${day.day}</strong>
                <label class="switch"><input type="checkbox" data-action="toggle-day" ${day.open ? "checked" : ""}>營業</label>
                <div class="slot-list">
                    ${day.open ? day.slots.map((slot, slotIndex) => slotRow(slot, slotIndex)).join("") : `<span class="muted">公休</span>`}
                    ${day.open ? `<button type="button" class="btn" data-action="add-slot">□ 新增時段</button>` : ""}
                </div>
            </div>
        `;
    }

    function slotRow(slot, slotIndex) {
        return `
            <div class="slot-row" data-slot-index="${slotIndex}">
                <input class="input" type="time" data-field="start" value="${slot.start}">
                <span>至</span>
                <input class="input" type="time" data-field="end" value="${slot.end}">
                <button type="button" class="btn btn-icon" data-action="remove-slot">×</button>
            </div>
        `;
    }

    function imageUploader({ key, title, spec, accept, multiple }) {
        return `
            <article class="image-uploader">
                <div>
                    <strong>${title}</strong>
                    <p>${spec}</p>
                </div>
                <label class="btn">
                    □ 選擇圖片
                    <input type="file" data-image-input="${key}" accept="${accept}" ${multiple ? "multiple" : ""} hidden>
                </label>
            </article>
        `;
    }

    function renderImagePreviews(images) {
        const cover = document.getElementById("coverPreview");
        const environment = document.getElementById("environmentPreview");
        if (cover) {
            cover.innerHTML = images.cover ? imageCard(images.cover, "cover") : emptyImageMessage("尚未上傳餐廳封面圖");
        }
        if (environment) {
            environment.innerHTML = images.environments.length
                ? images.environments.map((image, index) => imageCard(image, "environment", index)).join("")
                : emptyImageMessage("尚未上傳餐廳環境圖");
        }
    }

    function imageCard(image, type, index = 0) {
        const size = image.bytes ? `${(image.bytes / 1024).toFixed(0)} KB` : "已壓縮";
        return `
            <article class="image-preview-card">
                <img src="${image.dataUrl}" alt="${image.name}">
                <div>
                    <strong>${image.name}</strong>
                    <p>${image.width} × ${image.height}px · ${image.format} · ${size}</p>
                    <button type="button" class="btn btn-danger" data-action="remove-image" data-image-type="${type}" data-image-index="${index}">移除</button>
                </div>
            </article>
        `;
    }

    function emptyImageMessage(text) {
        return `<div class="image-empty">${text}</div>`;
    }

    function escapeAttr(value) {
        return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
    }

    function escapeText(value) {
        return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
    }

    return { renderModal, emptyRestaurant, hourRow, renderImagePreviews };
})();
