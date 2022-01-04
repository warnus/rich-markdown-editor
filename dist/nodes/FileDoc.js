"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const prosemirror_state_1 = require("prosemirror-state");
const toggleWrap_1 = __importDefault(require("../commands/toggleWrap"));
const outline_icons_1 = require("outline-icons");
const React = __importStar(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const Node_1 = __importDefault(require("./Node"));
const files_1 = __importDefault(require("../rules/files"));
const uploadFilePlaceholder_1 = __importDefault(require("../lib/uploadFilePlaceholder"));
const getDataTransferFiles_1 = __importDefault(require("../lib/getDataTransferFiles"));
const insertAllFiles_1 = __importDefault(require("../commands/insertAllFiles"));
const uploadPlugin = options => new prosemirror_state_1.Plugin({
    props: {
        handleDOMEvents: {
            paste(view, event) {
                if ((view.props.editable && !view.props.editable(view.state)) ||
                    !options.uploadFile) {
                    return false;
                }
                if (!event.clipboardData)
                    return false;
                const files = Array.prototype.slice
                    .call(event.clipboardData.items)
                    .map(dt => dt.getAsFile())
                    .filter(file => file);
                if (files.length === 0)
                    return false;
                const { tr } = view.state;
                if (!tr.selection.empty) {
                    tr.deleteSelection();
                }
                const pos = tr.selection.from;
                insertAllFiles_1.default(view, event, pos, files, options);
                return true;
            },
            drop(view, event) {
                if ((view.props.editable && !view.props.editable(view.state)) ||
                    !options.uploadImage) {
                    return false;
                }
                const files = getDataTransferFiles_1.default(event);
                if (files.length === 0) {
                    return false;
                }
                const result = view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                });
                if (result) {
                    insertAllFiles_1.default(view, event, result.pos, files, options);
                    return true;
                }
                return false;
            },
        },
    },
});
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
        return "container_file";
    }
    get rulePlugins() {
        return [files_1.default];
    }
    get schema() {
        return {
            attrs: {
                src: {},
                alt: {
                    default: null,
                },
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
                    getAttrs: (dom) => {
                        const a = dom.getElementsByTagName("a")[0];
                        return {
                            style: dom.className.includes("tip")
                                ? "tip"
                                : dom.className.includes("warning")
                                    ? "warning"
                                    : undefined,
                            src: "src",
                            alt: "title"
                        };
                    }
                },
            ],
            toDOM: node => {
                const select = document.createElement("select");
                select.addEventListener("change", this.handleStyleChange);
                const a = document.createElement("a");
                a.href = node.attrs.src;
                const fileName = document.createTextNode(node.attrs.alt);
                a.appendChild(fileName);
                this.styleOptions.forEach(([key, label]) => {
                    const option = document.createElement("option");
                    option.value = key;
                    option.innerText = label;
                    option.selected = node.attrs.style === key;
                    select.appendChild(option);
                });
                let component;
                if (node.attrs.style === "tip") {
                    component = React.createElement(outline_icons_1.StarredIcon, { color: "currentColor" });
                }
                else if (node.attrs.style === "warning") {
                    component = React.createElement(outline_icons_1.WarningIcon, { color: "currentColor" });
                }
                else {
                    component = React.createElement(outline_icons_1.InfoIcon, { color: "currentColor" });
                }
                const icon = document.createElement("div");
                icon.className = "icon";
                react_dom_1.default.render(component, icon);
                return [
                    "div",
                    { class: `notice-block ${node.attrs.style}` },
                    icon, a,
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
        state.write("[" +
            state.esc(node.attrs.alt) + "]" + "(" +
            state.esc(node.attrs.src) + ")");
        state.ensureNewLine();
        state.write("@@@");
        state.closeBlock(node);
    }
    parseMarkdown() {
        return {
            block: "container_file",
            getAttrs: token => {
                return {
                    src: token.attrGet("src"),
                    alt: token.attrGet("alt"),
                    style: token.info
                };
            },
        };
    }
    get plugins() {
        return [uploadFilePlaceholder_1.default, uploadPlugin(this.options)];
    }
}
exports.default = File;
//# sourceMappingURL=FileDoc.js.map