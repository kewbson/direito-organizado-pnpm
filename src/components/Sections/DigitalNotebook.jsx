import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, BookOpen, Calendar, Filter, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LexicalEditor } from '@/components/ui/LexicalEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/contexts/DataContext'
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { NoteViewer } from './NoteViewer';

export function DigitalNotebook() {
  const { notes, addNote, updateNote, deleteNote, toggleNoteFavorite } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: ''
  })
  const [viewingNote, setViewingNote] = useState(null);

  // Usar o hook useDebounce para o conteúdo do editor
  const debouncedContent = useDebounce(formData.content, 1000); // Salva após 1 segundo de inatividade

  // Efeito para salvar automaticamente no Firebase quando o conteúdo debounced muda e estamos editando
  useEffect(() => {
    // Só tenta salvar se estivermos em modo de edição (editingId)
    // E se o conteúdo debounced for diferente do que já está na nota (para evitar saves desnecessários ao carregar)
    if (editingId && debouncedContent !== null && debouncedContent !== undefined) {
      // Encontrar a nota original para evitar salvamento se o conteúdo não mudou de fato
      const originalNote = notes.find(n => n.id === editingId);
      if (originalNote && originalNote.content !== debouncedContent) {
        console.log('Salvando automaticamente anotação:', editingId);
        updateNote(editingId, { content: debouncedContent });
      }
    }
  }, [debouncedContent, editingId, updateNote, notes]); // Dependências do useEffect
  
  // Função para truncar o conteúdo do Lexical
  const truncateContent = (lexicalContent, maxLength) => {
    try {
      const parsedContent = JSON.parse(lexicalContent);
      let plainText = '';
      parsedContent.root.children.forEach(node => {
        if (node.type === 'paragraph' && node.children) {
          node.children.forEach(child => {
            if (child.type === 'text' && child.text) {
              plainText += child.text;
            }
          });
        }
      });
      if (plainText.length > maxLength) {
        return plainText.substring(0, maxLength) + '...';
      }
      return plainText || 'Sem conteúdo.';
    } catch (e) {
      console.error("Erro ao analisar conteúdo Lexical:", e);
      return 'Conteúdo inválido.';
    }
  };

  // Filtrar anotações
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject
    const matchesFavorites = !showFavoritesOnly || note.isFavorite
    return matchesSearch && matchesSubject && matchesFavorites
  })

  // Obter matérias únicas
  const subjects = [...new Set(notes.map(note => note.subject))]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

const handleSubmit = async (e) => { 
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim() || !formData.content) {
      toast.error("Por favor, preencha o título, a matéria e o conteúdo.");
      return;
    }

    // Ação de adicionar nova anotação
    const result = await addNote(formData);
    
    if (result && result.success) {
      setFormData({ title: '', subject: '', content: null });
      setIsCreating(false);
      setEditingId(null);
      toast.success("Anotação criada com sucesso!");
      // Opcional: Mostrar um toast de sucesso aqui para "Nova Anotação criada!"
    } else {
      toast.error(result?.error || "Ocorreu um erro ao criar a anotação.");
    }
  };

  const handleEdit = (note) => {
    setFormData({
      title: note.title,
      subject: note.subject,
      content: note.content
    })
    setEditingId(note.id)
    setIsCreating(true)
  }

const handleCancel = () => {
  setFormData({ title: '', subject: '', content: null })
  setIsCreating(false)
  setEditingId(null)
}

  const handleDelete = async (id) => { // <-- Tornar a função assíncrona
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      const result = await deleteNote(id); // <-- Usar await
      if (result && result.success) {
        toast.success("Anotação excluída com sucesso!"); // <-- ADICIONADO
      } else {
        toast.error(result?.error || "Erro ao excluir anotação."); // <-- ADICIONADO
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
          <div>
<div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
  <div>
    {/* Ícone + Título */}
    <div className="flex items-center justify-center gap-3">
      <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
      <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
        Caderno Digital
      </h1>
    </div>

    {/* Descrição */}
    <p className="text-muted-foreground text-lg text-center mt-2">
      Suas anotações de estudo organizadas por matéria
    </p>
  </div>
</div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
                  <Button 
          onClick={() => setIsCreating(true)}
          className="bg-primary hover:bg-primary/90 mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Nova Anotação
        </Button>
      </div>
        </div>
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar anotações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="all">Todas as matérias</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={showFavoritesOnly ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
          >
            <Star className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            {showFavoritesOnly ? 'Mostrando Favoritos' : 'Mostrar Favoritos'}
          </Button>
        </div>
      </div>

      {/* Formulário de criação/edição */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Anotação' : 'Nova Anotação'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Contratos - Teoria Geral"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Matéria</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Ex: Direito Civil"
                    required
                  />
                </div>
              </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Conteúdo</Label>
                        <LexicalEditor
                    // Usaremos o `initialEditorState` para carregar notas salvas
                    initialEditorState={formData.content}
                    // O `onChange` do nosso editor nos devolverá o estado mais recente
                onChange={(editorState) => {
                setFormData((prev) => ({ ...prev, content: editorState }));
                }}
                />
                </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  {editingId ? 'Salvar Alterações' : 'Criar Anotação'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de anotações */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium primary hover:primary/90 mb-2">
              {notes.length === 0 ? 'Nenhuma anotação criada' : 'Nenhuma anotação encontrada'}
            </h3>
            <p className="text-gray-500 mb-4">
              {notes.length === 0 
                ? 'Comece criando sua primeira anotação de estudo'
                : 'Tente ajustar os filtros de busca'
              }
            </p>
            {notes.length === 0 && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira anotação
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card 
              key={note.id} 
              className="hover:shadow-md transition-shadow cursor-pointer" // Adicionado cursor-pointer
              onClick={() => setViewingNote(note)} // <-- ADICIONADO onClick aqui
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{note.title}</CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      {note.subject}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleNoteFavorite(note.id)}
                      className={`${note.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      <Star className={`h-4 w-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 dark:text-gray-300">
                  {note.content ? truncateContent(note.content, 150) : 'Sem conteúdo.'}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  Atualizado em {formatDate(note.lastModified || note.date)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
          {/* Renderiza o NoteViewer se uma nota estiver selecionada para visualização */}
      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onEdit={(noteToEdit) => {
            setViewingNote(null); // Fecha o visualizador
            handleEdit(noteToEdit); // Abre o formulário de edição
          }}
          onDelete={(noteToDelete) => handleDelete(noteToDelete.id)} // Passa a função de deleção para o viewer
          toggleNoteFavoriteProp={toggleNoteFavorite} // Passa a função de favoritar
        />
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-amber-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-primary hover:primary/90">Total de Anotações</p>
                <p className="text-2xl font-bold text-primary hover:primary/90">{notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-primary hover:primary/90">Matérias</p>
                <p className="text-2xl font-bold text-primary hover:primary/90">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-primary hover:primary/90">Resultados</p>
                <p className="text-2xl font-bold text-primary hover:primary/90">{filteredNotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

