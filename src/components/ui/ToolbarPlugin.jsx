// Arquivo: src/components/ui/ToolbarPlugin.jsx

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  // Comandos e seletores novos:
  $isRootNode,
  $isParagraphNode,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, CodeIcon, Heading1Icon, Heading2Icon, ListIcon, ListOrderedIcon, LinkIcon } from 'lucide-react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator'; 

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [isLink, setIsLink] = useState(false);

const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Formatação de texto (inline)
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      // Verifica se a seleção é um link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
      // Formatação de bloco (block)
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      
      if ($isHeadingNode(element)) {
        const tag = element.getTag();
        setBlockType(tag);
      } else if ($isListNode(element)) {
        const parentList = element;
        const listType = parentList.getListType();
        setBlockType(listType);
      } else {
        setBlockType('paragraph');
      }
    }
  }, []);

  useEffect(() => {
    // Adiciona um "ouvinte" que chama updateToolbar sempre que o editor muda
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [updateToolbar, editor]);
    
    const insertLink = useCallback(() => {
    if (!isLink) {
      const url = prompt('Digite a URL do link:');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
<div className="toolbar flex items-center gap-1 p-2 border-b border-input bg-card flex-wrap">
      {/* Seletor de Bloco (Títulos e Parágrafo) */}
      <Select value={blockType} onValueChange={(value) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (value === 'paragraph') {
                    $setBlocksType(selection, () => $createParagraphNode());
                } else if (value === 'h1' || value === 'h2') {
                    $setBlocksType(selection, () => $createHeadingNode(value));
                }
            }
        });
      }}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tipo de Bloco" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Parágrafo</SelectItem>
          <SelectItem value="h1">Título 1</SelectItem>
          <SelectItem value="h2">Título 2</SelectItem>
        </SelectContent>
      </Select>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Botões de formatação de texto */}
      <Button type="button" variant={isBold ? 'secondary' : 'ghost'} size="sm" onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'); }}>
        <BoldIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant={isItalic ? 'secondary' : 'ghost'} size="sm" onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'); }}>
        <ItalicIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant={isUnderline ? 'secondary' : 'ghost'} size="sm" onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'); }}>
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant={isStrikethrough ? 'secondary' : 'ghost'} size="sm" onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'); }}>
        <StrikethroughIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant={isCode ? 'secondary' : 'ghost'} size="sm" onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code'); }}>
        <CodeIcon className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Botões de Lista */}
      <Button type="button" variant={blockType === 'ul' ? 'secondary' : 'ghost'} size="sm" onClick={() => { editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined); }}>
        <ListIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant={blockType === 'ol' ? 'secondary' : 'ghost'} size="sm" onClick={() => { editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined); }}>
        <ListOrderedIcon className="h-4 w-4" />
      </Button>
    
      {/* NOVO BOTÃO DE LINK AQUI */}
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <Button
        type="button"
        variant={isLink ? 'secondary' : 'ghost'}
        size="sm"
        onClick={insertLink}
        aria-label="Inserir Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
      
      
  );
}