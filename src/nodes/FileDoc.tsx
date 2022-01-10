import { wrappingInputRule } from "prosemirror-inputrules";
import { Plugin } from "prosemirror-state";
import toggleWrap from "../commands/toggleWrap";
import { WarningIcon, InfoIcon, StarredIcon, LinkIcon } from "outline-icons";
import * as React from "react";
import ReactDOM from "react-dom";
import Node from "./Node";
import filesRule from "../rules/files";
import { InputRule } from "prosemirror-inputrules";
import uploadFilePlaceholderPlugin from "../lib/uploadFilePlaceholder";
import getDataTransferFiles from "../lib/getDataTransferFiles";
import insertAllFiles from "../commands/insertAllFiles";

/**
 * Matches following attributes in Markdown-typed image: [, title, src]
 *
 * Example:
 * @Lorem@(file.doc) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "class") -> [, "", "image.jpg", "small"]
 * ![Lorem](image.jpg "class") -> [, "Lorem", "image.jpg", "small"]
 */
const FILE_INPUT_REGEX = /@@@\[(?<alt>[^]*?)\]\((?<filename>[^]*?)\)@@@/;
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
    return [filesRule];
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
          getAttrs: (dom: HTMLDivElement) => ({
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

        component = <LinkIcon color="currentColor" />;

        const icon = document.createElement("div");
        icon.className = "icon";
        ReactDOM.render(component, icon);

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
        src: "testa",
        alt: "testb",
      });
      view.dispatch(transaction);
    }
  };

  inputRules({ type }) {
    return [wrappingInputRule(/^@@@$/, type)];
  }

  toMarkdown(state, node) {
    state.write("\n@@@");
    // state.renderContent(node);
    state.write("[" +  
      state.esc(node.attrs.alt) + "]" + "(" +
      state.esc(node.attrs.src) + ")"
    )
    state.write("@@@");
    state.ensureNewLine();
    // state.write("test")
    // state.ensureNewLine();

    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "container_file",
      // getAttrs: tok => ({ style: tok.info }),
      getAttrs: token => {
        console.log(token)
        const file_regex =  /\[(?<alt>[^]*?)\]\((?<filename>[^]*?)\)@@@/g;
        const result = file_regex.exec(token.info);
        return {
          src: result? result[2] : null,
          alt: result? result[1] : null,
          // src: "test_src",
          // alt: "test_alt",
          style: "info"
        };
      },
    };
  }

  get plugins() {
    return [uploadFilePlaceholderPlugin, uploadPlugin(this.options)];
  }
}
