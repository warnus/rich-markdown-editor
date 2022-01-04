import Node from "./Node";
import noticesRule from "../rules/files";
export default class File extends Node {
    get styleOptions(): [string, any][];
    get name(): string;
    get rulePlugins(): (typeof noticesRule)[];
    get schema(): {
        attrs: {
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
            };
        }[];
        toDOM: (node: any) => (string | HTMLDivElement | {
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
        getAttrs: (tok: any) => {
            style: any;
        };
    };
}
//# sourceMappingURL=FileDoc.d.ts.map