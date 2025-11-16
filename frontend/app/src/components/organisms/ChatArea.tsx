import { useState, useEffect, useRef } from "react";
import { ChatInput } from "../molecules/ChatInput";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { apiService } from "../../../api/api";
import React from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  artifacts?: any[];
}

interface ChatAreaProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  currentSession: string | null;
  selectedFilesCount: number;
  useFileData: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onToggleSidebar: () => void;
  onToggleFileData: () => void;
  onBack: () => void;
  selectedModel?: string;
  availableModels?: string[];
  onModelChange?: (model: string) => void;
}

export const ChatArea = ({
  messages,
  input,
  isLoading,
  currentSession,
  selectedFilesCount,
  useFileData,
  onInputChange,
  onSendMessage,
  onToggleSidebar,
  onToggleFileData,
  onBack,
  selectedModel = "OPENAI_20b_BR",
  availableModels = [],
  onModelChange,
}: ChatAreaProps) => {
  const [artifacts, setArtifacts] = useState<{ [messageId: string]: any[] }>(
    {}
  );
  const [loadingArtifacts, setLoadingArtifacts] = useState<Set<string>>(
    new Set()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleViewArtifacts = async (messageId: string) => {
    if (artifacts[messageId]) return;

    setLoadingArtifacts((prev) => new Set(prev).add(messageId));
    try {
      const data = await apiService.getArtifacts(messageId);
      setArtifacts((prev) => ({ ...prev, [messageId]: data.artifacts || [] }));
    } catch (error) {
      console.error("Failed to load artifacts:", error);
      setArtifacts((prev) => ({ ...prev, [messageId]: [] }));
    } finally {
      setLoadingArtifacts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            🏠 Dashboard
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-8 pb-40">
        {!currentSession ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">เริ่มการสนทนาใหม่</h3>
              <p className="text-gray-500">Data is power, questions are keys</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "user" ? (
                  <div className="max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                    {message.content}
                  </div>
                ) : (
                  <div className="w-full max-w-none overflow-hidden">
                    <div className="break-words">
                      <MarkdownRenderer content={message.content} />
                    </div>

                    {/* Artifacts Button */}
                    <div className="mt-2">
                      <button
                        onClick={() => handleViewArtifacts(message.id)}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                        disabled={loadingArtifacts.has(message.id)}
                      >
                        {loadingArtifacts.has(message.id)
                          ? "Loading..."
                          : "View Source"}
                      </button>
                    </div>

                    {/* Loaded Artifacts */}
                    {artifacts[message.id] !== undefined && (
                      <div className="mt-3">
                        {artifacts[message.id] &&
                        artifacts[message.id].length > 0 ? (
                          <div className="space-y-2">
                            {artifacts[message.id].map((artifact, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-gray-50 border border-gray-200 rounded"
                              >
                                <h4 className="text-sm font-medium mb-2">
                                  {artifact.title || `Artifact ${idx + 1}`}
                                </h4>
                                {artifact.type === "results" ? (
                                  <div className="text-xs overflow-x-auto">
                                    <table className="min-w-full border border-gray-300 text-xs">
                                      <tbody>
                                        {artifact.content
                                          .split("\n")
                                          .filter(
                                            (row: string) =>
                                              row.trim() && !row.includes("---")
                                          )
                                          .map((row: string, idx: number) => {
                                            const cells = row
                                              .split("|")
                                              .slice(1, -1); // Remove first and last empty cells
                                            const filteredCells =
                                              cells.slice(1); // Remove first column (index)
                                            return (
                                              <tr
                                                key={idx}
                                                className={
                                                  idx === 0
                                                    ? "bg-gray-100 font-medium"
                                                    : ""
                                                }
                                              >
                                                {filteredCells.map(
                                                  (cell, cellIdx) => (
                                                    <td
                                                      key={cellIdx}
                                                      className="border border-gray-300 px-2 py-1"
                                                    >
                                                      {cell.trim()}
                                                    </td>
                                                  )
                                                )}
                                              </tr>
                                            );
                                          })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : artifact.type === "chart" ? (
                                  <div className="w-full">
                                    <iframe
                                      srcDoc={`
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                            <script src="https://cdn.plot.ly/plotly-3.2.0.min.js"></script>
                                        </head>
                                        <body style="margin:0;padding:10px;">
                                            <div id="chart" style="width:100%;height:380px;"></div>
                                            <script>
                                                const config = ${artifact.content};
                                                Plotly.newPlot('chart', config.data, config.layout, {responsive: true});
                                            </script>
                                        </body>
                                        </html>
                                      `}
                                      className="w-full border border-gray-200 rounded"
                                      style={{ height: "400px" }}
                                      title="Chart"
                                    />
                                  </div>
                                ) : (
                                  <pre className="text-xs text-gray-700 overflow-x-auto">
                                    <code>{artifact.content}</code>
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                            No artifacts available for this message
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>AI กำลังตอบ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Input Area */}
      {currentSession && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-300 rounded-2xl shadow-lg p-4 max-w-full overflow-hidden">
              <ChatInput
                value={input}
                onChange={onInputChange}
                onSend={onSendMessage}
                placeholder="พิมพ์คำถามเกี่ยวกับข้อมูล..."
                disabled={isLoading}
                useFileData={useFileData}
                onToggleFileData={onToggleFileData}
                selectedFilesCount={selectedFilesCount}
                selectedModel={selectedModel}
                availableModels={availableModels}
                onModelChange={onModelChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
