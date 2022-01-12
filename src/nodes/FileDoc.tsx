import { wrappingInputRule } from "prosemirror-inputrules";
import { Plugin } from "prosemirror-state";
import toggleWrap from "../commands/toggleWrap";
import { WarningIcon, InfoIcon, StarredIcon, LinkIcon, TrashIcon } from "outline-icons";
import * as React from "react";
import styled from "styled-components";
import ReactDOM from "react-dom";
import Node from "./Node";
import filesRule from "../rules/files";
import { InputRule } from "prosemirror-inputrules";
import uploadFilePlaceholderPlugin from "../lib/uploadFilePlaceholder";
import getDataTransferFiles from "../lib/getDataTransferFiles";
import insertAllFiles from "../commands/insertAllFiles";

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
        // style: {
        //   default: "info",
        // },
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
            // style: dom.className.includes("tip")
            //   ? "tip"
            //   : dom.className.includes("warning")
            //   ? "warning"
            //   : undefined,
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

        component = <LinkIcon color="currentColor" />;

        const icon = document.createElement("div");
        icon.className = "icon";
        ReactDOM.render(component, icon);

        let button_component;

        button_component = <Button><TrashIcon onClick={this.handleTrash()}/></Button>;

        const trash = document.createElement("div");

        trash.className = "trash";
        ReactDOM.render(button_component, trash);

        return [
          "div",
          // { class: `file-block ${node.attrs.style}` },
          { class: `file-block` },
          icon, a,
          ["div", { contentEditable: true }, trash],
          ["div", { class: "content" }, 0],
        ];
      },
    };
  }

  commands({ type }) {
    return attrs => toggleWrap(type, attrs);
  }

  handleTrash = () => event => {
    console.log("Trash Click!!")
  }

  inputRules({ type }) {
    return [wrappingInputRule(/^@@@$/, type)];
  }

  toMarkdown(state, node) {
    state.write("\n@@@");
    state.write("[" +  
      state.esc(node.attrs.alt) + "]" + "(" +
      state.esc(node.attrs.src) + ")"
    )
    state.ensureNewLine();
    state.write("@@@");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "container_file",
      getAttrs: token => {
        console.log(token)
        const file_regex =  /\[(?<alt>[^]*?)\]\((?<filename>[^]*?)\)/g;
        const result = file_regex.exec(token.info);
        return {
          src: result? result[2] : null,
          alt: result? result[1] : null,
          // style: "info"
        };
      },
    };
  }

  get plugins() {
    return [uploadFilePlaceholderPlugin, uploadPlugin(this.options)];
  }
}

const Button = styled.button`
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