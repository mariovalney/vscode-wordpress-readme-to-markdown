# WP Readme to Markdown

VS Code extension that converts WP plugin `readme.txt` files to `README.md` Markdown format.

Inspired by the [Sublime Text plugin](https://github.com/claudiosanches/wordpress-readme-to-markdown) by Claudio Sanches.

## Features

- **Command**: Right-click any `readme.txt` or use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → **WordPress Readme: Convert to README.md**
- **Convert on save**: Optionally auto-convert whenever `readme.txt` is saved

### Conversions performed

| WordPress readme.txt | Markdown output |
|---|---|
| `=== Plugin Name ===` | `# Plugin Name` |
| `== Section ==` | `## Section` |
| `= Subsection =` | `### Subsection` |
| `Key: value` (header metadata) | `**Key:** value` |
| `Contributors: slug1, slug2` | Links to wordpress.org profiles |
| Screenshot items in `== Screenshots ==` | Image tags pointing to `ps.w.org` assets |

## Usage

1. Open a WordPress plugin `readme.txt` in VS Code
2. Right-click the file in the Explorer or in the editor → **Convert to README.md**  
   _or_ open the Command Palette and run **WP Readme: Convert to README.md**
3. A `README.md` is created in the same directory

## Settings

| Setting | Default | Description |
|---|---|---|
| `wpReadme.convertOnSave` | `false` | Auto-convert `readme.txt` to `README.md` on save |
| `wpReadme.warnOnReadmeMdSave` | `true` | Warn when saving `README.md` in a folder that also contains a `readme.txt` |

## License

MIT
