import React, { createContext, useState, useContext, ReactNode } from "react";

type Job = {
  name: string;
  positions: String[];
};

// Define the context type
type JobsContextType = {
  jobs: any;
  setJobs: (jobs: any) => void;
};

// Create the context
const JobsContext = createContext<JobsContextType | undefined>(undefined);

// Provider component
export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job | null>({
    name: "",
    positions: [],
  });

  return (
    <JobsContext.Provider
      value={{
        jobs,
        setJobs,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

// Hook to use the context
const useJobsContext = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobsContext must be used within an AuthContext");
  }
  return context;
};

export default useJobsContext;
