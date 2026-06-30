/* ============================================================
   MBA Partner — React Chatbot widget (NO backend, NO API key)
   Used on ALL pages — single unified knowledge base, no cat/mba
   track split. Same bot, same answers everywhere (e.g. "mentor",
   "contact", "fees" now answer consistently no matter what page
   the user is on).

   Loaded directly in the browser via Babel Standalone — no npm,
   no build step. Just edit KNOWLEDGE_BASE below to feed more
   questions/answers; everything else works automatically.

   Reuses the existing chatbot.css classes, so it looks identical
   to the previous widget — only the brain changed (local lookup
   instead of calling a backend).
   ============================================================ */

const { useState, useEffect, useRef } = React;

/* ---------------------------------------------------------------
   👉 DATA FEEDING HAPPENS HERE 👈
   One flat list now — add as many entries as you want. Each entry
   needs:
     keywords: words/phrases that should trigger this answer
     answer:   what the bot replies with
   Matching is simple keyword-overlap — no AI, fully offline.
----------------------------------------------------------------- */
const KNOWLEDGE_BASE = [
    // ---------------- Short / generic single-word queries ----------------
    {
        keywords: ['cat'],
        answer: 'CAT (Common Admission Test) is India\'s top MBA entrance exam for IIMs and other top B-Schools. Ask me about syllabus, eligibility, VARC, DILR, Quant, percentile, mock tests, or how to book a prep session!'
    },
    {
        keywords: ['mba'],
        answer: 'MBA helps build leadership, business and management skills for careers in consulting, finance, marketing, operations and more. Ask me about top colleges, placements, live projects, GDPI, or how to book a mentor session!'
    },
    {
        keywords: ['omet', 'omets'],
        answer: 'OMETs (Other Management Entrance Tests) include XAT, SNAP, NMAT, CMAT, IIFT and MICAT. Ask me about a specific exam, or which OMET to target!'
    },

    // ---------------- CAT / OMET topics ----------------
    {
        keywords: ['cat exam', 'what is cat', 'cat full form'],
        answer: 'CAT (Common Admission Test) is India\'s most popular MBA entrance exam conducted every year for admission into IIMs and many other top B-Schools.'
    },
    {
        keywords: ['cat eligibility', 'eligible', 'graduation percentage'],
        answer: 'You need a bachelor\'s degree with at least 50% marks (45% for SC/ST/PwD) or be in your final year of graduation to appear for CAT.'
    },
    {
        keywords: ['cat syllabus', 'syllabus'],
        answer: 'CAT has three sections: VARC (Verbal Ability & Reading Comprehension), DILR (Data Interpretation & Logical Reasoning), and Quantitative Aptitude.'
    },
    {
        keywords: ['cat pattern', 'exam pattern'],
        answer: 'CAT consists of 66 questions divided into VARC, DILR and QA. The total duration is 120 minutes, with 40 minutes allotted to each section.'
    },
    {
        keywords: ['negative marking', 'marking scheme'],
        answer: 'MCQs carry +3 for a correct answer and -1 for an incorrect answer. TITA (Type In The Answer) questions have no negative marking.'
    },
    {
        keywords: ['cat preparation', 'prepare for cat'],
        answer: 'A good CAT preparation plan includes concept building, daily practice, sectional tests, mock tests, and detailed analysis of every mock.'
    },
    {
        keywords: ['mock test', 'mocks'],
        answer: 'Mock tests help you improve speed, accuracy, time management, and exam temperament. We recommend taking mocks regularly and analysing every mistake.'
    },
    {
        keywords: ['percentile', 'cat percentile'],
        answer: 'CAT percentile shows your performance relative to other candidates. Top IIMs usually shortlist candidates above 98–99+ percentile, though it varies by category and profile.'
    },
    {
        keywords: ['sectional cutoff', 'cutoff'],
        answer: 'Most IIMs require both an overall percentile and sectional percentiles. Clearing only the overall cutoff is usually not enough.'
    },
    {
        keywords: ['best books', 'books'],
        answer: 'Popular CAT books include Arun Sharma for QA & DILR, Nishit Sinha books, and regular practice through quality mock tests.'
    },
    {
        keywords: ['daily study', 'study plan'],
        answer: 'Most aspirants prepare for 2–4 hours daily for 6–9 months depending on their current level.'
    },
    {
        keywords: ['non engineer', 'arts', 'commerce'],
        answer: 'Yes. Students from engineering, commerce, arts, science and every background crack CAT every year.'
    },
    {
        keywords: ['work experience'],
        answer: 'Work experience is not required for CAT. Freshers and experienced professionals can both apply.'
    },
    {
        keywords: ['cat registration', 'registration'],
        answer: 'CAT registration generally starts around August every year. Keep checking the official notification for exact dates.'
    },
    {
        keywords: ['cat score vs percentile'],
        answer: 'Your raw score is converted into a scaled score and then into a percentile based on your performance relative to other candidates.'
    },
    {
        keywords: ['xat'],
        answer: 'XAT is conducted by XLRI and includes Decision Making, Verbal Ability, Quantitative Aptitude, Data Interpretation and General Knowledge.'
    },
    {
        keywords: ['nmat'],
        answer: 'NMAT allows multiple attempts and has no negative marking. It is accepted by NMIMS and several other B-Schools.'
    },
    {
        keywords: ['snap'],
        answer: 'SNAP is conducted by Symbiosis International University and is accepted by SIBM, SCMHRD and other Symbiosis institutes.'
    },
    {
        keywords: ['cmat'],
        answer: 'CMAT is conducted by NTA and is accepted by more than 1000 AICTE-approved MBA colleges across India.'
    },
    {
        keywords: ['iift'],
        answer: 'IIFT admissions now use CAT scores for MBA (International Business) admissions.'
    },
    {
        keywords: ['varc', 'verbal ability', 'reading comprehension'],
        answer: 'VARC has 24 questions — RC passages (16 Qs) and VA questions like Para Jumbles, Para Summary, and Odd Sentence Out (8 Qs). RC is the most scoring part.'
    },
    {
        keywords: ['rc tips'],
        answer: 'For RC: read the passage actively, understand the author\'s tone, and eliminate options carefully. Don\'t spend more than 8–9 minutes per passage.'
    },
    {
        keywords: ['para jumble', 'parajumble'],
        answer: 'Para Jumbles require you to arrange 4–5 sentences logically. Look for opening sentences (no pronoun reference), linking words, and chronological clues.'
    },
    {
        keywords: ['para summary'],
        answer: 'Para Summary tests your ability to identify the central idea of a paragraph. Always pick the option that covers the main point without being too narrow or too broad.'
    },
    {
        keywords: ['odd sentence', 'odd one out'],
        answer: 'Odd Sentence Out requires identifying the sentence that doesn\'t fit the paragraph\'s central theme. Look for topic breaks or contradictory information.'
    },
    {
        keywords: ['improve varc', 'varc score'],
        answer: 'To improve VARC: read editorials daily (Hindu, Economist), practice RC passages, and do timed VA exercises. Consistency over 3–4 months shows results.'
    },
    {
        keywords: ['varc cutoff', 'varc percentile'],
        answer: 'Top IIMs expect 80–85+ percentile in VARC. Some colleges are lenient for engineers. Focus on RC accuracy as it carries the most weight.'
    },
    {
        keywords: ['dilr', 'data interpretation', 'logical reasoning'],
        answer: 'DILR has 20 questions in sets of 4–5. It tests your ability to read tables, graphs, and logical puzzles quickly and accurately.'
    },
    {
        keywords: ['improve dilr', 'dilr tips'],
        answer: 'For DILR: practice set selection — skip difficult sets early. Solve 3–4 sets daily and always time yourself. Speed comes with pattern recognition.'
    },
    {
        keywords: ['dilr set selection', 'which sets to attempt'],
        answer: 'In the exam, spend 2–3 mins scanning all sets. Pick sets that look familiar and have clear data. Don\'t get stuck on one set — move on.'
    },
    {
        keywords: ['dilr cutoff'],
        answer: 'DILR cutoffs at top IIMs are around 70–80 percentile. Attempting 2–3 sets accurately is often enough to clear the cutoff.'
    },
    {
        keywords: ['bar graph', 'pie chart', 'di set'],
        answer: 'DI sets include bar graphs, pie charts, line graphs, tables and caselets. Practice calculating percentages, ratios and averages quickly without a calculator.'
    },
    {
        keywords: ['seating arrangement', 'arrangement'],
        answer: 'Seating arrangement questions test logical deduction. Draw diagrams, fix definite positions first, then use elimination for remaining slots.'
    },
    {
        keywords: ['blood relation', 'family tree'],
        answer: 'For blood relation problems, draw a family tree. Assign symbols (M/F) to each person and map relationships step by step.'
    },
    {
        keywords: ['quantitative aptitude', 'qa section'],
        answer: 'QA has 22 questions covering Arithmetic, Algebra, Geometry, Number System, Modern Math and Mensuration. Arithmetic contributes the most questions.'
    },
    {
        keywords: ['arithmetic', 'profit loss', 'time speed distance', 'time and work'],
        answer: 'Arithmetic (Percentages, Profit & Loss, Ratio & Proportion, Time-Speed-Distance, Time & Work) forms 35–40% of QA. Master these topics first.'
    },
    {
        keywords: ['algebra', 'quadratic equations'],
        answer: 'Algebra includes Linear & Quadratic Equations, Inequalities, Functions and Graphs. Usually 4–5 questions appear from this topic.'
    },
    {
        keywords: ['geometry', 'mensuration', 'triangles', 'circles'],
        answer: 'Geometry covers triangles, circles, quadrilaterals, coordinate geometry and mensuration. Learn key theorems and formulas — shortcuts save time.'
    },
    {
        keywords: ['number system', 'factors', 'divisibility'],
        answer: 'Number System includes factors, HCF/LCM, divisibility rules, remainders and base systems. This is a high-difficulty but high-reward area.'
    },
    {
        keywords: ['permutation', 'combination', 'probability'],
        answer: 'P&C and Probability together contribute 2–3 questions. Focus on basic counting principles, arrangements and simple probability rules.'
    },
    {
        keywords: ['improve quant', 'quant tips', 'quant score'],
        answer: 'For QA: build concepts topic by topic, solve 20–30 questions daily, and learn shortcuts. Accuracy matters more than speed initially.'
    },
    {
        keywords: ['quant cutoff'],
        answer: 'QA cutoffs at top IIMs range from 70–85 percentile. Engineers often score higher here, so non-engineers should focus on accuracy in Arithmetic.'
    },
    {
        keywords: ['calculator', 'mental math'],
        answer: 'No calculator is allowed in CAT. Practice mental math — multiplication tables up to 20, squares up to 30, cubes up to 15, and fraction-decimal conversions.'
    },
    {
        keywords: ['time management in exam'],
        answer: 'You get 40 minutes per section with no switching allowed. Prioritize easy questions first, mark difficult ones, and return to them if time permits.'
    },
    {
        keywords: ['attempt order', 'which question first'],
        answer: 'Scan the section quickly, attempt your strongest questions first, then medium-difficulty ones. Never spend more than 2.5 minutes on a single QA question.'
    },
    {
        keywords: ['tita', 'type in the answer'],
        answer: 'TITA questions have no options and no negative marking. Always attempt TITA if you have a reasonable idea of the answer — there\'s no penalty.'
    },
    {
        keywords: ['iim ahmedabad', 'iima'],
        answer: 'IIM Ahmedabad typically requires 99+ percentile overall with strong sectional scores. It also weighs academics and work experience heavily in shortlisting.'
    },
    {
        keywords: ['iim bangalore', 'iimb'],
        answer: 'IIM Bangalore uses a composite score of CAT percentile, academics and work experience. Cutoff is usually 99+ percentile overall.'
    },
    {
        keywords: ['iim calcutta', 'iimc'],
        answer: 'IIM Calcutta has a quantitative-heavy shortlisting process. Overall cutoff is 99+ percentile with strong QA and DILR performance preferred.'
    },
    {
        keywords: ['iim lucknow', 'iiml'],
        answer: 'IIM Lucknow typically shortlists at 95–97+ percentile. It offers strong placements especially in FMCG, consulting and finance.'
    },
    {
        keywords: ['iim kozhikode', 'iimk'],
        answer: 'IIM Kozhikode shortlists around 90–95 percentile. It has strong placements and a growing reputation in marketing and digital business.'
    },
    {
        keywords: ['new iims', 'baby iims'],
        answer: 'New IIMs (Ranchi, Raipur, Rohtak, Kashipur, Tiruchirappalli, etc.) shortlist between 85–92 percentile and are excellent options for mid-range scores.'
    },
    {
        keywords: ['iim fees', 'mba fees'],
        answer: 'IIM fees range from ₹10–25 lakhs for the full program. However, placements at top IIMs typically recover the cost within 1–2 years of working.'
    },
    {
        keywords: ['gdpi', 'gd pi', 'group discussion personal interview'],
        answer: 'GDPI (Group Discussion + Personal Interview) is the final selection round after written exam shortlisting. It typically includes a GD, a PI, and sometimes a WAT — testing communication, awareness, personality and clarity of goals.'
    },
    {
        keywords: ['gd preparation', 'group discussion tips'],
        answer: 'For GD: speak clearly and logically, add new points rather than repeating others, maintain composure, and try to summarize if given the chance.'
    },
    {
        keywords: ['pi preparation', 'interview preparation', 'mba interview'],
        answer: 'For PI: prepare your Why MBA, Why this college, career goals, academic gaps, work experience, current affairs, and industry knowledge thoroughly.'
    },
    {
        keywords: ['wat', 'written ability test'],
        answer: 'WAT (Written Ability Test) is a short essay on a given topic. Structure your essay with introduction, 2–3 arguments, and a conclusion. 200–300 words in 20–30 minutes.'
    },
    {
        keywords: ['current affairs', 'general awareness', 'general knowledge'],
        answer: 'MBA interviews often test current affairs. Read business news daily (Economic Times, Mint) and stay updated on budget, policy changes and global events.'
    },
    {
        keywords: ['cat attempt', 'how many attempts', 'number of attempts'],
        answer: 'There is no limit on the number of times you can attempt CAT. Many candidates crack it in their second or third attempt after learning from mistakes.'
    },
    {
        keywords: ['cat score validity'],
        answer: 'CAT scores are valid for one year. You need to reappear if you want to apply in the next admission cycle.'
    },
    {
        keywords: ['cat difficulty', 'how tough is cat'],
        answer: 'CAT difficulty varies each year. DILR is often the most unpredictable section. Consistent practice and strong fundamentals help you handle any difficulty level.'
    },
    {
        keywords: ['scaled score', 'normalization'],
        answer: 'CAT is conducted in multiple slots. Scores are normalized across slots to ensure fairness. Your scaled score may differ from your raw score.'
    },
    {
        keywords: ['admit card', 'hall ticket'],
        answer: 'CAT admit cards are released 2–3 weeks before the exam. Download it from the official CAT website and carry a printout along with a valid photo ID.'
    },
    {
        keywords: ['cat result', 'result date'],
        answer: 'CAT results are usually declared in January. After results, IIMs send interview calls based on their shortlisting criteria.'
    },
    {
        keywords: ['cat online', 'computer based test'],
        answer: 'CAT is a computer-based test. You type numerical answers and click options on screen. Familiarity with online mock tests helps reduce exam-day stress.'
    },
    {
        keywords: ['which omet should i target', 'which omet'],
        answer: 'The right OMET depends on your target B-schools and preparation level. XAT is ideal for XLRI and several top institutes, SNAP for Symbiosis colleges, NMAT for NMIMS and other partner schools, CMAT for AICTE-approved institutes, and MICAT if you are aiming for MICA. Choose exams based on your preferred colleges and career goals rather than attempting every available test.'
    },

    // ---------------- MBA / Placements / Live Projects topics ----------------
    {
        keywords: ['what is mba', 'about mba'],
        answer: 'An MBA helps develop leadership, business knowledge, problem-solving and management skills for careers in consulting, finance, marketing, operations, HR and product management.'
    },
    {
        keywords: ['specialization'],
        answer: 'Popular MBA specializations include Marketing, Finance, Operations, HR, Analytics, Product Management and Consulting.'
    },
    {
        keywords: ['placement'],
        answer: 'Placements depend on your profile, MBA college, internships, networking and interview performance. We help students build recruiter-ready profiles.'
    },
    {
        keywords: ['summer internship', 'sip'],
        answer: 'Summer Internship Program (SIP) is one of the most important parts of an MBA and often leads to Pre-Placement Offers (PPOs).'
    },
    {
        keywords: ['ppo', 'pre placement offer'],
        answer: 'A PPO (Pre-Placement Offer) is a full-time job offer given after successfully completing your summer internship.'
    },
    {
        keywords: ['live projects'],
        answer: 'Live projects let you work on real business problems under industry mentors, helping strengthen your CV and interview preparation.'
    },
    {
        keywords: ['case interview'],
        answer: 'Case interviews evaluate structured thinking, communication and business problem-solving. Regular case practice significantly improves performance.'
    },
    {
        keywords: ['consulting'],
        answer: 'Consulting roles require strong problem-solving, communication and structured thinking. Case interview preparation is essential.'
    },
    {
        keywords: ['resume review', 'cv review'],
        answer: 'Our mentors review your CV line by line and suggest improvements to maximize shortlisting chances.'
    },
    {
        keywords: ['linkedin'],
        answer: 'A strong LinkedIn profile improves networking and recruiter visibility. We help students optimize both LinkedIn and resumes.'
    },
    {
        keywords: ['networking'],
        answer: 'Networking with alumni, seniors and recruiters opens up internship, mentorship and placement opportunities.'
    },
    {
        keywords: ['group discussion'],
        answer: 'GD preparation focuses on communication, logical thinking, leadership and teamwork.'
    },
    {
        keywords: ['case competition'],
        answer: 'Case competitions help you improve analytical thinking and are highly valued by recruiters during placements.'
    },
    {
        keywords: ['cv points'],
        answer: 'Recruiters prefer measurable achievements. Live projects, leadership positions, competitions and certifications make your CV stronger.'
    },
    {
        keywords: ['business analytics'],
        answer: 'Business Analytics combines SQL, Excel, Power BI, Python and statistics to solve business problems using data.'
    },
    {
        keywords: ['product management'],
        answer: 'Product Management focuses on solving customer problems, defining product strategy and collaborating with engineering, design and business teams.'
    },
    {
        keywords: ['finance roles', 'investment banking'],
        answer: 'Finance roles include Investment Banking, Corporate Finance, Equity Research, Risk Management and Financial Consulting.'
    },
    {
        keywords: ['marketing roles', 'brand management'],
        answer: 'Marketing roles involve brand management, digital marketing, sales strategy, customer insights and product marketing.'
    },
    {
        keywords: ['operations roles', 'supply chain'],
        answer: 'Operations focuses on supply chain, logistics, procurement, process optimization and manufacturing.'
    },
    {
        keywords: ['why mba', 'mba worth it', 'mba value'],
        answer: 'An MBA opens doors to senior leadership roles, career switches, higher salaries and a strong alumni network. The ROI depends on your college and how you utilize the 2 years.'
    },
    {
        keywords: ['mba vs pgdm', 'pgdm'],
        answer: 'MBA is a degree awarded by universities; PGDM is a diploma awarded by autonomous institutes like IIMs. Both are equally valued by recruiters in India.'
    },
    {
        keywords: ['top mba colleges', 'best mba colleges', 'top b schools'],
        answer: 'Top MBA colleges in India include IIM A/B/C/L/K/I, FMS Delhi, XLRI, MDI Gurgaon, SP Jain, IIFT, NMIMS, Symbiosis and IMT Ghaziabad.'
    },
    {
        keywords: ['fms delhi'],
        answer: 'FMS Delhi offers one of the best ROI in MBA education with low fees (under ₹2 lakhs) and strong placements. CAT cutoff is usually 98+ percentile.'
    },
    {
        keywords: ['xlri'],
        answer: 'XLRI Jamshedpur is India\'s top HR and Business Management school. It uses XAT scores and is highly respected for HR and General Management roles.'
    },
    {
        keywords: ['mdi gurgaon'],
        answer: 'MDI Gurgaon is a premier B-school with strong corporate connections. It accepts CAT scores and has excellent placements in consulting and finance.'
    },
    {
        keywords: ['sp jain', 'spjimr'],
        answer: 'SPJIMR Mumbai offers PGDM programs with strong placements in FMCG, consulting and banking. Known for its emphasis on social impact and values-based leadership.'
    },
    {
        keywords: ['mba salary', 'package', 'ctc'],
        answer: 'Average MBA salaries range from ₹8–12 LPA at mid-tier colleges to ₹25–35 LPA at top IIMs. Consulting and finance roles often pay the highest packages.'
    },
    {
        keywords: ['mba fresher', 'mba without experience'],
        answer: 'Freshers can do an MBA. IIMs and top colleges accept freshers, though work experience (1–2 years) often strengthens your profile and interview answers.'
    },
    {
        keywords: ['executive mba', 'emba'],
        answer: 'Executive MBA programs are designed for working professionals with 5+ years of experience. They run on weekends or in short intensive modules.'
    },
    {
        keywords: ['online mba'],
        answer: 'Online MBA programs from IIMs and other institutes are gaining acceptance, but for campus placements and networking, full-time programs are still preferred.'
    },
    {
        keywords: ['dual degree', 'integrated mba'],
        answer: 'Integrated MBA programs (5 years after 12th) are offered by IIM Indore, IIM Rohtak and others. They are ideal for students who are clear about pursuing management early.'
    },
    {
        keywords: ['mba loan', 'education loan'],
        answer: 'Most banks offer education loans for MBA at IIMs and top B-schools without collateral. Repayment starts 6–12 months after course completion.'
    },
    {
        keywords: ['scholarship', 'mba scholarship'],
        answer: 'Several IIMs and B-schools offer need-based and merit-based scholarships. External scholarships from companies, trusts and government schemes are also available.'
    },
    {
        keywords: ['placement preparation', 'placement prep'],
        answer: 'Start placement prep from Day 1 of MBA: build your CV, network actively, do live projects, practice case interviews, and prepare your story for every role you target.'
    },
    {
        keywords: ['shortlist criteria', 'recruiter shortlist'],
        answer: 'Recruiters shortlist based on your CV, grades, internship performance, competitions, and sometimes a written test or online assessment.'
    },
    {
        keywords: ['case study', 'case solving'],
        answer: 'Structuring a case: clarify the problem → lay out a framework → ask data questions → analyze → synthesize recommendations. Practice daily with frameworks like Profitability, Market Entry, M&A.'
    },
    {
        keywords: ['hr interview', 'behavioural interview', 'star method'],
        answer: 'HR interviews use behavioral questions: "Tell me about yourself", "Why this company?", "A time you failed". Use the STAR method (Situation, Task, Action, Result) to answer.'
    },
    {
        keywords: ['stress interview'],
        answer: 'Some companies conduct stress interviews to test composure. Stay calm, don\'t get defensive, and treat tough questions as thinking exercises rather than attacks.'
    },
    {
        keywords: ['pre placement talk', 'ppt session'],
        answer: 'Pre-Placement Talks are company presentations on campus before placements. Attend all relevant PPTs, research the company, and ask smart questions to get noticed.'
    },
    {
        keywords: ['lateral placement', 'lateral hiring'],
        answer: 'Lateral placements target students with prior work experience for senior roles. Your domain expertise combined with MBA skills makes you valuable for these positions.'
    },
    {
        keywords: ['dream company', 'target company'],
        answer: 'Research your dream companies\' business model, recent news, culture and role expectations. Tailor your CV and interview answers specifically for each company.'
    },
    {
        keywords: ['leadership', 'leadership skills'],
        answer: 'MBA develops leadership through team projects, clubs, live projects and case competitions. Leadership is demonstrated by initiative, decision-making and impact — not just seniority.'
    },
    {
        keywords: ['communication skills'],
        answer: 'Communication is critical in MBA placements. Practice clear, structured speaking in GDs, presentations and interviews. Writing skills matter for case analyses and reports.'
    },
    {
        keywords: ['excel', 'ms excel', 'vlookup', 'pivot table'],
        answer: 'Excel is essential for MBA roles in finance, analytics and consulting. Learn Pivot Tables, VLOOKUP, INDEX-MATCH, data visualization and basic financial modeling.'
    },
    {
        keywords: ['sql'],
        answer: 'SQL is highly valued in analytics and consulting roles. Learn SELECT, WHERE, GROUP BY, JOINs and subqueries. Practice on real datasets for interview rounds.'
    },
    {
        keywords: ['python for mba', 'python'],
        answer: 'Python is increasingly expected in analytics, product management and consulting roles. Focus on Pandas, NumPy and basic data visualization libraries.'
    },
    {
        keywords: ['power bi', 'tableau', 'dashboard'],
        answer: 'Data visualization tools like Power BI and Tableau are in demand for analytics roles. Building dashboards on real datasets is great for your CV and interviews.'
    },
    {
        keywords: ['certifications', 'cfa', 'prince2'],
        answer: 'Certifications in CFA, Excel, SQL, Power BI, Google Analytics or PRINCE2 add value to your MBA profile, especially if they align with your target role.'
    },

    // ---------------- Common / App / Platform topics (apply everywhere) ----------------
    {
        keywords: ['mba partner', 'about mba partner', 'what is this platform', 'how does this work'],
        answer: 'MBA Partner is a platform that helps MBA students and aspirants through live projects, case competitions, mentorship, placement prep and CAT/OMET guidance — all in one place.'
    },
    {
        keywords: ['mentor', 'mentorship'],
        answer: 'Our mentors are experienced professionals and MBA alumni who guide you through CAT prep, live projects, interview prep, CV reviews and career planning — whatever stage you\'re at.'
    },
    {
        keywords: ['book a session', 'book session', 'book a call', 'schedule a call', 'schedule session', 'book 1:1', 'book mentor'],
        answer: 'You can book a 1:1 session with our mentors directly by calling or messaging us on WhatsApp at +91 70427 32092. Just tell us your goal (CAT prep, MBA placements, live projects, etc.) and we\'ll set up a slot.'
    },
    {
        keywords: ['contact', 'call us', 'whatsapp', 'reach out', 'phone number'],
        answer: 'You can reach us at +91 70427 32092 via call or WhatsApp for personal guidance, course details or any queries.'
    },
    {
        keywords: ['bootcamp', 'placement bootcamp'],
        answer: 'Our Placements Bootcamp is an intensive program covering case interviews, CV building, GD practice, HR interviews and company-specific preparation.'
    },
    {
        keywords: ['price', 'cost', 'fee', 'fees', 'how much'],
        answer: 'For course fees and program details, please contact us at +91 70427 32092 or WhatsApp us. We\'ll help you find the right program for your goals.'
    },
    {
        keywords: ['refund', 'cancellation', 'reschedule'],
        answer: 'For refund, cancellation or rescheduling queries, please reach out to us directly at +91 70427 32092 (call/WhatsApp) and our team will assist you.'
    },
    {
        keywords: ['download app', 'mobile app', 'install app'],
        answer: 'For details about accessing our platform/app, please contact us at +91 70427 32092 and our team will guide you through the setup.'
    },
];

const GREETING = "Hi! 👋 I'm the MBA Partner assistant. Ask me anything about CAT/OMET prep, live projects, GDPI, placements, or how to book a mentor session.";

const SUGGESTIONS = [
    'How do I book a session?',
    'How do I improve my DILR score?',
    'How do live projects work?',
];

const FALLBACK =
    "Sorry, I couldn't find an exact answer. You can ask me about CAT preparation, VARC, DILR, Quant, GDPI, MBA admissions, live projects, case competitions, placements, resumes, internships, booking a session, or course details. For personal guidance, call or WhatsApp us at +91 70427 32092.";

// Simple keyword-overlap matcher — no AI, fully offline.
function findAnswer(text) {
    const lower = text.toLowerCase();
    let best = null;
    let bestScore = 0;

    KNOWLEDGE_BASE.forEach((entry) => {
        let score = 0;
        entry.keywords.forEach((kw) => {
            if (lower.includes(kw)) score += kw.split(' ').length; // longer phrase = stronger signal
        });
        if (score > bestScore) {
            bestScore = score;
            best = entry;
        }
    });

    return best ? best.answer : FALLBACK;
}

function ChatIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 5h16v11H9l-5 4V5Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6 6 18" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function SendIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 12 20 4l-6 16-3-7-7-1Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [opened, setOpened] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showGreeting, setShowGreeting] = useState(true);
    const bodyRef = useRef(null);

    useEffect(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, [messages]);

    function toggleOpen() {
        const next = !open;
        setOpen(next);
        setShowGreeting(false);
        if (next && !opened) {
            setOpened(true);
            setMessages([{ role: 'bot', text: GREETING }]);
        }
    }

    function send(text) {
        const trimmed = (text !== undefined ? text : input).trim();
        if (!trimmed) return;
        setInput('');
        const answer = findAnswer(trimmed);
        setMessages((prev) => [...prev, { role: 'user', text: trimmed }, { role: 'bot', text: answer }]);
    }

    return (
        <React.Fragment>
            {showGreeting && !open && (
                <div className="chatbot-greeting-bubble" onClick={toggleOpen} style={{ textAlign: 'left', cursor: 'pointer' }}>
                    <span>Need help? Ask me anything 👋</span>
                    <button
                        type="button"
                        aria-label="Dismiss"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowGreeting(false);
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            <button
                className={`chatbot-launcher${open ? ' open' : ''}`}
                onClick={toggleOpen}
                aria-label={open ? 'Close chat' : 'Open chat'}
                type="button"
            >
                <span className="chatbot-chat-icon">
                    <ChatIcon />
                </span>
                <span className="chatbot-close-icon">
                    <CloseIcon />
                </span>
            </button>

            <div className={`chatbot-panel${open ? ' open' : ''}`} role="dialog" aria-label="MBA Partner Assistant">
                <div className="chatbot-header">
                    <div className="chatbot-header-avatar">MP</div>
                    <div className="chatbot-header-text">
                        <strong>MBA Partner Assistant</strong>
                        <span className="chatbot-header-status">Instant answers</span>
                    </div>
                    <button className="chatbot-header-close" onClick={() => setOpen(false)} aria-label="Close chat" type="button">
                        ✕
                    </button>
                </div>

                <div className="chatbot-body" ref={bodyRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`chatbot-msg ${m.role === 'user' ? 'user' : 'bot'}`}>
                            {m.text}
                        </div>
                    ))}
                </div>

                {messages.length <= 1 && (
                    <div className="chatbot-suggestions">
                        {SUGGESTIONS.map((s) => (
                            <button key={s} type="button" className="chatbot-suggestion-chip" onClick={() => send(s)}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <div className="chatbot-input-row">
                    <input
                        className="chatbot-input"
                        type="text"
                        placeholder="Type your question…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') send();
                        }}
                    />
                    <button
                        className="chatbot-send-btn"
                        onClick={() => send()}
                        disabled={!input.trim()}
                        aria-label="Send"
                        type="button"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
}

function mountChatbot() {
    // Guard against duplicate <script> tags (e.g. leftover data-track tags
    // on a page) triggering chatbot.js more than once — only mount once.
    if (window.__mbaPartnerChatbotMounted) return;

    const mount = document.getElementById('chatbot-mount');
    if (!mount) return;

    window.__mbaPartnerChatbotMounted = true;
    const root = ReactDOM.createRoot(mount);
    root.render(<ChatbotWidget />);
}

mountChatbot();