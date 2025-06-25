/**
 * Interfaces para todos los servicios de la aplicación
 * Estas interfaces definen contratos claros para cada servicio
 */

import { ChatMessage, ChatConversation, ChatRequest, ChatResponse } from '../types';

// ==================== INTERFACES BASE ====================

/**
 * Interface base para todos los servicios
 */
export interface IBaseService {
  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean;

  /**
   * Verifica el estado de salud del servicio
   */
  isHealthy(): boolean;
}

/**
 * Interface para servicios que requieren configuración externa
 */
export interface IConfigurableService extends IBaseService {
  /**
   * Obtiene la configuración actual del servicio
   */
  getConfiguration(): Record<string, any>;

  /**
   * Valida la configuración del servicio
   */
  validateConfiguration(): Promise<boolean>;
}

// ==================== CHAT SERVICES ====================

/**
 * Interface para el servicio de Mistral AI
 */
export interface IMistralService extends IBaseService {
  /**
   * Genera una respuesta usando Mistral AI
   */
  generateResponse(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<{
    content: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
}

/**
 * Interface para el servicio de conversaciones
 */
export interface IConversationService extends IBaseService {
  /**
   * Crea un nuevo mensaje
   */
  createMessage(
    role: 'user' | 'assistant' | 'system',
    content: string,
    conversationId?: string
  ): ChatMessage;

  /**
   * Obtiene o crea una conversación
   */
  getOrCreateConversation(conversationId?: string): Promise<ChatConversation>;

  /**
   * Añade un mensaje a una conversación
   */
  addMessageToConversation(conversationId: string, message: ChatMessage): Promise<ChatConversation>;

  /**
   * Obtiene una conversación por ID
   */
  getConversation(conversationId: string): Promise<ChatConversation | null>;

  /**
   * Obtiene todas las conversaciones con paginación
   */
  getAllConversations(
    page?: number,
    limit?: number
  ): Promise<{
    conversations: ChatConversation[];
    totalCount: number;
    page: number;
    limit: number;
  }>;

  /**
   * Elimina una conversación
   */
  deleteConversation(conversationId: string): Promise<boolean>;

  /**
   * Limpia todas las conversaciones
   */
  clearAllConversations(): Promise<void>;

  /**
   * Actualiza el título de una conversación
   */
  updateConversationTitle(conversationId: string, newTitle: string): Promise<boolean>;

  /**
   * Busca conversaciones por texto
   */
  searchConversations(query: string): Promise<ChatConversation[]>;

  /**
   * Obtiene estadísticas del chat
   */
  getStats(): Promise<{
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  }>;
}

/**
 * Interface para el servicio principal de chat
 */
export interface IChatService extends IBaseService {
  /**
   * Envía un mensaje al chat
   */
  sendMessage(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Obtiene una conversación
   */
  getConversation(conversationId: string): Promise<ChatConversation | null>;

  /**
   * Obtiene todas las conversaciones
   */
  getAllConversations(
    page?: number,
    limit?: number
  ): Promise<{
    conversations: ChatConversation[];
    totalCount: number;
    page: number;
    limit: number;
  }>;

  /**
   * Elimina una conversación
   */
  deleteConversation(conversationId: string): Promise<boolean>;

  /**
   * Limpia todas las conversaciones
   */
  clearAllConversations(): Promise<void>;

  /**
   * Actualiza el título de una conversación
   */
  updateConversationTitle(conversationId: string, newTitle: string): Promise<boolean>;

  /**
   * Busca conversaciones
   */
  searchConversations(query: string): Promise<ChatConversation[]>;

  /**
   * Obtiene estadísticas
   */
  getStats(): Promise<{
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  }>;
}

// ==================== PDF SERVICES ====================

/**
 * Interface para el servicio de PDF
 */
export interface IPdfService extends IBaseService {
  /**
   * Lee texto de un PDF
   */
  readPdfText(buffer: Buffer): Promise<string>;

  /**
   * Analiza un PDF usando Mistral AI OCR
   */
  analyzePdfWithMistral(buffer: Buffer): Promise<unknown>;

  /**
   * Obtiene las capacidades del servicio
   */
  getCapabilities(): {
    textExtraction: boolean;
    mistralOcr: boolean;
    supportedFormats: string[];
    maxFileSize: string;
  };
}

// ==================== CALENDAR SERVICES ====================

/**
 * Interface para el servicio de calendario
 */
export interface ICalendarService extends IBaseService {
  /**
   * Crea un evento en el calendario
   */
  createEvent(event: {
    summary: string;
    description?: string;
    start: string;
    end: string;
    attendees?: string[];
  }): Promise<unknown>;
}

// ==================== GOOGLE DRIVE SERVICES ====================

/**
 * Interface para el servicio de autenticación de Google Drive
 */
export interface IDriveAuthService extends IBaseService {
  /**
   * Configura el token de acceso
   */
  setAccessToken(accessToken: string, refreshToken?: string): void;

  /**
   * Obtiene la URL de autorización
   */
  getAuthUrl(): string;

  /**
   * Intercambia código por tokens
   */
  getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken?: string }>;

  /**
   * Verifica si el token es válido
   */
  isTokenValid(): Promise<boolean>;

  /**
   * Refresca el token si es necesario
   */
  refreshTokenIfNeeded(): Promise<void>;
}

/**
 * Interface para operaciones de archivos en Google Drive
 */
export interface IDriveFileOperationsService extends IBaseService {
  /**
   * Sube un PDF a Google Drive
   */
  uploadPdf(
    fileBuffer: Buffer,
    filename: string,
    folderId?: string
  ): Promise<{
    fileId: string;
    webViewLink: string;
    webContentLink: string;
  }>;

  /**
   * Descarga un PDF de Google Drive
   */
  downloadPdf(fileId: string): Promise<Buffer>;

  /**
   * Elimina un PDF de Google Drive
   */
  deletePdf(fileId: string): Promise<void>;

  /**
   * Obtiene información de un archivo
   */
  getFileInfo(fileId: string): Promise<{
    id: string;
    name: string;
    size: string;
    mimeType: string;
    createdTime: string;
    modifiedTime: string;
    webViewLink: string;
    webContentLink: string;
  }>;

  /**
   * Crea una carpeta
   */
  createFolder(name: string, parentFolderId?: string): Promise<string>;
}

/**
 * Interface para búsqueda en Google Drive
 */
export interface IDriveSearchService extends IBaseService {
  /**
   * Lista PDFs en Google Drive
   */
  listPdfs(
    folderId?: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<{
    files: Array<{
      id: string;
      name: string;
      size: string;
      createdTime: string;
      modifiedTime: string;
      webViewLink: string;
    }>;
    nextPageToken?: string;
  }>;

  /**
   * Busca PDFs por término
   */
  searchPdfs(
    searchTerm: string,
    folderId?: string,
    pageSize?: number
  ): Promise<{
    files: Array<{
      id: string;
      name: string;
      size: string;
      createdTime: string;
      modifiedTime: string;
      webViewLink: string;
    }>;
  }>;

  /**
   * Búsqueda avanzada
   */
  advancedSearch(criteria: {
    name?: string;
    mimeType?: string;
    modifiedTime?: { after?: string; before?: string };
    size?: { min?: number; max?: number };
    folderId?: string;
    pageSize?: number;
  }): Promise<{
    files: Array<{
      id: string;
      name: string;
      size: string;
      createdTime: string;
      modifiedTime: string;
      webViewLink: string;
    }>;
  }>;

  /**
   * Obtiene estadísticas de carpeta
   */
  getFolderStats(folderId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    lastModified?: string;
  }>;
}

/**
 * Interface para el servicio principal de Google Drive
 */
export interface IGoogleDriveService extends IBaseService {
  // Métodos de autenticación
  setAccessToken(accessToken: string, refreshToken?: string): void;
  getAuthUrl(): string;
  getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken?: string }>;
  isTokenValid(): Promise<boolean>;
  refreshTokenIfNeeded(): Promise<void>;

  // Métodos de archivos
  uploadPdf(
    fileBuffer: Buffer,
    filename: string,
    folderId?: string
  ): Promise<{
    fileId: string;
    webViewLink: string;
    webContentLink: string;
  }>;
  downloadPdf(fileId: string): Promise<Buffer>;
  deletePdf(fileId: string): Promise<void>;
  getFileInfo(fileId: string): Promise<{
    id: string;
    name: string;
    size: string;
    mimeType: string;
    createdTime: string;
    modifiedTime: string;
    webViewLink: string;
    webContentLink: string;
  }>;
  createFolder(name: string, parentFolderId?: string): Promise<string>;

  // Métodos de búsqueda
  listPdfs(
    folderId?: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<{
    files: Array<{
      id: string;
      name: string;
      size: string;
      createdTime: string;
      modifiedTime: string;
      webViewLink: string;
    }>;
    nextPageToken?: string;
  }>;
  searchPdfs(
    searchTerm: string,
    folderId?: string,
    pageSize?: number
  ): Promise<{
    files: Array<{
      id: string;
      name: string;
      size: string;
      createdTime: string;
      modifiedTime: string;
      webViewLink: string;
    }>;
  }>;
  advancedSearch(criteria: any): Promise<{ files: any[] }>;
  getFolderStats(folderId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    lastModified?: string;
  }>;

  // Métodos de estado
  getCapabilities(): {
    auth: boolean;
    fileOperations: boolean;
    search: boolean;
    quotaUsed?: number;
    quotaLimit?: number;
  };
}
