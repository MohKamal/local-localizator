import { useState } from "react";
import "./App.css";
import { ProjectProvider } from "./providers/project.provider";
import { I18nProvider } from "./providers/i18n.provider";
import Dashboard from "./components/dashboard/dahsboard";
import { ViewProvider } from "./providers/view.provider";
import SplashScreen from "./components/Splash";

function App() {
  const [currentView, setCurrentView] = useState("splash");

  const handleSplashComplete = () => {
    setCurrentView("dashboard");
  };

  if (currentView === "splash") {
    return (
      <I18nProvider>
        <ProjectProvider>
          <SplashScreen onComplete={handleSplashComplete} />
        </ProjectProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <ProjectProvider>
        <ViewProvider>
          <Dashboard />
        </ViewProvider>
      </ProjectProvider>
    </I18nProvider>
  );
}

export default App;
