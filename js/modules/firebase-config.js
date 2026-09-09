import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Cấu hình Firebase với API Key của project cv-viminhhoang
const firebaseConfig = {
  apiKey: "AIzaSyCBQVGFcTTUlwiUphtIpdupHLapT10nX54",
  authDomain: "cv-viminhhoang.firebaseapp.com",
  projectId: "cv-viminhhoang",
  storageBucket: "cv-viminhhoang.firebasestorage.app",
  messagingSenderId: "713086747530",
  appId: "1:713086747530:web:bae71c37c1108e36e97e73",
  measurementId: "G-ZMX6MSREK3"
};

// Khởi tạo Firebase App & Firestore Database
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Hàm ghi dữ liệu vào Firestore (dùng cho Form liên hệ)
 */
export async function addContactData(data) {
  try {
    const docRef = await addDoc(collection(db, "contacts"), {
      ...data,
      createdAt: new Date()
    });
    console.log("Đã lưu dữ liệu thành công với ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Lỗi khi ghi dữ liệu vào Firebase:", error);
    return { success: false, error };
  }
}

/**
 * Hàm lấy dữ liệu từ Firestore (dùng để đọc dữ liệu động)
 */
export async function getCollectionData(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu:", error);
    return [];
  }
}
