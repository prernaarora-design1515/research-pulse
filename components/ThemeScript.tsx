// Runs before paint (sync, inline) so the theme never flashes on load.
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("rp-theme") || "system";
    var resolved = stored === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : stored;
    document.documentElement.setAttribute("data-theme", resolved);
  } catch (e) {}
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
