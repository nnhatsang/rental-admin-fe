import { cookies } from 'next/headers';
import { getPreference } from '@/server/server-actions';
import { SIDEBAR_COLLAPSIBLE_VALUES, SIDEBAR_VARIANT_VALUES } from '@/lib/preferences/layout';

export async function getLayoutPreferences() {
  const cookieStore = await cookies();
  
  // Trạng thái đóng/mở sidebar (Mặc định mở: true)
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';
  
  // Lấy kiểu sidebar (inset, floating,...)
  const variant = await getPreference('sidebar_variant', SIDEBAR_VARIANT_VALUES, 'inset');
  
  // Lấy hành vi thu gọn sidebar (icon, offcanvas,...)
  const collapsible = await getPreference('sidebar_collapsible', SIDEBAR_COLLAPSIBLE_VALUES, 'icon');

  return {
    defaultOpen,
    variant,
    collapsible,
  };
}
