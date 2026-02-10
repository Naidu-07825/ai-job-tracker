import fs from "fs/promises";

const url = "http://localhost:5010/api/resume/upload";

async function testFileFormats() {
  const testFiles = [
    {
      name: "PDF Resume",
      path: "./backend/uploads/1770536893387-Dasu Koteswar Naidu Resume.pdf",
      email: "test.pdf@example.com"
    },
    {
      name: "DOCX Resume",
      path: "./backend/uploads/1770539575483-Assignment_ AI-Powered Job Tracker with Smart Matching.docx",
      email: "test.docx@example.com"
    }
  ];

  console.log("🧪 Testing Resume Upload Formats\n");

  for (const file of testFiles) {
    try {
      const fileExists = await fs.stat(file.path).catch(() => null);
      
      if (!fileExists) {
        console.log(`❌ ${file.name}: File not found`);
        continue;
      }

      const buf = await fs.readFile(file.path);
      const fd = new FormData();
      const filename = file.path.split("/").pop();
      fd.append("resume", new Blob([buf]), filename);
      fd.append("email", file.email);

      console.log(`📤 ${file.name}`);
      console.log(`   Size: ${(buf.length / 1024).toFixed(2)} KB`);

      const res = await fetch(url, { method: "POST", body: fd });
      const body = await res.json();

      if (res.ok) {
        console.log(`   ✅ Status: ${res.status} OK`);
        console.log(`   ✅ Extracted: ${body.resumeLength} characters`);
      } else {
        console.log(`   ❌ Status: ${res.status}`);
        console.log(`   ❌ Error: ${body.error}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
    console.log("");
  }
}

setTimeout(testFileFormats, 1000);
