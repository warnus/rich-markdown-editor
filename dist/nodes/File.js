"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const toggleWrap_1 = __importDefault(require("../commands/toggleWrap"));
const react_dom_1 = __importDefault(require("react-dom"));
const Node_1 = __importDefault(require("./Node"));
const files_1 = __importDefault(require("../rules/files"));
class File extends Node_1.default {
    constructor() {
        super(...arguments);
        this.handleStyleChange = event => {
            const { view } = this.editor;
            const { tr } = view.state;
            const element = event.target;
            const { top, left } = element.getBoundingClientRect();
            const result = view.posAtCoords({ top, left });
            if (result) {
                const transaction = tr.setNodeMarkup(result.inside, undefined, {
                    style: element.value,
                });
                view.dispatch(transaction);
            }
        };
    }
    get styleOptions() {
        return Object.entries({
            info: this.options.dictionary.info,
            warning: this.options.dictionary.warning,
            tip: this.options.dictionary.tip,
        });
    }
    get name() {
        return "container_notice";
    }
    get rulePlugins() {
        return [files_1.default];
    }
    get schema() {
        return {
            attrs: {
                style: {
                    default: "info",
                },
            },
            content: "block+",
            group: "block",
            defining: true,
            draggable: true,
            parseDOM: [
                {
                    tag: "div.notice-block",
                    preserveWhitespace: "full",
                    contentElement: "div:last-child",
                    getAttrs: (dom) => ({
                        style: dom.className.includes("tip")
                            ? "tip"
                            : dom.className.includes("warning")
                                ? "warning"
                                : undefined,
                    }),
                },
            ],
            toDOM: node => {
                const select = document.createElement("select");
                select.addEventListener("change", this.handleStyleChange);
                this.styleOptions.forEach(([key, label]) => {
                    const option = document.createElement("option");
                    option.value = key;
                    option.innerText = label;
                    option.selected = node.attrs.style === key;
                    select.appendChild(option);
                });
                let component;
                if (node.attrs.style === "tip") {
                    component = color;
                    "currentColor" /  > ;
                }
                else if (node.attrs.style === "warning") {
                    component = color;
                    "currentColor" /  > ;
                }
                else {
                    component = color;
                    "currentColor" /  > ;
                }
                const icon = document.createElement("div");
                icon.className = "icon";
                react_dom_1.default.render(component, icon);
                return [
                    "div",
                    { class: `notice-block ${node.attrs.style}` },
                    icon,
                    ["div", { contentEditable: false }, select],
                    ["div", { class: "content" }, 0],
                ];
            },
        };
    }
    commands({ type }) {
        return attrs => toggleWrap_1.default(type, attrs);
    }
    inputRules({ type }) {
        return [prosemirror_inputrules_1.wrappingInputRule(/^@@@$/, type)];
    }
    toMarkdown(state, node) {
        state.write("\n@@@" + (node.attrs.style || "info") + "\n");
        state.renderContent(node);
        state.ensureNewLine();
        state.write("@@@");
        state.closeBlock(node);
    }
    parseMarkdown() {
        return {
            block: "container_notice",
            getAttrs: tok => ({ style: tok.info }),
        };
    }
}
exports.default = File;
//# sourceMappingURL=File.js.map