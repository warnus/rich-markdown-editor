import customFence from "markdown-it-container";

export default function file(md): void {
  console.log(md)
  console.log("in rule")
  
  return customFence(md, "file", {
    marker: "@",
    validate: () => true,
    render: function(tokens, idx) {
      const { info } = tokens[idx];
      console.log("customFence")
      console.log(tokens)
      if (tokens[idx].nesting === 1) {
        // opening tag
        return `<div class="notice notice-${md.utils.escapeHtml(info)}">\n`;
      } else {
        // closing tag
        return "</div>\n";
      }
    },
  });
}
