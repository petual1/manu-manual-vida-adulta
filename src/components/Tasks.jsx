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

export default function Tasks({ interest, profile, onNavigate }) {
    const [firestoreTasks, setFirestoreTasks] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [activeTab, setActiveTab] = useState('pendentes'); 
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) runTaskEngine(profile, currentUser.uid); 
    }, [profile]); 

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) { setIsLoading(false); return; }

        setIsLoading(true); 
        const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
        const q = query(tasksRef, where("category", "==", interest));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userTasks = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
            setFirestoreTasks(userTasks);
            setIsLoading(false); 
        });
        return () => unsubscribe();
    }, [interest]); 

    const allTasks = useMemo(() => {
        const merged = mergeTaskData(firestoreTasks);
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
                        if (depTask) unlockMessage = `Complete "${depTask.title}" primeiro.`;
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
            .sort((a, b) => (a.isLocked === b.isLocked) ? a.title.localeCompare(b.title) : a.isLocked ? 1 : -1);
        const _completed = allTasks
            .filter(task => task.status === 'concluída')
            .sort((a, b) => a.title.localeCompare(b.title));
        return { pendingTasks: _pending, completedTasks: _completed }; 
    }, [allTasks]);

    const currentSelectedTask = useMemo(() => allTasks.find(t => t.docId === selectedTaskId), [selectedTaskId, allTasks]);
    const progress = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    
    const hasShownRewardRef = useRef(false);
    useEffect(() => {
        if (progress === 100 && allTasks.length > 0 && !profile?.trophies?.includes(interest) && !hasShownRewardRef.current) {
            hasShownRewardRef.current = true;
            setIsRewardModalOpen(true); 
            const awardTrophy = async () => {
                const currentUser = auth.currentUser;
                if (currentUser) await updateDoc(doc(db, 'users', currentUser.uid), { trophies: arrayUnion(interest) });
            };
            awardTrophy();
        }
    }, [progress, allTasks, interest, profile]); 

    const handleToggleTaskStatus = async () => {
        if (!currentSelectedTask || !auth.currentUser) return; 
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', currentSelectedTask.docId), { status: 'concluída' });
            toast.success("Tarefa Concluída!");
            await runTaskEngine(profile, auth.currentUser.uid);
        } catch (error) {
            toast.error("Erro ao salvar.");
        }
    };

    const handleTaskClick = (task) => {
        if (task.isLocked) {
             toast("Tarefa Bloqueada", { description: task.unlockMessage, icon: <i className="fas fa-lock"></i> });
             return;
        }
        setSelectedTaskId(task.docId);
    };

    if (isLoading) return <div className="spinner-container"><div className="spinner"></div></div>;

    if (selectedTaskId && currentSelectedTask) {
        return (
            <div className="overlay-content-fade">
                <TaskDetailView 
                    task={currentSelectedTask} 
                    onBackClick={() => setSelectedTaskId(null)}
                    onConfirmCompletion={() => { handleToggleTaskStatus(); setSelectedTaskId(null); }} 
                    onNavigate={onNavigate} 
                />
            </div>
        );
    }

    const tasksToDisplay = activeTab === 'pendentes' ? pendingTasks : completedTasks;

    return (
        <div className="overlay-content-fade">
            {}
            <div className="modern-task-header">
                <div className="header-info">
                    <h3>Seu Progresso</h3>
                    <span className="progress-percent">{Math.round(progress)}%</span>
                </div>
                <div className="modern-progress-track">
                    <div className="modern-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            
            {}
            <div className="modern-tabs-row">
                <button className={`modern-tab ${activeTab === 'pendentes' ? 'active' : ''}`} onClick={() => setActiveTab('pendentes')}>
                    A Fazer ({pendingTasks.length})
                </button>
                <button className={`modern-tab ${activeTab === 'concluidas' ? 'active' : ''}`} onClick={() => setActiveTab('concluidas')}>
                    Concluídas ({completedTasks.length})
                </button>
            </div>
            
            {}
            <div className="tasks-stack-grid">
                {tasksToDisplay.length > 0 ? tasksToDisplay.map(task => (
                    <div 
                        key={task.docId} 
                        className={`modern-task-card ${task.priority.toLowerCase()} ${task.isLocked ? 'locked' : ''}`}
                        onClick={() => handleTaskClick(task)}
                    >
                        <div className="task-card-icon">
                            {task.isLocked ? <i className="fas fa-lock"></i> : 
                             task.status === 'concluída' ? <i className="fas fa-check-circle"></i> : 
                             <i className="fas fa-circle"></i>}
                        </div>
                        
                        <div className="task-card-content">
                            <h4>{task.title}</h4>
                            {task.isLocked && <p className="lock-msg">{task.unlockMessage}</p>}
                            {!task.isLocked && <p className="task-desc-preview">{task.description.substring(0, 60)}...</p>}
                        </div>
                        
                        <div className="task-card-arrow">
                            <i className="fas fa-chevron-right"></i>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state-small">
                        <i className={`fas ${activeTab === 'pendentes' ? 'fa-check-double' : 'fa-clipboard-list'}`}></i>
                        <p>{activeTab === 'pendentes' ? 'Tudo feito por aqui!' : 'Nenhuma tarefa concluída ainda.'}</p>
                    </div>
                )}
            </div>

            <CompletionRewardModal isOpen={isRewardModalOpen} onClose={() => setIsRewardModalOpen(false)} interestName={interest} />
        </div>
    );
}