// @ts-check
const tests = require("./common");
const { join } = require("path");

let entryPoint;

switch (process.platform) {
    case "darwin":
        entryPoint = "api-macos";
        break;
    case "win32":
        entryPoint = "api-win.exe";
        break;
    default:
        entryPoint = "api-linux";
        break;
}

tests({
    command: join(__dirname, '..', 'dist', entryPoint),
    args: [],
    prefix: "api (pkg)"
})
