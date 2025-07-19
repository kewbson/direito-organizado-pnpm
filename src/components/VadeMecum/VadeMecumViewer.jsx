import { useState } from 'react';
import { X, Calendar, Tag, FileText, Copy, Check, List, Hash } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { toast } from 'sonner';

const VadeMecumViewer = ({ document, onClose, isEmbedded = false }) => {
  const [copied, setCopied] = useState(false);
  const [showIndex, setShowIndex] = useState(false);

  // Log para confirmar que a versão atualizada está sendo usada
  console.log('🔄 VadeMecumViewer ATUALIZADO carregado - versão com melhor formatação');

  // Função auxiliar para obter o rótulo do tipo de documento
  const getTypeLabel = (type) => {
    const typeLabels = {
      'constituicao': 'Constituição',
      'lei': 'Lei',
      'codigo': 'Código',
      'decreto': 'Decreto',
      'portaria': 'Portaria',
      'resolucao': 'Resolução',
      'instrucao_normativa': 'Instrução Normativa',
      'medida_provisoria': 'Medida Provisória',
      'emenda_constitucional': 'Emenda Constitucional',
      'sumula': 'Súmula'
    };
    return typeLabels[type] || type;
  };

  // Função para navegar para um artigo específico
  const scrollToArticle = (articleNumber) => {
    const element = document.getElementById(`article-${articleNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Função para copiar o conteúdo, agora adaptada para a nova estrutura
  const handleCopyContent = () => {
    if (!document) return;

    let textToCopy = '';
    
    // Primeiro tenta usar a nova estrutura de artigos
    if (document.artigos && document.artigos.length > 0) {
      textToCopy = document.artigos
        .map(art => {
          let articleText = `Art. ${art.numero} - ${art.texto}`;
          
          // Adiciona incisos se existirem
          if (art.incisos && art.incisos.length > 0) {
            const incisosText = art.incisos
              .map(inciso => `  ${inciso.numero} - ${inciso.texto}`)
              .join('\n');
            articleText += '\n' + incisosText;
          }
          
          // Adiciona parágrafos se existirem
          if (art.paragrafos && art.paragrafos.length > 0) {
            const paragrafosText = art.paragrafos
              .map(paragrafo => `  ${paragrafo.numero} - ${paragrafo.texto}`)
              .join('\n');
            articleText += '\n' + paragrafosText;
          }
          
          return articleText;
        })
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
      console.log('Renderizando artigos estruturados:', document.artigos.length)
      return document.artigos.map((artigo, index) => (
        <div 
          key={index} 
          id={`article-${artigo.numero}`}
          className="mb-8 p-6 border border-emerald-200 dark:border-emerald-800 rounded-lg bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900/50 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-full text-sm font-bold shadow-md">
              {artigo.numero}
            </span>
            <h4 className="font-semibold text-xl text-foreground">Artigo {artigo.numero}</h4>
            {artigo.anchor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollToArticle(artigo.numero)}
                className="ml-auto h-6 w-6 p-0"
              >
                <Hash className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Título/resumo do artigo se disponível */}
          {artigo.titulo && artigo.titulo !== artigo.texto && (
            <p className="text-sm text-emerald-600 mb-3 italic font-medium bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded">
              {artigo.titulo}
            </p>
          )}
          
          {/* Texto principal do artigo */}
          <div className="prose prose-base dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed text-justify">
              {artigo.texto}
            </p>
          </div>
          
          {/* Incisos se existirem */}
          {artigo.incisos && artigo.incisos.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <List className="h-4 w-4" />
                Incisos:
              </h5>
              <ul className="list-none space-y-3">
                {artigo.incisos.map((inciso, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">
                      {inciso.numero}
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{inciso.texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Parágrafos se existirem */}
          {artigo.paragrafos && artigo.paragrafos.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Parágrafos:
              </h5>
              <div className="space-y-4">
                {artigo.paragrafos.map((paragrafo, idx) => (
                  <div key={idx} className="border-l-4 border-blue-400 pl-4 py-2 bg-white dark:bg-gray-800/30 rounded-r">
                    <span className="inline-block bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold mb-2">
                      {paragrafo.numero}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{paragrafo.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ));
    }
    
    // 2. Se não encontrar 'artigos', tenta renderizar a ESTRUTURA ANTIGA com 'conteudo'
    if (document.conteudo && document.conteudo.trim()) {
        console.log('Renderizando conteúdo tradicional')
        return document.conteudo.split('\n\n').map((paragraph, index) => {
          const text = paragraph.trim()
          
          // Detecta se é um artigo (começa com "Art." ou "Artigo")
          const isArticle = /^(Art\.|Artigo)\s*\d+/i.test(text)
          
          // Detecta se é uma seção ou capítulo
          const isSection = /^(Seção|Capítulo|Título|Parte)\s+[IVX\d]+/i.test(text)
          
          if (isArticle) {
            return (
              <div key={index} className="mb-6 p-4 border border-emerald-200 dark:border-emerald-800 rounded-lg bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900/50 shadow-sm">
                <p className="text-foreground leading-relaxed text-justify font-medium">
                  {text}
                </p>
              </div>
            )
          } else if (isSection) {
            return (
              <div key={index} className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r">
                <h4 className="font-semibold text-lg text-blue-700 dark:text-blue-300">
                  {text}
                </h4>
              </div>
            )
          } else {
            return (
              <p key={index} className="mb-4 text-muted-foreground leading-relaxed text-justify">
                {text}
              </p>
            )
          }
        });
    }

    // 3. Tenta renderizar o conteúdo estruturado que processamos
    if (document.conteudoEstruturado && document.conteudoEstruturado.trim()) {
        console.log('Renderizando conteúdo estruturado processado')
        return document.conteudoEstruturado.split('\n\n').map((paragraph, index) => {
          const text = paragraph.trim()
          
          // Detecta se é um artigo (começa com "Art." ou "Artigo")
          const isArticle = /^(Art\.|Artigo)\s*\d+/i.test(text)
          
          if (isArticle) {
            return (
              <div key={index} className="mb-6 p-4 border border-emerald-200 dark:border-emerald-800 rounded-lg bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900/50 shadow-sm">
                <p className="text-foreground leading-relaxed text-justify font-medium whitespace-pre-wrap">
                  {text}
                </p>
              </div>
            )
          } else {
            return (
              <p key={index} className="mb-4 text-muted-foreground leading-relaxed text-justify whitespace-pre-wrap">
                {text}
              </p>
            )
          }
        });
    }

    // 4. Se não encontrar nenhum dos dois, exibe uma mensagem
    console.log('Nenhum conteúdo encontrado para:', document.id)
    return (
      <div className="text-center py-8">
        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
        <p className="text-muted-foreground">Conteúdo não disponível para este documento.</p>
        <p className="text-sm text-muted-foreground mt-2">
          ID: {document.id} | Artigos: {document.artigos?.length || 0}
        </p>
      </div>
    );
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
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <Badge variant="secondary">{getTypeLabel(document.tipo)}</Badge>
              {document.referencia && <span className="text-sm font-medium text-muted-foreground">{document.referencia}</span>}
              {document.ano && <span className="text-xs text-muted-foreground">({document.ano})</span>}
              {document.status && (
                <Badge variant={document.status === 'vigente' ? 'default' : 'destructive'} className="text-xs">
                  {document.status}
                </Badge>
              )}
            </div>
            
            {/* Informações adicionais da nova estrutura */}
            {(document.area || document.jurisdicao || document.orgaoResponsavel) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {document.area && <span>📋 {document.area}</span>}
                {document.jurisdicao && <span>🏛️ {document.jurisdicao}</span>}
                {document.orgaoResponsavel && <span>🏢 {document.orgaoResponsavel}</span>}
              </div>
            )}
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
          {/* Índice de navegação rápida para artigos */}
          {document.artigos && document.artigos.length > 5 && (
            <Collapsible open={showIndex} onOpenChange={setShowIndex}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span>Índice de Artigos ({document.artigos.length})</span>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {document.artigos.map((artigo) => (
                    <Button
                      key={artigo.numero}
                      variant="ghost"
                      size="sm"
                      onClick={() => scrollToArticle(artigo.numero)}
                      className="justify-start text-xs h-8"
                    >
                      Art. {artigo.numero}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

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