/// <reference types="react" />
import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import Node from "./Node";
export default class File extends Node {
    get name(): string;
    get schema(): {
        inline: boolean;
        attrs: {
            src: {};
            alt: {
                default: null;
            };
        };
        content: string;
        marks: string;
        group: string;
        draggable: boolean;
        parseDOM: {
            tag: string;
            getAttrs: (dom: HTMLElement) => {
                src: string | null;
            };
        }[];
        toDOM: (node: any) => (string | any[] | {
            class: string;
        })[];
    };
    handleKeyDown: ({ node, getPos }: {
        node: any;
        getPos: any;
    }) => (event: any) => void;
    handleBlur: ({ node, getPos }: {
        node: any;
        getPos: any;
    }) => (event: any) => void;
    component: (props: any) => JSX.Element;
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        node: string;
        getAttrs: (token: any) => {
            src: any;
            alt: any;
        };
    };
    commands({ type }: {
        type: any;
    }): (attrs: any) => (state: any, dispatch: any) => boolean;
    inputRules({ type }: {
        type: any;
    }): InputRule<any>[];
    get plugins(): Plugin<any, any>[];
}
//# sourceMappingURL=FileDoc.d.ts.map