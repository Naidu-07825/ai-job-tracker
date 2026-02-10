import fs from "fs/promises";

const url = "http://localhost:5010/api/resume/upload";

// Create a test file with the user's actual resume content
const resumeContent = `Dasu Koteswar Naidu
Kommadi, Visakhapatnam, Andhra Pradesh, India
dasukoteswarnaidu0@gmail.com — +91 7075251153
LinkedIn Profile
Objective
B.Tech Computer Science Engineering (Data Science) student with hands-on experience in full
stack, web development and database management. Seeking an internship or entry-level role to
apply Python, SQL, JavaScript, React, and MongoDB in building real-world, data-driven web
applications and software solutions.
Education
Computer Science and Engineering-Data Science
Aditya Engineering College (CGPA: 7.0/ 10)
Intermediate (Class XII)
Narayana junior College (Marks: 517/1000)
Board of Intermediate Education, Andhra Pradesh
Secondary School Certificate (Class X) (Marks:594/600)
Board of Secondary Education, Andhra Pradesh
Technical Skills
2022– 2026
2020– 2022
2019– 2020
• Programming Languages: Python, C, SQL, JavaScript
• Web Technologies: HTML, CSS, JavaScript
• Frameworks & Libraries: React.js, Node.js , express.js
• Databases: MySQL, MongoDB
• Tools: Git, GitHub, VS Code, Jupyter Notebook
Experience
Web Development Intern– ApexPlanet Software Pvt. Ltd.
• Developed responsive web pages using HTML, CSS, and JavaScript.
• Implemented UI components, forms, and animations.
• Improved website performance and accessibility.
• Collaborated using Git and VS Code for version control.
May 2025– Jun 2025
Full Stack Developer Intern– Pena4
Nov2025– Apr 2026
• Developed full-stack web applications using HTML, CSS, JavaScript.
• Built backend services with Node.js and Express.js.
• Designed MongoDB schemas and implemented REST APIs.
• Created admin dashboards and CRUD functionalities.
Projects
E-Library Management System
• Developed a full-stack web application for book browsing and order management.
• Implemented MySQL database for user and book data.
• Designed frontend and backend CRUD operations.
Certifications
• NPTEL– Cloud Computing
• NPTEL– Introduction to Industry 4.0 and Industrial Internet of Things (IIoT)
• HackerRank– SQL (Advanced)
• HackerRank– JavaScript (Intermediate)
• HackerRank– React (Basic)
• LinkedIn Learning– React Essential Training
• Infosys Springboard– HTML5, CSS3, and JavaScript
`;

async function testUpload() {
  try {
    // Write test file
    await fs.writeFile("./test_dasu_resume.txt", resumeContent);
    console.log("Created test resume file");

    // Create form data
    const buf = await fs.readFile("./test_dasu_resume.txt");
    const fd = new FormData();
    fd.append("resume", new Blob([buf]), "Dasu_Resume.txt");
    fd.append("email", "dasu@example.com");

    console.log("\n📤 Uploading resume...");
    console.log(`   File size: ${buf.length} bytes`);
    console.log(`   Content preview: ${resumeContent.substring(0, 100)}...`);

    const res = await fetch(url, { method: "POST", body: fd });
    const body = res.headers.get("content-type")?.includes("json")
      ? await res.json()
      : await res.text();

    console.log(`\n📊 Upload Response:`);
    console.log(`   Status: ${res.status}`);
    console.log(`   Body:`, JSON.stringify(body, null, 2));

    // Clean up
    await fs.unlink("./test_dasu_resume.txt").catch(() => {});
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// Wait for backend to be ready
setTimeout(testUpload, 1000);
