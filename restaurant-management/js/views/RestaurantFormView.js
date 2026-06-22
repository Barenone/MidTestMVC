// =============================================
// View — RestaurantFormView.js
// 職責：表單頁的畫面渲染與欄位存取
// =============================================

const RestaurantFormView = (() => {

    // 切換為「編輯模式」標題
    function setEditMode() {
        document.getElementById('formTitle').textContent = '編輯餐廳';
        document.getElementById('submitBtn').textContent = '更新餐廳';
    }

    // 將資料填入表單欄位（編輯時使用）
    function fillForm(data) {
        document.getElementById('name').value = data.name || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('businessHours').value = data.businessHours || '';
        document.getElementById('latitude').value = data.latitude ?? '';
        document.getElementById('longitude').value = data.longitude ?? '';

        data.categories.forEach(cat => {
            const btn = document.querySelector(`.cat-btn[data-cat="${cat}"]`);
            if (btn) btn.classList.add('active');
        });
    }

    // 從表單收集資料（交給 Controller）
    function getFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            businessHours: document.getElementById('businessHours').value.trim(),
            latitude: document.getElementById('latitude').value.trim() || null,
            longitude: document.getElementById('longitude').value.trim() || null,
            categories: [...document.querySelectorAll('.cat-btn.active')]
                .map(btn => btn.dataset.cat),
        };
    }

    // 顯示驗證錯誤
    function showErrors(errors) {
        ['name', 'phone', 'address', 'latitude', 'longitude', 'categories']
            .forEach(field => {
                const el = document.getElementById(`err-${field}`);
                if (el) el.textContent = errors[field] || '';
            });
    }

    // 清除所有錯誤訊息
    function clearErrors() {
        showErrors({});
    }

    // 綁定類別切換
    function bindCategoryToggle() {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', () => btn.classList.toggle('active'));
        });
    }

    // 綁定表單送出（傳入 callback）
    function bindSubmit(onSubmit) {
        document.getElementById('restaurantForm')
            .addEventListener('submit', (e) => {
                e.preventDefault();
                onSubmit();
            });
    }

    return {
        setEditMode, fillForm, getFormData, showErrors, clearErrors,
        bindCategoryToggle, bindSubmit
    };
})();