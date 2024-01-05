const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const conventionalRecommendedBump = require("conventional-recommended-bump");
const { inc } = require("semver");
const ChromeExtension = require("crx");

function bumpVersion() {
  // Read the current version from the manifest file
  const manifest = JSON.parse(fs.readFileSync("manifest.json"));
  const currentVersion = manifest.version;

  // Compute the new version using conventional commit messages
  const result = new Promise((resolve, reject) => {
    conventionalRecommendedBump(
      {
        preset: "angular",
        whatBump: (commits) => {
          let level = 2;
          commits.forEach((commit) => {
            if (commit.notes.length > 0 || commit.type === "feat") {
              level = 1;
            } else if (level === 2 && commit.type === "fix") {
              level = 0;
            }
          });
          return { level };
        },
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      }
    );
  });

  const newVersion = result.releaseType
    ? inc(currentVersion, result.releaseType)
    : currentVersion;
  manifest.version = newVersion;
  fs.writeFileSync("manifest.json", JSON.stringify(manifest, null, 2));

  return newVersion;
}

function releaseNewVersion(newVersion) {
  // // Tag the new version and commit to GitHub
  const tag = `web-extension/${newVersion}`;
  execSync(`git tag ${tag}`);
  execSync(`git commit -am "Bump version to ${newVersion}"`);
  execSync(`git push && git push --tags`);
}

function packExtension() {
  const crx = new ChromeExtension({
    codebase:
      "https://gitee.com/curlly-brackets/grow-in-juejin-web-extension/raw/master/extension.crx",
    privateKey: fs.readFileSync(
      path.resolve(
        process.env.OPEN_PROJECT_KEYS_PATH,
        "grow-in-juejin",
        "dist.pem"
      )
    ),
  });

  crx
    .load(path.resolve(__dirname, "./dist"))
    .then((crx) => crx.pack())
    .then((crxBuffer) => {
      const updateXML = crx.generateUpdateXML();

      fs.writeFileSync("./release/update.xml", updateXML);
      fs.writeFileSync("./release/extension.crx", crxBuffer);
    })
    .catch((err) => {
      console.error(err);
    });
}

// function generatePrivateKey() {
//   const crx = new ChromeExtension({
//     codebase:
//       "https://gitee.com/curlly-brackets/grow-in-juejin-web-extension/raw/master/extension.crx",
//     privateKey: fs.readFileSync(
//       path.resolve(
//         process.env.OPEN_PROJECT_KEYS_PATH,
//         "grow-in-juejin",
//         "dist.pem"
//       )
//     ),
//   });
//   const key = crx
//     .generatePublicKey(path.resolve(__dirname, "./dist"))
//     .then((key) => {
//       console.log(key + "");
//     });
// }

// const version = bumpVersion();
// console.log(version);

packExtension();
