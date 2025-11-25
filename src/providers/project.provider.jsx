import React, { createContext, useContext, useState } from "react";

// Create the context with a default value
const ProjectContext = createContext({
  selectedProject: null,
  setSelectedProject: () => {},
});

// Custom hook to use the context
export const useProject = () => {
  return useContext(ProjectContext);
};

// Provider component that will wrap your app
export const ProjectProvider = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
