'use client';

import { Link } from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconClearFormatting,
  IconCode,
  IconH1,
  IconH2,
  IconItalic,
  IconLink,
  IconLinkOff,
  IconList,
  IconListNumbers,
  IconMinus,
  IconPalette,
  IconPilcrow,
  IconStrikethrough,
  IconUnderline,
} from '@tabler/icons-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { EmailTextAlign, EmailTextColor, EmailUnderline } from './mail-editor-extensions';
import { decorateEmailVariables, EmailVariableNode, serializeEmailVariables } from './mail-variable-node';

type MailBodyEditorProps = {
  value: string;
  variables: string[];
  disabled?: boolean;
  id?: string;
  labelId?: string;
  onChange: (value: string) => void;
};

type EditorMode = 'visual' | 'html';
type BlockStyle = 'p' | 'h1' | 'h2' | 'h3';
type TextAlignment = 'left' | 'center' | 'right' | 'justify';

const buttonClassName = 'size-8';

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({ label, active, disabled = false, onClick, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon"
      className={buttonClassName}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" role="separator" aria-orientation="vertical" />;
}

const isAdvancedEmailHtml = (value: string) =>
  /<(?:!doctype|html|head|body|table|style|tr|td|th)\b/i.test(value) ||
  /(?:cellpadding|cellspacing|colspan|rowspan)\s*=\s*/i.test(value) ||
  /<pre\s*>\s*<code>/i.test(value);

export function MailBodyEditor({
  value,
  variables,
  disabled = false,
  id = 'mail-body-editor',
  labelId,
  onChange,
}: MailBodyEditorProps) {
  const advancedHtml = isAdvancedEmailHtml(value);
  const [mode, setMode] = useState<EditorMode>(() => (advancedHtml ? 'html' : 'visual'));
  const lastSyncedValueRef = useRef(value);
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({ link: false, codeBlock: false }),
      Link.configure({ openOnClick: false }),
      EmailUnderline,
      EmailTextColor,
      EmailTextAlign,
      EmailVariableNode,
    ],
    content: decorateEmailVariables(value, variables),
    editorProps: {
      attributes: {
        class: cn(
          'min-h-64 max-h-[min(50dvh,420px)] w-full max-w-none overflow-y-auto overscroll-contain px-4 py-3 text-sm leading-6 outline-none',
          '[&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6',
          '[&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold',
          '[&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5',
          '[&_hr]:my-4 [&_hr]:border-border',
        ),
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        ...(labelId ? { 'aria-labelledby': labelId } : { 'aria-label': 'Nội dung email' }),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const nextValue = serializeEmailVariables(currentEditor.getHTML());
      lastSyncedValueRef.current = nextValue;
      onChange(nextValue);
    },
  });

  useEffect(() => {
    if (!editor || mode === 'html' || value === lastSyncedValueRef.current) return;

    const nextContent = decorateEmailVariables(value, variables);
    if (nextContent !== editor.getHTML()) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
    lastSyncedValueRef.current = value;
  }, [editor, mode, value, variables]);

  useEffect(() => {
    if (advancedHtml && mode === 'visual') {
      setMode('html');
    }
  }, [advancedHtml, mode]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  const blockStyle: BlockStyle = editor?.isActive('heading', { level: 1 })
    ? 'h1'
    : editor?.isActive('heading', { level: 2 })
      ? 'h2'
      : editor?.isActive('heading', { level: 3 })
        ? 'h3'
        : 'p';
  const textAlignment: TextAlignment = editor?.isActive('paragraph', { textAlign: 'center' }) || editor?.isActive('heading', { textAlign: 'center' })
    ? 'center'
    : editor?.isActive('paragraph', { textAlign: 'right' }) || editor?.isActive('heading', { textAlign: 'right' })
      ? 'right'
      : editor?.isActive('paragraph', { textAlign: 'justify' }) || editor?.isActive('heading', { textAlign: 'justify' })
        ? 'justify'
        : 'left';
  const textColor = editor?.getAttributes('emailTextColor').color ?? '#111827';

  const setBlockStyle = (value: string) => {
    if (!editor) return;

    const chain = editor.chain().focus();
    if (value === 'h1') chain.setNode('heading', { level: 1 }).run();
    else if (value === 'h2') chain.setNode('heading', { level: 2 }).run();
    else if (value === 'h3') chain.setNode('heading', { level: 3 }).run();
    else chain.setParagraph().run();
  };

  const setTextAlignment = (alignment: TextAlignment) => {
    if (!editor) return;

    const blockType = editor.isActive('heading') ? 'heading' : 'paragraph';
    editor.chain().focus().updateAttributes(blockType, { textAlign: alignment }).run();
  };

  const setTextColor = (color: string) => {
    editor?.chain().focus().setMark('emailTextColor', { color }).run();
  };

  const insertVariable = (name: string) => {
    if (disabled) return;

    if (mode === 'html') {
      const textarea = sourceTextareaRef.current;
      const start = textarea?.selectionStart ?? value.length;
      const end = textarea?.selectionEnd ?? start;
      const token = `{{${name}}}`;
      const nextValue = `${value.slice(0, start)}${token}${value.slice(end)}`;

      onChange(nextValue);

      requestAnimationFrame(() => {
        textarea?.focus();
        const cursorPosition = start + token.length;
        textarea?.setSelectionRange(cursorPosition, cursorPosition);
      });
      return;
    }

    editor?.chain().focus().insertContent({ type: 'emailVariable', attrs: { name } }).run();
  };

  return (
    <div className={cn('overflow-hidden rounded-md border bg-background', disabled && 'bg-muted/20')}>
      <Tabs value={mode} onValueChange={(nextMode) => setMode(nextMode as EditorMode)} className="gap-0">
        <div className="flex flex-col border-b bg-muted/20">
          <div className="flex flex-wrap items-center gap-1 p-2" role="group" aria-label="Chế độ và công cụ soạn thảo">
          <TabsList className="mr-1 shrink-0">
            <TabsTrigger
              value="visual"
              disabled={advancedHtml}
              title={advancedHtml ? 'HTML nâng cao chỉ nên chỉnh sửa ở chế độ HTML source' : undefined}
            >
              <IconPilcrow data-icon="inline-start" />
              Soạn thảo
            </TabsTrigger>
            <TabsTrigger value="html">
              <IconCode data-icon="inline-start" />
              HTML source
            </TabsTrigger>
          </TabsList>

          {mode === 'visual' ? (
            <div className="flex w-full flex-wrap items-center gap-1" role="toolbar" aria-label="Công cụ định dạng nội dung email">
              <ToolbarButton
                label="Hoàn tác"
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().undo().run()}
              >
                <IconArrowBackUp aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Làm lại"
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().redo().run()}
              >
                <IconArrowForwardUp aria-hidden="true" />
              </ToolbarButton>

              <ToolbarDivider />

              <Select value={blockStyle} onValueChange={setBlockStyle} disabled={disabled || !editor}>
                <SelectTrigger size="sm" className="h-8 w-[116px] text-xs" aria-label="Kiểu đoạn">
                  <SelectValue placeholder="Kiểu đoạn" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="p">
                    <IconPilcrow data-icon="inline-start" /> Đoạn văn
                  </SelectItem>
                  <SelectItem value="h1">
                    <IconH1 data-icon="inline-start" /> Tiêu đề 1
                  </SelectItem>
                  <SelectItem value="h2">
                    <IconH2 data-icon="inline-start" /> Tiêu đề 2
                  </SelectItem>
                  <SelectItem value="h3">Tiêu đề 3</SelectItem>
                </SelectContent>
              </Select>

              <ToolbarDivider />

              <ToolbarButton
                label="In đậm"
                active={Boolean(editor?.isActive('bold'))}
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <IconBold aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="In nghiêng"
                active={Boolean(editor?.isActive('italic'))}
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <IconItalic aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Gạch chân"
                active={Boolean(editor?.isActive('emailUnderline'))}
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().toggleMark('emailUnderline').run()}
              >
                <IconUnderline aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Gạch ngang"
                active={Boolean(editor?.isActive('strike'))}
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
              >
                <IconStrikethrough aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Mã nội dòng"
                active={Boolean(editor?.isActive('code'))}
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().toggleCode().run()}
              >
                <IconCode aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Xóa định dạng"
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
              >
                <IconClearFormatting aria-hidden="true" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                label="Danh sách dấu đầu dòng"
                active={Boolean(editor?.isActive('bulletList'))}
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <IconList aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Danh sách đánh số"
                active={Boolean(editor?.isActive('orderedList'))}
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              >
                <IconListNumbers aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Trích dẫn"
                active={Boolean(editor?.isActive('blockquote'))}
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              >
                <IconBlockquote aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Đường phân cách"
                disabled={disabled || !editor}
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              >
                <IconMinus aria-hidden="true" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                label="Căn trái"
                active={textAlignment === 'left'}
                disabled={disabled || !editor}
                onClick={() => setTextAlignment('left')}
              >
                <IconAlignLeft aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Căn giữa"
                active={textAlignment === 'center'}
                disabled={disabled || !editor}
                onClick={() => setTextAlignment('center')}
              >
                <IconAlignCenter aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Căn phải"
                active={textAlignment === 'right'}
                disabled={disabled || !editor}
                onClick={() => setTextAlignment('right')}
              >
                <IconAlignRight aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                label="Căn đều"
                active={textAlignment === 'justify'}
                disabled={disabled || !editor}
                onClick={() => setTextAlignment('justify')}
              >
                <IconAlignJustified aria-hidden="true" />
              </ToolbarButton>

              <label
                className={cn(
          'relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                  (disabled || !editor) && 'pointer-events-none opacity-50',
                )}
                title="Màu chữ"
              >
                <IconPalette aria-hidden="true" />
                <span className="absolute bottom-1 h-0.5 w-4 rounded-full" style={{ backgroundColor: textColor }} aria-hidden="true" />
                <input
                  type="color"
                  value={textColor}
                  disabled={disabled || !editor}
                  onChange={(event) => setTextColor(event.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                  aria-label="Màu chữ"
                />
              </label>

              <ToolbarButton
                label={editor?.isActive('link') ? 'Xóa liên kết' : 'Thêm liên kết'}
                active={Boolean(editor?.isActive('link'))}
                disabled={disabled || !editor}
                onClick={() => {
                  if (!editor) return;
                  if (editor.isActive('link')) {
                    editor.chain().focus().unsetLink().run();
                    return;
                  }

                  const currentHref = editor.getAttributes('link').href ?? '';
                  const href = window.prompt('Nhập URL liên kết', currentHref);
                  if (href === null) return;
                  if (href.trim()) editor.chain().focus().setLink({ href: href.trim() }).run();
                }}
              >
                {editor?.isActive('link') ? <IconLinkOff aria-hidden="true" /> : <IconLink aria-hidden="true" />}
              </ToolbarButton>
            </div>
          ) : null}

          </div>

          {advancedHtml ? (
            <p className="px-3 pb-2 text-xs text-muted-foreground">
              Nội dung này có cấu trúc email nâng cao (table/style), nên chỉ chỉnh sửa ở HTML source để giữ nguyên markup.
            </p>
          ) : null}

          {variables.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1 border-t px-2 py-2" aria-label="Biến có thể chèn">
              <span className="px-1 text-xs font-medium text-muted-foreground">Chèn biến:</span>
              {variables.map((variable) => (
                <Button
                  key={variable}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full px-2 text-xs"
                  disabled={disabled}
                  onClick={() => insertVariable(variable)}
                >
                  {'{{'}{variable}{'}}'}
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        <TabsContent value="visual" className="mt-0">
          <EditorContent editor={editor} />
        </TabsContent>
        <TabsContent value="html" className="mt-0">
          <Textarea
            ref={sourceTextareaRef}
            id={`${id}-source`}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-64 max-h-[min(50dvh,420px)] resize-none rounded-none border-0 font-mono text-xs leading-5 shadow-none focus-visible:ring-0"
            spellCheck={false}
            aria-labelledby={labelId}
            aria-label="HTML source nội dung email"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
