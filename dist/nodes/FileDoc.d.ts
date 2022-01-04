import { Plugin } from "prosemirror-state";
import Node from "./Node";
import filesRule from "../rules/files";
export default class File extends Node {
    get styleOptions(): [string, any][];
    get name(): string;
    get rulePlugins(): (typeof filesRule)[];
    get schema(): {
        attrs: {
            src: {};
            alt: {
                default: string;
            };
            style: {
                default: string;
            };
        };
        content: string;
        group: string;
        defining: boolean;
        draggable: boolean;
        parseDOM: {
            tag: string;
            preserveWhitespace: string;
            contentElement: string;
            getAttrs: (dom: HTMLDivElement) => {
                style: string | undefined;
                alt: boolean;
            };
        }[];
        toDOM: (node: any) => (string | HTMLAnchorElement | HTMLDivElement | {
            class: string;
        } | (string | HTMLSelectElement | {
            contentEditable: boolean;
        })[] | (string | number | {
            class: string;
        })[])[];
    };
    commands({ type }: {
        type: any;
    }): (attrs: any) => (state: any, dispatch: any) => boolean;
    handleStyleChange: (event: any) => void;
    inputRules({ type }: {
        type: any;
    }): any[];
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        block: string;
        getAttrs: (token: any) => {
            src: any;
            alt: any;
            style: any;
        };
    };
    get plugins(): Plugin<any, any>[];
}
//# sourceMappingURL=FileDoc.d.ts.map