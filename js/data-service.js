/* =========================================================
   CV DATA SERVICE & FIRESTORE CRAWLER
   - Cào/kéo 100% dữ liệu từ Firestore Database
   - Cung cấp API window.cvDataService để lấy dữ liệu bất kỳ lúc nào
   - Render động vào toàn bộ UI Shell (Không chứa dữ liệu cứng trong HTML)
   - Hỗ trợ xuất dữ liệu JSON & Nạp dữ liệu (Seed DB)
========================================================= */

import { db } from './modules/firebase-config.js';
import { applyLanguage } from './modules/i18n.js';
import { 
  doc, 
  getDoc, 
  setDoc,
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Bộ nhớ đệm dữ liệu toàn cục
window.__cvDataCache = null;

/**
 * 1. CÀO TOÀN BỘ DỮ LIỆU TỪ DATABASE VỀ (PROFILE, EDUCATION, PROJECTS, SKILLS, MINDSET)
 * @returns {Promise<Object>} Đối tượng chứa toàn bộ dữ liệu CV
 */
export async function fetchAllCVData() {
  console.log("🔄 Đang cào toàn bộ dữ liệu từ Firestore Database...");
  
  try {
    const [profileSnap, eduSnap, projSnap, skillsSnap, mindsetSnap] = await Promise.all([
      // 1. Profile
      getDoc(doc(db, "profile", "main")),
      // 2. Education
      getDocs(query(collection(db, "education"), orderBy("order", "asc"))),
      // 3. Projects
      getDocs(query(collection(db, "projects"), orderBy("order", "asc"))),
      // 4. Skills
      getDocs(query(collection(db, "skills"), orderBy("order", "asc"))),
      // 5. Mindset
      getDocs(query(collection(db, "mindset"), orderBy("order", "asc")))
    ]);

    const result = {
      profile: profileSnap.exists() ? profileSnap.data() : null,
      education: eduSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      projects: projSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      skills: skillsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      mindset: mindsetSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      fetchedAt: new Date().toISOString()
    };

    window.__cvDataCache = result;
    console.log("✅ Đã cào thành công toàn bộ dữ liệu từ Database:", result);
    return result;
  } catch (error) {
    console.error("❌ Lỗi khi cào dữ liệu từ Firestore:", error);
    throw error;
  }
}

/**
 * 2. RENDER DỮ LIỆU PROFILE & AVATAR VÀO UI
 */
export function renderProfile(profile) {
  if (!profile) return;

  const currentLang = localStorage.getItem('cv_lang') || 'vi';
  const dict = window.translations ? window.translations[currentLang] : null;

  // Avatar ảnh đại diện từ database
  if (profile.avatarUrl) {
    const avatarImg = document.getElementById("hero-avatar");
    if (avatarImg) avatarImg.src = profile.avatarUrl;
  }

  // Tên & Chức danh
  const nameEl = document.getElementById("hero-name");
  if (nameEl) {
    nameEl.textContent = (dict && dict["name"]) || profile.fullName || "VÕ MINH HOÀNG";
    nameEl.setAttribute("data-i18n", "name");
  }

  const titleEl = document.getElementById("hero-title");
  if (titleEl) {
    titleEl.textContent = (dict && dict["role"]) || profile.title || "Chuyên ngành Khoa học Dữ liệu";
    titleEl.setAttribute("data-i18n", "role");
  }

  const statusEl = document.getElementById("hero-status");
  if (statusEl) {
    statusEl.textContent = (dict && dict["status"]) || profile.status || "Sẵn sàng nhận việc";
    statusEl.setAttribute("data-i18n", "status");
  }

  // Mục tiêu nghề nghiệp (Bio)
  const bioEl = document.getElementById("hero-bio");
  if (bioEl) {
    bioEl.innerHTML = (dict && dict["desc-about"]) || profile.bio || "";
    bioEl.setAttribute("data-i18n", "desc-about");
  }

  // Liên hệ (Phone & Zalo)
  const phoneEl = document.getElementById("hero-phone");
  const phoneChip = document.getElementById("hero-phone-chip");
  if (profile.phone) {
    if (phoneEl) phoneEl.textContent = profile.phone;
    if (phoneChip) phoneChip.setAttribute("data-copy", profile.phone);
  }

  // Liên hệ (Email)
  const emailEl = document.getElementById("hero-email");
  const emailChip = document.getElementById("hero-email-chip");
  if (profile.email) {
    if (emailEl) emailEl.textContent = profile.email;
    if (emailChip) emailChip.setAttribute("data-copy", profile.email);
  }

  // Ngày sinh & Địa chỉ
  const dobEl = document.getElementById("hero-dob");
  if (dobEl) {
    dobEl.textContent = (dict && dict["val-dob"]) || profile.dob || "22 tháng 02 năm 2005";
    dobEl.setAttribute("data-i18n", "val-dob");
  }

  const locEl = document.getElementById("hero-loc");
  if (locEl) {
    locEl.textContent = (dict && dict["val-loc"]) || profile.location || "TP. Hồ Chí Minh";
    locEl.setAttribute("data-i18n", "val-loc");
  }

  // Liên kết mạng xã hội & CV
  const cvBtn = document.getElementById("hero-cv-btn");
  if (cvBtn && profile.cvUrl) cvBtn.href = profile.cvUrl;

  const githubLink = document.getElementById("hero-github-link");
  if (githubLink && profile.github) githubLink.href = profile.github;

  const linkedinLink = document.getElementById("hero-linkedin-link");
  if (linkedinLink && profile.linkedin) linkedinLink.href = profile.linkedin;
}

/**
 * 3. RENDER HỌC VẤN (EDUCATION) VÀO UI
 */
export function renderEducation(eduList) {
  const container = document.getElementById("education-container");
  if (!container || !eduList || eduList.length === 0) return;

  const currentLang = localStorage.getItem('cv_lang') || 'vi';
  const dict = window.translations ? window.translations[currentLang] : null;

  container.innerHTML = eduList.map((edu, idx) => {
    const schoolName = (dict && dict["edu-school"]) || edu.school || '';
    const majorName = (dict && dict["edu-major"]) || edu.degree || '';
    const periodText = (dict && dict["edu-period"]) || (edu.period ? `(${edu.period})` : '');
    const descText = (dict && dict["edu-desc"]) || edu.description || '';

    return `
    <div class="edu-item" style="${idx < eduList.length - 1 ? 'margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px dashed rgba(2, 132, 199, 0.2);' : ''}">
      <div class="edu-top-line">
        <h3 id="edu-school" data-i18n="edu-school" style="font-size: 1.05rem; font-weight: 800; color: var(--card-text);">${schoolName}</h3>
        ${edu.gpa ? `<span class="gpa-pill" id="edu-gpa">${edu.gpa}</span>` : ''}
      </div>
      <p class="edu-period">
        <span id="edu-degree" data-i18n="edu-major">${majorName}</span> 
        <span id="edu-period" data-i18n="edu-period" style="font-size: 0.82rem; opacity: 0.85;">${periodText}</span>
      </p>
      <p class="edu-summary" id="edu-desc" data-i18n="edu-desc" style="font-size: 0.88rem; color: var(--card-muted); line-height: 1.6; margin-top: 4px;">${descText}</p>
    </div>
    `;
  }).join("");
}

/**
 * 4. RENDER DỰ ÁN NỔI BẬT (PROJECTS) VÀO UI
 */
export function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  if (!container || !projects || projects.length === 0) return;

  const currentLang = localStorage.getItem('cv_lang') || 'vi';
  const dict = window.translations ? window.translations[currentLang] : null;

  const colorPods = ["pod-pastel-blue", "pod-pastel-peach", "pod-pastel-mint"];
  const flagColors = ["flag-pastel-blue", "flag-pastel-peach", "flag-pastel-mint"];
  const chipColors = ["chip-pastel-blue", "chip-pastel-purple", "chip-pastel-peach", "chip-pastel-mint"];

  container.innerHTML = projects.map((p, index) => {
    const pIdx = index + 1;
    const podClass = colorPods[index % colorPods.length];
    const flagClass = flagColors[index % flagColors.length];

    // Icon phù hợp theo danh mục
    let catIcon = "fa-code";
    if (p.category) {
      const cat = p.category.toLowerCase();
      if (cat.includes("ml") || cat.includes("pipeline") || cat.includes("ai") || cat.includes("deep") || cat.includes("vision")) catIcon = "fa-check";
      else if (cat.includes("bi") || cat.includes("dashboard") || cat.includes("chart") || cat.includes("báo cáo")) catIcon = "fa-chart-line";
      else if (cat.includes("app") || cat.includes("mobile") || cat.includes("web") || cat.includes("platform")) catIcon = "fa-mobile-screen";
      else if (cat.includes("nlp") || cat.includes("sentiment") || cat.includes("text")) catIcon = "fa-language";
    }

    // Title theo ngôn ngữ hiện tại
    const titleText = (dict && dict[`p${pIdx}-title`]) || p.title || "Dự án mới";

    // Bullet points theo ngôn ngữ hiện tại
    let descHtml = "";
    if (Array.isArray(p.bullets) && p.bullets.length > 0) {
      descHtml = `<ul class="bullet-list">` + p.bullets.map((b, bi) => {
        const defaultFormatted = b.includes(":") ? b.replace(/^([^:]+:)/, "<strong>$1</strong>") : b;
        const bulletText = (dict && dict[`p${pIdx}-b${bi + 1}`]) || defaultFormatted;
        return `<li data-i18n="p${pIdx}-b${bi + 1}">${bulletText}</li>`;
      }).join("") + `</ul>`;
    } else if (p.description) {
      const descText = (dict && dict[`p${pIdx}-desc`]) || p.description;
      descHtml = `<p class="project-desc" data-i18n="p${pIdx}-desc" style="line-height: 1.7; color: var(--card-muted); margin-bottom: 0.8rem;">${descText}</p>`;
    }

    // Tech stack chips
    const tags = (p.techStack || []).map((tech, ti) => 
      `<span class="interactive-chip ${chipColors[ti % chipColors.length]}" style="font-size: 0.78rem; padding: 3px 10px;">${tech}</span>`
    ).join(" ");

    return `
      <article class="project-pod ${podClass}">
        <div class="project-header">
          <div>
            <h3 class="project-title" data-i18n="p${pIdx}-title" style="font-size: clamp(1.05rem, 1.8vw, 1.2rem); font-weight: 800; color: var(--card-text);">${titleText}</h3>
          </div>
          <div class="badge-tag-wrap">
            <span class="badge-tag"><i class="fa-solid ${catIcon}" aria-hidden="true"></i> ${p.category || "Project"}</span>
            ${p.year ? `<span class="year-flag ${flagClass}">${p.year}</span>` : ""}
          </div>
        </div>
        ${descHtml}
        ${tags ? `<div class="project-tags" style="display: flex; flex-wrap: wrap; gap: 6px; margin: 0.6rem 0;">${tags}</div>` : ""}
        ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link" style="font-size: 0.88rem; font-weight: 700; color: var(--primary-blue); display: inline-flex; align-items: center; gap: 6px; margin-top: 0.4rem;"><span data-i18n="btn-view-github">${(dict && dict["btn-view-github"]) || "Xem GitHub"}</span> <i class="fa-solid fa-arrow-right"></i></a>` : ""}
      </article>
    `;
  }).join("");
}

/**
 * 5. RENDER KỸ NĂNG (SKILLS) VÀO UI
 */
export function renderSkills(skills) {
  const progContainer = document.getElementById("skills-programming-chips");
  const toolsContainer = document.getElementById("skills-tools-chips");

  if (!skills || skills.length === 0) return;

  let progItems = [];
  let toolsItems = [];

  skills.forEach(s => {
    const category = (s.category || "").toLowerCase();
    const items = s.items || [];
    if (category.includes("lập trình") || category.includes("programming") || category.includes("ngôn ngữ")) {
      progItems.push(...items);
    } else {
      toolsItems.push(...items);
    }
  });

  if (progContainer && progItems.length > 0) {
    const uniqueProg = [...new Set(progItems)];
    progContainer.innerHTML = uniqueProg.map(item => 
      `<span class="interactive-chip chip-pastel-blue">${item}</span>`
    ).join(" ");
  }

  if (toolsContainer && toolsItems.length > 0) {
    const uniqueTools = [...new Set(toolsItems)];
    const colors = ["chip-pastel-purple", "chip-pastel-peach", "chip-pastel-mint", "chip-slate"];
    toolsContainer.innerHTML = uniqueTools.map((item, idx) => 
      `<span class="interactive-chip ${colors[idx % colors.length]}">${item}</span>`
    ).join(" ");
  }
}

/**
 * 6. RENDER NĂNG LỰC TƯ DUY (MINDSET) VÀO UI
 */
export function renderMindset(mindsetList) {
  const container = document.getElementById("mindset-container") || document.querySelector(".mindset-matrix");
  if (!container || !mindsetList || mindsetList.length === 0) return;

  const currentLang = localStorage.getItem('cv_lang') || 'vi';
  const dict = window.translations ? window.translations[currentLang] : null;

  container.innerHTML = mindsetList.map((item, index) => {
    const mTitle = (dict && dict[`mindset-${index + 1}-title`]) || item.title || '';
    const mDesc = (dict && dict[`mindset-${index + 1}-desc`]) || item.description || '';

    return `
    <div class="mindset-box">
      <strong>
        <i class="fa-solid ${item.icon || 'fa-lightbulb'} ${item.colorClass || 'text-pastel-blue'}" aria-hidden="true"></i> 
        <span data-i18n="mindset-${index + 1}-title">${mTitle}</span>
      </strong>
      <span data-i18n="mindset-${index + 1}-desc">${mDesc}</span>
    </div>
    `;
  }).join("");
}

/**
 * 7. RENDER TOÀN BỘ GIAO DIỆN
 */
export function renderAll(data) {
  if (!data) return;
  if (data.profile) renderProfile(data.profile);
  if (data.education) renderEducation(data.education);
  if (data.projects) renderProjects(data.projects);
  if (data.skills) renderSkills(data.skills);
  if (data.mindset) renderMindset(data.mindset);

  // Tự động áp dụng ngôn ngữ đã lưu (VI hoặc EN) sau khi render xong
  const currentLang = localStorage.getItem('cv_lang') || 'vi';
  applyLanguage(currentLang);
}

/**
 * 8. XUẤT DỮ LIỆU CV THÀNH FILE JSON (ĐỂ LƯU HOẶC DÙNG KHI CẦN)
 */
export async function exportDataAsJSON() {
  let data = window.__cvDataCache;
  if (!data) {
    data = await fetchAllCVData();
  }

  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonStr);
  downloadAnchor.setAttribute("download", `cv_data_export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  console.log("💾 Đã xuất toàn bộ dữ liệu ra file JSON thành công.");
}

/**
 * 9. LÀM MỚI DỮ LIỆU TỪ DATABASE VÀ RENDER LẠI
 */
export async function refreshData() {
  const data = await fetchAllCVData();
  renderAll(data);
  return data;
}

/**
 * 10. HÀM ĐẨY TOÀN BỘ 100% DỮ LIỆU LÊN FIRESTORE (SEED DATABASE)
 */
export async function seedAllDataToDatabase() {
  console.log("🚀 Bắt đầu quá trình nạp lại toàn bộ dữ liệu lên Firebase Firestore...");

  // 0. Tự động dọn dẹp sạch các collection cũ để tránh trùng lặp dữ liệu
  console.log("🧹 Đang dọn sạch dữ liệu cũ trong các collection để đảm bảo chuẩn xác...");
  for (const colName of ["projects", "skills", "education", "mindset"]) {
    try {
      const snap = await getDocs(collection(db, colName));
      for (const docItem of snap.docs) {
        await deleteDoc(docItem.ref);
      }
    } catch (cleanErr) {
      console.warn(`Lưu ý khi dọn dẹp collection ${colName}:`, cleanErr);
    }
  }
  console.log("✨ Đã dọn sạch các bản ghi cũ thành công!");

  // 1. Lấy ảnh đại diện và chuyển sang Base64
  let base64Avatar = "";
  try {
    const res = await fetch("assets/images/avatar.jpg");
    if (res.ok) {
      const blob = await res.blob();
      base64Avatar = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      console.log("📸 Đã đọc và mã hóa ảnh avatar.jpg sang Base64 thành công.");
    }
  } catch (e) {
    console.warn("Không đọc được avatar.jpg cục bộ, dùng avatar mặc định:", e);
  }

  // 2. Dữ liệu Thông tin cá nhân (Profile)
  const profileData = {
    fullName: "VÕ MINH HOÀNG",
    title: "Chuyên ngành Khoa học Dữ liệu",
    status: "Sẵn sàng nhận việc",
    bio: "Sinh viên năm 3 ngành Khoa học Dữ liệu tại ĐH Nguyễn Tất Thành (GPA 3.2/4.0), sở hữu nền tảng toán ứng dụng, lập trình Python/Dart và tư duy phân tích hệ thống. Nắm vững quy trình xử lý dữ liệu từ thô đến mô hình hóa (Data Cleaning, Feature Engineering, Modeling) cùng khả năng phát triển ứng dụng cơ bản. Mong muốn tìm kiếm cơ hội thực tập vị trí <strong>Data Analyst / Data Scientist</strong> để áp dụng năng lực phân tích, tối ưu hóa quy trình và đóng góp giá trị thực tế cho doanh nghiệp.",
    email: "h0352301149@gmail.com",
    phone: "0352301149",
    dob: "22 tháng 02 năm 2005",
    location: "TP. Hồ Chí Minh",
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    cvUrl: "#",
    avatarUrl: base64Avatar || "assets/images/avatar.jpg",
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, "profile", "main"), profileData);
  console.log("✅ 1/5: Đã đẩy dữ liệu Profile & Avatar lên Firestore.");

  // 3. Dữ liệu Học vấn (Education)
  const educationData = [
    {
      id: "edu_ntt",
      school: "Trường Đại học Nguyễn Tất Thành",
      degree: "Chuyên ngành Khoa học Dữ liệu",
      period: "2023 - Hiện tại",
      gpa: "GPA 3.2 / 4.0",
      description: "Sở hữu nền tảng toán ứng dụng, lập trình Python/Dart và tư duy phân tích hệ thống. Nắm vững quy trình xử lý dữ liệu từ thô đến mô hình hóa.",
      order: 1
    }
  ];
  for (const edu of educationData) {
    const { id, ...data } = edu;
    await setDoc(doc(db, "education", id), data);
  }
  console.log("✅ 2/5: Đã đẩy dữ liệu Education lên Firestore.");

  // 4. Dữ liệu Dự án nổi bật (Projects - 5 dự án hoàn chỉnh)
  const projectsData = [
    {
      id: "proj_1",
      title: "Hệ thống Gợi ý Sản phẩm và Mô hình Dự báo",
      category: "ML Pipeline",
      year: "2026",
      order: 1,
      techStack: ["Python", "Pandas", "NumPy", "Scikit-learn", "XGBoost", "LSTM"],
      bullets: [
        "Quy trình dữ liệu: Khảo sát dữ liệu thô, xử lý giá trị thiếu (missing values), nhiễu (outliers) và chuẩn hóa thuộc tính (feature scaling) bằng Python (Pandas, NumPy).",
        "Mô hình hóa: Triển khai thuật toán Collaborative Filtering (User-Based, Item-Based); thử nghiệm và so sánh hiệu năng giữa Machine Learning (Random Forest, XGBoost) và chuỗi thời gian (LSTM).",
        "Đánh giá và Tối ưu: Tinh chỉnh siêu tham số (Hyperparameter Tuning), đánh giá mô hình qua chỉ số Precision, Recall, F1-Score và NDCG@K để đảm bảo độ chính xác."
      ],
      githubUrl: "https://github.com/"
    },
    {
      id: "proj_2",
      title: "Dashboard Phân tích Tiêm chủng Toàn cầu",
      category: "BI Dashboard",
      year: "2026",
      order: 2,
      techStack: ["Power BI", "Power Query", "DAX", "UNICEF Data"],
      bullets: [
        "Xử lý dữ liệu: Trích xuất và làm sạch bộ dữ liệu đa chiều từ UNICEF bằng Power Query.",
        "Trực quan hóa: Thiết kế mô hình dữ liệu (Data Model), viết hàm DAX tính toán các chỉ số bao phủ vắc-xin (BCG, POL3, DTP3, HEPBB, MCV1) và chuyển hóa thành dashboard báo cáo tương tác trực quan."
      ],
      githubUrl: "https://github.com/"
    },
    {
      id: "proj_3",
      title: "Phát triển Ứng dụng Di động và Website",
      category: "Cross-platform",
      year: "2025",
      order: 3,
      techStack: ["Flutter", "Dart", "Firebase Realtime", "HTML5", "CSS3", "JavaScript"],
      bullets: [
        "Ứng dụng Mạng xã hội Lava (Flutter/Firebase): Thiết kế giao diện đa nền tảng (hỗ trợ Dark Mode), tích hợp Realtime Database và Authentication để xử lý luồng sự kiện thời gian thực (nhắn tin, đăng bài).",
        "Website Bán Hàng (HTML/CSS/JS): Lập trình giao diện hiển thị danh sách sản phẩm chuẩn responsive, tối ưu trải nghiệm người dùng và kiểm thử độ tương thích trình duyệt."
      ],
      githubUrl: "https://github.com/"
    },
    {
      id: "proj_4",
      title: "Chuyển Phong Cách Hội Họa bằng Neural Style Transfer",
      category: "Deep Learning / AI Vision",
      year: "2025",
      order: 4,
      techStack: ["Python", "TensorFlow / PyTorch", "VGG-19", "OpenCV"],
      bullets: [
        "Xây dựng mô hình Deep Learning áp dụng phong cách nghệ thuật cổ điển vào ảnh kỹ thuật số hiện đại.",
        "Sử dụng mạng nơ-ron tích chập (CNN - VGG-19 pretrained) bóc tách content loss và style loss, tối ưu hóa qua thuật toán L-BFGS."
      ],
      githubUrl: "https://github.com/"
    },
    {
      id: "proj_5",
      title: "Phân Loại Cảm Xúc Đánh Giá Khách Hàng (Sentiment Analysis)",
      category: "NLP / Machine Learning",
      year: "2024",
      order: 5,
      techStack: ["Python", "NLTK", "Scikit-learn", "TF-IDF", "Logistic Regression"],
      bullets: [
        "Tiền xử lý văn bản tiếng Việt: tách từ (tokenization), loại bỏ stopwords, biểu diễn đặc trưng với TF-IDF.",
        "Huấn luyện các mô hình phân loại (Naive Bayes, SVM, Logistic Regression) đạt F1-Score trên 88% trên tập dữ liệu đánh giá sản phẩm thương mại điện tử."
      ],
      githubUrl: "https://github.com/"
    }
  ];
  for (const proj of projectsData) {
    const { id, ...data } = proj;
    await setDoc(doc(db, "projects", id), data);
  }
  console.log("✅ 3/5: Đã đẩy 5 Dự án lên Firestore.");

  // 5. Dữ liệu Kỹ năng (Skills)
  const skillsData = [
    {
      id: "programming",
      category: "Lập trình và CSDL",
      order: 1,
      items: ["Python", "SQL", "Dart", "HTML/CSS", "JavaScript", "Firebase"]
    },
    {
      id: "tools",
      category: "Thư viện và Công cụ Dữ liệu",
      order: 2,
      items: ["Pandas", "NumPy", "Scikit-learn", "Power BI", "Power Query", "Flutter", "Git/GitHub", "Google Colab", "VS Code"]
    }
  ];
  for (const sk of skillsData) {
    const { id, ...data } = sk;
    await setDoc(doc(db, "skills", id), data);
  }
  console.log("✅ 4/5: Đã đẩy dữ liệu Kỹ năng lên Firestore.");

  // 6. Dữ liệu Năng lực tư duy (Mindset)
  const mindsetData = [
    {
      id: "mindset_1",
      order: 1,
      icon: "fa-shield-halved",
      colorClass: "text-pastel-blue",
      title: "Tư duy Phản biện Dữ liệu:",
      description: "Luôn hoài nghi và kiểm tra lại tính toàn vẹn, độ tin cậy cũng như độ lệch (bias) của dữ liệu trước khi đưa vào mô hình huấn luyện."
    },
    {
      id: "mindset_2",
      order: 2,
      icon: "fa-puzzle-piece",
      colorClass: "text-pastel-purple",
      title: "Tư duy Giải quyết Vấn đề:",
      description: "Khả năng bóc tách bài toán nghiệp vụ phức tạp thành các bước kỹ thuật nhỏ, ưu tiên chọn giải pháp tối ưu và đơn giản nhất."
    },
    {
      id: "mindset_3",
      order: 3,
      icon: "fa-book-open-reader",
      colorClass: "text-pastel-mint",
      title: "Năng lực Tự học và Đọc Tài liệu:",
      description: "Chủ động nghiên cứu tài liệu kỹ thuật tiếng Anh (Technical Documentation/API Specs), có khả năng tự tra cứu và sửa lỗi (debug) độc lập."
    },
    {
      id: "mindset_4",
      order: 4,
      icon: "fa-sliders",
      colorClass: "text-pastel-peach",
      title: "Linh hoạt và Thích ứng:",
      description: "Dễ dàng chuyển đổi linh hoạt giữa việc phân tích dữ liệu, viết code ứng dụng di động hoặc làm giao diện web tùy theo yêu cầu của dự án."
    }
  ];
  for (const ms of mindsetData) {
    const { id, ...data } = ms;
    await setDoc(doc(db, "mindset", id), data);
  }
  console.log("✅ 5/5: Đã đẩy 4 khối Tư duy lên Firestore.");

  console.log("🎉 HOÀN THÀNH: Đã đẩy 100% dữ liệu lên Database thành công!");
  
  // Tự động kéo dữ liệu mới và render lại UI
  await refreshData();
}

// Gắn các hàm tiện ích vào window để có thể gọi ở Console F12 bất kỳ lúc nào
window.cvDataService = {
  fetchAllCVData,
  renderProfile,
  renderEducation,
  renderProjects,
  renderSkills,
  renderMindset,
  renderAll,
  exportDataAsJSON,
  refreshData,
  seedAllDataToDatabase
};

// Tự động chạy khi tải trang
async function init() {
  try {
    const data = await fetchAllCVData();
    renderAll(data);
  } catch (err) {
    console.warn("⚠️ Không thể tải dữ liệu tự động từ Firestore:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
