import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit, Trash2, FileText, Calendar, Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

// Para renderizar o conteúdo Lexical (semelhante ao LexicalEditor, mas apenas para leitura)
// Precisamos das nodes e do LexicalComposer, mas sem a parte de edição ativa
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// Nodes que o editor suporta (precisam ser as mesmas da LexicalEditor.jsx)
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { LinkNode } from '@lexical/link';

// Tema do editor (precisa ser o mesmo do App.css e LexicalEditor.jsx)
const editorTheme = {
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'mb-2',
  quote: 'ml-4 border-gray-300 pl-4 italic',
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

// Configuração básica do editor para visualização (apenas leitura)
const viewerEditorConfig = {
  namespace: 'NoteViewerEditor',
  theme: editorTheme,
  onError(error) {
    console.error('Erro no Lexical NoteViewer:', error);
    toast.error('Erro ao carregar conteúdo da anotação.');
  },
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
  editable: false, // Muito importante: define o editor como somente leitura
};

export function NoteViewer({ note, onClose, onEdit, onDelete, toggleNoteFavoriteProp }) {
  const { notes, deleteNote, toggleNoteFavorite: toggleNoteFavoriteContext } = useData();
  const currentNote = notes.find(n => n.id === note.id); // Garante que estamos usando a versão mais recente da nota

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      const result = await deleteNote(currentNote.id);
      if (result?.success) {
        toast.success("Anotação excluída com sucesso!");
        onClose(); // Fecha o visualizador após a exclusão
      } else {
        toast.error(result?.error || "Erro ao excluir anotação.");
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (toggleNoteFavoriteProp) { // Usar a prop se for passada (para Dashboard, por exemplo)
      const result = await toggleNoteFavoriteProp(currentNote.id);
      if (result?.success) {
        toast.success(currentNote.isFavorite ? "Anotação removida dos favoritos." : "Anotação adicionada aos favoritos!");
      } else {
        toast.error(result?.error || "Erro ao atualizar favoritos.");
      }
    } else if (toggleNoteFavoriteContext) { // Fallback para o contexto se a prop não existir
      const result = await toggleNoteFavoriteContext(currentNote.id);
      if (result?.success) {
        toast.success(currentNote.isFavorite ? "Anotação removida dos favoritos." : "Anotação adicionada aos favoritos!");
      } else {
        toast.error(result?.error || "Erro ao atualizar favoritos.");
      }
    }
  };

  const handleExportPdf = () => {
    toast.info("Funcionalidade de exportação para PDF em desenvolvimento!");
    // Lógica futura para exportação de PDF será adicionada aqui.
  };

  if (!currentNote) {
    return (
      <Card className="max-w-2xl mx-auto p-4">
        <CardHeader>
          <CardTitle>Anotação não encontrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta anotação pode ter sido excluída ou não existe.</p>
          <Button onClick={onClose} className="mt-4">Voltar</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <CardTitle className="text-xl mb-3 leading-tight">
                {currentNote.title}
              </CardTitle>
              <Badge variant="secondary" className="mb-2">
                {currentNote.subject}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                Última atualização: {formatDate(currentNote.lastModified || currentNote.date)}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className={`${currentNote.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
              >
                <Star className={`h-4 w-4 ${currentNote.isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-0 custom-scrollbar">
          <div className="p-6">
            <LexicalComposer initialConfig={{ ...viewerEditorConfig, editorState: currentNote.content }}>
              <div className="editor-container border-none shadow-none">
                <RichTextPlugin
                  contentEditable={<ContentEditable className="editor-input min-h-[150px] p-0" />}
                  placeholder={null} // Não precisamos de placeholder no visualizador
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </div>
            </LexicalComposer>
          </div>
        </CardContent>

        <div className="flex-shrink-0 border-t p-4 flex justify-between items-center bg-background">
          <Button variant="outline" onClick={handleExportPdf} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <div className="flex space-x-2">
            <Button variant="default" onClick={() => onEdit(currentNote)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}