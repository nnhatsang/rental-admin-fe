import { useAuthStore } from '@/modules/auth/store';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { ESocketEmit, ESocketReason, type IPermissionsUpdatedPayload } from '@/utils/consts/socket.const';
import { deleteCookie } from 'cookies-next';
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from '@/utils/consts/token.const';
import { useRouter } from 'next/navigation';
import { PATHNAME } from '@/utils/consts/pathname.const';

// Biến instance chạy độc bản (Singleton) để quản lý kết nối socket toàn cục
let socketInstance: ReturnType<typeof io> | null = null;

class SocketManager {
  // Đối tượng socket.io-client thực tế đang kết nối
  private socket: ReturnType<typeof io> | null = null;

  // Bộ lưu trữ tạm thời các hàm callback sự kiện trước và sau khi socket được khởi tạo
  /* eslint-disable @typescript-eslint/no-explicit-any */
  private eventHandlers: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor() {}

  /**
   * Khởi tạo kết nối WebSocket với Server
   * Phương thức này sẽ giải quyết đường dẫn tự động và thiết lập các thông số kết nối lại
   */
  public initializeSocket() {
    if (!socketInstance) {
      // 1. Khởi tạo socket client
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL! || '', {
        withCredentials: true, // Cho phép truyền Cookie HttpOnly (admin_access_token) lên Server để xác thực
        reconnection: true, // Bật tự động kết nối lại khi mất mạng
        reconnectionAttempts: 5, // Thử lại tối đa 5 lần
        reconnectionDelay: 1000, // Khoảng thời gian giữa các lần thử lại là 1 giây
        transports: ['websocket'], // Chỉ ưu tiên giao thức WebSocket
      });

      this.socket = socketInstance;

      // 2. Đăng ký các sự kiện cơ bản của socket (connect, disconnect,...)
      this.setupEventListeners();

      // 3. Đồng bộ đăng ký lại tất cả các callback sự kiện nghiệp vụ đã đăng ký trước khi socket khởi tạo thành công
      this.eventHandlers.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          this.socket?.on(event, handler);
        });
      });
    }
  }

  /**
   * Ngắt kết nối socket hiện tại và giải phóng bộ nhớ
   * Được gọi khi người dùng thực hiện logout hoặc tài khoản bị khóa
   */
  public disconnectSocket() {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      this.socket = null;
      console.log('[Socket] Đã ngắt kết nối và giải phóng bộ nhớ socket.');
    }
  }

  /**
   * Lắng nghe và log trạng thái kết nối cơ bản của Socket.io client
   */
  private setupEventListeners() {
    if (!socketInstance) return;

    socketInstance.on('connect', () => {
      console.log(`[Socket] Kết nối thành công với Server, Socket ID: ${socketInstance?.id}`);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`[Socket] Đã ngắt kết nối: ${reason}`);
    });

    socketInstance.on('reconnect', () => {
      console.log('[Socket] Kết nối lại với server thành công');
    });

    socketInstance.on('connect_error', (error) => {
      console.log('[Socket] Lỗi kết nối WebSocket:', error);
    });
  }

  /**
   * Đăng ký một callback lắng nghe sự kiện từ Server
   * @param event Tên sự kiện (ESocketEmit)
   * @param handler Hàm callback xử lý dữ liệu nhận được
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public on(event: string, handler: (...args: any[]) => void) {
    // Thêm handler vào map để quản lý
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Đăng ký trực tiếp với socket của client (nếu đã kết nối thành công)
    this.socket?.on(event, handler);
  }

  /**
   * Hủy đăng ký lắng nghe sự kiện
   * @param event Tên sự kiện cần hủy
   * @param handler Callback cụ thể cần hủy
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public off(event: string, handler: (...args: any[]) => void) {
    if (!this.eventHandlers.has(event)) {
      return;
    }
    this.eventHandlers.get(event)!.delete(handler);
    this.socket?.off(event, handler);

    // Nếu không còn handler nào lắng nghe sự kiện này thì xóa key khỏi Map
    if (this.eventHandlers.get(event)!.size === 0) {
      this.eventHandlers.delete(event);
    }
  }

  /**
   * Hủy tất cả các sự kiện và listener trên socket hiện tại
   */
  public offAll() {
    this.eventHandlers.clear();
    this.socket?.off();
  }

  /**
   * Hủy toàn bộ listener của một sự kiện cụ thể
   * @param event Tên sự kiện cần hủy toàn bộ listener
   */
  public offAllEvents(event: string) {
    if (!this.eventHandlers.has(event)) {
      return;
    }
    this.eventHandlers.get(event)!.clear();
    this.socket?.off(event);
    this.eventHandlers.delete(event);
  }

  /**
   * Lấy đối tượng socket hiện tại
   */
  public getSocket() {
    return this.socket;
  }
}

// Export đối tượng socketManager để sử dụng xuyên suốt dự án
export const socketManager = new SocketManager();

/**
 * Hook tự động khởi tạo kết nối socket khi người dùng đăng nhập thành công
 * và ngắt kết nối socket khi người dùng đăng xuất
 */
export const useSocketEmit = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      socketManager.initializeSocket();
    } else {
      socketManager.disconnectSocket();
    }
  }, [isAuthenticated]);
};

/**
 * Hook lắng nghe sự kiện đồng bộ phân quyền thời gian thực (permissions:updated) từ Server
 * Khi nhận được sự kiện, hook sẽ:
 * 1. Hiển thị toast sonner báo tin
 * 2. Gọi lại API profile để cập nhật hoặc đăng xuất người dùng (nếu bị khóa/xóa)
 */
export const useSocketEvents = () => {
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Hàm xử lý khi nhận tín hiệu thay đổi phân quyền
    const handlePermissionsUpdated = async (data: IPermissionsUpdatedPayload) => {
      console.log('[Socket] Nhận sự kiện permissions:updated:', data);

      // Trường hợp 1: Tài khoản bị Admin xóa hoặc bị đưa vào trạng thái Banned/Locked
      if (
        data.reason === ESocketReason.USER_DELETED ||
        data.activityStatus === 'BANNED' ||
        data.activityStatus === 'LOCKED'
      ) {
        toast.error('Tài khoản của bạn đã bị vô hiệu hóa hoặc xóa bởi Quản trị viên. Đang đăng xuất...', {
          duration: 4000,
        });
        const { logout } = useAuthStore.getState();
        logout();

        // Gọi lại fetchProfile (kết quả trả về 401 sẽ tự kích hoạt hàm clearAuth và chuyển hướng về /auth)
        // await fetchProfile().catch(() => {});
      } else {
        toast.info('Quyền hạn của bạn đã được cập nhật bởi quản trị viên. Đang cập nhật giao diện...', {
          duration: 3000,
        });
        // Gọi lại fetchProfile để lưu trữ bộ quyền mới vào Auth Store
        await fetchProfile().catch(() => {});
      }
    };

    // Đăng ký lắng nghe sự kiện PERMISSIONS_UPDATED
    socketManager.on(ESocketEmit.PERMISSIONS_UPDATED, handlePermissionsUpdated);

    // Clean up: gỡ đăng ký khi component bị hủy (unmount)
    return () => {
      socketManager.off(ESocketEmit.PERMISSIONS_UPDATED, handlePermissionsUpdated);
    };
  }, [isAuthenticated, user, fetchProfile]);
};

// Hook tổng hợp quản lý toàn bộ vòng đời và sự kiện của Socket
export const useSocket = () => {
  useSocketEmit(); // Khởi tạo / Ngắt kết nối socket theo trạng thái auth
  useSocketEvents(); // Lắng nghe các sự kiện socket (đổi quyền,...)
};
