import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

export function AvailabilityEmpty({ title, description }: { title: string; description: string }) {
  return <Empty className="min-h-64 rounded-xl border border-dashed"><EmptyHeader><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader></Empty>;
}
