import type {
  HandoverStatus,
  RentalOrderDetail,
  RentalOrderListItem,
  RentalOrderRefund,
  RentalOrderStatus,
  RentalSettlementStatus,
  ReturnStatus,
} from './model';

type RefundSummaryItem = Pick<RentalOrderRefund, 'amount' | 'status'>;

export type RentalOrderFinancialDisplayInput = {
  status: RentalOrderStatus;
  handoverStatus: HandoverStatus;
  returnStatus: ReturnStatus;
  settlementStatus: RentalSettlementStatus;
  amountDueAtBooking?: number;
  amountDueBeforeHandover: number;
  refundDue: number;
  additionalChargeDue: number;
  actualRefundTotal?: number;
  paidTotal: number;
  totalCustomerObligation: number;
  refunds?: ReadonlyArray<RefundSummaryItem>;
  payments?: ReadonlyArray<{ direction: 'INBOUND' | 'OUTBOUND'; amount: number; status: string }>;
};

type RentalOrderGanttFinancialDisplayInput = Omit<RentalOrderFinancialDisplayInput, 'status'> & { orderStatus: RentalOrderStatus };
type RentalOrderFinancialSource = RentalOrderListItem | RentalOrderDetail | RentalOrderFinancialDisplayInput | RentalOrderGanttFinancialDisplayInput;

export type RentalOrderFinancialSummaryKind =
  | 'BOOKING_PAYMENT_DUE'
  | 'PRE_HANDOVER_PAYMENT_DUE'
  | 'PENDING_PAYMENT_CONFIRMATION'
  | 'READY_FOR_HANDOVER'
  | 'IN_RENTAL'
  | 'AWAITING_INSPECTION'
  | 'ADDITIONAL_CHARGE_DUE'
  | 'REFUND_DUE'
  | 'REFUND_PENDING_CONFIRMATION'
  | 'REFUNDED'
  | 'SETTLED'
  | 'DISPUTED'
  | 'NO_ACTION';

export type RentalOrderFinancialSummary = {
  kind: RentalOrderFinancialSummaryKind;
  label: string;
  description: string;
  amount: number;
  amountLabel: string | null;
  badgeStatus: RentalSettlementStatus;
  isActionRequired: boolean;
  pendingRefundTotal: number;
  pendingPaymentTotal: number;
};

export type RentalOrderOperationalBadge =
  | { kind: 'handover'; status: HandoverStatus; label: string }
  | { kind: 'return'; status: ReturnStatus; label: string }
  | { kind: 'settlement'; status: Extract<RentalSettlementStatus, 'SETTLED' | 'DISPUTED'>; label: string };

export type RentalOrderNextActionKind =
  | 'CONFIRM_PAYMENT'
  | 'RECORD_PAYMENT'
  | 'HANDOVER'
  | 'RETURN'
  | 'INSPECTION'
  | 'CREATE_REFUND'
  | 'CONFIRM_REFUND'
  | 'SETTLE'
  | 'DISPUTE'
  | 'NONE';

export type RentalOrderNextAction = {
  kind: RentalOrderNextActionKind;
  label: string;
  description: string;
  financial: RentalOrderFinancialSummary;
};

type RentalOrderOperationalDisplayInput = RentalOrderFinancialSource;

function getFinancialValues(order: RentalOrderFinancialSource): RentalOrderFinancialDisplayInput {
  if ('orderStatus' in order) {
    return { ...order, status: order.orderStatus };
  }

  if ('financials' in order) {
    return {
      status: order.status,
      handoverStatus: order.handoverStatus,
      returnStatus: order.returnStatus,
      settlementStatus: order.settlementStatus,
      ...order.financials,
      refunds: order.refunds,
      payments: order.payments,
    };
  }

  return order;
}

function getPendingRefundTotal(refunds?: ReadonlyArray<RefundSummaryItem>) {
  return (
    refunds
      ?.filter((refund) => refund.status === 'PENDING' || refund.status === 'PROCESSING')
      .reduce((total, refund) => total + refund.amount, 0) ?? 0
  );
}

function getPendingPaymentTotal(
  payments?: ReadonlyArray<{ direction: 'INBOUND' | 'OUTBOUND'; amount: number; status: string }>,
) {
  return (
    payments
      ?.filter((payment) => payment.direction === 'INBOUND' && payment.status === 'PENDING')
      .reduce((total, payment) => total + payment.amount, 0) ?? 0
  );
}

export function getRentalOrderReturnLabel(order: RentalOrderOperationalDisplayInput): string | null {
  const values = getFinancialValues(order);

  if (values.status === 'RENTING') {
    if (values.returnStatus === 'NOT_RETURNED') return 'Chưa trả máy';
    if (values.returnStatus === 'RETURNED') return 'Đã nhận trả máy';
    return 'Đã kiểm tra';
  }

  if (values.status === 'RETURNED') {
    return values.returnStatus === 'RETURNED' ? 'Chờ kiểm tra' : 'Đã kiểm tra';
  }

  if (values.status === 'DONE') return 'Đã kiểm tra';
  return null;
}

export function getRentalOrderOperationalBadges(
  order: RentalOrderOperationalDisplayInput,
): RentalOrderOperationalBadge[] {
  const values = getFinancialValues(order);

  switch (values.status) {
    case 'CREATED':
      return [
        values.amountDueBeforeHandover > 0 || values.handoverStatus === 'PENDING_PAYMENT'
          ? { kind: 'handover', status: 'PENDING_PAYMENT', label: 'Chờ thanh toán' }
          : { kind: 'handover', status: 'READY', label: 'Sẵn sàng bàn giao' },
      ];
    case 'CONFIRMED':
      return [
        values.handoverStatus === 'PENDING_PAYMENT'
          ? { kind: 'handover', status: 'PENDING_PAYMENT', label: 'Chờ thanh toán' }
          : { kind: 'handover', status: 'READY', label: 'Sẵn sàng bàn giao' },
      ];
    case 'RENTING': {
      const returnLabel = getRentalOrderReturnLabel(values);
      return [
        { kind: 'handover', status: 'HANDED_OVER', label: 'Đã bàn giao' },
        ...(returnLabel ? [{ kind: 'return', status: values.returnStatus, label: returnLabel } as const] : []),
      ];
    }
    case 'RETURNED': {
      const returnLabel = getRentalOrderReturnLabel(values);
      return returnLabel ? [{ kind: 'return', status: values.returnStatus, label: returnLabel }] : [];
    }
    case 'DONE':
      return [{ kind: 'settlement', status: 'SETTLED', label: 'Đã quyết toán' }];
    case 'DISPUTED':
      return [{ kind: 'settlement', status: 'DISPUTED', label: 'Cần xử lý tranh chấp' }];
    case 'CANCELLED':
      return [];
  }

}

export function getRentalOrderFinancialSummary(order: RentalOrderFinancialSource): RentalOrderFinancialSummary {
  const values = getFinancialValues(order);
  const pendingRefundTotal = getPendingRefundTotal(values.refunds);
  const pendingPaymentTotal = getPendingPaymentTotal(values.payments);
  const actualRefundTotal = values.actualRefundTotal ?? 0;

  const summary = (
    kind: RentalOrderFinancialSummaryKind,
    label: string,
    description: string,
    amount = 0,
    amountLabel: string | null = null,
    badgeStatus: RentalSettlementStatus = 'NOT_STARTED',
    isActionRequired = false,
  ): RentalOrderFinancialSummary => ({
    kind,
    label,
    description,
    amount,
    amountLabel,
    badgeStatus,
    isActionRequired,
    pendingRefundTotal,
    pendingPaymentTotal,
  });

  if (values.status === 'DISPUTED' || values.settlementStatus === 'DISPUTED') {
    return summary('DISPUTED', 'Đang tranh chấp', 'Đơn cần nhân viên xử lý thủ công trước khi tiếp tục.', 0, null, 'DISPUTED', true);
  }

  if (values.status === 'DONE') {
    return summary('SETTLED', 'Đã quyết toán', 'Đơn đã hoàn tất và không còn khoản cần xử lý.', 0, null, 'SETTLED');
  }

  if (values.status !== 'CANCELLED' && pendingPaymentTotal > 0) {
    return summary(
      'PENDING_PAYMENT_CONFIRMATION',
      'Chờ xác nhận thanh toán',
      'Có giao dịch khách đã gửi nhưng quản trị viên chưa xác nhận.',
      pendingPaymentTotal,
      'Giao dịch chờ xác nhận',
      'PAYMENT_DUE',
      true,
    );
  }

  if (values.status === 'CANCELLED') {
    if (pendingRefundTotal > 0) {
      return summary(
        'REFUND_PENDING_CONFIRMATION',
        'Đang chờ xác nhận hoàn',
        'Đã tạo yêu cầu hoàn; cần xác nhận sau khi chuyển tiền cho khách.',
        pendingRefundTotal,
        'Đang chờ hoàn',
        'REFUND_DUE',
        true,
      );
    }

    if (values.refundDue > 0) {
      return summary(
        'REFUND_DUE',
        'Còn phải hoàn',
        'Đơn đã hủy nhưng vẫn còn khoản tiền hợp lệ cần hoàn cho khách.',
        values.refundDue,
        'Còn phải hoàn',
        'REFUND_DUE',
        true,
      );
    }

    if (actualRefundTotal > 0) {
      return summary('REFUNDED', 'Đã hoàn tiền', 'Khoản tiền cần hoàn đã được xác nhận hoàn thực tế.', actualRefundTotal, 'Đã hoàn', 'SETTLED');
    }

    return summary('NO_ACTION', 'Không còn khoản cần xử lý', 'Đơn đã hủy và hiện không còn khoản thu/hoàn cần thao tác.', 0, null, 'SETTLED');
  }

  if (values.returnStatus === 'INSPECTED') {
    if (values.additionalChargeDue > 0) {
      return summary(
        'ADDITIONAL_CHARGE_DUE',
        'Cần thu thêm',
        'Sau kiểm tra thiết bị, đơn phát sinh khoản cần thu thêm từ khách.',
        values.additionalChargeDue,
        'Còn phải thu thêm',
        'PAYMENT_DUE',
        true,
      );
    }

    if (pendingRefundTotal > 0) {
      return summary(
        'REFUND_PENDING_CONFIRMATION',
        'Đang chờ xác nhận hoàn',
        'Đã có yêu cầu hoàn đang chờ xác nhận.',
        pendingRefundTotal,
        'Đang chờ hoàn',
        'REFUND_DUE',
        true,
      );
    }

    if (values.refundDue > 0) {
      return summary(
        'REFUND_DUE',
        'Còn phải hoàn',
        'Sau đối soát, đơn còn khoản tiền cần hoàn cho khách.',
        values.refundDue,
        'Còn phải hoàn',
        'REFUND_DUE',
        true,
      );
    }

    if (values.settlementStatus === 'SETTLED') {
      return summary('SETTLED', 'Đã quyết toán', 'Đã kiểm tra xong và không còn khoản phải thu hoặc hoàn.', 0, null, 'SETTLED');
    }
  }

  if (values.status === 'CREATED' || values.status === 'CONFIRMED') {
    if ((values.amountDueAtBooking ?? 0) > 0) {
      return summary(
        'BOOKING_PAYMENT_DUE',
        'Còn phải thu tiền giữ lịch',
        'Khách cần thanh toán khoản giữ lịch trước khi đơn được xác nhận.',
        values.amountDueAtBooking,
        'Còn phải thu tiền giữ lịch',
        'PAYMENT_DUE',
        true,
      );
    }

    if (values.amountDueBeforeHandover > 0) {
      return summary(
        'PRE_HANDOVER_PAYMENT_DUE',
        'Còn phải thu trước bàn giao',
        'Khách chưa thanh toán đủ số tiền cần thu trước khi giao máy.',
        values.amountDueBeforeHandover,
        'Còn phải thu trước bàn giao',
        'PAYMENT_DUE',
        true,
      );
    }

    if (values.handoverStatus === 'READY' || values.status === 'CONFIRMED') {
      return summary('READY_FOR_HANDOVER', 'Đủ điều kiện bàn giao', 'Đơn đã đủ điều kiện tài chính để bàn giao máy.', 0, null, 'SETTLED');
    }
  }

  if (values.status === 'RENTING') {
    return summary('IN_RENTAL', 'Đang thuê', 'Thiết bị đang ở phía khách hàng trong thời gian thuê.', 0, null, 'SETTLED');
  }

  if (values.status === 'RETURNED' && values.returnStatus === 'RETURNED') {
    return summary('AWAITING_INSPECTION', 'Chờ kiểm tra thiết bị', 'Đã nhận trả máy; cần kiểm tra tình trạng trước khi quyết toán.', 0, null, 'NOT_STARTED', true);
  }

  return summary('NO_ACTION', 'Chưa có khoản cần xử lý', 'Chưa phát sinh bước tài chính tiếp theo.', 0, null, values.settlementStatus);
}

export function getRentalOrderNextAction(order: RentalOrderFinancialSource): RentalOrderNextAction {
  const values = getFinancialValues(order);
  const financial = getRentalOrderFinancialSummary(order);

  if (financial.kind === 'DISPUTED') {
    return { kind: 'DISPUTE', label: 'Xử lý tranh chấp', description: financial.description, financial };
  }

  if (financial.kind === 'PENDING_PAYMENT_CONFIRMATION') {
    return { kind: 'CONFIRM_PAYMENT', label: 'Xác nhận thanh toán', description: financial.description, financial };
  }

  if (values.status === 'CANCELLED') {
    if (financial.kind === 'REFUND_PENDING_CONFIRMATION') {
      return { kind: 'CONFIRM_REFUND', label: 'Xác nhận đã chuyển tiền hoàn', description: financial.description, financial };
    }
    if (financial.kind === 'REFUND_DUE') {
      return { kind: 'CREATE_REFUND', label: 'Tạo yêu cầu hoàn tiền', description: financial.description, financial };
    }
    return { kind: 'NONE', label: 'Đã hủy', description: financial.description, financial };
  }

  if (financial.kind === 'BOOKING_PAYMENT_DUE' || financial.kind === 'PRE_HANDOVER_PAYMENT_DUE' || financial.kind === 'ADDITIONAL_CHARGE_DUE') {
    return { kind: 'RECORD_PAYMENT', label: 'Ghi nhận thanh toán', description: financial.description, financial };
  }

  if (financial.kind === 'READY_FOR_HANDOVER') {
    return { kind: 'HANDOVER', label: 'Bàn giao máy', description: financial.description, financial };
  }

  switch (values.status) {
    case 'CREATED':
      return { kind: 'NONE', label: 'Chờ xác nhận', description: 'Đơn mới tạo; chưa có thao tác vận hành tiếp theo.', financial };
    case 'CONFIRMED':
      return { kind: 'HANDOVER', label: 'Bàn giao máy', description: 'Đơn đã sẵn sàng cho bước bàn giao thiết bị.', financial };
    case 'RENTING':
      return { kind: 'RETURN', label: 'Nhận trả máy', description: 'Ghi nhận khi khách trả thiết bị về kho.', financial };
    case 'RETURNED':
      if (getFinancialValues(order).returnStatus === 'RETURNED') {
        return { kind: 'INSPECTION', label: 'Kiểm tra thiết bị', description: financial.description, financial };
      }
      if (financial.kind === 'REFUND_DUE') {
        return { kind: 'CREATE_REFUND', label: 'Tạo yêu cầu hoàn tiền', description: financial.description, financial };
      }
      if (financial.kind === 'SETTLED') {
        return { kind: 'SETTLE', label: 'Quyết toán đơn thuê', description: financial.description, financial };
      }
      return { kind: 'NONE', label: 'Đang đối soát', description: financial.description, financial };
    case 'DONE':
      return { kind: 'NONE', label: 'Đã hoàn tất', description: financial.description, financial };
    case 'DISPUTED':
      return { kind: 'DISPUTE', label: 'Xử lý tranh chấp', description: financial.description, financial };
  }

  return { kind: 'NONE', label: 'Chưa có bước tiếp theo', description: financial.description, financial };
}
