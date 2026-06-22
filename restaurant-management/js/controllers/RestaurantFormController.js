// =============================================
// Controller — RestaurantFormController.js
// 職責：協調表單頁的 Model ↔ View
// =============================================

const RestaurantFormController = (() => {

    const params = new URLSearchParams(window.location.search);
    const editID = params.get('id');
    const isEdit = !!editID;

    // 驗證規則（商業邏輯放在 Controller）
    function _validate(data) {
        const errors = {};

        if (!data.name) {
            errors.name = '餐廳名稱為必填';
        }
        if (!data.address) {
            errors.address = '地址為必填';
        }
        if (data.phone && !/^[\d\-\(\)\s]+$/.test(data.phone)) {
            errors.phone = '電話格式不正確';
        }
        if (data.latitude !== null) {
            const lat = parseFloat(data.latitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                errors.latitude = '緯度需介於 -90 ~ 90';
            }
        }
        if (data.longitude !== null) {
            const lng = parseFloat(data.longitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                errors.longitude = '經度需介於 -180 ~ 180';
            }
        }
        if (!data.categories || data.categories.length === 0) {
            errors.categories = '至少選擇一個類別';
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    }

    // 表單送出處理
    function _handleSubmit() {
        RestaurantFormView.clearErrors();
        const formData = RestaurantFormView.getFormData();
        const { isValid, errors } = _validate(formData);

        if (!isValid) {
            RestaurantFormView.showErrors(errors);
            return;
        }

        const payload = {
            ...formData,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            memberID: 1,
            memberName: 'admin',
        };

        if (isEdit) {
            RestaurantModel.update(editID, payload);
            alert('餐廳已更新！');
        } else {
            RestaurantModel.create(payload);
            alert('餐廳已新增！');
        }

        window.location.href = 'list.html';
    }

    // 初始化
    function init() {
        RestaurantFormView.bindCategoryToggle();
        RestaurantFormView.bindSubmit(_handleSubmit);

        if (isEdit) {
            const data = RestaurantModel.getByID(editID);
            if (data) {
                RestaurantFormView.setEditMode();
                RestaurantFormView.fillForm(data);
            }
        }
    }

    return { init };
})();

RestaurantFormController.init();