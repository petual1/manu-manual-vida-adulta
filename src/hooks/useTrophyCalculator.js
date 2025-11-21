import { useMemo } from 'react';
import { taskKnowledgeBase } from '../taskEngine';

export function useTrophyCalculator(profileInterests, allUserTasks) {
    const calculatedTrophies = useMemo(() => {
        if (!profileInterests || !allUserTasks) return [];
        
        const completedTaskIds = new Set(
            allUserTasks
                .filter(task => task.status === 'concluída')
                .map(task => task.id)
        );

        return profileInterests.filter(interestName => {
            const interestData = taskKnowledgeBase[interestName];
            if (!interestData) return false; 

            const totalTasksForInterest = interestData.tasks.length;
            if (totalTasksForInterest === 0) return false; 

            let completedCount = 0;
            for (const task of interestData.tasks) {
                if (completedTaskIds.has(task.id)) {
                    completedCount++;
                }
            }
            
            return completedCount === totalTasksForInterest;
        });

    }, [profileInterests, allUserTasks]);

    return calculatedTrophies;
}