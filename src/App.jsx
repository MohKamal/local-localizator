import { useState } from "react";
import "./App.css";
import SplashScreen from "./components/Splash";
import ProjectDashboard from "./components/ProjectDashboard";
import { ProjectProvider } from "./providers/project.provider";
import { I18nProvider } from "./providers/i18n.provider";

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
        <ProjectDashboard />
      </ProjectProvider>
    </I18nProvider>
  );
}

export default App;
