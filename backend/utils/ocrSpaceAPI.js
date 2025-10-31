import dotenv from "dotenv";
dotenv.config();
import FormData from "form-data";
import fs from "fs"; 

const apiKey = 

async function extractTextFromPDF(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("language", "eng");
  form.append("isOverlayRequired", "false");

  const response = await axios.post("https://api.ocr.space/parse/image", form, {
    headers: {
      ...form.getHeaders(),
      "apikey": apiKey
    },
  });

  const parsedResults = response.data.ParsedResults;
  if (!parsedResults || !parsedResults.length) {
    throw new Error("Could not extract text from PDF.");
  }

  return parsedResults.map(r => r.ParsedText).join("\n");
}


export default extractTextFromPDF;