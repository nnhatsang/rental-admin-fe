import { Extension, Mark } from '@tiptap/core';

export const EmailUnderline = Mark.create({
  name: 'emailUnderline',

  parseHTML() {
    return [{ tag: 'u' }];
  },

  renderHTML() {
    return ['u', 0];
  },
});

export const EmailTextColor = Mark.create({
  name: 'emailTextColor',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.color || element.getAttribute('color') || null,
        renderHTML: (attributes: { color?: string | null }) =>
          attributes.color ? { style: `color: ${attributes.color}` } : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (node: HTMLElement) => (node.style.color ? { color: node.style.color } : false),
      },
      {
        tag: 'font',
        getAttrs: (node: HTMLElement) => {
          const color = node.getAttribute('color');

          return color ? { color } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },
});

export const EmailTextAlign = Extension.create({
  name: 'emailTextAlign',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          textAlign: {
            default: 'left',
            parseHTML: (element: HTMLElement) => element.style.textAlign || element.getAttribute('align') || 'left',
            renderHTML: (attributes: { textAlign?: string }) => {
              const textAlign = attributes.textAlign ?? 'left';
              const allowedAlignments = ['left', 'center', 'right', 'justify'];

              return allowedAlignments.includes(textAlign) && textAlign !== 'left' ? { style: `text-align: ${textAlign}` } : {};
            },
          },
        },
      },
    ];
  },
});
