// ===========================
// MENTOR DATA
// ===========================
const mentors = [
    {
        name: "Yash Gohil",
        school: "IIM Ahmedabad",
        company: "Accenture Consulting",
        domain: "Consulting",
        initials: "YG",
        linkedin: "https://www.linkedin.com/in/yashgohil14/",
        votes: 87,
        top: true,
        avatarGradient: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)"
    },
    {
        name: "Shen Shaji",
        school: "IIM Bangalore",
        company: "Media.Net",
        domain: "Product Management",
        initials: "SS",
        linkedin: "https://www.linkedin.com/in/shenshaji/",
        votes: 74,
        top: true,
        avatarImage: "https://media.licdn.com/dms/image/v2/D5603AQEoDUFTkB8GvA/profile-displayphoto-shrink_800_800/B56ZWkQ22gHEAc-/0/1742217638011?e=1784160000&v=beta&t=NszghOXdBF2yKGgBnoCAKIvFXh3L8oL8psHZ35hmpwM"
    },
    {
        name: "Vidhi Barolia",
        school: "IIM Lucknow",
        company: "PwC US",
        domain: "Finance",
        initials: "VB",
        linkedin: "https://www.linkedin.com/in/vidhi-barolia-a555a9271/",
        votes: 92,
        top: true,
        avatarImage: "https://media.licdn.com/dms/image/v2/D5603AQEhHS7iCOMoRQ/profile-displayphoto-crop_800_800/B56Z6n.K2WKYAM-/0/1780934554388?e=1784160000&v=beta&t=5nSa9iToFVHW5V1vbIYpMhsaeOdqfHN20QPOQKqv-5g"
    },
    {
        name: "Aadesh Gupta",
        school: "IIM Mumbai",
        company: "L'Oreal",
        domain: "Marketing",
        initials: "AG",
        linkedin: "https://www.linkedin.com/in/aadesh-gupta-609528194/",
        votes: 68,
        top: true,
        avatarImage: "https://media.licdn.com/dms/image/v2/D4D03AQFKn5GJGBgYFQ/profile-displayphoto-crop_800_800/B4DZ2X1bPAK0AM-/0/1776368862293?e=1784160000&v=beta&t=tDVnsbc_FKJrqvoPyP-ADRq0MPJUArabEKBe0_usgNQ"
    },
    {
        name: "Ananyo Roy",
        school: "XLRI Jamshedpur",
        company: "TAS",
        domain: "HR",
        initials: "AR",
        linkedin: "https://www.linkedin.com/in/ananyosroy/",
        votes: 79,
        top: true,
        avatarGradient: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)"
    },
    {
        name: "Ashutosh Gupta",
        school: "IIM Lucknow",
        company: "Gulf Oil",
        domain: "Operations",
        initials: "AG",
        linkedin: "https://www.linkedin.com/in/ashutosh-gupta-iiml/",
        votes: 63,
        top: true,
        avatarGradient: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)"
    }
];

// Domain → badge CSS class map
const badgeClassMap = {
    "Consulting": "badge-consulting",
    "Finance": "badge-finance",
    "Marketing": "badge-marketing",
    "HR": "badge-hr",
    "Operations": "badge-operations",
    "Product Management": "badge-pm"
};

// ===========================
// RENDER MENTOR CARDS
// ===========================
function renderMentors(filter) {
    const grid = document.getElementById("mentorGrid");
    const filtered = filter === "All"
        ? mentors
        : mentors.filter(m => m.domain === filter);

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#888; padding:32px 0;">No mentors found for this domain.</p>';
        return;
    }

    grid.innerHTML = filtered.map(m => {
        const badgeClass = badgeClassMap[m.domain] || "badge-consulting";

        // Use real photo if avatarImage is provided, otherwise fall back to gradient + initials
        const avatarHTML = m.avatarImage
            ? `<div class="mentor-avatar mentor-avatar-img">
                 <img src="${m.avatarImage}" alt="${m.name}" />
               </div>`
            : `<div class="mentor-avatar" style="background: ${m.avatarGradient}">
                 ${m.initials}
               </div>`;

        return `
      <div class="mentor-card">
        ${m.top ? '<div class="voted-chip">⭐ Top Voted</div>' : ''}
        <div class="mentor-card-top">
          ${avatarHTML}
          <div class="mentor-info">
            <div class="mentor-name">${m.name}</div>
            <div class="mentor-school">${m.school}</div>
            <div class="mentor-company">${m.company}</div>
          </div>
        </div>
        <span class="mentor-domain-badge ${badgeClass}">${m.domain}</span>
        <div class="mentor-voted">
          <i class="ti ti-star-filled"></i>
          <strong>${m.votes}</strong>&nbsp;students voted
        </div>
        <div class="mentor-actions">
          <button class="btn-book" data-name="${m.name}" data-school="${m.school}" data-company="${m.company}">
            Book a session
          </button>
          <a class="btn-linkedin" href="${m.linkedin}" target="_blank" rel="noopener" title="View LinkedIn profile">
            <i class="ti ti-brand-linkedin"></i>
          </a>
        </div>
      </div>
    `;
    }).join("");

    // Attach book button listeners — opens the booking modal instead of alert()
    grid.querySelectorAll(".btn-book").forEach(btn => {
        btn.addEventListener("click", () => {
            openBookingModal({
                name: btn.dataset.name,
                school: btn.dataset.school,
                company: btn.dataset.company
            });
        });
    });
}

// ===========================
// FILTER TABS
// ===========================
function initFilterTabs() {
    const tabs = document.querySelectorAll(".filter-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderMentors(tab.dataset.filter);
        });
    });
}

// ===========================
// BOOKING MODAL (built once, reused for every "Book a session" click)
// ===========================
let currentBookingMentor = null;

const bookingModal = document.createElement("div");
bookingModal.className = "booking-modal";
bookingModal.innerHTML = `
  <div class="booking-modal-backdrop"></div>
  <div class="booking-modal-inner">
    <button class="booking-modal-close" type="button" aria-label="Close">&times;</button>
    <div class="form-title" id="bookingTitle">Book a session</div>
    <div class="form-sub" id="bookingSub">Fill in your details and we'll confirm your slot.</div>

    <div class="form-row">
      <label>Your name <span class="label-hint">*</span></label>
      <input type="text" id="bk-name" placeholder="Full name">
    </div>

    <div class="form-two">
      <div class="form-row">
        <label>Email <span class="label-hint">*</span></label>
        <input type="email" id="bk-email" placeholder="you@email.com">
      </div>
      <div class="form-row">
        <label>Phone <span class="label-hint">*</span></label>
        <input type="tel" id="bk-phone" placeholder="10-digit number">
      </div>
    </div>

    <div class="form-two">
      <div class="form-row">
        <label>Preferred date <span class="label-hint">*</span></label>
        <input type="date" id="bk-date">
      </div>
      <div class="form-row">
        <label>Preferred time slot <span class="label-hint">*</span></label>
        <select id="bk-time">
          <option value="">Select a slot</option>
          <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
          <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
          <option value="5:00 PM - 6:00 PM">5:00 PM - 6:00 PM</option>
          <option value="8:00 PM - 9:00 PM">8:00 PM - 9:00 PM</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <label>What do you want to discuss? <span class="label-hint">(optional)</span></label>
      <textarea id="bk-message" placeholder="e.g. Resume review, profile building, interview prep..."></textarea>
    </div>

    <button class="submit-btn" id="bookingSubmitBtn" type="button">Confirm booking</button>
    <div class="form-footer">We'll email you the meeting link once the mentor confirms.</div>
  </div>
`;
document.body.appendChild(bookingModal);

const bookingTitleEl = bookingModal.querySelector("#bookingTitle");
const bookingSubEl = bookingModal.querySelector("#bookingSub");

function openBookingModal(mentor) {
    currentBookingMentor = mentor;
    bookingTitleEl.textContent = `Book a session with ${mentor.name}`;
    bookingSubEl.textContent = `${mentor.school} · ${mentor.company} — fill in your details and we'll confirm your slot.`;
    bookingModal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeBookingModal() {
    bookingModal.classList.remove("open");
    document.body.style.overflow = "";
    // reset the form fields
    bookingModal.querySelector("#bk-name").value = "";
    bookingModal.querySelector("#bk-email").value = "";
    bookingModal.querySelector("#bk-phone").value = "";
    bookingModal.querySelector("#bk-date").value = "";
    bookingModal.querySelector("#bk-time").value = "";
    bookingModal.querySelector("#bk-message").value = "";
}

bookingModal.querySelector(".booking-modal-close").addEventListener("click", closeBookingModal);
bookingModal.querySelector(".booking-modal-backdrop").addEventListener("click", closeBookingModal);
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && bookingModal.classList.contains("open")) closeBookingModal();
});

bookingModal.querySelector("#bookingSubmitBtn").addEventListener("click", () => {
    const name = bookingModal.querySelector("#bk-name").value.trim();
    const email = bookingModal.querySelector("#bk-email").value.trim();
    const phone = bookingModal.querySelector("#bk-phone").value.trim();
    const date = bookingModal.querySelector("#bk-date").value;
    const time = bookingModal.querySelector("#bk-time").value;

    if (!name || !email || !phone || !date || !time) {
        showToast("Please fill in all required fields.", true);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address.", true);
        return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        showToast("Please enter a valid 10-digit phone number.", true);
        return;
    }

    // Success
    closeBookingModal();
    showToast(`✓ Session requested with ${currentBookingMentor.name}! We'll confirm by email.`);
});

// ===========================
// VIDEO UPLOAD
// ===========================
function initVideoUpload() {
    const dropZone = document.getElementById("videoDropZone");
    const fileInput = document.getElementById("videoInput");
    const videoName = document.getElementById("videoName");

    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            videoName.textContent = "✓ " + file.name + " selected";
            videoName.classList.add("selected");
        }
    });

    // Drag & drop support
    dropZone.addEventListener("dragover", e => {
        e.preventDefault();
        dropZone.style.borderColor = "#6c5ce7";
        dropZone.style.background = "#f5f3ff";
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.style.borderColor = "";
        dropZone.style.background = "";
    });

    dropZone.addEventListener("drop", e => {
        e.preventDefault();
        dropZone.style.borderColor = "";
        dropZone.style.background = "";
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("video/")) {
            fileInput.files = e.dataTransfer.files;
            videoName.textContent = "✓ " + file.name + " selected";
            videoName.classList.add("selected");
        } else {
            showToast("Please drop a valid video file.", true);
        }
    });
}

// ===========================
// FORM SUBMIT (Become a Mentor application form)
// ===========================
function initForm() {
    const btn = document.getElementById("submitBtn");
    btn.addEventListener("click", () => {
        const name = document.getElementById("f-name").value.trim();
        const email = document.getElementById("f-email").value.trim();
        const school = document.getElementById("f-school").value;
        const domain = document.getElementById("f-domain").value;
        const company = document.getElementById("f-company").value.trim();
        const why = document.getElementById("f-why").value.trim();
        const video = document.getElementById("videoInput").files[0];

        // Validate required fields
        if (!name || !email || !school || !domain) {
            showToast("Please fill in all required fields.", true);
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast("Please enter a valid email address.", true);
            return;
        }

        if (!video) {
            showToast("Please upload your 1-minute intro video.", true);
            return;
        }

        // Success — reset form
        document.getElementById("f-name").value = "";
        document.getElementById("f-email").value = "";
        document.getElementById("f-school").value = "";
        document.getElementById("f-domain").value = "";
        document.getElementById("f-company").value = "";
        document.getElementById("f-why").value = "";
        document.getElementById("videoInput").value = "";
        document.getElementById("videoName").textContent = "MP4, MOV or WebM · max 100 MB · max 90 seconds";
        document.getElementById("videoName").classList.remove("selected");

        showToast("✓ Application submitted! We'll be in touch soon.");
    });
}

// ===========================
// TOAST HELPER
// ===========================
function showToast(msg, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.style.background = isError ? "#ef4444" : "#22c55e";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3500);
}

// ===========================
// INIT
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    renderMentors("All");
    initFilterTabs();
    initVideoUpload();
    initForm();
});