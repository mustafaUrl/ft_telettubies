export default function escapeHtml(str) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '/': '&#x2F;'
    };
    return str.replace(/[&<>"'/]/g, char => map[char]);
  }