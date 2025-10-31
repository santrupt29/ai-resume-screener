import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import PDFParser from "pdf2json";
import Tesseract from "tesseract.js";

function pdfBufferToPngs(fileBuffer, tmpDir) {
  const pdfPath = path.join(tmpDir, "tmp_resume.pdf");
  fs.writeFileSync(pdfPath, fileBuffer);

  const outPrefix = path.join(tmpDir, "page");
  execFileSync("pdftoppm", ["-png", pdfPath, outPrefix]);

  const files = fs.readdirSync(tmpDir)
    .filter(f => f.startsWith("page") && f.endsWith(".png"))
    .map(f => path.join(tmpDir, f))
    .sort((a,b) => a.localeCompare(b, undefined, { numeric: true }));

  return files;
}

async function runOcrOnPngFiles(pngPaths) {
  let fullText = "";
  for (const pngPath of pngPaths) {
    const { data: { text } } = await Tesseract.recognize(pngPath, "eng", {
      logger: m => console.log("[TESSERACT]", m.status, Math.round((m.progress||0)*100) + "%")
    });
    fullText += text + "\n\n";
  }
  return fullText;
}

export async function extractTextFromPdfBuffer(fileBuffer) {
  try {
    const pdfParser = new PDFParser();

    const rawText = await new Promise((resolve, reject) => {
      let settled = false;
      pdfParser.on("pdfParser_dataError", errData => {
        if (!settled) {
          settled = true;
          reject(new Error(errData?.parserError || "pdf2json parse error"));
        }
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        if (settled) return;
        try {
          const text = pdfParser.getRawTextContent();
          settled = true;
          resolve(text || "");
        } catch (e) {
          settled = true;
          reject(new Error("pdf2json getRawTextContent failed"));
        }
      });

      pdfParser.parseBuffer(fileBuffer);
    });

    if (rawText && rawText.trim()) {
      console.log("✅ extractTextFromPdfBuffer: extracted text via pdf2json (length:", rawText.length, ")");
      return rawText;
    } else {
      console.warn("⚠️ extractTextFromPdfBuffer: pdf2json returned empty text. Falling back to OCR.");
    }
  } catch (err) {
    console.warn("⚠️ pdf2json failed:", err.message || err);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-ocr-"));
  try {
    const pngPaths = pdfBufferToPngs(fileBuffer, tmpDir); // may throw if pdftoppm missing
    if (!pngPaths || pngPaths.length === 0) {
      throw new Error("No PNG pages produced from PDF (pdftoppm failure or empty PDF).");
    }

    console.log(`✅ OCR fallback: produced ${pngPaths.length} PNG pages, running Tesseract...`);
    const ocrText = await runOcrOnPngFiles(pngPaths);

    if (ocrText && ocrText.trim()) {
      console.log("✅ OCR extracted text (length:", ocrText.length, ")");
      return ocrText;
    } else {
      throw new Error("OCR produced empty text");
    }
  } finally {
    // Cleanup temp files
    try {
      const tmpFiles = fs.readdirSync(tmpDir);
      for (const f of tmpFiles) {
        fs.unlinkSync(path.join(tmpDir, f));
      }
      fs.rmdirSync(tmpDir);
    } catch (cleanupErr) {
      console.warn("Warning: cleanup failed for tmpDir:", tmpDir, cleanupErr);
    }
  }
}
