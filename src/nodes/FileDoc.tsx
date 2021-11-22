import * as React from "react";
import { Plugin } from "prosemirror-state";
// import { InputRule } from "prosemirror-inputrules";
// import { setTextSelection } from "prosemirror-utils";
import styled from "styled-components";
import getDataTransferFiles from "../lib/getDataTransferFiles";
import uploadFilePlaceholderPlugin from "../lib/uploadFilePlaceholder";
import insertAllFiles from "../commands/insertAllFiles";
import Node from "./Node";
import { WarningIcon, InfoIcon, StarredIcon, LinkIcon } from "outline-icons";
import ReactDOM from "react-dom";
import toggleWrap from "../commands/toggleWrap";
import { wrappingInputRule } from "prosemirror-inputrules";
import fileRule from "../rules/file";
/**
 * Matches following attributes in Markdown-typed file: [, alt, src, title]
 *
 * Example:
 * ![Lorem](file.pdf) -> [, "Lorem", "file.pdf"]
 * ![](file.pdf "Ipsum") -> [, "", "file.pdf", "Ipsum"]
 * ![Lorem](file.pdf "Ipsum") -> [, "Lorem", "file.pdf", "Ipsum"]
 */
const FILE_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

const uploadPlugin = options =>
  new Plugin({
    props: {
      handleDOMEvents: {
        paste(view, event: ClipboardEvent): boolean {
          if (
            (view.props.editable && !view.props.editable(view.state)) ||
            !options.uploadFile
          ) {
            return false;
          }

          if (!event.clipboardData) return false;

          // check if we actually pasted any files
          const files = Array.prototype.slice
            .call(event.clipboardData.items)
            .map(dt => dt.getAsFile())
            .filter(file => file);

          if (files.length === 0) return false;

          const { tr } = view.state;
          if (!tr.selection.empty) {
            tr.deleteSelection();
          }
          const pos = tr.selection.from;

          insertAllFiles(view, event, pos, files, options);
          return true;
        },
        drop(view, event: DragEvent): boolean {
          if (
            (view.props.editable && !view.props.editable(view.state)) ||
            !options.uploadImage
          ) {
            return false;
          }

          const files = getDataTransferFiles(event);
          if (files.length === 0) {
            return false;
          }

          // grab the position in the document for the cursor
          const result = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (result) {
            insertAllFiles(view, event, result.pos, files, options);
            return true;
          }

          return false;
        },
      },
    },
  });

export default class File extends Node {
  get name() {
    console.log("file node test")
    return "container_file";
  }

  get rulePlugins() {
    return [fileRule];
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
          getAttrs: (dom: HTMLDivElement) => ({
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

        // this.styleOptions.forEach(([key, label]) => {
        //   const option = document.createElement("option");
        //   option.value = key;
        //   option.innerText = label;
        //   option.innerText = node.attrs.alt;
        //   option.selected = node.attrs.style === key;
        //   select.appendChild(option);
        // });

        let component;

        // if (node.attrs.style === "tip") {
        //   component = <StarredIcon color="currentColor" />;
        // } else if (node.attrs.style === "warning") {
        //   component = <WarningIcon color="currentColor" />;
        // } else {
        //   component = <InfoIcon color="currentColor" />;
        // }
        component = <LinkIcon color="currentColor" />;

        const icon = document.createElement("div");
        icon.className = "icon";
        const a = document.createElement("a");
        // a.href = URL.createObjectURL(node.attrs.src);
        a.href = node.attrs.src;
        a.target = '_blank';
        const fileName = document.createTextNode(node.attrs.alt);
        a.appendChild(fileName);
        
        console.log("alt")
        console.log(node.attrs.alt)
        ReactDOM.render(component, icon);

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
    return attrs => toggleWrap(type, attrs);
  }

  handleStyleChange = event => {
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

  inputRules({ type }) {
    return [wrappingInputRule(/^!!!$/, type)];
  }

  toMarkdown(state, node) {
    // state.write("\n:::" + (node.attrs.style || "info") + "\n");
    state.write("\n@@@" + (node.attrs.style || "info")+ "\n");
    state.renderContent(node);
    console.log(node);
    state.ensureNewLine();
    state.write("@@@");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "container_file",
      getAttrs: tok => ({ style: tok.info }),
    };
  }

  get plugins() {
    return [uploadFilePlaceholderPlugin, uploadPlugin(this.options)];
  }
}

const Caption = styled.p`
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