import { Plugin } from "prosemirror-state";
import Node from "./Node";
import fileRule from "../rules/file";
export default class File extends Node {
    get name(): string;
    get rulePlugins(): (typeof fileRule)[];
    get styleOptions(): [string, any][];
    get schema(): {
        attrs: {
            src: {};
            alt: {
                default: null;
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
    }): import("prosemirror-inputrules").InputRule<any>[];
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        block: string;
    };
    get plugins(): Plugin<any, any>[];
}
//# sourceMappingURL=FileDoc.d.ts.map