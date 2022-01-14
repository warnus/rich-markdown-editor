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
Object.defineProperty(exports, "__esModule", { value: true });
const uploadFilePlaceholder_1 = __importStar(require("../lib/uploadFilePlaceholder"));
const types_1 = require("../types");
const insertAllFiles = function (view, event, pos, files, options) {
    if (files.length === 0)
        return;
    const { dictionary, uploadFile, onFileUploadStart, onFileUploadStop, onShowToast, } = options;
    if (!uploadFile) {
        console.warn("uploadFile callback must be defined to handle file uploads.");
        return;
    }
    event.preventDefault();
    if (onFileUploadStart)
        onFileUploadStart();
    const { schema } = view.state;
    let complete = 0;
    for (const file of files) {
        const id = {};
        const { tr } = view.state;
        tr.setMeta(uploadFilePlaceholder_1.default, {
            add: { id, file, pos },
        });
        view.dispatch(tr);
        uploadFile(file)
            .then(src => {
            const pos = uploadFilePlaceholder_1.findPlaceholder(view.state, id);
            if (pos === null)
                return;
            const transaction = view.state.tr
                .replaceWith(pos, pos, schema.nodes.container_file.create({ src, alt: file.name }))
                .setMeta(uploadFilePlaceholder_1.default, { remove: { id } });
            view.dispatch(transaction);
        })
            .catch(error => {
            console.error(error);
            const transaction = view.state.tr.setMeta(uploadFilePlaceholder_1.default, {
                remove: { id },
            });
            view.dispatch(transaction);
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