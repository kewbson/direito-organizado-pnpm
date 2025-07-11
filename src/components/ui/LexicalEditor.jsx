// Arquivo: src/components/ui/LexicalEditor.jsx
import { FloatingLinkEditorPlugin } from './FloatingLinkEditorPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ToolbarPlugin } from './ToolbarPlugin'; 
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';

// Este é o nosso tema. Ele mapeia os nomes das formatações para classes do Tailwind CSS.
// Deixaremos pronto para quando formos estilizar.
const editorTheme = {
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'mb-2',
  quote: 'ml-4 border-l-4 border-gray-300 pl-4 italic',
  heading: {
    h1: 'text-3xl font-bold mb-4',
    h2: 'text-2xl font-semibold mb-3',
    h3: 'text-xl font-medium mb-2',
  },
  list: {
    nested: {
      listitem: 'ml-4',
    },
    ol: 'list-decimal list-inside mb-2',
    ul: 'list-disc list-inside mb-2',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-sm font-mono text-sm',
  },
};

// Placeholder (texto que aparece quando o editor está vazio)
function Placeholder() {
  return <div className="editor-placeholder">Digite suas anotações aqui...</div>;
}

// Configuração inicial do editor
const editorConfig = {
  // O namespace é um nome único para o nosso editor.
  namespace: 'DireitoOrganizadoEditor',
  theme: editorTheme,
  // Tratamento de erro básico
  onError(error) {
    throw error;
  },
  // Aqui registramos todos os tipos de "nós" que nosso editor suportará.
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    LinkNode,
  ],
};

export function LexicalEditor({ onChange, initialEditorState }) {
  // Se houver um estado inicial (ao editar uma nota), o editor o carregará.
  // Caso contrário, ele começará vazio.
  const initialConfig = {
    ...editorConfig,
    editorState: initialEditorState || null,
  };
  
  return (
    <LexicalComposer initialConfig={initialConfig}>
<div className="editor-container relative bg-card border border-input rounded-md shadow-sm overflow-hidden">
  {/* A Toolbar vai aqui em cima */}
  <ToolbarPlugin />
  <div className="relative">
    {/* O RichTextPlugin agora fica dentro de uma div para o placeholder funcionar corretamente com a toolbar */}
    <RichTextPlugin
      contentEditable={<ContentEditable className="editor-input p-4 min-h-[200px] focus:outline-none" />}
      placeholder={<Placeholder />}
      ErrorBoundary={LexicalErrorBoundary}
    />
  </div>
  <LinkPlugin />
  <ListPlugin />
  <FloatingLinkEditorPlugin />
  <HistoryPlugin />
  <OnChangePlugin
    onChange={(editorState) => {
            const editorStateJSON = JSON.stringify(editorState.toJSON());
            onChange(editorStateJSON);
          }}
        />
      </div>
    </LexicalComposer>
  );
}