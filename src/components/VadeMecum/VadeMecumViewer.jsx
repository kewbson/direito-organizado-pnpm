import { useState } from 'react';
import { X, Calendar, Tag, FileText, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const VadeMecumViewer = ({ document, onClose, isEmbedded = false }) => {
  const [copied, setCopied] = useState(false);

  // Função auxiliar para formatar datas, sejam Timestamps do Firebase ou strings
  const formatDate = (date) => {
    if (!date) return 'Data indisponível';
    let dateObj;
    if (date.toDate) { // Se for um Timestamp do Firebase
      dateObj = date.toDate();
    } else { // Se for uma string
      dateObj = new Date(date);
    }
    return dateObj.toLocaleDateString('pt-BR');
  };

  // Função auxiliar para obter o rótulo do tipo de documento
  const getTypeLabel = (type) => {
    const typeLabels = {
      'constituicao': 'Constituição',
      'lei': 'Lei',
      'codigo': 'Código',
    };
    return typeLabels[type] || type;
  };

  // Função para copiar o conteúdo, agora adaptada para a nova estrutura
  const handleCopyContent = () => {
    if (!document) return;

    let textToCopy = '';
    // Verifica se existe o array 'artigos'
    if (document.artigos && document.artigos.length > 0) {
      textToCopy = document.artigos
        .map(art => `Art. ${art.numero} - ${art.texto}`)
        .join('\n\n');
    } else if (document.conteudo) {
      // Mantém a compatibilidade com a estrutura antiga
      textToCopy = document.conteudo;
    } else {
      toast.error("Não há conteúdo para copiar.");
      return;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Conteúdo copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Função principal para renderizar o conteúdo, seja da estrutura nova ou antiga
  const renderContent = () => {
    // 1. Tenta renderizar a NOVA estrutura com o array 'artigos'
    if (document.artigos && document.artigos.length > 0) {
      return document.artigos.map((artigo, index) => (
        <div key={index} className="mb-6">
          <h4 className="font-semibold text-lg text-foreground mb-2">Art. {artigo.numero}</h4>
          {/* A classe 'whitespace-pre-wrap' respeita as quebras de linha (\n) do seu JSON */}
          <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
            {artigo.texto}
          </p>
        </div>
      ));
    }
    
    // 2. Se não encontrar 'artigos', tenta renderizar a ESTRUTURA ANTIGA com 'conteudo'
    if (document.conteudo) {
        return document.conteudo.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
              {paragraph.trim()}
            </p>
        ));
    }

    // 3. Se não encontrar nenhum dos dois, exibe uma mensagem
    return <p className="text-muted-foreground">Este documento não possui conteúdo para exibição.</p>;
  };
    
    if (!document) {
    if (isEmbedded) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Selecione um documento</p>
                <p className="text-sm">Escolha um item da lista para ver os detalhes.</p>
            </div>
        </div>
      );
    }
    return null;
  }
  
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-shrink-0 border-b p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-semibold mb-2 leading-tight">{document.titulo}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary">{getTypeLabel(document.tipo)}</Badge>
              {document.referencia && <span className="text-sm font-medium text-muted-foreground">{document.referencia}</span>}
            </div>
          </div>
          {onClose && !isEmbedded && (
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {document.palavrasChave && document.palavrasChave.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Palavras-chave:</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {document.palavrasChave.map((keyword, index) => (
                  <Badge key={index} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Conteúdo do Documento:</h3>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyContent} className="text-xs">
                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </Button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg bg-muted/20">
              {renderContent()}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default VadeMecumViewer;