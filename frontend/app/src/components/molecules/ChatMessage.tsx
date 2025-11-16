import { useState } from "react";
import { MarkdownRenderer } from "../organisms/MarkdownRenderer";
import { ArtifactViewer } from "./ArtifactViewer";
import { apiService } from "../../../api/api";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(false);
  const [showArtifacts, setShowArtifacts] = useState(false);

  const handleViewArtifacts = async () => {
    if (artifacts.length === 0) {
      setLoadingArtifacts(true);
      try {
        const data = await apiService.getArtifacts(message.id);
        setArtifacts(data.artifacts || []);
      } catch {
        setArtifacts([]);
      } finally {
        setLoadingArtifacts(false);
      }
    }
    setShowArtifacts(!showArtifacts);
  };

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-3xl px-4 py-3 rounded-lg ${
          message.role === "user"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900 border border-gray-300"
        }`}
      >
        {message.role === "assistant" ? (
          <>
            <MarkdownRenderer content={message.content} />

            <button
              onClick={handleViewArtifacts}
              className="mt-2 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
              disabled={loadingArtifacts}
            >
              {loadingArtifacts
                ? "Loading..."
                : showArtifacts
                ? "Hide Artifacts"
                : "View Artifacts"}
            </button>

            {showArtifacts && (
              <div className="mt-3">
                {artifacts.length > 0 ? (
                  <div className="space-y-2">
                    {artifacts.map((artifact, idx) => (
                      <ArtifactViewer key={idx} artifact={artifact} />
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                    No artifacts available for this message
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        <p
          className={`text-xs mt-2 ${
            message.role === "user" ? "text-gray-200" : "text-gray-600"
          }`}
        >
          {message.timestamp.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};
