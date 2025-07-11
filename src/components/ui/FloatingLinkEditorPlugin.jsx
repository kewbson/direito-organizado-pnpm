// Arquivo: src/components/ui/FloatingLinkEditorPlugin.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { getSelectedNode } from '../../utils/getSelectedNode'; // Criaremos este utilitário
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { Edit2Icon, CheckIcon, UnlinkIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

// Componente da UI da toolbar flutuante
function FloatingLinkEditor({ editor, isLink, setIsLink, anchorElem }) {
  const editorRef = useRef(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastSelection, setLastSelection] = useState(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRect = nativeSelection.getRangeAt(0).getBoundingClientRect();
      editorElem.style.top = `${domRect.top + domRect.height + 4}px`;
      editorElem.style.left = `${domRect.left + window.scrollX}px`;
    } 
    
// Lógica para controlar a visibilidade do editor flutuante
    // Ele deve aparecer se houver uma seleção de texto
    // E se a seleção estiver dentro de um LinkNode ou o nó selecionado for um LinkNode
    if ($isRangeSelection(selection) && !nativeSelection.isCollapsed && rootElement.contains(nativeSelection.anchorNode)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
        // Atualiza a URL do link no input, se estiver editando um link existente
        editor.update(() => {
          const latestSelection = $getSelection();
          if ($isRangeSelection(latestSelection)) {
            const selectedNode = getSelectedNode(latestSelection);
            const selectedParent = selectedNode.getParent();
            const linkNode = $isLinkNode(selectedNode) ? selectedNode : ($isLinkNode(selectedParent) ? selectedParent : null);
            if (linkNode) {
              setLinkUrl(linkNode.getURL());
            }
          }
        });
      } else {
        setIsLink(false);
      }
    } else {
      setIsLink(false);
      setIsEditing(false); // Garante que o modo de edição seja desativado
      setLinkUrl(''); // Limpa a URL do link quando não há link
    }
    
    setLastSelection(selection);
  }, [editor]);
    
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateLinkEditor();
      });
    });
  }, [editor, updateLinkEditor]);

    return (
    <div ref={editorRef} className="link-editor" style={{ opacity: isLink && lastSelection ? 1 : 0, pointerEvents: isLink && lastSelection ? 'auto' : 'none' }}>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (lastSelection) {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                  setIsEditing(false);
                }
              }
            }}
          />
          <Button size="sm" onClick={() => {
            if (lastSelection) {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
              setIsEditing(false);
            }
          }}>
            <CheckIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <a
            href={linkUrl.startsWith('http://') || linkUrl.startsWith('https://') ? linkUrl : `https://${linkUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-editor-url"
          >
            {linkUrl}
          </a>
          <Button size="icon" className="h-6 w-6" variant="ghost" onClick={() => setIsEditing(true)}>
            <Edit2Icon className="h-3 w-3" />
          </Button>
<Button size="icon" className="h-6 w-6" variant="ghost" onClick={() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
}}>
  <UnlinkIcon className="h-3 w-3" />
</Button>
        </div>
      )}
    </div>
  );
}


// O Plugin principal que controla a visibilidade do editor flutuante
export function FloatingLinkEditorPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isLink, setIsLink] = useState(false);
  const anchorElem = typeof window !== 'undefined' ? document.body : null;

  const updateListener = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = getSelectedNode(selection);
        const parent = node.getParent();
        if ($isLinkNode(parent) || $isLinkNode(node)) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      }
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateListener();
        return false;
      },
      1,
    );
  }, [editor, updateListener]);

  if (!anchorElem) return null;

  return createPortal(
    <FloatingLinkEditor
      editor={editor}
      isLink={isLink}
      setIsLink={setIsLink}
      anchorElem={anchorElem}
    />,
    anchorElem
  );
}