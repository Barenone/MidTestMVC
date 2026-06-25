const RestaurantListView = (() => {
    const tagClassMap = {
        "台式料理": "food-taiwan",
        "火鍋": "hotpot",
        "咖啡廳": "cafe",
        "違規內容": "violation"
    };

    function tag(name, extraClass = "") {
        const cls = tagClassMap[name] || extraClass || "";
        return `<span class="tag ${cls}">${name}</span>`;
    }

    function statsCards(stats) {
        return `
            <div class="stats-grid">
                <article class="stat-card"><span>餐廳總數</span><strong>${stats.total}</strong><small>本月 +5</small></article>
                <article class="stat-card"><span>平均星級</span><strong>${stats.avgRating}</strong><small>全平台</small></article>
                <article class="stat-card"><span>評論總數</span><strong>${stats.reviewCount}</strong><small>本週 +18</small></article>
                <article class="stat-card"><span>停用中</span><strong class="danger-text">${stats.deleted}</strong><small>可還原</small></article>
            </div>
        `;
    }

    function renderList({ stats, restaurants, tags }) {
        const activeTags = tags.filter(item => !item.isDeleted);
        return `
            ${statsCards(stats)}
            <div class="toolbar">
                <div class="filter-row">
                    <input id="searchInput" class="input" type="search" placeholder="搜尋餐廳名稱...">
                    <select id="cityFilter" class="select">
                        <option value="">全部縣市</option>
                        <option>台北市</option>
                    </select>
                    <select id="districtFilter" class="select">
                        <option value="">全部行政區</option>
                        <option>大安區</option>
                        <option>信義區</option>
                        <option>士林區</option>
                        <option>中山區</option>
                        <option>中正區</option>
                    </select>
                    <select id="tagFilter" class="select">
                        <option value="">全部標籤</option>
                        ${activeTags.map(item => `<option>${item.name}</option>`).join("")}
                    </select>
                    <select id="sortSelect" class="select">
                        <option value="newest">最新新增</option>
                        <option value="rating">星級最高</option>
                        <option value="review">評論最多</option>
                    </select>
                </div>
            </div>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>餐廳名稱</th>
                            <th>縣市 / 行政區</th>
                            <th>標籤</th>
                            <th>電話</th>
                            <th>星級</th>
                            <th>評...</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="restaurantRows">${restaurantRows(restaurants)}</tbody>
                </table>
            </div>
            <div class="pager"><span>共 ${restaurants.length} 筆</span><button class="btn">□</button><button class="btn">1</button><button class="btn">2</button><button class="btn">3</button><button class="btn">□</button></div>
        `;
    }

    function restaurantRows(restaurants) {
        if (!restaurants.length) {
            return `<tr><td colspan="7" class="muted">目前沒有符合條件的餐廳。</td></tr>`;
        }
        return restaurants.map(item => `
            <tr data-id="${item.id}">
                <td><strong>${item.name}</strong></td>
                <td>${item.city} · ${item.district}</td>
                <td>${item.tags.map(name => tag(name)).join(" ")}</td>
                <td class="muted">${item.phone}</td>
                <td><span class="stars">★</span>${item.rating.toFixed(1)}</td>
                <td>${item.reviewCount}</td>
                <td>
                    <button class="btn btn-icon" title="查看" data-action="detail" data-id="${item.id}">□</button>
                    <button class="btn btn-icon" title="編輯" data-action="edit" data-id="${item.id}">...</button>
                </td>
            </tr>
        `).join("");
    }

    function renderDeleted({ restaurants }) {
        return `
            <div class="alert">以下餐廳已停用（IsDeleted = 1），一般用戶不可見。點擊進入詳細頁面可解除停用或永久刪除。</div>
            <div class="stats-grid">
                <article class="stat-card"><span>停用總數</span><strong>${restaurants.length}</strong><small>可還原</small></article>
                <article class="stat-card"><span>最近停用</span><strong>${restaurants[0]?.deletedAt || "-"}</strong><small>${restaurants[0]?.name || "-"}</small></article>
                <article class="stat-card"><span>前次停用原因</span><strong>${restaurants[0]?.deleteReason || "-"}</strong><small>由 admin 執行</small></article>
            </div>
            <div class="toolbar">
                <div class="filter-row deleted-filters">
                    <input id="deletedSearchInput" class="input" type="search" placeholder="搜尋停用餐廳...">
                    <select id="deletedCityFilter" class="select"><option value="">全部縣市</option><option>台北市</option></select>
                    <select id="deletedReasonFilter" class="select">
                        <option value="">全部停用原因</option>
                        <option>已歇業</option>
                        <option>資訊不實</option>
                        <option>違規內容</option>
                    </select>
                </div>
            </div>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr><th>餐廳名稱</th><th>縣市 / 行政區</th><th>標籤</th><th>停用時間</th><th>停用原因</th><th>執行者</th><th>操作</th></tr>
                    </thead>
                    <tbody id="deletedRows">${deletedRows(restaurants)}</tbody>
                </table>
            </div>
        `;
    }

    function deletedRows(restaurants) {
        if (!restaurants.length) {
            return `<tr><td colspan="7" class="muted">目前沒有停用餐廳。</td></tr>`;
        }
        return restaurants.map(item => `
            <tr data-id="${item.id}">
                <td><strong>${item.name}</strong></td>
                <td>${item.city} · ${item.district}</td>
                <td>${item.tags.map(name => tag(name, "neutral")).join(" ")}</td>
                <td class="muted">${item.deletedAt}</td>
                <td>${tag(item.deleteReason, item.deleteReason === "已歇業" ? "cafe" : "violation")}</td>
                <td class="muted">${item.deletedBy}</td>
                <td><button class="btn btn-icon" title="查看" data-action="deleted-detail" data-id="${item.id}">□</button></td>
            </tr>
        `).join("");
    }

    function renderTags(tags) {
        const active = tags.filter(item => !item.isDeleted);
        const inactive = tags.filter(item => item.isDeleted);
        return `
            <div class="tag-page-row">
                <input id="newTagInput" class="input" placeholder="輸入新標籤名稱，ex. 越南料理">
                <button id="addTagBtn" class="btn">□ 新增標籤</button>
            </div>
            <p class="hint">點擊停用後標籤將執行軟刪除（IsDeleted = 1），並自動移至下方停用區。</p>
            <div class="tag-grid">
                ${active.map(item => tagCard(item)).join("")}
            </div>
            <div class="divider">停用中 ${inactive.length} 個標籤（IsDeleted = 1）</div>
            <div class="tag-grid">
                ${inactive.map(item => tagCard(item)).join("")}
            </div>
        `;
    }

    function tagCard(item) {
        const usage = RestaurantModel.tagUsage(item.name);
        return `
            <article class="tag-card ${item.isDeleted ? "inactive" : ""}">
                <div>
                    <strong>${item.name}</strong>
                    <p class="muted">${item.isDeleted ? `已停用，原 ${usage} 間餐廳使用` : `使用中 ${usage} 間餐廳`}</p>
                </div>
                <button class="btn ${item.isDeleted ? "btn-restore" : "btn-danger"}" data-action="toggle-tag" data-id="${item.id}">
                    □ ${item.isDeleted ? "啟用" : "停用"}
                </button>
            </article>
        `;
    }

    return {
        renderList,
        restaurantRows,
        renderDeleted,
        deletedRows,
        renderTags,
        tag
    };
})();
