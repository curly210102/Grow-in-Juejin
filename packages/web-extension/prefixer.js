const fs = require("fs");
const path = require("path");

const prefix = "gij-";

function getAllVueFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllVueFiles(filePath, fileList);
    } else if (path.extname(file) === ".vue") {
      fileList.push(filePath);
    }
  });

  return fileList;
}

getAllVueFiles(__dirname).forEach(addPrefixToSingleFile);

function addPrefixToSingleFile(fileName) {
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const regex = /[^:]class="([^"]+)"|:class="[^']*'([^'+])'"/g;
    let match = regex.exec(data);
    while (match != null) {
      console.log(match[1]);
      const classList = match[1].split(" ");
      const transformedList = classList.map((item) => {
        if (item.startsWith(prefix)) {
          return item;
        }
        const className = item.split(":")[1] ?? item;

        return className.startsWith("-")
          ? `-${prefix}${className.slice(1)}`
          : prefix + className;
      });
      const transformedString = transformedList.join(" ");
      data = data.replace(match[1], transformedString);
      match = regex.exec(data);
    }

    fs.writeFile(fileName, data, "utf8", (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`The file ${fileName} has been updated.`);
    });
  });
}
