import customFence from "markdown-it-container";

export default function file(md): void {
  console.log(md)
  return customFence(md, "file", {
    marker: "@",
    validate: () => true,
    render: function(tokens, idx) {
      const { info } = tokens[idx];
      
      if (tokens[idx].nesting === 1) {
        // opening tag
        return `<div class="notice notice-${md.utils.escapeHtml(info)}">\n${tokens}`;
      } else {
        // closing tag
        return "</div>\n";
      }
    },
  });
}
