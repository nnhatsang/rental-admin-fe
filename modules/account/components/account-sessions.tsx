'use client';

import {
  IconActivity,
  IconAlertCircle,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDevices,
  IconLoader,
  IconLogin,
  IconLogout,
  IconMapPin,
  IconRefresh
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, parseDate } from '@/lib/utils';
import {
  useGetAuthSessions,
  useRevokeAuthSession,
  useRevokeOtherAuthSessions,
} from '@/modules/auth/hooks/use-auth-sessions';
import type { IAuthSession } from '@/modules/auth/types';

type RevokeIntent = { type: 'session'; sessionId: string; label: string } | { type: 'others' } | null;

const formatSessionDate = (value: string) => {
  const date = parseDate(value);
  return date ? formatDate(date, 'datetime') : 'Không có dữ liệu';
};

const formatRelativeActivity = (timestamp: number, now: number) => {
  const elapsedMs = Math.max(0, now - timestamp);
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);

  if (elapsedMinutes < 1) return 'vừa xong';
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} giờ trước`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays} ngày trước`;

  return formatDate(new Date(timestamp), 'datetime');
};

function RelativeActivity({ value }: { value: string }) {
  const date = parseDate(value);
  const timestamp = date?.getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (timestamp === undefined) return;

    const updateNow = () => setNow(Date.now());
    updateNow();

    const timer = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(timer);
  }, [timestamp]);

  if (timestamp === undefined) return <span>Không có dữ liệu</span>;

  const exactDate = formatDate(new Date(timestamp), 'datetime');
  const label = now === null ? exactDate : formatRelativeActivity(timestamp, now);

  return (
    <time dateTime={new Date(timestamp).toISOString()} title={`Thời gian chính xác: ${exactDate}`}>
      {label}
    </time>
  );
}

const getSessionLabel = (session: IAuthSession) => {
  const deviceName = session.deviceName?.trim();
  const browser = session.browser?.trim();

  return deviceName || browser || 'Thiết bị không xác định';
};

const getSessionSecondaryLabel = (session: IAuthSession) => {
  const deviceName = session.deviceName?.trim();
  const browser = session.browser?.trim();

  if (!deviceName || !browser || deviceName === browser) return null;

  return browser;
};

const getSessionIcon = (session: IAuthSession) => {
  const device = `${session.deviceName ?? ''} ${session.browser ?? ''}`.toLowerCase();

  if (/iphone|ipad|android|mobile/.test(device)) return IconDeviceMobile;
  if (/windows|mac|linux|desktop|laptop|chrome os/.test(device)) return IconDeviceDesktop;

  return IconDevices;
};

type SessionMetaProps = {
  icon: typeof IconMapPin;
  label: string;
  value: string;
};



function SessionRow({ session, onRevoke }: { session: IAuthSession; onRevoke: (session: IAuthSession) => void }) {
  const label = getSessionLabel(session);
  const secondaryLabel = getSessionSecondaryLabel(session);
  const SessionIcon = getSessionIcon(session);

  return (
    <Card className={cn('shadow-none border-0', session.isCurrent && 'bg-muted/40')}>
      <CardContent className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <SessionIcon className="size-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium">{label}</p>

            {session.isCurrent && <Badge variant="secondary">Hiện tại</Badge>}
          </div>

          {secondaryLabel && <p className="mt-0.5 truncate text-sm text-muted-foreground">{secondaryLabel}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {session.ipAddress && (
              <span className="flex items-center gap-1">
                <IconMapPin className="size-3.5" />
                {session.ipAddress}
              </span>
            )}

            <span className="flex items-center gap-1">
              <IconActivity className="size-3.5" />
              <RelativeActivity value={session.lastUsedAt} />
            </span>

            <span className="hidden items-center gap-1 sm:flex">
              <IconLogin className="size-3.5" />
              {formatSessionDate(session.createdAt)}
            </span>
          </div>
        </div>

        {!session.isCurrent && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label={`Thu hồi phiên đăng nhập trên ${label}`}
            onClick={() => onRevoke(session)}
          >
            <IconLogout className="size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function AccountSessions() {
  const sessionsQuery = useGetAuthSessions();
  const revokeSessionMutation = useRevokeAuthSession();
  const revokeOthersMutation = useRevokeOtherAuthSessions();
  const [revokeIntent, setRevokeIntent] = useState<RevokeIntent>(null);

  const sessions = sessionsQuery.data ?? [];
  const hasOtherSessions = sessions.some((session) => !session.isCurrent);
  const isRevoking = revokeSessionMutation.isPending || revokeOthersMutation.isPending;

  const handleConfirmRevoke = () => {
    if (!revokeIntent) return;

    if (revokeIntent.type === 'session') {
      revokeSessionMutation.mutate(revokeIntent.sessionId, {
        onSuccess: () => setRevokeIntent(null),
      });
      return;
    }

    revokeOthersMutation.mutate(undefined, {
      onSuccess: () => setRevokeIntent(null),
    });
  };

  return (
    <>
      <section className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid min-w-0 max-w-full auto-rows-min gap-1.5">
            {/* <h2 className="text-xl leading-none font-semibold">Thiết bị đang đăng nhập</h2>
            <p className="max-w-3xl text-sm leading-snug text-muted-foreground">
              Kiểm tra các phiên đăng nhập và thu hồi những thiết bị bạn không còn sử dụng.
            </p> */}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={sessionsQuery.isFetching}
              onClick={() => void sessionsQuery.refetch()}
            >
              {sessionsQuery.isFetching ? (
                <IconLoader className="animate-spin" data-icon="inline-start" />
              ) : (
                <IconRefresh data-icon="inline-start" />
              )}
              Làm mới
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!hasOtherSessions || isRevoking}
              onClick={() => setRevokeIntent({ type: 'others' })}
            >
              <IconLogout data-icon="inline-start" />
              Đăng xuất thiết bị khác
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {sessionsQuery.isPending ? (
            <div className="grid gap-3" aria-busy="true" aria-label="Đang tải phiên đăng nhập">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : sessionsQuery.isError ? (
            <Alert variant="destructive">
              <IconAlertCircle aria-hidden="true" />
              <AlertTitle>Không thể tải danh sách thiết bị</AlertTitle>
              <AlertDescription>Vui lòng thử làm mới lại sau.</AlertDescription>
            </Alert>
          ) : sessions.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconDevices aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Chưa có phiên đăng nhập</EmptyTitle>
                <EmptyDescription>Danh sách thiết bị đang hoạt động sẽ hiển thị tại đây.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-3" role="list" aria-label="Các thiết bị đang đăng nhập">
              {sessions.map((session) => (
                <div key={session.sessionId} role="listitem">
                  <SessionRow
                    session={session}
                    onRevoke={(target) =>
                      setRevokeIntent({ type: 'session', sessionId: target.sessionId, label: getSessionLabel(target) })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={revokeIntent !== null}
        onOpenChange={(open) => {
          if (!open && !isRevoking) setRevokeIntent(null);
        }}
        title={revokeIntent?.type === 'others' ? 'Đăng xuất các thiết bị khác?' : 'Thu hồi phiên đăng nhập?'}
        desc={
          revokeIntent?.type === 'others'
            ? 'Tất cả phiên đăng nhập khác của tài khoản sẽ bị thu hồi. Thiết bị hiện tại vẫn được giữ lại.'
            : `Phiên đăng nhập trên ${revokeIntent?.label ?? 'thiết bị này'} sẽ không thể tiếp tục sử dụng.`
        }
        confirmText="Xác nhận thu hồi"
        cancelBtnText="Hủy"
        destructive
        isLoading={isRevoking}
        handleConfirm={handleConfirmRevoke}
      />
    </>
  );
}
