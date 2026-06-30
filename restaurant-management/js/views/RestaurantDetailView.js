const RestaurantDetailView = (() => {
    function render(restaurant, { deleted = false } = {}) {
        if (!restaurant) {
            return `<div class="card">找不到餐廳資料。</div>`;
        }

        return `
            <div class="detail-header">
                <div class="detail-title">
                    <button class="btn" data-action="${deleted ? "back-deleted" : "back-list"}">□ 返回</button>
                    <h2>${restaurant.name}</h2>
                    ${deleted ? `<span class="tag closed">停用中</span>` : ""}
                </div>
                <div class="page-actions">
                    ${deleted ? `
                        <button class="btn" data-action="edit-deleted" data-id="${restaurant.id}">□ 編輯</button>
                        <button class="btn btn-restore" data-action="restore" data-id="${restaurant.id}">□ 解除停用</button>
                        <button class="btn btn-danger" data-action="hard-delete" data-id="${restaurant.id}">□ 永久刪除</button>
                    ` : `
                        <button class="btn" data-action="edit" data-id="${restaurant.id}">□ 編輯</button>
                        <button class="btn btn-danger" data-action="soft-delete" data-id="${restaurant.id}">□ 停用</button>
                    `}
                </div>
            </div>

            ${deleted ? `<div class="alert">此資料目前 IsDeleted = 1。可先編輯修正資料，再解除停用回到餐廳一覽。</div>` : ""}

            <div class="detail-grid">
                <div>
                    ${imageSection(restaurant)}

                    <section class="card">
                        <h3>基本資訊</h3>
                        ${infoRow("餐廳名稱", restaurant.name)}
                        ${infoRow("縣市", restaurant.city)}
                        ${infoRow("行政區", restaurant.district)}
                        ${infoRow("詳細地址", restaurant.address)}
                        ${infoRow("電話", restaurant.phone)}
                        ${infoRow("標籤", restaurant.tags.map(name => RestaurantListView.tag(name)).join(" "))}
                        ${infoRow("擁有者", `${restaurant.owner}（MemberID: ${restaurant.memberId}）`)}
                    </section>

                    <section class="card">
                        <h3>營業時間</h3>
                        <div class="hours-grid">
                            ${restaurant.hours.map(day => `
                                <div class="hour-day">
                                    <b>週${day.day}</b>
                                    ${day.open ? day.slots.map(slot => `<div>${slot.start}<br>${slot.end}</div>`).join("") : `<span class="muted">公休</span>`}
                                </div>
                            `).join("")}
                        </div>
                    </section>
                </div>

                <div>
                    <section class="card">
                        <h3>評分摘要</h3>
                        <strong style="font-size:42px">${restaurant.rating.toFixed(1)}</strong>
                        <p><span class="stars">★★★★★</span></p>
                        <p class="muted">共 ${restaurant.reviewCount} 則評論</p>
                    </section>

                    <section class="card">
                        <h3>座標</h3>
                        ${infoRow("Latitude", restaurant.latitude ?? "尚未填寫")}
                        ${infoRow("Longitude", restaurant.longitude ?? "尚未填寫")}
                    </section>

                    ${deleted ? `
                        <section class="card">
                            <h3>停用資訊</h3>
                            ${infoRow("停用時間", restaurant.deletedAt)}
                            ${infoRow("執行者", restaurant.deletedBy)}
                            ${infoRow("停用原因", RestaurantListView.tag(restaurant.deleteReason, "violation"))}
                        </section>
                    ` : ""}
                </div>
            </div>
        `;
    }

    function imageSection(restaurant) {
        const cover = restaurant.images?.cover;
        const environments = restaurant.images?.environments || [];
        const visibleEnvironments = environments.slice(0, 6);
        const hiddenCount = Math.max(environments.length - 6, 0);

        return `
            <section class="card">
                <h3>餐廳圖片</h3>
                <div class="detail-image-grid">
                    <div class="detail-cover">
                        ${cover ? imageButton(cover, {
                            action: "view-image",
                            restaurantId: restaurant.id,
                            type: "cover",
                            index: 0,
                            className: "detail-image-button cover"
                        }) : `<div class="image-empty">尚未上傳封面圖</div>`}
                    </div>
                    <div class="detail-env-list">
                        ${visibleEnvironments.length ? visibleEnvironments.map((image, index) => {
                            const isOverflowTile = index === 5 && hiddenCount > 0;
                            return imageButton(image, {
                                action: isOverflowTile ? "view-environment-gallery" : "view-image",
                                restaurantId: restaurant.id,
                                type: "environment",
                                index,
                                className: `detail-image-button environment ${isOverflowTile ? "has-more" : ""}`,
                                overlay: isOverflowTile ? `+${hiddenCount}` : ""
                            });
                        }).join("") : `<div class="image-empty">尚未上傳環境圖</div>`}
                    </div>
                </div>
            </section>
        `;
    }

    function imageButton(image, { action, restaurantId, type, index, className, overlay = "" }) {
        return `
            <button class="${className}" data-action="${action}" data-id="${restaurantId}" data-image-type="${type}" data-image-index="${index}" title="檢視 ${image.name}">
                <img src="${image.dataUrl}" alt="${image.name}">
                ${overlay ? `<span class="image-more-overlay">${overlay}</span>` : ""}
            </button>
        `;
    }

    function renderSingleImageModal(image) {
        return `
            <div class="modal lightbox-modal" role="dialog" aria-modal="true" aria-label="圖片檢視">
                <div class="modal-head">
                    <div>
                        <h2>${image.name}</h2>
                        <p class="muted">${image.width} × ${image.height}px · ${image.format}</p>
                    </div>
                    <button class="btn btn-icon" data-action="close-modal" aria-label="關閉">×</button>
                </div>
                <div class="lightbox-body">
                    <img class="lightbox-image" src="${image.dataUrl}" alt="${image.name}">
                </div>
            </div>
        `;
    }

    function renderGalleryModal(images) {
        return `
            <div class="modal gallery-modal" role="dialog" aria-modal="true" aria-label="環境圖一覽">
                <div class="modal-head">
                    <div>
                        <h2>環境圖一覽</h2>
                        <p class="muted">共 ${images.length} 張</p>
                    </div>
                    <button class="btn btn-icon" data-action="close-modal" aria-label="關閉">×</button>
                </div>
                <div class="gallery-body">
                    ${images.map(image => `
                        <figure class="gallery-item">
                            <img src="${image.dataUrl}" alt="${image.name}">
                            <figcaption>${image.name}</figcaption>
                        </figure>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function infoRow(key, value) {
        return `
            <div class="info-row">
                <span class="info-key">${key}</span>
                <span>${value}</span>
            </div>
        `;
    }

    return { render, renderSingleImageModal, renderGalleryModal };
})();
