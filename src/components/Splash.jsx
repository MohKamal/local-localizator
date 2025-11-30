import { useEffect } from "react";
import logo from "./../assets/logo.png";

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="mb-8">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <img src={logo} style={{width: 64, height: 64}}/>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Localize with Ease,
            <br />
            <span className="text-yellow-300">Develop with Confidence.</span>
          </h1>
        </div>
        <div className="w-32 h-1 bg-white/30 rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
