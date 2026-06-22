javascript// =============================================
// View — RestaurantDetailView.js
// 職責：詳情頁的畫面渲染
// =============================================

const RestaurantDetailView = (() => {

    // 找不到資料時顯示錯誤
    function renderNotFound() {
        document.querySelector('.container').innerHTML =
            '<p class="empty-msg">找不到此餐廳，<a href="list.html">返回列表</a></p>';
    }

    // 渲染操作按鈕列
    function renderActions(id) {
        document.getElementById('detailActions').innerHTML = `
      <a href="form.html?id=${id}" class="btn btn-primary">編輯</a>
      <button class="btn btn-danger" data-action="soft-delete">軟刪除</button>
    `;
    }

    // 渲染基本資訊列
    function renderInfoRows(data) {
        const rows = [
            ['地址', data.address],
            ['電話', data.phone || '—'],
            ['營業時間', data.businessHours || '—'],
            ['類別', data.categories.map(c => `<span class="tag">${c}</span>`).join('')],
            ['新增者', `${data.memberName}（ID: ${data.memberID}）`],
            ['建立時間', new Date(data.createdAt).toLocaleString('zh-TW')],
        ];

        document.getElementById('infoRows').innerHTML = rows.map(([k, v]) => `
      <div class="info-row">
        <span class="info-key">${k}</span>
        <span class="info-val">${v}</span>
      </div>
    `).join('');
    }

    // 填入經緯度欄位
    function fillCoords(lat, lng) {
        document.getElementById('editLat').value = lat ?? '';
        document.getElementById('editLng').value = lng ?? '';
    }

    // 讀取座標欄位值
    function getCoords() {
        return {
            latitude: document.getElementById('editLat').value.trim() || null,
            longitude: document.getElementById('editLng').value.trim() || null,
        };
    }

    // 渲染評分統計
    function renderRating(data) {
        const full = Math.round(data.averageRating);
        const empty = 5 - full;
        document.getElementById('ratingDisplay').innerHTML = `
      <div class="rating-big">${data.averageRating.toFixed(1)}</div>
      <div class="stars">${'★'.repeat(full)}${'☆'.repeat(empty)}</div>
      <div class="text-muted" style="margin-top:6px">共 ${data.reviewCount} 則評論</div>
    `;
    }

    // 綁定儲存座標按鈕
    function bindSaveCoord(onSave) {
        document.getElementById('saveCoordBtn')
            .addEventListener('click', onSave);
    }

    // 綁定軟刪除按鈕（事件委派）
    function bindSoftDelete(onDelete) {
        document.getElementById('detailActions')
            .addEventListener('click', (e) => {
                if (e.target.dataset.action === 'soft-delete') onDelete();
            });
    }

    return {
        renderNotFound, renderActions, renderInfoRows,
        fillCoords, getCoords, renderRating, bindSaveCoord, bindSoftDelete
    };
})();