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
const styled_components_1 = __importDefault(require("styled-components"));
const react_dom_1 = __importDefault(require("react-dom"));
const Node_1 = __importDefault(require("./Node"));
const files_1 = __importDefault(require("../rules/files"));
const uploadFilePlaceholder_1 = __importDefault(require("../lib/uploadFilePlaceholder"));
const getDataTransferFiles_1 = __importDefault(require("../lib/getDataTransferFiles"));
const insertAllFiles_1 = __importDefault(require("../commands/insertAllFiles"));
const FILE_INPUT_REGEX = /@@@\[(?<alt>[^]*?)\]\((?<filename>[^]*?)\)@@@/;
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
        this.handleTrash = () => event => {
            console.log("Trash Click!!");
        };
        this.handleStyleChange = event => {
            const { view } = this.editor;
            const { tr } = view.state;
            const element = event.target;
            const { top, left } = element.getBoundingClientRect();
            const result = view.posAtCoords({ top, left });
            if (result) {
                const transaction = tr.setNodeMarkup(result.inside, undefined, {
                    style: element.value,
                    src: "testa",
                    alt: "testb",
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
                    default: "",
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
                    getAttrs: (dom) => ({
                        style: dom.className.includes("tip")
                            ? "tip"
                            : dom.className.includes("warning")
                                ? "warning"
                                : undefined,
                        alt: dom.className.includes("a")
                    }),
                },
            ],
            toDOM: node => {
                const a = document.createElement("a");
                a.href = node.attrs.src;
                const fileName = document.createTextNode(node.attrs.alt);
                a.appendChild(fileName);
                let component;
                component = React.createElement(outline_icons_1.LinkIcon, { color: "currentColor" });
                const icon = document.createElement("div");
                icon.className = "icon";
                react_dom_1.default.render(component, icon);
                let button_component;
                button_component = React.createElement(Button, null,
                    React.createElement(outline_icons_1.TrashIcon, { onClick: this.handleTrash() }));
                const trash = document.createElement("div");
                trash.className = "trash";
                react_dom_1.default.render(button_component, trash);
                return [
                    "div",
                    { class: `notice-block ${node.attrs.style}` },
                    icon, a,
                    ["div", { contentEditable: true }, trash],
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
        state.write("\n@@@");
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
                console.log(token);
                const file_regex = /\[(?<alt>[^]*?)\]\((?<filename>[^]*?)\)/g;
                const result = file_regex.exec(token.info);
                return {
                    src: result ? result[2] : null,
                    alt: result ? result[1] : null,
                    style: "info"
                };
            },
        };
    }
    get plugins() {
        return [uploadFilePlaceholder_1.default, uploadPlugin(this.options)];
    }
}
exports.default = File;
const Button = styled_components_1.default.button `
  position: absolute;
  top: 8px;
  right: 8px;
  border: 0;
  margin: 0;
  padding: 0;
  border-radius: 4px;
  // background: ${props => props.theme.background};
  // color: ${props => props.theme.textSecondary};
  background: red;
  color: red;
  width: 24px;
  height: 24px;
  display: inline-block;
  cursor: pointer;
  opacity: 0;
  // transition: opacity 100ms ease-in-out;

  // &:active {
  //   transform: scale(0.98);
  // }

  &:hover {
    color: ${props => props.theme.text};
    opacity: 1;
  }
`;
//# sourceMappingURL=FileDoc.js.map