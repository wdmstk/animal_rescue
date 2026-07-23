import fs from "node:fs";
import path from "node:path";

// BRAND_GUIDELINES.md & DESIGN_GOVERNANCE.md で規定されている禁止キーワード
const FORBIDDEN_TERMS = [
  "絶対安心",
  "100%保証",
  "絶対に治る",
  "完璧な診断",
  "確実な回復",
  "今すぐ買わないと"
];

const TARGET_DIRS = ["src"];
const IGNORE_PATTERNS = [".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx"];

function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (
      (filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".json")) &&
      !IGNORE_PATTERNS.some((pattern) => filePath.endsWith(pattern))
    ) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function checkBrandTerms(): boolean {
  console.log("🔍 Checking Brand Terms and Governance Quality Gate...");
  let hasError = false;

  const files = TARGET_DIRS.flatMap((dir) =>
    fs.existsSync(dir) ? walkDir(dir) : []
  );

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      for (const term of FORBIDDEN_TERMS) {
        if (line.includes(term)) {
          console.error(
            `❌ [Brand Violation] Found forbidden term "${term}" in ${file}:${index + 1}`
          );
          console.error(`   Line: ${line.trim()}`);
          hasError = true;
        }
      }
    });
  }

  if (hasError) {
    console.error("\n💥 Brand term check failed. Please remove forbidden marketing/overpromising phrases.");
    process.exit(1);
  } else {
    console.log("✅ Brand term check passed cleanly with no violations!");
  }

  return true;
}

checkBrandTerms();
