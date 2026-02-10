import fs from "fs/promises";

const url = "http://localhost:5010/api/resume/upload";

// Use one of the existing PDF files from uploads
const pdfPath = "./backend/uploads/1770536893387-Dasu Koteswar Naidu Resume.pdf";

async function testPdfUpload() {
  try {
    const fileExists = await fs.stat(pdfPath).catch(() => null);
    
    if (!fileExists) {
      console.log(`❌ PDF file not found at: ${pdfPath}`);
      console.log("\n📁 Available files in uploads:");
      const files = await fs.readdir("./backend/uploads").catch(() => []);
      files.slice(0, 5).forEach(f => console.log(`   - ${f}`));
      return;
    }

    console.log(`\n📤 Testing PDF Upload`);
    console.log(`   File: ${pdfPath}`);
    
    const buf = await fs.readFile(pdfPath);
    const fd = new FormData();
    fd.append("resume", new Blob([buf]), "Dasu_Resume.pdf");
    fd.append("email", "dasu.pdf@example.com");

    console.log(`   File size: ${buf.length} bytes`);
    console.log(`\n   Uploading...`);

    const res = await fetch(url, { method: "POST", body: fd });
    const body = res.headers.get("content-type")?.includes("json")
      ? await res.json()
      : await res.text();

    console.log(`\n📊 PDF Upload Response:`);
    console.log(`   Status: ${res.status}`);
    console.log(`   Success: ${body.success || false}`);
    if (body.resumeLength) {
      console.log(`   Extracted: ${body.resumeLength} characters`);
    }
    if (body.error) {
      console.log(`   Error: ${body.error}`);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

setTimeout(testPdfUpload, 1000);
