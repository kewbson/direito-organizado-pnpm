import { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Brain, 
  HelpCircle, 
  User, 
  LogOut,
  Menu,
  X,
  Scale,
  ShieldCheck // Ícone para o botão ADM
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext'; // O useAuth é o correto aqui.

const menuItems = [
  { id: 'dashboard', label: 'Meu Painel', icon: Home },
  { id: 'notebook', label: 'Caderno Digital', icon: BookOpen },
  { id: 'planning', label: 'Planejamento(FRC)', icon: Calendar },
  { id: 'calendar', label: 'Agenda', icon: Calendar },
  { id: 'tests', label: 'Testes Rápidos', icon: Brain },
  { id: 'vademecum', label: 'Vade Mecum', icon: Scale },
  { id: 'support', label: 'Suporte', icon: HelpCircle },
  { id: 'profile', label: 'Meu Perfil', icon: User },
];

export function Sidebar({ activeSection, onSectionChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  // O hook 'useAuth' nos dá acesso ao objeto 'user' (com a role) e à função 'logout'
  const { user, logout } = useAuth(); 

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleSectionChange = (sectionId) => {
    onSectionChange(sectionId);
    setIsOpen(false);
  };
    
const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-2 border-b border-sidebar-border"></div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout and Admin Button */}
      <div className="p-4 border-t border-sidebar-border">
        <ul className="space-y-2">
          {/* BOTÃO DO PAINEL DE ADMINISTRAÇÃO - SÓ APARECE SE O USUÁRIO FOR ADMIN */}
          {user && user.role === 'admin' && (
            <li>
              <a 
                href="https://direitoorganizado-adm.netlify.app" // URL do seu painel admin
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 text-yellow-400 hover:bg-yellow-400/20"
              >
                <ShieldCheck className="h-5 w-5" />
                <span className="font-bold">Painel ADM</span>
              </a>
            </li>
          )}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-sidebar-foreground/70 hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sair</span>
            </button>
          </li>
        </ul>
        <p className="mt-4 text-center text-xs text-sidebar-foreground/60">
          Copyright &copy; 2025 Kewbson Hilário
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background shadow-md border-border"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>
      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${className}`}>
        <SidebarContent />
      </aside>
    </>
  );
}