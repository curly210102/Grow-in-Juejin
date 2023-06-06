const fs = require("fs");
const resolveConfig = require("tailwindcss/lib/public/resolve-config").default;
const resolveConfigPath =
  require("tailwindcss/lib/util/resolveConfigPath").default;
const {
  createContext,
  getFileModifiedMap,
} = require("tailwindcss/lib/lib/setupContextUtils");
const {
  parseCandidateFiles,
  resolvedChangedContent,
} = require("tailwindcss/lib/lib/content");
const {
  defaultExtractor: createDefaultExtractor,
} = require("tailwindcss/lib/lib/defaultExtractor");
const { resolveMatches } = require("tailwindcss/lib/lib/generateRules");
const regex = require("tailwindcss/lib/lib/regex");
const {
  splitAtTopLevelOnly,
} = require("tailwindcss/lib/util/splitAtTopLevelOnly");

const PREFIX = "gij-";

// 创建 context
function getContext(tailwindConfig) {
  return createContext(tailwindConfig);
}

// 获取所有模板文件
function getAllTemplateFiles(context, tailwindConfig) {
  let fileModifiedMap = getFileModifiedMap(context);
  let candidateFiles = parseCandidateFiles(context, tailwindConfig);
  let [allFiles] = resolvedChangedContent(
    context,
    candidateFiles,
    fileModifiedMap
  );
  return allFiles;
}

// 主逻辑
function processTailwindPrefix() {
  const tailwindConfig = resolveConfig(require(resolveConfigPath()));
  const context = getContext(tailwindConfig);
  const allFiles = getAllTemplateFiles(context, tailwindConfig);

  for (let { file, content } of allFiles) {
    content = file ? fs.readFileSync(file, "utf8") : content;
    // 匹配+替换生成新内容
    const newContent = generateNewContent(content, context);

    if (newContent !== content) {
      fs.writeFile(file, newContent, "utf-8", (err) => {
        if (err) {
          console.error(`Update ${file} Failed`);
        } else {
          console.log(`Update ${file} Success`);
        }
      });
    }
  }
}

function generateNewContent(content, context) {
  const defaultExtractor = createDefaultExtractor(context);
  // 逐行匹配并替换
  const newContent = content
    .split("\n")
    .map((line) => {
      if (line.trim().length === 0) {
        return line;
      }
      // 提取行中原子 class
      const candidates = new Set(
        defaultExtractor(line).filter((s) => s !== "!*")
      );
      const classes = Array.from(candidates).filter(
        (candidate) => Array.from(resolveMatches(candidate, context)).length > 0
      );

      if (classes.length) {
        // 将 class 替换为增加了 prefix 的 class
        const classRegex = regex.pattern([
          /(?<=^|\s|['"`])/,
          regex.any(classes.map(regex.escape)),
          /(?=$|\s|['"`])/,
        ]);
        return line.replace(classRegex, (match) => addPrefix(match, context));
      } else {
        return line;
      }
    })
    .join("\n");
  return newContent;
}

// 增加 Prefix
// 拆解出 variants, important, class
// 再组装为 `${variants}${important}${prefix}${class}`
function addPrefix(tailwindClass, context) {
  const separator = context.tailwindConfig.separator;
  let [classCandidate, ...variants] = splitAtTopLevelOnly(
    tailwindClass,
    separator
  ).reverse();

  let important = false;
  if (classCandidate.startsWith("!")) {
    important = true;
    classCandidate = classCandidate.slice(1);
  }

  let negative = false;
  if (classCandidate.startsWith("-")) {
    negative = true;
    classCandidate = classCandidate.slice(1);
  }

  // 任意属性不添加前缀
  if (classCandidate.startsWith("[")) {
    return tailwindClass;
  }

  variants.reverse().push("");
  return (
    variants.join(separator) +
    (important ? "!" : "") +
    (negative ? "-" : "") +
    PREFIX +
    classCandidate
  );
}

processTailwindPrefix();
