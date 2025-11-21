import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, where, arrayUnion } 
    from 'firebase/firestore';
import { db, auth } from '../firebase';
import { runTaskEngine, taskKnowledgeBase } from '../taskEngine';
import { toast } from 'sonner';
import TaskDetailView from './TaskDetailView';
import CompletionRewardModal from './CompletionRewardModal'; 

const mergeTaskData = (firestoreTasks) => {
    const allKnowledgeTasks = Object.values(taskKnowledgeBase).flatMap(cat => cat.tasks);
    
    return firestoreTasks.map(task => {
        const knowledgeData = allKnowledgeTasks.find(kbTask => kbTask.id === task.id);
        
        return {
            ...task, 
            description: knowledgeData?.description || "Descrição em breve...",
            steps: knowledgeData?.steps || [], 
        };
    });
};

const getPriorityClass = (priority) => {
    switch (priority) { 
        case 'Alta': return 'priority-high'; 
        case 'Média': return 'priority-medium'; 
        case 'Baixa': return 'priority-low'; 
        default: return ''; 
    }
};


export default function Tasks({ interest, profile, onNavigate }) {
    const [firestoreTasks, setFirestoreTasks] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [activeTab, setActiveTab] = useState('pendentes'); 
    
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        runTaskEngine(profile, currentUser.uid); 
    }, [profile]); 

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setIsLoading(false); 
            return;
        }

        setIsLoading(true); 
        const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
        const q = query(tasksRef, where("category", "==", interest));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userTasks = snapshot.docs.map(doc => ({
                ...doc.data(),
                docId: doc.id 
            }));
            setFirestoreTasks(userTasks);
            setIsLoading(false); 
        }, (error) => {
            console.error("Erro ao buscar tarefas:", error);
            setIsLoading(false); 
        });

        return () => unsubscribe();
    }, [interest]); 

    const allTasks = useMemo(() => {
        const merged = mergeTaskData(firestoreTasks, taskKnowledgeBase);
        const completedIds = new Set(merged.filter(t => t.status === 'concluída').map(t => t.id));

        return merged.map(task => {
            const knowledgeTask = taskKnowledgeBase[task.category]?.tasks.find(t => t.id === task.id);
            const dependencies = knowledgeTask?.dependencies || [];
            
            let isLocked = false;
            let unlockMessage = "";

            if (dependencies.length > 0) {
                for (const depId of dependencies) {
                    if (!completedIds.has(depId)) {
                        isLocked = true;
                        const depTask = Object.values(taskKnowledgeBase).flatMap(cat => cat.tasks).find(t => t.id === depId);
                        if (depTask) {
                            unlockMessage = `Complete a tarefa: "${depTask.title}" para desbloquear.`;
                        }
                        break;
                    }
                }
            }
            return { ...task, isLocked, unlockMessage };
        });
    }, [firestoreTasks]);

    const { pendingTasks, completedTasks } = useMemo(() => {
        const _pending = allTasks
            .filter(task => task.status === 'pendente')
            .sort((a, b) => {
                if (a.isLocked && !b.isLocked) return 1;
                if (!a.isLocked && b.isLocked) return -1;
                return a.title.localeCompare(b.title);
            });
        const _completed = allTasks
            .filter(task => task.status === 'concluída')
            .sort((a, b) => a.title.localeCompare(b.title));
        
        return { pendingTasks: _pending, completedTasks: _completed }; 
    }, [allTasks]);

    const currentSelectedTask = useMemo(() => {
        return allTasks.find(t => t.docId === selectedTaskId);
    }, [selectedTaskId, allTasks]);

    
    const progress = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    
    const hasShownRewardRef = useRef(false);

    useEffect(() => {
        if (progress === 100 && allTasks.length > 0) {
            
            const userTrophies = profile?.trophies || [];
            
            if (!userTrophies.includes(interest) && !hasShownRewardRef.current) {
                
                hasShownRewardRef.current = true;
                
                setIsRewardModalOpen(true); 
                
                const awardTrophy = async () => {
                    const currentUser = auth.currentUser;
                    if (!currentUser) return;
                    
                    const userRef = doc(db, 'users', currentUser.uid);
                    await updateDoc(userRef, {
                        trophies: arrayUnion(interest) 
                    });
                };
                awardTrophy();
            }
        }

        if (progress < 100) {
            hasShownRewardRef.current = false;
        }
        
    }, [progress, allTasks, interest, profile]); 


    const handleToggleTaskStatus = async () => {
        if (!currentSelectedTask) return; 

        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const taskRef = doc(db, 'users', currentUser.uid, 'tasks', currentSelectedTask.docId);
        
        try {
            await updateDoc(taskRef, { status: 'concluída' });
            
            toast.success(`Tarefa Concluída: "${currentSelectedTask.title}"`, {
                description: 'Fique de olho, novas tarefas podem ter sido desbloqueadas!',
            });
            
            await runTaskEngine(profile, currentUser.uid);
            
            
        } catch (error) {
            console.error("Erro ao atualizar a tarefa:", error);
            toast.error("Oops! Não foi possível salvar sua conclusão.");
        }
    };

    const handleTaskClick = (task) => {
        if (task.isLocked) {
             toast.info(task.unlockMessage, {
                icon: <i className="fas fa-lock" style={{marginRight: '10px', color: '#6c757d'}}></i>,
             });
            return; 
        }
        setSelectedTaskId(task.docId);
    };
    
    const handleBackClick = () => {
        setSelectedTaskId(null);
    };
    
    const handleConfirmCompletion = () => {
        handleToggleTaskStatus(); 
        handleBackClick(); 
    };


    if (isLoading) {
        return <div className="spinner-container"><div className="spinner"></div></div>;
    }

    if (selectedTaskId && currentSelectedTask) {
        return (
            <TaskDetailView 
                task={currentSelectedTask} 
                onBackClick={handleBackClick}
                onConfirmCompletion={handleConfirmCompletion} 
                onNavigate={onNavigate} 
            />
        );
    }

    const tasksToDisplay = activeTab === 'pendentes' ? pendingTasks : completedTasks;

    return (
        <>
            <div className="overlay-view">
                <div className="task-view-header">
                    <h3>Plano de Ação</h3>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span>{Math.round(progress)}% Concluído</span>
                </div>
                
                <div className="task-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'pendentes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pendentes')}
                    >
                        Pendentes ({pendingTasks.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'concluidas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('concluidas')}
                    >
                        Concluídas ({completedTasks.length})
                    </button>
                </div>
                
                <div className="checklist">
                    {tasksToDisplay.length > 0 ? tasksToDisplay.map(task => (
                        <button 
                            key={task.docId} 
                            className={`checklist-item ${getPriorityClass(task.priority)} ${task.isLocked ? 'locked' : ''}`}
                            onClick={() => handleTaskClick(task)}
                            disabled={task.isLocked && task.status !== 'concluída'} 
                        >
                            <div className="checklist-main">
                                <input 
                                    type="checkbox" 
                                    id={`task-list-${task.docId}`}
                                    checked={task.status === 'concluída'} 
                                    readOnly 
                                    style={{ pointerEvents: 'none' }}
                                />
                                <label htmlFor={`task-list-${task.docId}`} style={{ cursor: task.isLocked ? 'not-allowed' : 'pointer' }}>
                                    {task.title}
                                </label>
                            </div>
                            {task.isLocked && (
                                <small className="unlock-message">
                                    <i className="fas fa-lock" style={{marginRight: '5px'}}></i>
                                    {task.unlockMessage}
                                </small>
                            )}
                        </button>
                    )) : (
                        <p style={{textAlign: 'center', color: 'var(--secondary-text)', marginTop: '2rem'}}>
                            {activeTab === 'pendentes' 
                                ? 'Nenhuma tarefa pendente. Ótimo trabalho!' 
                                : 'Nenhuma tarefa foi concluída ainda.'}
                        </p>
                    )}
                </div>
            </div>

            <CompletionRewardModal 
                isOpen={isRewardModalOpen}
                onClose={() => setIsRewardModalOpen(false)}
                interestName={interest}
            />
        </>
    );
}