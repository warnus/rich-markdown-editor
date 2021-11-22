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
const React = __importStar(require("react"));
const prosemirror_state_1 = require("prosemirror-state");
const styled_components_1 = __importDefault(require("styled-components"));
const getDataTransferFiles_1 = __importDefault(require("../lib/getDataTransferFiles"));
const uploadFilePlaceholder_1 = __importDefault(require("../lib/uploadFilePlaceholder"));
const insertAllFiles_1 = __importDefault(require("../commands/insertAllFiles"));
const Node_1 = __importDefault(require("./Node"));
const outline_icons_1 = require("outline-icons");
const react_dom_1 = __importDefault(require("react-dom"));
const toggleWrap_1 = __importDefault(require("../commands/toggleWrap"));
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const file_1 = __importDefault(require("../rules/file"));
const FILE_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;
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
    get name() {
        return "file";
    }
    get rulePlugins() {
        return [file_1.default];
    }
    get styleOptions() {
        return Object.entries({
            info: this.options.dictionary.info,
            warning: this.options.dictionary.warning,
            tip: this.options.dictionary.tip,
        });
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
                    tag: "div.file-block",
                    preserveWhitespace: "full",
                    contentElement: "div:last-child",
                },
            ],
            toDOM: node => {
                const select = document.createElement("select");
                select.addEventListener("change", this.handleStyleChange);
                let component;
                component = React.createElement(outline_icons_1.LinkIcon, { color: "currentColor" });
                const icon = document.createElement("div");
                icon.className = "icon";
                const a = document.createElement("a");
                a.href = node.attrs.src;
                a.target = '_blank';
                const fileName = document.createTextNode(node.attrs.alt);
                a.appendChild(fileName);
                console.log("alt");
                console.log(node.attrs.alt);
                react_dom_1.default.render(component, icon);
                return [
                    "div",
                    { class: `file-block ${node.attrs.style}` },
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
        state.write("\n@@@" + "file" + "\n");
        state.renderContent(node);
        state.ensureNewLine();
        state.write("@@@");
        state.closeBlock(node);
    }
    parseMarkdown() {
        return {
            block: "file",
        };
    }
    get plugins() {
        return [uploadFilePlaceholder_1.default, uploadPlugin(this.options)];
    }
}
exports.default = File;
const Caption = styled_components_1.default.p `
  border: solid;
  display: block;
  font-size: 13px;
  font-style: italic;
  color: ${props => props.theme.textSecondary};
  padding: 2px 0;
  line-height: 16px;
  text-align: center;
  width: 100%;
  min-height: 1em;
  outline: none;
  background: none;
  resize: none;
  &:empty:before {
    color: ${props => props.theme.placeholder};
    content: "Write a caption";
    pointer-events: none;
  }
`;
//# sourceMappingURL=FileDoc.js.map