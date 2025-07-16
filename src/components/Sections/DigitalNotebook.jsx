import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, BookOpen, Calendar, Filter, Star, Tag, FileText, Clock, TrendingUp } from 'lucide-react'
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
  const [selectedTags, setSelectedTags] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    tags: []
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

  // Filtrar anotações com busca aprimorada
  const filteredNotes = notes.filter(note => {
    // Busca no título e conteúdo (incluindo conteúdo do Lexical)
    const searchContent = searchTerm.toLowerCase()
    const titleMatch = note.title.toLowerCase().includes(searchContent)
    
    // Busca no conteúdo do Lexical
    let contentMatch = false
    try {
      if (note.content) {
        const parsedContent = JSON.parse(note.content)
        let plainText = ''
        parsedContent.root.children.forEach(node => {
          if (node.type === 'paragraph' && node.children) {
            node.children.forEach(child => {
              if (child.type === 'text' && child.text) {
                plainText += child.text + ' '
              }
            })
          }
        })
        contentMatch = plainText.toLowerCase().includes(searchContent)
      }
    } catch (e) {
      // Fallback para busca simples se não conseguir parsear
      contentMatch = note.content?.toLowerCase().includes(searchContent) || false
    }
    
    // Busca nas tags
    const tagsMatch = note.tags?.some(tag => 
      tag.toLowerCase().includes(searchContent)
    ) || false
    
    const matchesSearch = titleMatch || contentMatch || tagsMatch
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject
    const matchesFavorites = !showFavoritesOnly || note.isFavorite
    
    // Filtro por tags selecionadas
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => note.tags?.includes(tag))
    
    return matchesSearch && matchesSubject && matchesFavorites && matchesTags
  })

  // Obter matérias únicas
  const subjects = [...new Set(notes.map(note => note.subject))]
  
  // Obter todas as tags únicas
  const allTags = [...new Set(notes.flatMap(note => note.tags || []))]
  
  // Função para adicionar/remover tags do filtro
  const toggleTagFilter = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

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
      content: note.content,
      tags: note.tags || []
    })
    setEditingId(note.id)
    setIsCreating(true)
  }

const handleCancel = () => {
  setFormData({ title: '', subject: '', content: null, tags: [] })
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
      {/* Header melhorado */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              Caderno Digital
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Suas anotações de estudo organizadas por matéria. Crie, edite e organize seu conhecimento de forma eficiente.
        </p>
        <div className="mt-6">
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Nova Anotação
          </Button>
        </div>
      </div>
      {/* Filtros melhorados */}
      <Card className="hover:shadow-md transition-all duration-200 bg-gradient-orange-400 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-700 dark:text-orange-400">
            <Filter className="h-5 w-5 mr-2" />
            Filtros e Busca
          </CardTitle>
          <CardDescription>
            Encontre rapidamente suas anotações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar anotações, conteúdo ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 bg-white"
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
                className={showFavoritesOnly ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"}
              >
                <Star className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                {showFavoritesOnly ? 'Favoritos' : 'Mostrar Favoritos'}
              </Button>
            </div>
          </div>
          
          {/* Filtro de Tags */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Filtrar por Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTagFilter(tag)}
                    className={`text-xs ${
                      selectedTags.includes(tag) 
                        ? "bg-orange-500 hover:bg-orange-600 text-white" 
                        : "bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTags([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de criação/edição */}
      {isCreating && (
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
              <Edit className="h-5 w-5 mr-2" />
              {editingId ? 'Editar Anotação' : 'Nova Anotação'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Modifique os dados da sua anotação' : 'Crie uma nova anotação de estudo'}
            </CardDescription>
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
                    className="bg-white dark:bg-gray-800"
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
                    className="bg-white dark:bg-gray-800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      setFormData(prev => ({ ...prev, tags }))
                    }}
                    placeholder="Ex: contratos, teoria geral, obrigações"
                    className="bg-white dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500">
                    Use tags para organizar melhor suas anotações
                  </p>
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
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  {editingId ? 'Salvar Alterações' : 'Criar Anotação'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de anotações */}
      {filteredNotes.length === 0 ? (
        <Card className="over:shadow-md transition-all duration-200 bg-gradient-green-300 from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
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
              className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-orange-400" 
              onClick={() => setViewingNote(note)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{note.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {note.subject}
                      </Badge>
                      {note.isFavorite && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Favorito
                        </Badge>
                      )}
                    </div>
                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
                          >
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleNoteFavorite(note.id)
                      }}
                      className={`${note.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      <Star className={`h-4 w-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(note)
                      }}
                      className="text-gray-600 hover:text-orange-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(note.id)
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 dark:text-gray-300">
                  {note.content ? truncateContent(note.content, 120) : 'Sem conteúdo.'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(note.lastModified || note.date)}
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    <span>Clique para ver</span>
                  </div>
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

      {/* Estatísticas melhoradas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-all duration-200 bg-gradient-orange-300 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg mr-3">
                <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Total de Anotações</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                <Filter className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Matérias</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="over:shadow-md transition-all duration-200 bg-gradient-green-300 from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Resultados</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{filteredNotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}