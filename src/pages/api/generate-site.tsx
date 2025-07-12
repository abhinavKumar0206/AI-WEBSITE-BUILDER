
import type { NextApiRequest, NextApiResponse } from "next";

type FileOutput = {
  filename: string;
  content: string;
};

type ResponseData = {
  files: FileOutput[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { prompt } = req.body;

  console.log("🧠 Prompt received:", prompt);

  const rawResponse = await fetch("http://localhost:8000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const result = await rawResponse.json();
  console.log("📦 LLM Output:", result);

  const rawText = result.files[0].content;

  const files: FileOutput[] = [];
  const matches = rawText.matchAll(/\*\*([\w.-]+)\*\*\n+```[\w]*\n+([\s\S]+?)```/g);

  for (const match of matches) {
    files.push({
      filename: match[1],
      content: match[2].trim(),
    });
  }

  res.status(200).json({ files });
}
