import { readFile } from "node:fs/promises";

const report = JSON.parse(await readFile("eslint-report.json", "utf8"));
let errors = 0;

const escapeMessage = (value) =>
  String(value).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
const escapeProperty = (value) => escapeMessage(value).replaceAll(":", "%3A").replaceAll(",", "%2C");

for (const result of report) {
  for (const message of result.messages) {
    const level = message.severity === 2 ? "error" : "warning";
    if (message.severity === 2) errors += 1;
    const location = [
      `file=${escapeProperty(result.filePath)}`,
      `line=${message.line || 1}`,
      `col=${message.column || 1}`,
    ].join(",");
    const rule = message.ruleId ? `${message.ruleId}: ` : "";
    console.log(`::${level} ${location}::${escapeMessage(`${rule}${message.message}`)}`);
  }
}

if (errors) process.exitCode = 1;
