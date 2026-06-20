import { PermissionCode } from "@/utils/consts/rbac.const";
import { TablerIcon } from "@tabler/icons-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: TablerIcon;
  requiredPermissions?: PermissionCode[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: TablerIcon;
  requiredPermissions?: PermissionCode[];
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}
