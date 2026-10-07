'use client';

import { IconCode, IconExternalLink, IconEye } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { IRenderedMailTemplateOut } from '../type';

type MailTemplatePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rendered: IRenderedMailTemplateOut | null;
};

export function MailTemplatePreviewDialog({ open, onOpenChange, rendered }: MailTemplatePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(90dvh,900px)] max-h-[90dvh] w-[min(100%-2rem,960px)] flex-col gap-4 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEye aria-hidden="true" />
            Preview email
          </DialogTitle>
          <DialogDescription>Đây là giao diện HTML cuối cùng với payload mẫu; layout được backend ghép vào trước khi trả về.</DialogDescription>
        </DialogHeader>
        {rendered ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="mb-1 text-xs text-muted-foreground">Subject</div>
              <div className="font-medium">{rendered.subject}</div>
            </div>
            <Tabs defaultValue="preview" className="min-h-0 flex-1">
              <TabsList>
                <TabsTrigger value="preview">
                  <IconEye data-icon="inline-start" />
                  Giao diện
                </TabsTrigger>
                <TabsTrigger value="source">
                  <IconCode data-icon="inline-start" />
                  HTML source
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-2 min-h-0 flex-1 overflow-hidden rounded-lg border bg-white">
                <iframe
                  title="Preview giao diện email"
                  sandbox=""
                  referrerPolicy="no-referrer"
                  srcDoc={rendered.htmlBody}
                  className="block h-full min-h-96 w-full border-0 bg-white"
                />
              </TabsContent>
              <TabsContent value="source" className="mt-2 min-h-0 flex-1 overflow-auto rounded-lg border bg-muted/20">
                <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-5">{rendered.htmlBody}</pre>
              </TabsContent>
            </Tabs>
            <Badge variant="outline" className="w-fit">
              <IconExternalLink data-icon="inline-start" />
              Giao diện chạy trong sandbox, không thực thi script
            </Badge>
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
