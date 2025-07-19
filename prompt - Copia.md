# 📋 PROMPT COMPLETO - DIREITO ORGANIZADO V2.0

## 🎯 **VISÃO GERAL DO PROJETO**

Criar um aplicativo web moderno e escalável para estudantes e profissionais do direito no Brasil, com foco em produtividade, organização de estudos e consulta jurídica. O projeto deve ser desenvolvido pensando na experiência de um **estudante de direito**, priorizando funcionalidades essenciais e preparando a base para futuras monetizações.

### 🏆 **OBJETIVOS PRINCIPAIS**
- **Performance otimizada** para carregamento rápido
- **Código limpo e escalável** para manutenção fácil
- **Preparação para mobile** (futuro APK/iOS)
- **Base para monetização** (planos pagos + loja jurídica)
- **Foco na experiência do estudante** de direito

### 🚀 **ESTRATÉGIA DE DESENVOLVIMENTO ITERATIVA**
- **Desenvolvimento página por página**: Foco em uma funcionalidade por vez até 100% completa
- **Páginas não prioritárias**: Exibir apenas preview "Em Desenvolvimento" 
- **Primeira prioridade**: Sistema de Login + Caderno Digital completo
- **Layout flexível**: Deixar o Claude/IA decidir o melhor layout e UX, seguindo apenas as cores definidas

---

## 🔥 **FIREBASE CONFIGURATION E DADOS EXISTENTES**

## 🏗️ **ARQUITETURA TECNOLÓGICA**
```javascript
// firebase/config.js
const firebaseConfig = {
  apiKey: "AIzaSyACIX4Ep4HHTQSPCmQ8Ip3uWUHvYIuufyU",
  authDomain: "super-ajudante-mvp-v1.firebaseapp.com",
  projectId: "super-ajudante-mvp-v1",
  storageBucket: "super-ajudante-mvp-v1.firebasestorage.app",
  messagingSenderId: "21694426906",
  appId: "1:21694426906:web:d0c3c04e435adad699c6a3",
  measurementId: "G-98YPWL77DG"
};
```

### **Estrutura de Dados no Firestore (EXISTENTE)**
```javascript
// Collection: "users" - Perfis de usuário
{
  uid: "firebase_user_id",
  email: "usuario@email.com",
  displayName: "Nome do Usuário",
  plan: "free|premium|pro",
  createdAt: "timestamp",
  lastLogin: "timestamp",
  preferences: {
    theme: "light|dark",
    notifications: true,
    defaultView: "dashboard"
  }
}

// Collection: "notes" - Anotações do caderno digital
{
  id: "auto_generated_id",
  userId: "firebase_user_id",
  title: "Título da Anotação",
  content: "Conteúdo em texto rico/HTML",
  subject: "Matéria (ex: Direito Civil)",
  tags: ["tag1", "tag2"],
  createdAt: "timestamp",
  updatedAt: "timestamp",
  isArchived: false,
  color: "#ffffff", // Para organização visual
  attachments: [] // Para futuras implementações
}

// Collection: "study_plans" - Planos de estudo
{
  id: "auto_generated_id",
  userId: "firebase_user_id",
  title: "Nome do Plano",
  type: "graduacao|concurso|oab|livre",
  subjects: ["Direito Civil", "Direito Penal"],
  schedule: {
    // Estrutura de horários
  },
  goals: {
    daily: 4, // horas por dia
    weekly: 28 // horas por semana
  },
  createdAt: "timestamp",
  isActive: true
}

// Collection: "bookmarks" - Marcações no Vade Mecum
{
  id: "auto_generated_id",
  userId: "firebase_user_id",
  lawId: "cf", // ID da lei (ex: cf, cc, cp)
  articleNumber: "1",
  note: "Anotação pessoal sobre o artigo",
  highlights: ["texto destacado"],
  createdAt: "timestamp"
}
```

### **IMPORTANTE: Vade Mecum - NÃO usar Firebase NESTE MOMENTO**
- **Dados das leis**: Usar EXCLUSIVAMENTE os arquivos da pasta `js-modules/`
- **83 arquivos .js disponíveis** com toda legislação brasileira
- **Não armazenar leis no Firestore** - apenas marcações/anotações do usuário

### **Stack Principal**
```json
{
  "framework": "React 19.1.0 + Vite 6.3.5",
  "linguagem": "JavaScript (ES Modules)",
  "estilização": "Tailwind CSS v4.1.7",
  "componentes": "Shadcn/ui (estilo new-york)",
  "roteamento": "React Router DOM v7.6.1",
  "estado": "Context API (AuthContext + DataContext)",
  "backend": "Firebase v11.10.0 (Auth + Firestore)",
  "gerenciador": "PNPM",
  "mobile_ready": "PWA + Capacitor (futuro)"
}
```

### **Dependências Críticas**
```json
{
  "dependencies": {
    "@radix-ui/react-*": "^latest",
    "@tailwindcss/vite": "^4.1.7",
    "firebase": "^11.10.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.1",
    "lucide-react": "^0.510.0",
    "framer-motion": "^12.15.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.0",
    "zod": "^3.24.4",
    "react-hook-form": "^7.56.3",
    "@hookform/resolvers": "^5.0.1",
    "date-fns": "^4.1.0",
    "sonner": "^2.0.3"
  }
}
```

---

## 📱 **EXPERIÊNCIA DO USUÁRIO (ESTUDANTE DE DIREITO)**

### **Personas Principais**
1. **Estudante de Graduação** - Precisa organizar matérias, fazer anotações e consultar leis
2. **Concurseiro** - Foco em cronogramas de estudo, simulados e consulta rápida
3. **Profissional Iniciante** - Consulta jurídica rápida e organização de casos
4. **Em todos os 3 casos acima** - Os usuários precisam trablhar com muitos arquivos, então o projeto deve ser um gerenciador central desses arquivos.

### **Jornada do Usuário**
```
Cadastro → Onboarding → Dashboard → Módulos → Rotina de Estudo
```

### **Funcionalidades por Prioridade**
**🎯 FASE 1 - LOGIN + CADERNO DIGITAL (100% Completo):**
1. ✅ Sistema de Login/Registro (Firebase Auth)
2. ✅ Caderno Digital completo e funcional
3. ✅ Dashboard básico com navegação

**📋 OUTRAS PÁGINAS (Preview "Em Desenvolvimento"):**
- Vade Mecum Inteligente
- Planejamento de Estudos
- Agenda Inteligente (deverá ser integrada em outras agendas, como a do google, mas futuramente)  
- Testes rápidos/Quiz e flash cards
- Perfil do Usuário
- Configurações

**🚀 Futuras (Após Caderno 100%):**
1. Vade Mecum completo
2. Planejamento de estudos
3. Agenda Inteligente
4. Loja Jurídica
5. Planos Pagos

---

## 🔐 **SISTEMA DE LOGIN (PRIORIDADE IMEDIATA)**

### **Funcionalidades Obrigatórias**
```javascript
// Página de Login simples e funcional
- Login com email/senha
- Registro de novos usuários
- Recuperação de senha (forgot password)
- Integração completa com Firebase Auth
- Redirecionamento automático após login
- Validação de formulários com React Hook Form + Zod
- Estados de loading e erro
- Design limpo e profissional
```

### **Estrutura do Sistema de Auth**
```javascript
// contexts/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Funções obrigatórias:
  const login = async (email, password) => {
    // Implementar signInWithEmailAndPassword
  }
  
  const register = async (email, password, displayName) => {
    // Implementar createUserWithEmailAndPassword
    // Criar documento na collection "users"
  }
  
  const logout = async () => {
    // Implementar signOut
  }
  
  const resetPassword = async (email) => {
    // Implementar sendPasswordResetEmail
  }
  
  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### **Estrutura de Dados (js-modules/) - Para Implementação Futura**
```javascript
// Formato dos arquivos existentes - NÃO MODIFICAR
export default {
  "id": "cf",
  "titulo": "Constituição",
  "ano": 1988,
  "nome": "Constituição da República Federativa do Brasil", 
  "alias": "Constituição Federal",
  "area": "administrativo",
  "categoria": "constitucional",
  "jurisdicao": "federal",
  "prioridade": 1,
  "url": "http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
  "artigos": {
    "1": {
      "numero": "1º",
      "titulo": "Brasil, formada pela união indissolúvel...",
      "texto": "Art. 1º A República Federativa do Brasil...",
      "incisos": ["I", "II", "III", "IV", "V"]
    }
  },
  "totalArtigos": 250
}
```

### **83 Leis Disponíveis na pasta js-modules/**
- Constituição Federal (cf.js), Código Civil (cc.js), Código Penal (cp.js)
- Código de Processo Civil (cpc.js), CLT (clt.js), CDC (cdc.js)
- ECA (eca.js), e mais 76 leis brasileiras importantes

---

## 📝 **CADERNO DIGITAL (IMPLEMENTAÇÃO COMPLETA - FASE 1)**

### **Funcionalidades OBRIGATÓRIAS do Caderno**
```javascript
// CRUD Completo de Anotações
1. ✅ Criar nova anotação
2. ✅ Editar anotação existente  
3. ✅ Deletar anotação (com confirmação)
4. ✅ Listar todas as anotações
5. ✅ Buscar anotações por título/conteúdo
6. ✅ Filtrar por matéria/tags
7. ✅ Organizar por data, título, matéria
8. ✅ Sistema de tags personalizadas
9. ✅ Cores para categorização visual
10. ✅ Sincronização em tempo real com Firebase
```

### **Editor de Texto Rico**
```javascript
// Funcionalidades do Editor
- Formatação básica: negrito, itálico, sublinhado
- Listas (ordenadas e não ordenadas)
- Links
- Cabeçalhos (H1, H2, H3)
- Citações (blockquotes)
- Código inline e blocos de código
- Desfazer/Refazer
- Contagem de palavras
- Auto-save durante digitação
```

### **Interface do Caderno (Flexível - Claude decide layout)**
```javascript
// Componentes essenciais (layout livre):
1. Lista de anotações (sidebar, grid, ou lista)
2. Editor principal 
3. Barra de ferramentas do editor
4. Sistema de busca e filtros
5. Modal/drawer para nova anotação
6. Confirmação de exclusão
7. Indicadores de sincronização
8. Estados de loading/erro
```

### **Estrutura de Dados (Firebase Firestore)**
```javascript
// Collection: "notes"
{
  id: "auto_generated_id",
  userId: "firebase_user_id", // Obrigatório para segurança
  title: "Título da Anotação",
  content: "Conteúdo do editor Lexical (JSON)",
  subject: "Direito Civil", // Dropdown com matérias
  tags: ["importante", "revisao"], // Array de strings
  color: "#3B82F6", // Hex color para organização visual
  createdAt: "2025-01-15T10:30:00Z",
  updatedAt: "2025-01-15T11:45:00Z",
  isArchived: false, // Para arquivar sem deletar
  wordCount: 150 // Para estatísticas
}
```

### **Matérias Pré-definidas (Dropdown)**
```javascript
// constants/subjects.js
export const SUBJECTS = [
  "Direito Constitucional",
  "Direito Civil", 
  "Direito Penal",
  "Direito Processual Civil",
  "Direito Processual Penal",
  "Direito Administrativo",
  "Direito Tributário",
  "Direito Trabalhista",
  "Direito Empresarial",
  "Direito do Consumidor",
  "Outro" // Para matérias personalizadas
]
```

---

## � **PÁGINAS "EM DESENVOLVIMENTO" (PREVIEWS SIMPLES)**

### **Páginas com Preview Básico**
```javascript
// Componentes simples para páginas não priorizadas
const ComingSoonPage = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-6">
        {icon}
      </div>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      <div className="bg-primary/10 px-4 py-2 rounded-full">
        <span className="text-primary font-medium">Em Desenvolvimento</span>
      </div>
    </div>
  )
}

// Páginas que terão preview:
1. 📚 Vade Mecum - "Consulte toda legislação brasileira"
2. 📅 Planejamento - "Organize seus estudos de forma inteligente"  
3. 🧠 Testes - "Pratique com questões e simulados"
4. 👤 Perfil - "Gerencie sua conta e preferências"
5. ⚙️ Configurações - "Personalize sua experiência"
```

## ⚖️ **VADE MECUM (INFORMAÇÕES PARA FUTURO)**

## 🎨 **DESIGN SYSTEM (APENAS CORES - LAYOUT FLEXÍVEL)**

### **Paleta de Cores Obrigatória**
```javascript
// tailwind.config.js - Cores específicas para o projeto
module.exports = {
  theme: {
    extend: {
      colors: {
        // Cores primárias (Verde Jurídico)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7', 
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#047857', // COR PRINCIPAL
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22'
        },
        
        // Cores secundárias (Jurídico tradicional)
        juridico: {
          gold: '#d4af37',    // Dourado elegante
          navy: '#1e293b',    // Azul marinho profissional
          cream: '#faf9f6',   // Creme suave
          slate: '#64748b'    // Cinza neutro
        },
        
        // Cores funcionais
        success: '#10b981',
        warning: '#f59e0b', 
        error: '#ef4444',
        info: '#3b82f6'
      }
    }
  }
}
```

### **Diretrizes de Design (Sem Layout Específico)**
- **Tipografia**: Inter como fonte principal (já configurada)
- **Espaçamento**: Usar sistema de espaçamento do Tailwind (4, 8, 16, 24px)
- **Bordas**: Rounded-lg para cards, rounded-md para inputs
- **Sombras**: Usar shadow-sm, shadow-md conforme necessário
- **Tema**: Suporte completo a dark/light mode
- **Responsividade**: Mobile-first sempre

**IMPORTANTE**: O Claude tem total liberdade para decidir:
- Layout das páginas
- Posicionamento de elementos  
- Estrutura de componentes
- Navegação e fluxos de usuário
- Organização visual

---

## 🏛️ **ARQUITETURA DE CÓDIGO LIMPO**

### **Estrutura de Pastas Otimizada**
```
src/
├── components/
│   ├── ui/                    # Shadcn/ui components
│   ├── common/                # Componentes reutilizáveis
│   ├── features/              # Componentes por funcionalidade
│   │   ├── auth/
│   │   ├── vademecum/
│   │   ├── notebook/
│   │   ├── planning/
│   │   └── dashboard/
│   └── layout/                # Layout e navegação
├── hooks/                     # Custom hooks
├── services/                  # Serviços (Firebase, APIs)
├── utils/                     # Utilitários e helpers
├── contexts/                  # Context API
├── constants/                 # Constantes globais
├── types/                     # TypeScript types (futuro)
└── styles/                    # Estilos globais
```

### **Padrões de Código**
```javascript
// 1. Componentes funcionais com hooks
const Component = ({ prop1, prop2 }) => {
  // Custom hooks primeiro
  const { user } = useAuth()
  
  // Estado local
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {}, [])
  
  // Handlers
  const handleAction = () => {}
  
  // Render
  return <div>...</div>
}

// 2. Custom hooks para lógica complexa
const useVadeMecum = () => {
  // Toda lógica do Vade Mecum aqui
  return { laws, search, filter }
}

// 3. Services para comunicação externa
export const vademecumService = {
  getLaws: () => {},
  searchLaws: () => {},
  saveFavorite: () => {}
}
```

---

## 💰 **PREPARAÇÃO PARA MONETIZAÇÃO**

### **Arquitetura de Planos**
```javascript
// constants/plans.js
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuito',
    features: [
      'Vade Mecum básico',
      'Caderno limitado (50 notas)',
      'Planejamento simples'
    ],
    limits: {
      notes: 50,
      storage: '100MB',
      vademecum: 'basic'
    }
  },
  PREMIUM: {
    id: 'premium', 
    name: 'Premium',
    price: 19.90,
    features: [
      'Vade Mecum completo',
      'Caderno ilimitado',
      'Planejamento avançado',
      'Exportação PDF'
    ],
    limits: {
      notes: -1, // ilimitado
      storage: '1GB',
      vademecum: 'full'
    }
  },
  PRO: {
    id: 'pro',
    name: 'Profissional',
    price: 39.90,
    features: [
      'Todos recursos Premium',
      'Acesso à Loja Jurídica',
      'Suporte prioritário',
      'Funcionalidades profissionais'
    ]
  }
}
```

### **Sistema de Verificação de Planos**
```javascript
// hooks/useSubscription.js
export const useSubscription = () => {
  const { user } = useAuth()
  
  const checkFeatureAccess = (feature) => {
    return user?.plan?.features?.includes(feature)
  }
  
  const checkLimit = (type, current) => {
    const limit = user?.plan?.limits?.[type]
    return limit === -1 || current < limit
  }
  
  return { checkFeatureAccess, checkLimit }
}
```

### **Componente de Paywall**
```javascript
// components/common/Paywall.jsx
const Paywall = ({ feature, children }) => {
  const { checkFeatureAccess } = useSubscription()
  const hasAccess = checkFeatureAccess(feature)
  
  if (!hasAccess) {
    return <UpgradeModal feature={feature} />
  }
  
  return children
}
```

---

## 🛍️ **PREPARAÇÃO PARA LOJA JURÍDICA**

### **Estrutura de Produtos**
```javascript
// types/store.js
export const PRODUCT_TYPES = {
  COURSE: 'course',
  EBOOK: 'ebook', 
  TEMPLATE: 'template',
  WEBINAR: 'webinar'
}

// Firestore: collection "products"
{
  id: "uuid",
  type: "course",
  title: "Curso de Direito Civil",
  description: "string",
  price: 199.90,
  instructor: "string",
  category: "civil",
  isActive: true,
  createdAt: "timestamp"
}
```

### **Sistema de Compras**
```javascript
// services/paymentService.js
export const paymentService = {
  createCheckout: async (productId) => {
    // Integração com Stripe/PayPal/PIX
  },
  verifyPayment: async (paymentId) => {
    // Verificar status do pagamento
  }
}
```

---

## 📱 **PREPARAÇÃO PARA MOBILE (PWA + CAPACITOR)**

### **PWA Configuration**
```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache'
            }
          }
        ]
      },
      manifest: {
        name: 'Direito Organizado',
        short_name: 'DireitoOrg',
        description: 'Seu assistente jurídico completo',
        theme_color: '#047857',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

### **Capacitor Setup (Futuro)**
```bash
# Preparação para mobile nativo
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npx cap init "Direito Organizado" "com.direitoorganizado.app"
```

---

### **Componentes Responsivos (Flexibilidade Total)**
- **Mobile-first**: Sempre começar pelo mobile
- **Navegação**: Decidir entre sidebar, bottom nav, ou drawer
- **Cards**: Para anotações, estatísticas, etc
- **Modals/Drawers**: Para formulários e ações
- **Loading states**: Spinners, skeletons conforme necessário
- **Empty states**: Quando não há dados

---

## 🚀 **PERFORMANCE E OTIMIZAÇÃO OBRIGATÓRIA**

### **Estratégias Críticas**
```javascript
// 1. Code Splitting obrigatório
const CadernoDigital = lazy(() => import('./pages/CadernoDigital'))
const VadeMecum = lazy(() => import('./pages/VadeMecum'))

// 2. Debounce para busca (obrigatório)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

// 3. Firestore real-time com unsubscribe
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'notes'), where('userId', '==', user.uid)),
    (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setNotes(notes)
    }
  )
  
  return unsubscribe // IMPORTANTE: limpar listener
}, [user.uid])
```

---

---

## 🚀 **PERFORMANCE E OTIMIZAÇÃO OBRIGATÓRIA**

### **Estratégias Críticas**
```javascript
// 1. Code Splitting por rota
const VadeMecum = lazy(() => import('./components/features/vademecum'))

// 2. Virtualization para listas grandes
import { FixedSizeList as List } from 'react-window'

// 3. Debounce para busca
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

### **Bundle Optimization Obrigatório**
```javascript
// vite.config.js - Code splitting necessário
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-editor': ['lexical', '@lexical/react'],
          'vademecum-data': ['./src/data/js-modules/index.js']
        }
      }
    }
  }
})
```

---

## ✅ **ROADMAP ESPECÍFICO - DESENVOLVIMENTO ITERATIVO**

### **🎯 FASE 1 - FOCO TOTAL (2-3 semanas)**
```javascript
// ENTREGÁVEIS OBRIGATÓRIOS:
1. ✅ Setup inicial (Vite + React + Tailwind + Firebase)
2. ✅ Sistema de Login/Registro 100% funcional
3. ✅ Caderno Digital COMPLETO com todas funcionalidades
4. ✅ Layout responsivo com navegação básica
5. ✅ Páginas "Em Desenvolvimento" com previews
6. ✅ Deploy funcional

// CRITÉRIOS DE CONCLUSÃO DA FASE 1:
- Login/logout funcionando perfeitamente
- Criar, editar, deletar anotações
- Busca e filtros funcionais
- Sincronização Firebase em tempo real
- Interface responsiva e profissional
- Performance otimizada
```

### **📋 PRÓXIMAS FASES (Após Fase 1 100%)**
- **Fase 2**: Vade Mecum completo (3-4 semanas)
- **Fase 3**: Planejamento de estudos (2-3 semanas)  
- **Fase 4**: Sistema de planos/monetização (2 semanas)
- **Fase 5**: PWA e preparação mobile (1-2 semanas)

---

---

## �️ **COMANDOS E SETUP INICIAL**

### **Setup Obrigatório**
```bash
# Criar projeto Vite
pnpm create vite direito-organizado --template react
cd direito-organizado

# Instalar dependências essenciais
pnpm install @tailwindcss/vite tailwindcss
pnpm install firebase react-router-dom
pnpm install lucide-react framer-motion
pnpm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm install @radix-ui/react-tabs @radix-ui/react-select
pnpm install react-hook-form @hookform/resolvers zod
pnpm install lexical @lexical/react @lexical/rich-text
pnpm install class-variance-authority clsx tailwind-merge
pnpm install sonner # Para toasts/notificações

# Configurar Shadcn/ui
npx shadcn@latest init

# Desenvolvimento
pnpm dev
```

### **Estrutura de Arquivos Inicial**
```
src/
├── components/
│   ├── ui/              # Shadcn components
│   ├── auth/            # Login/Register
│   ├── notebook/        # Caderno Digital
│   ├── layout/          # Layout geral
│   └── common/          # Componentes reutilizáveis
├── pages/               # Páginas principais
├── contexts/            # AuthContext
├── hooks/               # Custom hooks
├── services/            # Firebase services
├── constants/           # Constantes (matérias, cores)
└── lib/                 # Utilitários
```

---

## 🎓 **CONSIDERAÇÕES FINAIS E PRIORIDADES**

### **FOCO ABSOLUTO - FASE 1**
1. **Login simples** mas seguro e funcional
2. **Caderno Digital completo** - nada pela metade
3. **Código limpo** e bem estruturado
4. **Performance otimizada** desde o início
5. **Responsividade perfeita** 

### **LIBERDADES CRIATIVAS PARA O CLAUDE**
- **Layout**: Decidir a melhor disposição de elementos
- **UX**: Criar a melhor experiência de usuário possível
- **Navegação**: Escolher entre sidebar, drawer, bottom nav
- **Componentes**: Organizar da forma mais intuitiva
- **Animações**: Adicionar onde fizer sentido

### **NÃO NEGOCIÁVEIS**
- ✅ Firebase com as credenciais fornecidas
- ✅ Estrutura de dados do Firestore conforme especificado
- ✅ Cores da paleta obrigatória
- ✅ Funcionalidades completas do Caderno Digital
- ✅ Performance e otimização desde o início
- ✅ Páginas não priorizadas com preview "Em Desenvolvimento"

**OBJETIVO**: Entregar o melhor Caderno Digital para estudantes de direito, com código limpo e preparado para escalabilidade.
