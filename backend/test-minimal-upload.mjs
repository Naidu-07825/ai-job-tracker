import fs from "fs/promises";

const url = "http://localhost:5010/api/resume/upload";
const filePath = "./test_minimal.txt";

(async () => {
  try {
    const buf = await fs.readFile(filePath);
    const fd = new FormData();
    fd.append("resume", new Blob([buf]), "test_minimal.txt");
    fd.append("email", "minimal@example.com");

    const res = await fetch(url, { method: "POST", body: fd });
    const body = res.headers.get("content-type")?.includes("json") ? await res.json() : await res.text();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
