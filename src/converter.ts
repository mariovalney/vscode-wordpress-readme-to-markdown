/**
 * Converts WordPress plugin readme.txt format to Markdown.
 *
 * WordPress readme.txt uses a custom format inspired by BBCode:
 * - === H1 ===, == H2 ==, = H3 =
 * - "Key: value" header metadata
 * - Screenshots section with numbered items
 * - Contributors as comma-separated slugs
 */

interface ConversionOptions {
  pluginSlug?: string;
}

export function convertReadmeToMarkdown(content: string, options: ConversionOptions = {}): string {
  const lines = content.split('\n');
  const result: string[] = [];

  let pluginSlug = options.pluginSlug ?? '';
  let inScreenshots = false;
  let screenshotIndex = 0;
  let headerSectionDone = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Extract plugin slug from the first H1 heading if not provided
    if (!pluginSlug && /^===\s*.+\s*===/.test(line)) {
      const match = line.match(/^===\s*(.+?)\s*===/);
      if (match) {
        pluginSlug = match[1].toLowerCase().replace(/\s+/g, '-');
      }
    }

    // Track whether we've left the header metadata section
    if (!headerSectionDone && line.trim() === '') {
      const nextNonEmpty = lines.slice(i + 1).find(l => l.trim() !== '');
      if (nextNonEmpty && !/^[^:\n#]+=/.test(nextNonEmpty) && !/^[A-Za-z ]+:\s/.test(nextNonEmpty)) {
        headerSectionDone = true;
      }
    }

    // Track when we enter/leave the Screenshots section
    if (/^==\s*Screenshots\s*==/i.test(line)) {
      inScreenshots = true;
      screenshotIndex = 0;
    } else if (/^==\s*.+\s*==/.test(line) && !/^===/.test(line)) {
      inScreenshots = false;
    }

    // Convert headings: === H1 ===, == H2 ==, = H3 =
    // Must match in order from most to least specific to avoid partial matches
    if (/^===\s*.+\s*===$/.test(line.trim())) {
      line = line.replace(/^===\s*(.+?)\s*===$/, '# $1');
    } else if (/^==\s*.+\s*==$/.test(line.trim())) {
      line = line.replace(/^==\s*(.+?)\s*==$/, '## $1');
    } else if (/^=\s*.+\s*=$/.test(line.trim())) {
      line = line.replace(/^=\s*(.+?)\s*=$/, '### $1');
    }

    // Convert header metadata "Key: value" lines to bold format
    // Only in the header section (before first blank-then-content gap)
    else if (!headerSectionDone && /^[A-Za-z][A-Za-z ]+:\s/.test(line)) {
      // Special case: Contributors — link each one to wordpress.org profiles
      if (/^Contributors:\s/i.test(line)) {
        const contributors = line.replace(/^Contributors:\s*/i, '');
        const linked = contributors
          .split(',')
          .map(c => c.trim())
          .filter(Boolean)
          .map(c => `[${c}](https://profiles.wordpress.org/${c}/)`)
          .join(', ');
        line = `**Contributors:** ${linked}  `;
      }
      // Special case: Donate link
      else if (/^Donate link:\s/i.test(line)) {
        const url = line.replace(/^Donate link:\s*/i, '').trim();
        line = `**Donate link:** ${url}  `;
      }
      // All other metadata keys
      else {
        line = line.replace(/^([A-Za-z][A-Za-z ]+):\s(.+)$/, '**$1:** $2  ');
      }
    }

    // Convert Screenshots section items: "1. Description" → image + caption
    else if (inScreenshots && /^\d+\.\s/.test(line)) {
      screenshotIndex++;
      const description = line.replace(/^\d+\.\s*/, '').trim();
      if (pluginSlug) {
        line = `![${description}](https://ps.w.org/${pluginSlug}/assets/screenshot-${screenshotIndex}.png)\n*${description}*`;
      } else {
        line = `![${description}](screenshot-${screenshotIndex}.png)\n*${description}*`;
      }
    }

    result.push(line);
  }

  return result.join('\n');
}
