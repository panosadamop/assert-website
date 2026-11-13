/** Serializable menu data passed from server components to client menus. */
export type NavChild = { label: string; href: string; description?: string; icon?: string };
export type NavItem = { label: string; href: string; newTab?: boolean; children?: NavChild[] };
export type LangOption = { code: string; name: string };
