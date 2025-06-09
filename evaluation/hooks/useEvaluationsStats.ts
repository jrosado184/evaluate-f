import { useEffect, useState } from "react";

const useEvaluationStats = (evaluations = []) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [percentComplete, setPercentComplete] = useState(0);
  const [percentInProgress, setPercentInProgress] = useState(0);

  useEffect(() => {
    if (!evaluations || evaluations.length === 0) return;

    let completed = 0;
    let inProgress = 0;

    evaluations.forEach((evalDoc: any) => {
      if (evalDoc.status === "complete") completed += 1;
      else if (evalDoc.status === "in_progress") inProgress += 1;
    });

    const total = completed + inProgress;
    const percentDone = total > 0 ? Math.round((completed / total) * 100) : 0;
    const percentPending =
      total > 0 ? Math.round((inProgress / total) * 100) : 0;

    setCompletedCount(completed);
    setInProgressCount(inProgress);
    setPercentComplete(percentDone);
    setPercentInProgress(percentPending);
  }, [evaluations]);

  return {
    completedCount,
    inProgressCount,
    percentComplete,
    percentInProgress,
  };
};

export default useEvaluationStats;
