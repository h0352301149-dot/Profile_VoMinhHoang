/* =========================================================
   FIRESTORE DYNAMIC DATA RENDERER (PROFILE, EDUCATION, PROJECTS, SKILLS)
   Hỗ trợ Avatar Base64 & Thiết kế Bento Grid Glassmorphism
========================================================= */

import { db } from './modules/firebase-config.js';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * 1. Tải thông tin cá nhân (Profile) & Hình ảnh từ Firestore
 */
export async function loadProfile() {
  try {
    const docRef = doc(db, "profile", "main");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Cập nhật Avatar (Hình ảnh động từ database)
      if (data.avatarUrl) {
        const avatarImg = document.getElementById("hero-avatar");
        if (avatarImg) {
          avatarImg.src = data.avatarUrl;
        }
      }

      // Cập nhật Text Profile
      if (data.fullName && document.getElementById("hero-name")) {
        document.getElementById("hero-name").textContent = data.fullName;
      }
      if (data.title && document.getElementById("hero-title")) {
        document.getElementById("hero-title").textContent = data.title;
      }
      if (data.bio && document.getElementById("hero-bio")) {
        document.getElementById("hero-bio").textContent = data.bio;
      }
      if (data.email && document.getElementById("hero-email")) {
        document.getElementById("hero-email").textContent = data.email;
        const emailChip = document.getElementById("hero-email-chip");
        if (emailChip) emailChip.setAttribute("data-copy", data.email);
      }
      if (data.phone && document.getElementById("hero-phone")) {
        document.getElementById("hero-phone").textContent = data.phone;
        const phoneChip = document.getElementById("hero-phone-chip");
        if (phoneChip) phoneChip.setAttribute("data-copy", data.phone);
      }
      if (data.github && document.getElementById("hero-github-link")) {
        document.getElementById("hero-github-link").href = data.github;
      }
      if (data.linkedin && document.getElementById("hero-linkedin-link")) {
        document.getElementById("hero-linkedin-link").href = data.linkedin;
      }
      if (data.cvUrl && document.getElementById("hero-cv-btn")) {
        document.getElementById("hero-cv-btn").href = data.cvUrl;
      }
      console.log("✅ Đã tải thông tin Profile & Avatar từ Firestore thành công.");
    }
  } catch (error) {
    console.warn("Lưu ý: Dùng dữ liệu Profile mặc định (chưa tạo document hoặc offline):", error);
  }
}

/**
 * 2. Tải thông tin Học vấn (Education) từ Firestore
 */
export async function loadEducation() {
  const container = document.getElementById("education-container");
  if (!container) return;

  try {
    const q = query(collection(db, "education"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Nếu có nhiều hơn 1 học vấn, render danh sách
      if (querySnapshot.size > 1) {
        let html = "";
        querySnapshot.forEach((docSnap) => {
          const edu = docSnap.data();
          html += `
            <div class="edu-item" style="margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px dashed rgba(2, 132, 199, 0.2);">
              <div class="edu-top-line">
                <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--card-text);">${edu.school || ''}</h3>
                ${edu.gpa ? `<span class="gpa-pill">${edu.gpa}</span>` : ''}
              </div>
              <p class="edu-period" style="font-size: 0.85rem; font-weight: 600; color: var(--card-muted); margin: 3px 0;">${edu.degree || ''} ${edu.period ? `· <span>(${edu.period})</span>` : ''}</p>
              ${edu.description ? `<p class="edu-summary" style="font-size: 0.88rem; color: var(--card-muted); line-height: 1.6;">${edu.description}</p>` : ''}
            </div>
          `;
        });
        container.innerHTML = html;
      } else {
        // Cập nhật thẻ hiện có
        const edu = querySnapshot.docs[0].data();
        if (edu.school && document.getElementById("edu-school")) {
          document.getElementById("edu-school").textContent = edu.school;
        }
        if (edu.degree && document.getElementById("edu-degree")) {
          document.getElementById("edu-degree").textContent = edu.degree;
        }
        if (edu.period && document.getElementById("edu-period")) {
          document.getElementById("edu-period").textContent = `(${edu.period})`;
        }
        if (edu.description && document.getElementById("edu-desc")) {
          document.getElementById("edu-desc").textContent = edu.description;
        }
        if (edu.gpa && document.getElementById("edu-gpa")) {
          document.getElementById("edu-gpa").textContent = edu.gpa;
        }
      }
      console.log(`✅ Đã tải ${querySnapshot.size} mục Học vấn từ Firestore thành công.`);
    }
  } catch (error) {
    console.warn("Lưu ý: Dùng dữ liệu Education mặc định:", error);
  }
}

/**
 * 3. Tải danh sách Dự án (Projects) từ Firestore
 */
export async function loadProjects() {
  const container = document.getElementById("projects-container");
  if (!container) return;

  try {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const colorPods = ["pod-pastel-blue", "pod-pastel-peach", "pod-pastel-mint"];
      const flagColors = ["flag-pastel-blue", "flag-pastel-peach", "flag-pastel-mint"];

      let htmlContent = "";
      let index = 0;
      querySnapshot.forEach((docSnap) => {
        const p = docSnap.data();
        const podClass = colorPods[index % colorPods.length];
        const flagClass = flagColors[index % flagColors.length];
        index++;

        const chipColors = ["chip-pastel-blue", "chip-pastel-purple", "chip-pastel-peach", "chip-pastel-mint"];
        const tags = (p.techStack || []).map((tech, ti) => 
          `<span class="interactive-chip ${chipColors[ti % chipColors.length]}" style="font-size: 0.78rem; padding: 3px 10px;">${tech}</span>`
        ).join(" ");

        let descHtml = "";
        if (Array.isArray(p.bullets) && p.bullets.length > 0) {
          descHtml = `<ul class="bullet-list">` + p.bullets.map(b => {
            const formatted = b.includes(":") ? b.replace(/^([^:]+:)/, "<strong>$1</strong>") : b;
            return `<li>${formatted}</li>`;
          }).join("") + `</ul>`;
        } else if (p.description) {
          descHtml = `<p class="project-desc" style="line-height: 1.7; color: var(--card-muted); margin-bottom: 0.8rem;">${p.description}</p>`;
        }

        // Chọn icon phù hợp với chuyên ngành dự án
        let catIcon = "fa-code";
        if (p.category) {
          const cat = p.category.toLowerCase();
          if (cat.includes("ml") || cat.includes("pipeline") || cat.includes("ai") || cat.includes("deep") || cat.includes("vision")) catIcon = "fa-check";
          else if (cat.includes("bi") || cat.includes("dashboard") || cat.includes("chart") || cat.includes("báo cáo")) catIcon = "fa-chart-line";
          else if (cat.includes("app") || cat.includes("mobile") || cat.includes("web") || cat.includes("platform")) catIcon = "fa-mobile-screen";
        }

        htmlContent += `
          <article class="project-pod ${podClass}">
            <div class="project-header">
              <div>
                <h3 class="project-title" style="font-size: clamp(1.05rem, 1.8vw, 1.2rem); font-weight: 800; color: var(--card-text);">${p.title || "Dự án mới"}</h3>
              </div>
              <div class="badge-tag-wrap">
                <span class="badge-tag"><i class="fa-solid ${catIcon}" aria-hidden="true"></i> ${p.category || "Project"}</span>
                ${p.year ? `<span class="year-flag ${flagClass}">${p.year}</span>` : ""}
              </div>
            </div>
            ${descHtml}
            ${tags ? `<div class="project-tags" style="display: flex; flex-wrap: wrap; gap: 6px; margin: 0.6rem 0;">${tags}</div>` : ""}
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link" style="font-size: 0.88rem; font-weight: 700; color: var(--primary-blue); display: inline-flex; align-items: center; gap: 6px; margin-top: 0.4rem;">Xem Github <i class="fa-solid fa-arrow-right"></i></a>` : ""}
          </article>
        `;
      });

      container.innerHTML = htmlContent;
      console.log(`✅ Đã tải ${querySnapshot.size} dự án từ Firestore thành công.`);
    }
  } catch (error) {
    console.warn("Lưu ý: Dùng dữ liệu Projects mặc định:", error);
  }
}

/**
 * 4. Tải danh sách Kỹ năng (Skills) từ Firestore
 */
export async function loadSkills() {
  const progContainer = document.getElementById("skills-programming-chips");
  const toolsContainer = document.getElementById("skills-tools-chips");

  try {
    const q = query(collection(db, "skills"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      let progItems = [];
      let toolsItems = [];

      querySnapshot.forEach((docSnap) => {
        const s = docSnap.data();
        const category = (s.category || "").toLowerCase();
        const items = s.items || [];

        // Phân loại linh hoạt theo category
        if (category.includes("lập trình") || category.includes("programming") || category.includes("ngôn ngữ")) {
          progItems.push(...items);
        } else {
          toolsItems.push(...items);
        }
      });

      // Render vào ô Lập trình
      if (progContainer && progItems.length > 0) {
        // Loại bỏ trùng lặp nếu có
        const uniqueProg = [...new Set(progItems)];
        progContainer.innerHTML = uniqueProg.map(item => 
          `<span class="interactive-chip chip-pastel-blue">${item}</span>`
        ).join(" ");
      }

      // Render vào ô Công cụ & AI
      if (toolsContainer && toolsItems.length > 0) {
        const uniqueTools = [...new Set(toolsItems)];
        const colors = ["chip-pastel-purple", "chip-pastel-peach", "chip-pastel-mint", "chip-slate"];
        toolsContainer.innerHTML = uniqueTools.map((item, idx) => 
          `<span class="interactive-chip ${colors[idx % colors.length]}">${item}</span>`
        ).join(" ");
      }

      console.log(`✅ Đã tải ${querySnapshot.size} nhóm kỹ năng từ Firestore thành công.`);
    }
  } catch (error) {
    console.warn("Lưu ý: Dùng danh sách Skills mặc định:", error);
  }
}

// Khởi chạy khi tài liệu đã sẵn sàng
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadEducation();
    loadProjects();
    loadSkills();
  });
} else {
  loadProfile();
  loadEducation();
  loadProjects();
  loadSkills();
}
