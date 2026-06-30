// /* ===================== DATA ===================== */
// // [Name, College]
const students = [
    ["Sabeen", "IIM Lucknow"], ["Aryan Vivian", "NMIMS Mumbai"], ["Abhishek Rohilla", "IIM Kozhikode"],
    ["Divija Bansod", "IIM Lucknow"], ["Rupali Priyadarshini", "IIM Indore"], ["Varun Gangurde", "BITSOM"],
    ["Prathamesh Mulay", "NMIMS Mumbai"], ["Nikhil Jaiswal", "JBIMS"], ["Tamoghna Haldar", "IIM Sambalpur"],
    ["Mrittika Mukhopadhya", "XIMB"], ["Satakshi Singh", "SSBF"], ["Shivadhwaj SR", "IIM Shillong"],
    ["Aastha Jain", "IIM Shillong"], ["Romit Banerjee", "GLIM Chennai"], ["Kushagra Barai", "IIM Mumbai"],
    ["Soumojit Mondal", "SCMHRD"], ["Nivedha", "IIM Indore"], ["Dhamo Dharan", "IIT Madras"],
    ["Sandeep", "IIM Bangalore"], ["Srishti Mittal", "NMIMS Mumbai"], ["Nishtha Arora", "MICA"],
    ["Anmisha N", "IIM Lucknow"], ["Pranav", "FMS Delhi"], ["Priya Yadav", "FMS Delhi"],
    ["Viresh Sawant", "GLIM Chennai"], ["Nishita Sihag", "ISME"], ["Gaurav Sarkar", "IIM Kozhikode"],
    ["Rudra", "IIM Trichy"], ["Avantika D", "GLIM Chennai"], ["Yash S Kute", "IIM Lucknow"],
    ["Kuber", "IIM Shillong"], ["Tushar Goyal", "IMI Delhi"], ["Tirth Vohera", "BITSOM"],
    ["Dev Chauhan", "IIM Ahmedabad"], ["Pratik Pratyush", "IIM Jammu"], ["Ritika Sharma", "IIM Shillong"],
    ["Sanjana Rai", "MDI Gurgaon"], ["Kakara Yasaswini", "IIM Kozhikode"], ["Vaibhavi Paliya", "GLIM Chennai"],
    ["Mohak Bansal", "MDI Gurgaon"], ["Shubhra Mishra", "SIMS Pune"], ["Sankalp Annavarpu", "FMS Delhi"],
    ["Aastha Maurya", "XLRI Jamshedpur"], ["Prabin Choudhury", "XIMB"],
    ["Ananya Deshpande", "SPJIMR Mumbai"], ["Karthik Subramanian", "LIBA Chennai"], ["Riya Kapoor", "TAPMI Manipal"],
    ["Harshvardhan Singh", "IIM Raipur"], ["Sneha Pillai", "IIM Udaipur"], ["Arjun Reddy", "IIM Visakhapatnam"],
    ["Ishita Bhatt", "IIM Nagpur"], ["Devansh Oberoi", "IIM Rohtak"], ["Meghna Iyer", "IIM Bodh Gaya"],
    ["Tanay Kulkarni", "Goa Institute of Management"], ["Pallavi Nair", "K J Somaiya Mumbai"],
    ["Aniket Joshi", "Welingkar Mumbai"], ["Saloni Agarwal", "TISS Mumbai"], ["Rohan Mehta", "IIFT Delhi"],
    ["Tanvi Shah", "SIBM Pune"], ["Yuvraj Thakur", "IMT Ghaziabad"], ["Komal Verma", "Great Lakes Chennai"],
    ["Aditya Krishnan", "IIT Bombay SJMSOM"], ["Pooja Tiwari", "IIT Delhi DMS"], ["Siddharth Rao", "IIT Kanpur"],
    ["Nidhi Saxena", "IIT Kharagpur VGSOM"], ["Manish Pandey", "DSE Delhi"], ["Ekta Chawla", "Christ University Bangalore"],
    ["Rishabh Gupta", "Amity Noida"], ["Swara Bhosale", "IIM Amritsar"], ["Vivek Anand", "IIM Sirmaur"],
    ["Chitra Menon", "IIM Kashipur"], ["Aryan Malhotra", "IIM Ranchi"], ["Diya Sengupta", "XLRI Delhi-NCR"],
    ["Naman Khurana", "SCMHRD Pune"], ["Tanisha Roy", "Welingkar Bangalore"], ["Yash Trivedi", "NMIMS Bangalore"],
    ["Aarushi Bhandari", "NMIMS Hyderabad"], ["Kunal Bose", "JBIMS Mumbai"], ["Shreya Dutta", "K J Somaiya Pune"],
    ["Manan Shah", "BITSOM"], ["Vidhi Choudhary", "GLIM Gurgaon"], ["Parth Vyas", "IIM Sambalpur"],
    ["Ojasvi Rana", "IIM Shillong"], ["Lakshay Arora", "MDI Murshidabad"], ["Aishwarya Pillai", "XIMB Bhubaneswar"],
    ["Devika Menon", "SSBF Mumbai"], ["Rohit Bajaj", "FMS Delhi"], ["Niharika Sinha", "ISME Bangalore"],
    ["Akshat Goenka", "GLIM Chennai"], ["Pranjal Mishra", "IIM Lucknow"], ["Sahil Kohli", "IIM Kozhikode"],
    ["Reema Dasgupta", "IIM Indore"], ["Tarun Bhalla", "IIM Trichy"], ["Vanya Kapoor", "MICA"],
    ["Aarav Sethi", "IIM Bangalore"], ["Ishaan Bedi", "IMI Delhi"], ["Kavya Ramesh", "IIM Ahmedabad"],
    ["Mihir Chandra", "IIM Jammu"], ["Riddhi Sood", "MDI Gurgaon"], ["Yashvi Patel", "SIMS Pune"]
];

/* ===================== COURSES ===================== */
// FIX (per request): filtering moves from "college" to "course".
// These are the same 10 products from the CAT/OMET courses page.
// Each course gets a short id (used as the filter key) + display label.
const courses = [
    { id: "all-in-one", label: "All-in-One Combo" },
    { id: "full-course", label: "Full Course" },
    { id: "course-mocks", label: "Full Course + Mock Series" },
    { id: "course-gdpi", label: "Full Course + GD-PI-WAT" },
    { id: "sectional", label: "Sectional Test Pack" },
    { id: "full-mocks", label: "20 Full-Length Mocks" },
    { id: "gdpi-prep", label: "GD-PI-WAT Prep" },
    { id: "gdpi-mocks", label: "GD-PI-WAT + Mock Series" },
    { id: "mentoring-1on1", label: "1-on-1 Mentoring" },
    { id: "mentoring-group", label: "Group Cohort Mentoring" }
];

// Deterministically assign each student to a course in round-robin order,
// so the ~100 testimonials spread evenly (10/11 each) across all 10 courses
// instead of being grouped by college.
function courseForIndex(i) {
    return courses[i % courses.length];
}

const quotesByCourse = {
    "all-in-one": [
        "Doing the full combo meant I never had to juggle separate platforms for concepts, mocks and interview prep — everything stayed in sync with my weak areas.",
        "The all-in-one combo was the only reason my prep felt structured end to end — concepts, mocks, then interview practice, in that exact order.",
        "I didn't have to think about what to buy next — the combo already had the full path mapped out for me from day one to my final mock PI."
    ],
    "full-course": [
        "I already had a mock series elsewhere, so this gave me exactly what I needed — deep concept clarity in QA and DILR without paying for mocks I wouldn't use.",
        "The concept videos broke down topics I'd been stuck on for months. I used my own mocks separately, so this was the perfect fit.",
        "300+ videos sounded like a lot, but the topic-wise practice sets right after each one is what actually made the concepts stick."
    ],
    "course-mocks": [
        "The percentile tracker after every mock is what kept me honest about where I actually stood — I stopped guessing and started fixing the right sections.",
        "Having the concept videos and the mocks in one place meant I could go straight from learning a topic to testing it that same week.",
        "Twenty full-lengths felt intense, but pairing them with the concept course meant every mock taught me something instead of just testing me."
    ],
    "course-gdpi": [
        "I cleared the cutoffs on my own but always froze up in interviews — the mock panels gave me the practice I actually needed before the real one.",
        "Pairing the concept course with the GD-PI-WAT prep meant I wasn't just exam-ready, I was actually interview-ready when my calls came in.",
        "The mock panels were tougher than my real interviews ended up being, which is exactly what I needed going in calm instead of nervous."
    ],
    "sectional": [
        "I was strong in VARC but kept losing time in DILR — the sectional packs let me drill just that one section until it stopped being my bottleneck.",
        "Thirty sectional tests sound repetitive, but each one exposed a different small mistake I didn't know I was making.",
        "I used this before jumping into full-lengths, and it meant my weak section wasn't dragging my overall score down anymore."
    ],
    "full-mocks": [
        "Twenty full-lengths felt like a lot at first, but the All-India rank after every attempt is what kept me competitive instead of comfortable.",
        "Taking a CAT-pattern mock every week built the stamina I needed — by test day, three hours didn't feel long anymore.",
        "Seeing my percentile move test after test was the most motivating part of my entire prep."
    ],
    "gdpi-prep": [
        "The live feedback after each GD round was blunt in the best way — it pointed out habits I didn't even know I had until someone said it out loud.",
        "Four mock interviews with alumni panelists meant my actual interview didn't feel like the first time I was being grilled on my profile.",
        "The WAT topic bank gave me structure I was missing — I went in with a framework instead of just writing whatever came to mind."
    ],
    "gdpi-mocks": [
        "Having mocks and interview prep in one place meant my prep plan actually made sense week to week instead of feeling like two separate courses.",
        "I split my time evenly between the full-length mocks and the mock panels, and both fed into each other more than I expected.",
        "This combo meant I never had a week where I was only doing one type of prep — it always felt balanced."
    ],
    "mentoring-1on1": [
        "My mentor caught that I was over-preparing QA and under-preparing VARC purely from one weekly call — that single shift changed my mock scores within weeks.",
        "Having someone look at my actual prep plan every week, instead of a generic schedule, was the difference for me.",
        "The 1-on-1 calls felt less like classes and more like someone actually invested in where I was stuck that week."
    ],
    "mentoring-group": [
        "Studying alone made it easy to skip days — the twice-a-week cohort calls gave me a group of people I didn't want to show up unprepared in front of.",
        "The small batch size meant the mentor actually remembered my doubts from the last session instead of starting from scratch each time.",
        "Peer accountability in the cohort kept me consistent in a way solo prep never did."
    ]
};

// avatar colors pulled from the design system (primary / accent family + supporting hues)
const avatarColors = ["#6366F1", "#EC4899", "#818CF8", "#F472B6", "#4F46E5", "#10B981", "#F59E0B", "#0EA5E9"];

function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

/* ===================== FILTER TABS (now course-wise, not college-wise) ===================== */
// Each student is assigned a course (round-robin) so every course chip
// gets a roughly even, realistic-looking count out of the ~100 testimonials.
const studentCourses = students.map((_, i) => courseForIndex(i).id);

const courseCounts = {};
courses.forEach(c => { courseCounts[c.id] = 0; });
studentCourses.forEach(id => { courseCounts[id]++; });

// Sort chips by count, highest first — same "most popular first" rule
// used on the CAT/OMET courses page.
const sortedCourses = [...courses].sort((a, b) => courseCounts[b.id] - courseCounts[a.id]);

const filtersEl = document.getElementById('filters');

function makeChip(label, count, filterValue, active) {
    const btn = document.createElement('button');
    btn.className = 'chip' + (active ? ' active' : '');
    btn.dataset.filter = filterValue;
    btn.innerHTML = `${label} <span class="count">${count}</span>`;
    btn.onclick = () => setFilter(filterValue);
    return btn;
}

filtersEl.appendChild(makeChip('All', students.length, 'all', true));
sortedCourses.forEach(c => filtersEl.appendChild(makeChip(c.label, courseCounts[c.id], c.id, false)));

function setFilter(value) {
    document.querySelectorAll('.chip').forEach(p => p.classList.toggle('active', p.dataset.filter === value));
    let visibleCount = 0;
    document.querySelectorAll('.card').forEach(card => {
        const courseId = card.dataset.course;
        const show = value === 'all' || courseId === value;
        card.classList.toggle('show', show);
        if (show) visibleCount++;
    });
    document.getElementById('empty').classList.toggle('show', visibleCount === 0);
}

/* ===================== HERO TICKER (auto-synced with data) ===================== */
const tickerStudents = document.getElementById('tickerStudents');
if (tickerStudents) tickerStudents.textContent = `${students.length} verified testimonials`;

const tickerColleges = document.getElementById('tickerColleges');
if (tickerColleges) tickerColleges.textContent = `${courses.length} courses represented`;

/* ===================== TESTIMONIAL CARDS ===================== */
const grid = document.getElementById('grid');
students.forEach(([name, college], i) => {
    const course = courseForIndex(i);
    const card = document.createElement('div');
    card.className = 'card show reveal';
    card.dataset.course = course.id;
    const color = avatarColors[i % avatarColors.length];
    const testimonialId = `MBP-${String(i + 1).padStart(3, '0')}`;
    const courseQuotes = quotesByCourse[course.id];
    const quote = courseQuotes[i % courseQuotes.length];
    card.innerHTML = `
    <div class="card-head">
      <div class="avatar" style="background:${color}">${initials(name)}</div>
      <div class="who">
        <div class="name">${name}</div>
        <div class="college">${college} '26</div>
      </div>
      <div class="verified">✓ Verified</div>
    </div>
    <div class="course-tag-row"><span class="course-tag">${course.label}</span></div>
    <p class="quote">${quote}</p>
   
  `;
    grid.appendChild(card);
});

/* ===================== MOBILE NAV TOGGLE ===================== */
const navEl = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
    navToggle.addEventListener('click', () => navEl.classList.toggle('menu-open'));
}

/* ===================== SCROLL REVEAL ===================== */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}