import React from 'react';
import { X, Edit, Trash2, CalendarDays, Target, Clock, CheckCircle, AlertCircle, Circle, Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';


export function StudyPlanViewer({ plan, onClose, onEdit, onDelete }) {
  const { 
    notes, 
    updateStudyPlan, 
    deleteStudyPlan,
    addTaskToStudyPlan,    
    toggleTaskCompletion,  
    deleteTaskFromStudyPlan 
  } = useData();

  // Garante que estamos usando a versão mais recente do plano do contexto de dados
  const currentPlan = useData().studyPlans.find(p => p.id === plan.id);
    
  const [newTaskText, setNewTaskText] = React.useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    // Adiciona { timeZone: 'UTC' } para que a data não seja deslocada pelo fuso horário local.
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluido': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'em-andamento': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'pendente': return <Circle className="h-5 w-5 text-gray-400" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate) return false;
    return status !== 'concluido' && new Date(dueDate) < new Date();
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Tem certeza que deseja excluir este plano de estudo?')) {
      const result = await deleteStudyPlan(currentPlan.id);
      if (result?.success) {
        toast.success("Plano de estudo excluído com sucesso!");
        onClose(); // Fecha o visualizador após a exclusão
      } else {
        toast.error(result?.error || "Erro ao excluir plano de estudo.");
      }
    }
  };

  // Funções para gerenciar o progresso diretamente no visualizador (opcional)
  const handleProgressUpdate = async (newProgress) => {
    if (!currentPlan) return;
    const status = newProgress === 100 ? 'concluido' : newProgress > 0 ? 'em-andamento' : 'pendente';
    const result = await updateStudyPlan(currentPlan.id, { progress: newProgress, status });
    if (result?.success) {
      toast.success("Progresso do plano atualizado!");
    } else {
      toast.error(result?.error || "Erro ao atualizar progresso.");
    }
  };

  if (!currentPlan) {
    return (
      <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <CardContent className="p-8 text-center bg-background rounded-lg shadow-lg">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Plano de estudo não encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            Este plano pode ter sido excluído ou não existe.
          </p>
          <Button onClick={onClose}>Voltar</Button>
        </CardContent>
      </Card>
    );
  }

  // Encontrar notas vinculadas
  const linkedNotesDetails = notes.filter(note => currentPlan.linkedNotes?.includes(note.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(currentPlan.status)}
                <CardTitle className="text-xl leading-tight">{currentPlan.title}</CardTitle>
                {isOverdue(currentPlan.dueDate, currentPlan.status) && (
                  <Badge variant="destructive" className="text-xs">Atrasado</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary">{currentPlan.subject}</Badge>
                <Badge className={getPriorityColor(currentPlan.priority)}>
                  {currentPlan.priority?.charAt(0).toUpperCase() + currentPlan.priority?.slice(1)}
                </Badge>
                {currentPlan.dueDate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    Prazo: {formatDate(currentPlan.dueDate)}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-6 space-y-6 custom-scrollbar">
          {/* Descrição */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Descrição</h3>
            <p className="text-muted-foreground">{currentPlan.description || 'Nenhuma descrição fornecida.'}</p>
          </div>

          <Separator />

          {/* Progresso */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Progresso</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Status: {currentPlan.status?.charAt(0).toUpperCase() + currentPlan.status?.slice(1)}</span>
                <span className="text-muted-foreground">{currentPlan.progress || 0}% Concluído</span>
              </div>
              <Progress value={currentPlan.progress || 0} className="h-2" />
              <div className="flex space-x-2">
                {[0, 25, 50, 75, 100].map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={currentPlan.progress === value ? "default" : "outline"}
                    onClick={() => handleProgressUpdate(value)}
                    className="text-xs"
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Notas Vinculadas */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              Notas Vinculadas
            </h3>
            {linkedNotesDetails.length > 0 ? (
              <ul className="space-y-2">
                {linkedNotesDetails.map(note => (
                  <li key={note.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {note.title} ({note.subject})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhuma nota do Caderno Digital vinculada a este plano.</p>
            )}
          </div>

          <Separator />

          {/* Tópicos de Estudo / Subtarefas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Tópicos de Estudo / Subtarefas
            </h3>
            
            {/* Input para Nova Tarefa */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newTaskText.trim()) {
                const result = await addTaskToStudyPlan(currentPlan.id, newTaskText);
                if (result.success) {
                  setNewTaskText(''); // Limpa o input
                  toast.success("Subtarefa adicionada!");
                } else {
                  toast.error(result.error || "Erro ao adicionar subtarefa.");
                }
              }
            }} className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Adicionar nova subtarefa..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            {/* Lista de Subtarefas */}
            {currentPlan.tasks && currentPlan.tasks.length > 0 ? (
              <div className="space-y-3">
                {currentPlan.tasks
                  .sort((a, b) => a.completed - b.completed || new Date(a.createdAt) - new Date(b.createdAt)) // Ordena: incompletas primeiro, depois por data
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={async (e) => {
                          const result = await toggleTaskCompletion(currentPlan.id, task.id, e.target.checked);
                          if (!result.success) {
                            toast.error(result.error || "Erro ao atualizar subtarefa.");
                          }
                        }}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (window.confirm('Tem certeza que deseja remover esta subtarefa?')) {
                            const result = await deleteTaskFromStudyPlan(currentPlan.id, task.id);
                            if (result.success) {
                              toast.success("Subtarefa removida!");
                            } else {
                              toast.error(result.error || "Erro ao remover subtarefa.");
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum tópico de estudo adicionado ainda.</p>
            )}
          </div>
            
        </CardContent>

        <div className="flex-shrink-0 border-t p-4 flex justify-end items-center bg-background space-x-2">
          <Button variant="default" onClick={() => onEdit(currentPlan)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Plano
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Excluir Plano
          </Button>
        </div>
      </Card>
    </div>
  );
}