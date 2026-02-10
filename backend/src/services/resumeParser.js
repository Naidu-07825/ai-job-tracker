import fs from "fs/promises";
import { createRequire } from "module";
import PDFParser from "pdf2json";

const require = createRequire(import.meta.url);
let pdfParse = null;
let mammoth = null;

try {
  pdfParse = require("pdf-parse");
  console.log("✅ pdf-parse loaded successfully");
} catch (err) {
  console.warn("⚠️ pdf-parse not available");
}

try {
  mammoth = require("mammoth");
  console.log("✅ mammoth loaded successfully");
} catch (err) {
  console.warn("⚠️ mammoth not available");
}

// Extract text from PDF using pdf2json
async function extractPdfWithPdf2Json(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errData) => {
        console.error("  ❌ pdf2json error:", errData.parserError);
        reject(new Error(errData.parserError));
      });
      
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          let text = "";
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textItem of page.Texts) {
                  if (textItem.R && textItem.R[0]) {
                    text += textItem.R[0].T + " ";
                  }
                }
              }
              text += "\n";
            }
          }
          const cleanText = text.trim();
          console.log(`  ✅ pdf2json extraction succeeded, extracted ${cleanText.length} chars from ${pdfData.Pages?.length || 0} pages`);
          resolve(cleanText);
        } catch (err) {
          console.error("  ❌ pdf2json data processing error:", err.message);
          reject(err);
        }
      });
      
      pdfParser.loadPDF(filePath);
    } catch (err) {
      console.error("  ❌ pdf2json initialization error:", err.message);
      reject(err);
    }
  });
}

export async function parseResume(filePath, mimetype) {
  try {
    const buf = await fs.readFile(filePath);
    console.log(`📄 Parsing resume: ${filePath}, mimetype: ${mimetype}, size: ${buf.length} bytes`);

    // Try PDF parsing with multiple methods
    if ((mimetype === "application/pdf" || filePath.endsWith('.pdf'))) {
      // First try: pdf2json (pure JavaScript, no native deps)
      try {
        console.log("  → Attempting PDF parsing with pdf2json...");
        const text = await extractPdfWithPdf2Json(filePath);
        if (text && text.length > 0) {
          return text;
        }
      } catch (err) {
        console.error("  ❌ pdf2json failed:", err.message);
      }

      // Second try: pdf-parse library
      if (pdfParse) {
        try {
          console.log("  → Attempting PDF parsing with pdf-parse...");
          const data = await pdfParse(buf);
          const text = (data.text || data.content || "").trim();
          console.log(`  ✅ pdf-parse succeeded, extracted ${text.length} chars`);
          if (text.length > 0) return text;
        } catch (err) {
          console.error("  ❌ pdf-parse error:", err.message);
        }
      }

      // Third try: Binary text extraction (last resort)
      try {
        console.log("  → Attempting binary text extraction from PDF...");
        const text = buf.toString("binary");
        const readableText = text
          .split("")
          .map((char) => {
            const code = char.charCodeAt(0);
            return (code >= 32 && code <= 126) || code >= 128 ? char : " ";
          })
          .join("")
          .replace(/\s+/g, " ")
          .trim();
        
        if (readableText.length > 50) {
          console.log(`  ✅ Binary extraction succeeded, extracted ${readableText.length} chars`);
          return readableText;
        }
      } catch (err) {
        console.error("  ❌ Binary extraction error:", err.message);
      }
    }

    // Try DOCX parsing
    if ((mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || filePath.endsWith('.docx')) && mammoth) {
      try {
        console.log("  → Attempting DOCX parsing with mammoth...");
        const result = await mammoth.extractRawText({ path: filePath });
        const text = result.value || "";
        console.log(`  ✅ DOCX parsed successfully, extracted ${text.length} chars`);
        if (text.length > 0) return text;
      } catch (err) {
        console.error("  ❌ DOCX parsing error:", err.message);
      }
    }

    // Fallback: treat as plain text
    console.log("  → Treating as plain text fallback...");
    const text = buf.toString("utf-8");
    console.log(`  ✅ Read as UTF-8 text, extracted ${text.length} chars`);
    return text;
  } catch (err) {
    console.error("❌ Resume parsing failed:", err.message);
    throw new Error(`Failed to parse resume: ${err.message}`);
  }
}
