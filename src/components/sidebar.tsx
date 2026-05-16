'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Home, BookOpen, GraduationCap, Users, FileText, MessageSquare, Heart, User, LogOut, Menu, X, Layers, Settings
} from 'lucide-react';
import { useState } from 'react';

const userNav = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/cursos', label: 'Cursos', icon: GraduationCap },
  { href: '/disciplinas', label: 'Disciplinas', icon: BookOpen },
  { href: '/eletivas', label: 'Eletivas', icon: Layers },
  { href: '/docentes', label: 'Docentes', icon: Users },
  { href: '/materiais', label: 'Materiais', icon: FileText },
  { href: '/forum', label: 'Forum', icon: MessageSquare },
  { href: '/favoritos', label: 'Favoritos', icon: Heart },
];

const adminNav = [
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/cursos', label: 'Cursos', icon: GraduationCap },
  { href: '/admin/semestres', label: 'Semestres', icon: BookOpen },
  { href: '/admin/disciplinas', label: 'Disciplinas', icon: BookOpen },
  { href: '/admin/eletivas', label: 'Eletivas', icon: Layers },
  { href: '/admin/docentes', label: 'Docentes', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout, email } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const NavLinks = () => (
    <>
      <div className="px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Menu</p>
        <nav className="space-y-1">
          {userNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {isAdmin && (
        <div className="px-3 py-2 mt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Settings className="h-3 w-3" /> Admin
          </p>
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <Link href="/dashboard" className="text-lg font-bold text-primary">Insper Mind</Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 bg-card z-40 overflow-y-auto pb-20">
          <NavLinks />
          <div className="border-t border-border mt-4 pt-4 px-3">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="truncate">{email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-secondary rounded-lg w-full"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0">
        <div className="h-14 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="text-lg font-bold text-primary">Insper Mind</Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </div>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">{email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-secondary rounded-lg w-full"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
