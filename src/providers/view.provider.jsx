import React, { createContext, useContext, useState } from "react";

// Create the context with a default value
const ViewContext = createContext({
  currentView: "dashboard",
  setCurrentView: () => {},
});

// Custom hook to use the context
export const useView = () => {
  return useContext(ViewContext);
};

// Provider component that will wrap your app
export const ViewProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState("dashboard");

  return (
    <ViewContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </ViewContext.Provider>
  );
};
