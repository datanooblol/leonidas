const API_BASE_URL = "https://leonidas-api.datanooblol.com";

interface AuthResponse {
  user_id: string;
  email: string;
  access_token: string;
}

interface ProjectData {
  project_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ProjectListResponse {
  projects: ProjectData[];
}

interface SessionData {
  session_id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface SessionListResponse {
  sessions: SessionData[];
}

interface SessionWithMessagesResponse {
  session_id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  messages: MessageHistoryResponse[];
}

interface FileData {
  file_id: string;
  project_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  selected?: boolean;
  created_at: string;
}

interface FileListResponse {
  files: FileData[];
}

interface MessageSend {
  content: string;
  model_id?: string;
  chat_with_data?: boolean;
}

interface ChatResponse {
  id: string;
  role: string;
  content: string;
  model_name: string;
  response_time_ms: number;
  input_tokens: number;
  output_tokens: number;
  reason: string;
  artifacts?: any[];
}

interface MessageResponse {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

interface SendMessageResponse {
  user_message: MessageResponse;
  ai_response: MessageResponse;
}

interface MessageHistoryResponse {
  message_id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  model_name?: string;
}

interface ChatHistoryResponse {
  session_id: string;
  messages: MessageHistoryResponse[];
}

interface PresignedUrlResponse {
  url: string;
  file_id: string;
  fields?: Record<string, string>;
}

interface FileMetadata {
  description?: string;
  tags?: string[];
  [key: string]: any;
}

interface FileResponse {
  file_id: string;
  project_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at?: string;
}

// Token management
let authToken: string | null = null;

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

export const apiService = {
  setAuthToken(token: string) {
    authToken = token;
  },

  clearAuthToken() {
    authToken = null;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const payload = { email, password };
    // console.log("🔐 API Request - Login:", payload);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Login error:", response.status, errorText);
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Login:", data);
    this.setAuthToken(data.access_token);
    return data;
  },

  async register(email: string, password: string): Promise<AuthResponse> {
    const payload = { email, password };
    // console.log("📝 API Request - Register:", payload);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Register error:", response.status, errorText);
      throw new Error(`Registration failed: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Register:", data);
    this.setAuthToken(data.access_token);
    return data;
  },

  async getProjects(): Promise<ProjectData[]> {
    console.log("📋 API Request - Get Projects");

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get projects error:", response.status, errorText);
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }

    const data: ProjectListResponse = await response.json();
    // console.log("✅ API Response - Get Projects:", data);
    return data.projects;
  },

  async createProject(name: string, description: string): Promise<ProjectData> {
    const payload = { name, description };
    // console.log("➕ API Request - Create Project:", payload);

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Create project error:", response.status, errorText);
      throw new Error(`Failed to create project: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Create Project:", data);
    return data;
  },

  async getProject(projectId: string): Promise<ProjectData> {
    // console.log("📁 API Request - Get Project:", { projectId });

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok)
      throw new Error(`Failed to fetch project: ${response.status}`);

    const data = await response.json();
    // console.log("✅ API Response - Get Project:", data);
    return data;
  },

  async updateProject(
    projectId: string,
    name: string,
    description: string
  ): Promise<ProjectData> {
    const payload = { name, description };
    // console.log("✏️ API Request - Update Project:", { projectId, ...payload });

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error(`Failed to update project: ${response.status}`);

    const data = await response.json();
    // console.log("✅ API Response - Update Project:", data);
    return data;
  },

  async deleteProject(projectId: string): Promise<void> {
    // console.log("🗑️ API Request - Delete Project:", { projectId });

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok)
      throw new Error(`Failed to delete project: ${response.status}`);

    // console.log("✅ API Response - Delete Project: Success");
  },

  async getSessions(projectId: string): Promise<SessionData[]> {
    // console.log("💬 API Request - Get Sessions:", { projectId });

    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/sessions`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get sessions error:", response.status, errorText);
      throw new Error(`Failed to fetch sessions: ${response.status}`);
    }

    const data: SessionListResponse = await response.json();
    // console.log("✅ API Response - Get Sessions:", data);
    return data.sessions;
  },

  async createSession(projectId: string, name: string): Promise<SessionData> {
    const payload = { name };
    // console.log("➕ API Request - Create Session:", { projectId, ...payload });

    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/sessions`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Create session error:", response.status, errorText);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Create Session:", data);
    return data;
  },

  async getFiles(projectId: string): Promise<FileData[]> {
    // console.log("📋 API Request - Get Files:", { projectId });

    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/files`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get files error:", response.status, errorText);
      throw new Error(`Failed to fetch files: ${response.status}`);
    }

    const data: FileListResponse = await response.json();
    // console.log("✅ API Response - Get Files:", data);
    return data.files;
  },

  async getSelectedFiles(projectId: string): Promise<FileData[]> {
    // console.log("📋 API Request - Get Selected Files:", { projectId });

    const response = await fetch(
      `${API_BASE_URL}/files/${projectId}/selected`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok)
      throw new Error(`Failed to fetch selected files: ${response.status}`);

    const data: FileListResponse = await response.json();
    // console.log("✅ API Response - Get Selected Files:", data);
    return data.files;
  },

  async uploadFile(projectId: string, file: File): Promise<void> {
    console.log("📤 API Request - Upload File:", {
      projectId,
      fileName: file.name,
      fileSize: file.size,
    });

    // 1. Get presigned URL
    const urlResponse = await fetch(
      `${API_BASE_URL}/files/${projectId}/upload-url?filename=${encodeURIComponent(
        file.name
      )}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );

    if (!urlResponse.ok) {
      const errorText = await urlResponse.text();
      console.error("❌ Get upload URL error:", urlResponse.status, errorText);
      throw new Error(`Failed to get upload URL: ${urlResponse.status}`);
    }

    const { file_id, url, fields }: PresignedUrlResponse =
      await urlResponse.json();
    // console.log("✅ API Response - Get Upload URL:", {
    //   file_id,
    //   url: url.substring(0, 50) + "...",
    //   fields,
    // });

    // 2. Upload to S3 using POST with FormData
    const formData = new FormData();

    if (fields) {
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    formData.append("file", file);

    try {
      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });
      console.log(
        "✅ S3 Upload Response: Success (status may be blocked by CORS)"
      );
    } catch (error) {
      console.log("⚠️ CORS error but upload likely succeeded:", error);
    }

    // 3. Confirm upload
    const confirmResponse = await fetch(
      `${API_BASE_URL}/files/${file_id}/confirm?size=${file.size}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!confirmResponse.ok) {
      const errorText = await confirmResponse.text();
      console.error(
        "❌ Confirm upload error:",
        confirmResponse.status,
        errorText
      );
      throw new Error(`Failed to confirm upload: ${confirmResponse.status}`);
    }

    const confirmData = await confirmResponse.json();
    // console.log("✅ API Response - Confirm Upload:", confirmData);
  },

  async deleteFile(fileId: string): Promise<void> {
    // console.log("🗑️ API Request - Delete File:", { fileId });

    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Delete file error:", response.status, errorText);
      throw new Error(`Failed to delete file: ${response.status}`);
    }

    // console.log("✅ API Response - Delete File: Success");
  },

  async updateFileStatus(
    fileId: string,
    status: string
  ): Promise<FileResponse> {
    // console.log("🔄 API Request - Update File Status:", { fileId, status });

    const response = await fetch(
      `${API_BASE_URL}/files/${fileId}/status?status=${status}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok)
      throw new Error(`Failed to update file status: ${response.status}`);

    const data = await response.json();
    // console.log("✅ API Response - Update File Status:", data);
    return data;
  },

  async sendMessage(
    sessionId: string,
    content: string,
    chatWithData: boolean = false,
    modelId: string = "OPENAI_20b_BR"
  ): Promise<ChatResponse> {
    const messageData: MessageSend = {
      content,
      model_id: modelId,
      chat_with_data: chatWithData,
    };
    // console.log("💬 API Request - Send Message:", { sessionId, messageData });

    const response = await fetch(
      `${API_BASE_URL}/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Send message error:", response.status, errorText);
      throw new Error(`Failed to send message: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Send Message:", data);
    return data;
  },

  async getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
    // console.log("📜 API Request - Get Chat History:", { sessionId });

    const response = await fetch(
      `${API_BASE_URL}/chat/sessions/${sessionId}/history`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get chat history error:", response.status, errorText);
      throw new Error(`Failed to get chat history: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Get Chat History:", data);
    return data;
  },

  async updateSession(sessionId: string, name: string): Promise<SessionData> {
    const payload = { name };
    // console.log("✏️ API Request - Update Session:", { sessionId, ...payload });

    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Update session error:", response.status, errorText);
      throw new Error(`Failed to update session: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Update Session:", data);
    return data;
  },

  async deleteSession(sessionId: string): Promise<void> {
    // console.log("🗑️ API Request - Delete Session:", { sessionId });

    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Delete session error:", response.status, errorText);
      throw new Error(`Failed to delete session: ${response.status}`);
    }

    // console.log("✅ API Response - Delete Session: Success");
  },

  async refreshSession(sessionId: string): Promise<SessionData> {
    // console.log("🔄 API Request - Refresh Session:", { sessionId });

    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/refresh`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok)
      throw new Error(`Failed to refresh session: ${response.status}`);

    const data = await response.json();
    // console.log("✅ API Response - Refresh Session:", data);
    return data;
  },

  async getSessionWithMessages(
    sessionId: string
  ): Promise<SessionWithMessagesResponse> {
    // console.log("💬 API Request - Get Session With Messages:", { sessionId });

    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Get session with messages error:",
        response.status,
        errorText
      );
      throw new Error(
        `Failed to get session with messages: ${response.status}`
      );
    }

    const data = await response.json();
    // console.log("✅ API Response - Get Session With Messages:", data);
    return data;
  },

  async renameFile(fileId: string, newFilename: string): Promise<FileResponse> {
    // console.log("✏️ API Request - Rename File:", { fileId, newFilename });

    const response = await fetch(
      `${API_BASE_URL}/files/${fileId}/status?status=renamed`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Rename file error:", response.status, errorText);
      throw new Error(`Failed to rename file: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Rename File:", data);
    return data;
  },

  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    // console.log("📊 API Request - Get File Metadata:", { fileId });

    const response = await fetch(`${API_BASE_URL}/files/${fileId}/metadata`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get file metadata error:", response.status, errorText);
      throw new Error(`Failed to get file metadata: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Get File Metadata:", data);
    return data;
  },

  async updateFileMetadata(
    fileId: string,
    metadata: FileMetadata
  ): Promise<FileResponse> {
    // console.log("📊 API Request - Update File Metadata:", { fileId, metadata });

    const response = await fetch(
      `${API_BASE_URL}/files/${fileId}/metadata?name=${encodeURIComponent(
        metadata.name || ""
      )}&description=${encodeURIComponent(metadata.description || "")}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(metadata.columns || []),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Update file metadata error:",
        response.status,
        errorText
      );
      throw new Error(`Failed to update file metadata: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Update File Metadata:", data);
    return data;
  },

  async updateFileSelection(fileId: string, selected: boolean): Promise<void> {
    // console.log("☑️ API Request - Update File Selection:", {
    //   fileId,
    //   selected,
    // });

    const response = await fetch(
      `${API_BASE_URL}/files/${fileId}/selection?selected=${selected}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Update file selection error:",
        response.status,
        errorText
      );
      throw new Error(`Failed to update file selection: ${response.status}`);
    }

    // console.log("✅ API Response - Update File Selection: Success");
  },

  async getFileSelection(fileId: string): Promise<boolean> {
    // console.log("☑️ API Request - Get File Selection:", { fileId });

    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get file selection error:", response.status, errorText);
      throw new Error(`Failed to get file selection: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Get File Selection:", data);
    return data.selected;
  },

  async getAvailableModels(): Promise<{ models: string[] }> {
    // console.log("🤖 API Request - Get Available Models");

    const response = await fetch(`${API_BASE_URL}/chat/available-models`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Get available models error:",
        response.status,
        errorText
      );
      throw new Error(`Failed to get available models: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Get Available Models:", data);
    return data;
  },

  async getArtifacts(
    messageId: string
  ): Promise<{ message_id: string; artifacts: any[] }> {
    // console.log("🎨 API Request - Get Artifacts:", { messageId });

    const response = await fetch(
      `${API_BASE_URL}/chat/${messageId}/artifacts`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get artifacts error:", response.status, errorText);
      throw new Error(`Failed to get artifacts: ${response.status}`);
    }

    const data = await response.json();
    // console.log("✅ API Response - Get Artifacts:", data);
    return data;
  },
};

export const getLastUsedModel = (
  messages: MessageHistoryResponse[],
  availableModels: string[]
): string => {
  const lastAssistantMessage = messages
    .filter((msg) => msg.role === "assistant" && msg.model_name)
    .pop();

  const lastModel = lastAssistantMessage?.model_name;

  if (lastModel && availableModels.includes(lastModel)) {
    return lastModel;
  }

  return availableModels[0] || "OPENAI_20b_BR";
};
