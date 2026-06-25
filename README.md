# 餐廳管理系統 JavaScript MVC 雛型

本專案先聚焦在餐廳管理後台，包含餐廳一覽、餐廳詳細、預填編輯視窗、餐廳標籤一覽、停用餐廳一覽。會員系統、評論系統、檢舉系統目前只保留側欄入口，不做功能實作。

## 1. 開啟方式

1. 用 Visual Studio Code 開啟 `D:\MidTestMVC`。
2. 開啟 `restaurant-management/index.html`。
3. 可直接用瀏覽器開啟，或使用 VS Code 的 Live Server。
4. 若畫面資料被測試改亂，可清除瀏覽器 localStorage 後重新整理，系統會重新建立預設假資料。

## 2. 檔案結構

```text
restaurant-management/
  index.html
  css/
    style.css
  js/
    models/
      RestaurantModel.js
    views/
      RestaurantListView.js
      RestaurantDetailView.js
      RestaurantFormView.js
    controllers/
      RestaurantListController.js
      RestaurantDetailController.js
      RestaurantFormController.js
  pages/
    list.html
    detail.html
    form.html
```

## 3. MVC 分工

`RestaurantModel.js` 負責資料與假資料，先用 localStorage 模擬資料庫。包含餐廳資料、標籤資料、新增、修改、停用、復原、永久刪除。

`RestaurantListView.js` 負責餐廳一覽、停用餐廳一覽、標籤一覽的 HTML 模板。

`RestaurantDetailView.js` 負責餐廳詳細資料與停用餐廳詳細資料的 HTML 模板。

`RestaurantFormView.js` 負責新增與編輯餐廳的彈出視窗表單。

`RestaurantListController.js` 是目前的主要入口，負責導覽、搜尋、篩選、切換頁面與全域事件。

`RestaurantDetailController.js` 負責詳細頁的編輯、停用、解除停用與永久刪除。

`RestaurantFormController.js` 負責表單送出、標籤選取、營業時間增減、套用週一時段。

## 4. 操作流程

1. 進入 `index.html` 後，預設顯示「餐廳一覽」。
2. 在餐廳一覽可用關鍵字、縣市、行政區、標籤、排序篩選資料。
3. 點擊表格列或查看按鈕可進入餐廳詳細。
4. 在詳細頁點「編輯」會開啟已預填資料的編輯視窗。
5. 在詳細頁點「停用」會輸入停用原因，資料移到「停用餐廳一覽」。
6. 在停用餐廳詳細頁可選擇「解除停用」或「永久刪除」。
7. 在「餐廳標籤一覽」可新增標籤，或將標籤停用。停用標籤會自動移到下方停用區。

## 5. 對應資料庫欄位建議

餐廳主檔可對應 Restaurant，建議欄位包含：

```text
RestaurantID, Name, City, District, Address, Phone,
Latitude, Longitude, MemberID, AverageRating, ReviewCount,
IsDeleted, DeletedAt, DeletedBy, DeleteReason, CreatedAt
```

標籤可對應 RestaurantTag：

```text
TagID, Name, IsDeleted
```

餐廳與標籤關聯可對應 RestaurantTagMap：

```text
RestaurantID, TagID
```

營業時間可對應 RestaurantBusinessHour：

```text
RestaurantID, DayOfWeek, OpenTime, CloseTime, SortOrder, IsClosed
```

圖片可對應：

```text
RestaurantCover
RestaurantEnvironment
```

## 6. 後續接三層式架構建議

目前前端 Model 使用 localStorage，之後可替換成 API 呼叫：

1. Presentation Layer：保留目前 HTML、CSS、View、Controller。
2. Business Logic Layer：建立餐廳服務，例如 RestaurantService，處理驗證、軟刪除規則、標籤可用狀態。
3. Data Access Layer：建立 Repository，負責連接資料庫。
4. 將 `RestaurantModel.js` 的 localStorage 方法改成 `fetch()` 呼叫後端 API。

建議 API：

```text
GET    /api/restaurants
GET    /api/restaurants/{id}
POST   /api/restaurants
PUT    /api/restaurants/{id}
PATCH  /api/restaurants/{id}/disable
PATCH  /api/restaurants/{id}/restore
DELETE /api/restaurants/{id}

GET    /api/restaurant-tags
POST   /api/restaurant-tags
PATCH  /api/restaurant-tags/{id}/toggle
```

## 7. 本次雛型重點

- 先完成餐廳管理，不混入其他同學負責的系統。
- 使用 JavaScript MVC 分層，方便後續改成 ASP.NET MVC 的 View + Controller + API。
- 使用 IsDeleted 模擬軟刪除。
- 停用標籤不直接消失，而是移到下方停用區。
- 詳細頁編輯視窗會預填既有資料。
