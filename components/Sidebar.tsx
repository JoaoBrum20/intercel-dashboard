"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, FileText, LayoutDashboard, LogOut, PackageSearch, Settings, ShoppingBag, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const items = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/produtos", label: "Produtos", icon: ShoppingBag },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <div className="brand-mark"><PackageSearch size={22} /></div>
          <div>
            <strong>INTERCEL</strong>
            <span>Gestão integrada</span>
          </div>
        </div>

        <nav className="nav-list">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <button
          type="button"
          className="nav-item"
          onClick={handleLogout}
          style={{ width: "100%", border: 0, cursor: "pointer", background: "transparent", marginBottom: 12 }}
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <div>
            <strong>TagPlus</strong>
            <span>Integração preparada</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
