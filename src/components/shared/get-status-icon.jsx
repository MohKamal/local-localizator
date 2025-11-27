import { Play, Clock, FileText } from "lucide-react";

const getStatusIcon = (status) => {
  switch (status) {
    case "completed":
      return <FileText className="w-4 h-4" />;
    case "missing":
      return <Clock className="w-4 h-4" />;
    case "paused":
      return <Play className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export default getStatusIcon;
