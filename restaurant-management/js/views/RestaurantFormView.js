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
                                ${selectField("行政區", "district", data.district, ["大安區", "信義區", "士林區", "中山區", "中正區"], true)}
                            </div>
                            ${field("詳細地址", "address", data.address, true)}
                            <p class="hint">實作後可串接地圖 API，由地址自動轉換 Latitude / Longitude。</p>
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
                            <h3>圖片</h3>
                            <p class="hint">封面可對應 RestaurantCover，環境照可對應 RestaurantEnvironment。</p>
                            <div class="image-placeholders">
                                <div class="image-box">封面</div>
                                <div class="image-box">新增</div>
                                <div class="image-box">環境照</div>
                                <div class="image-box">新增</div>
                            </div>
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
            tags: [],
            hours: JSON.parse(JSON.stringify(RestaurantModel.defaultHours))
        };
    }

    function field(label, name, value = "", required = false) {
        return `
            <label class="field">
                <span>${label}${required ? ` <b class="required">*</b>` : ""}</span>
                <input class="input" name="${name}" value="${value ?? ""}" ${required ? "required" : ""}>
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

    return { renderModal, emptyRestaurant, hourRow };
})();
