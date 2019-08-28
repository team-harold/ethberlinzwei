const fs = require("fs"),
  path = require("path"),
  slash = require("slash");
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(process.argv[2] || ".", function(filePath) {
  const fileContents = fs.readFileSync(filePath, "utf8");
  filePath = slash(filePath);
  console.log({filePath});

  if (path.extname(filePath) !== ".html") return;
  const rel =
    "./" +
    filePath
      .replace(/^\//, "")
      .replace(process.argv[2], "")
      .replace(/^\//, "")
      .replace(/[^\/]+/g, "..")
      .replace(/\.\.$/, "");
  console.log({rel});
  const contents = fileContents.replace(
    /<base href=[^>]*>/,
    `<base href="${rel}">`
  );

  fs.writeFileSync(filePath, contents, "utf8");
});