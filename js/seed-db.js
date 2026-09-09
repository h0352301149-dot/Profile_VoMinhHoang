/* =========================================================
   FIRESTORE DATABASE SEED RUNNER
   - Chạy độc lập hoặc import trong Console F12
   - Lệnh nhanh trong Console:
       import('./js/seed-db.js')
     Hoặc:
       await window.cvDataService.seedAllDataToDatabase()
========================================================= */

import { seedAllDataToDatabase } from './data-service.js';

console.log("⚡ Đang kích hoạt Script đẩy toàn bộ dữ liệu lên Firebase Firestore...");
seedAllDataToDatabase().then(() => {
  console.log("%c🎉 ĐÃ HOÀN TẤT ĐẨY TOÀN BỘ DỮ LIỆU LÊN DATABASE!", "color: #10b981; font-weight: bold; font-size: 14px;");
}).catch(err => {
  console.error("❌ Có lỗi xảy ra trong quá trình seed database:", err);
});
