import { Node } from '@tiptap/core';

export const EmailVariableNode = Node.create({
  name: 'emailVariable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      name: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-email-variable]',
        getAttrs: (element) => {
          const dataName = element.getAttribute('data-email-variable')?.trim();
          const textName = element.textContent?.match(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/)?.[1];

          return { name: dataName || textName || '' };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const name = String(node.attrs.name ?? '');

    return [
      'span',
      {
        'data-email-variable': name,
        class: 'email-variable-token',
      },
      `{{${name}}}`,
    ];
  },
});

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const variableSpanPattern = /<span\b([^>]*data-email-variable[^>]*)>[\s\S]*?<\/span>/gi;
const emptyVariableSpanPattern = /<span\b[^>]*data-email-variable\s*=\s*["']\s*["'][^>]*>\s*{{\s*}}\s*<\/span>/gi;
const legacyVariableAttributePattern =
  /(\b(?:href|src)\s*=\s*["'])&lt;span\b[^>]*data-email-variable\s*=\s*["'][^>]*(?:>|&gt;)\s*{{\s*([a-zA-Z0-9_.-]+)\s*}}\s*(?=["'])/gi;
const legacyTokenAnchorEndPattern =
  /(<a\b[^>]*\bclass\s*=\s*["'][^"']*\bemail-variable-token\b[^"']*["'][^>]*?)\s*&gt;([\s\S]*?)<\/a>/gi;
const legacyTokenAnchorClassPattern = /(<a\b[^>]*?)\sclass\s*=\s*(["'])([^"']*\bemail-variable-token\b[^"']*)\2/gi;

export const normalizeLegacyEmailVariableMarkup = (html: string) => {
  let normalized = html.replace(legacyVariableAttributePattern, '$1{{$2}}');

  normalized = normalized.replace(legacyTokenAnchorEndPattern, '$1>$2</a>');
  normalized = normalized.replace(legacyTokenAnchorClassPattern, (_match, prefix: string, quote: string, classValue: string) => {
    const classes = classValue.split(/\s+/).filter((className) => className && className !== 'email-variable-token');

    return classes.length ? `${prefix} class=${quote}${classes.join(' ')}${quote}` : prefix;
  });
  normalized = normalized.replace(emptyVariableSpanPattern, '');

  return normalized;
};

export const decorateEmailVariables = (html: string, variables: string[]) => {
  if (!html || variables.length === 0) return html;

  const normalizedHtml = normalizeLegacyEmailVariableMarkup(html);
  const names = variables.map(escapeRegExp).join('|');
  if (!names) return html;

  const tokenPattern = new RegExp(`{{\\s*(${names})\\s*}}`, 'g');
  const preservedSpans: string[] = [];
  const protectedHtml = normalizedHtml.replace(variableSpanPattern, (match) => {
    const index = preservedSpans.push(match) - 1;
    return `\uE000${index}\uE001`;
  });

  const decorateText = (text: string) =>
    text.replace(tokenPattern, (_match, name: string) => `<span data-email-variable="${name}" class="email-variable-token">{{${name}}}</span>`);

  let output = '';
  let textStart = 0;
  let inTag = false;
  let quote: '"' | "'" | null = null;

  for (let index = 0; index < protectedHtml.length; index += 1) {
    const character = protectedHtml[index];

    if (!inTag && character === '<') {
      output += decorateText(protectedHtml.slice(textStart, index));
      output += character;
      inTag = true;
      quote = null;
      continue;
    }

    if (!inTag) continue;

    output += character;
    if (quote) {
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '>') {
      inTag = false;
      textStart = index + 1;
    }
  }

  output += inTag ? protectedHtml.slice(textStart) : decorateText(protectedHtml.slice(textStart));

  return output.replace(/\uE000(\d+)\uE001/g, (_match, index: string) => preservedSpans[Number(index)] ?? '');
};

export const serializeEmailVariables = (html: string) =>
  normalizeLegacyEmailVariableMarkup(
    html.replace(variableSpanPattern, (match, attributes: string) => {
      const attributeName = attributes.match(/data-email-variable\s*=\s*["']([^"']+)["']/i)?.[1]?.trim();
      const textName = match.match(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/)?.[1];
      const name = attributeName || textName;

      return name ? `{{${name}}}` : match;
    }),
  );
