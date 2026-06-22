// =============================================
// View — RestaurantListView.js
// 職責：列表頁的所有畫面渲染
// 不做資料判斷、不呼叫 Model
// =============================================

const RestaurantListView = (() => {

    // 統計卡
    function renderStats(stats) {
        document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card">
        <div class="stat-label">餐廳總數</div>
        <div class="stat-val">${stats.total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">平均星級</div>
        <div class="stat-val">${stats.avgRating}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">評論總數</div>
        <div class="stat-val">${stats.totalReviews}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已軟刪除</div>
        <div class="stat-val">${stats.deleted}</div>
      </div>
    `;
    }

    // 餐廳列表表格
    function renderTable(list) {
        const tbody = document.getElementById('restaurantTableBody');
        const emptyMsg = document.getElementById('emptyMsg');

        if (list.length === 0) {
            tbody.innerHTML = '';
            emptyMsg.style.display = 'block';
            return;
        }
        emptyMsg.style.display = 'none';

        tbody.innerHTML = list.map(r => `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.categories.map(c => `<span class="tag">${c}</span>`).join('')}</td>
        <td class="text-muted">${r.address}</td>
        <td class="text-muted">${r.phone || '—'}</td>
        <td>★ ${r.averageRating.toFixed(1)}</td>
        <td>${r.reviewCount}</td>
        <td>
          <a href="detail.html?id=${r.id}" class="btn btn-sm">詳情</a>
          <a href="form.html?id=${r.id}"   class="btn btn-sm">編輯</a>
          <button class="btn btn-sm btn-danger"
                  data-action="delete" data-id="${r.id}">刪除</button>
        </td>
      </tr>
    `).join('');
    }

    // 綁定篩選條件變更事件（傳入 callback 給 Controller 處理）
    function bindFilterEvents(onFilterChange) {
        document.getElementById('searchInput')
            .addEventListener('input', onFilterChange);
        document.getElementById('categoryFilter')
            .addEventListener('change', onFilterChange);
        document.getElementById('sortSelect')
            .addEventListener('change', onFilterChange);
    }

    // 綁定刪除按鈕（事件委派，傳入 callback）
    function bindDeleteEvent(onDelete) {
        document.getElementById('restaurantTableBody')
            .addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action="delete"]');
                if (btn) onDelete(btn.dataset.id);
            });
    }

    // 取得篩選條件的當前值
    function getFilterValues() {
        return {
            keyword: document.getElementById('searchInput').value,
            category: document.getElementById('categoryFilter').value,
            sortBy: document.getElementById('sortSelect').value,
        };
    }

    return { renderStats, renderTable, bindFilterEvents, bindDeleteEvent, getFilterValues };
})();