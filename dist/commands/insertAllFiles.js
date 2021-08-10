"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const createAndInsertLink_1 = __importDefault(require("../commands/createAndInsertLink"));
const insertAllFiles = function (view, event, files, options) {
    if (files.length === 0)
        return;
    const { dictionary, uploadFile, onFileUploadStart, onFileUploadStop, onShowToast, onCreateLink, } = options;
    if (!uploadFile) {
        console.warn("uploadFile callback must be defined to handle file uploads.");
        return;
    }
    event.preventDefault();
    if (onFileUploadStart)
        onFileUploadStart();
    let complete = 0;
    const { state } = view;
    const { from, to } = state.selection;
    for (const file of files) {
        uploadFile(file)
            .then(src => {
            const title = file.name;
            const href = `creating#${src}…`;
            view.dispatch(view.state.tr
                .insertText(title, from, to)
                .addMark(from, to + title.length, state.schema.marks.link.create({ href })));
            createAndInsertLink_1.default(view, src, href, {
                onCreateLink,
                onShowToast,
                dictionary,
            });
        })
            .catch(error => {
            console.error(error);
            if (onShowToast) {
                onShowToast(dictionary.fileUploadError, types_1.ToastType.Error);
            }
        })
            .finally(() => {
            complete++;
            if (complete === files.length) {
                if (onFileUploadStop)
                    onFileUploadStop();
            }
        });
    }
};
exports.default = insertAllFiles;
//# sourceMappingURL=insertAllFiles.js.map