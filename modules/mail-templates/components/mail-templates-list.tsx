'use client';

import { DataTable } from '@/components/ui/data-table';
import { useMailTemplateLogic } from '../hooks/mail-template-logic';
import { MailTemplateFormDialog } from './update';

function MailTemplatesTable() {
  const { table, selectedTemplate, setSelectedTemplate } = useMailTemplateLogic();

  return (
    <main className="@container/main flex min-w-0 flex-col gap-5">
      <DataTable table={table} />

      {selectedTemplate ? (
        <MailTemplateFormDialog
          id={selectedTemplate.id}
          readOnly={selectedTemplate.readOnly}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedTemplate(null);
          }}
        />
      ) : null}
    </main>
  );
}

export function MailTemplatesList() {
  return <MailTemplatesTable />;
}
