"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_it_container_1 = __importDefault(require("markdown-it-container"));
function file(md) {
    console.log(md);
    console.log("in rule");
    return markdown_it_container_1.default(md, "file", {
        marker: "@",
        validate: () => true,
        render: function (tokens, idx) {
            const { info } = tokens[idx];
            console.log("customFence");
            console.log(tokens);
            if (tokens[idx].nesting === 1) {
                return `<div class="notice notice-${md.utils.escapeHtml(info)}">\n`;
            }
            else {
                return "</div>\n";
            }
        },
    });
}
exports.default = file;
//# sourceMappingURL=files.js.map