import type {
  User,
  Conversation,
  Message,
  CalendarEvent,
  CalendarAttendee,
  PdfDocument,
  ActivityLog,
  SystemConfig,
} from '../../generated/prisma';

// ==================== TIPOS BASE ====================

export type {
  User,
  Conversation,
  Message,
  CalendarEvent,
  CalendarAttendee,
  PdfDocument,
  ActivityLog,
  SystemConfig,
};

// ==================== TIPOS EXTENDIDOS ====================

// Conversación con mensajes incluidos
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  user?: User | null;
}

// Evento de calendario con invitados incluidos
export interface CalendarEventWithAttendees extends CalendarEvent {
  attendees: CalendarAttendee[];
  user?: User | null;
}

// Usuario con relaciones incluidas
export interface UserWithRelations extends User {
  conversations: Conversation[];
  calendarEvents: CalendarEvent[];
}

// ==================== TIPOS PARA CREACIÓN ====================

// Datos para crear un usuario
export interface CreateUserData {
  email: string;
  name?: string;
}

// Datos para crear una conversación
export interface CreateConversationData {
  title: string;
  userId?: string;
}

// Datos para crear un mensaje
export interface CreateMessageData {
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversationId: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

// Datos para crear un evento de calendario
export interface CreateCalendarEventData {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  userId?: string;
  attendees?: string[]; // Array de emails
  zapierEventId?: string;
  zapierStatus?: string;
}

// Datos para crear un documento PDF
export interface CreatePdfDocumentData {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  extractedText?: string;
  ocrText?: string;
  textExtractionStatus?: string;
  ocrStatus?: string;
  pages?: number;
  confidence?: number;
  language?: string;
}

// Datos para crear un log de actividad
export interface CreateActivityLogData {
  action: string;
  module: 'chat' | 'calendar' | 'pdf' | 'system';
  details?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// ==================== TIPOS PARA ACTUALIZACIÓN ====================

// Datos para actualizar una conversación
export interface UpdateConversationData {
  title?: string;
}

// Datos para actualizar un evento de calendario
export interface UpdateCalendarEventData {
  summary?: string;
  description?: string;
  start?: Date;
  end?: Date;
  zapierEventId?: string;
  zapierStatus?: string;
  zapierError?: string;
}

// Datos para actualizar un documento PDF
export interface UpdatePdfDocumentData {
  extractedText?: string;
  ocrText?: string;
  textExtractionStatus?: string;
  ocrStatus?: string;
  textExtractionError?: string;
  ocrError?: string;
  pages?: number;
  confidence?: number;
  language?: string;
}

// ==================== TIPOS PARA CONSULTAS ====================

// Opciones de paginación
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Filtros para conversaciones
export interface ConversationFilters {
  userId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Filtros para eventos de calendario
export interface CalendarEventFilters {
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
}

// Filtros para documentos PDF
export interface PdfDocumentFilters {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasText?: boolean;
  hasOcr?: boolean;
}

// Filtros para logs de actividad
export interface ActivityLogFilters {
  module?: string;
  action?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ==================== TIPOS PARA RESPUESTAS ====================

// Respuesta paginada genérica
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Estadísticas del chat
export interface ChatStats {
  totalConversations: number;
  totalMessages: number;
  averageMessagesPerConversation: number;
  totalUsers: number;
  messagesLast24h: number;
  messagesLast7d: number;
  messagesLast30d: number;
}

// Estadísticas del calendario
export interface CalendarStats {
  totalEvents: number;
  eventsThisMonth: number;
  eventsNextMonth: number;
  totalAttendees: number;
  successfulEvents: number;
  failedEvents: number;
}

// Estadísticas de PDF
export interface PdfStats {
  totalDocuments: number;
  totalSize: number;
  documentsWithText: number;
  documentsWithOcr: number;
  averagePages: number;
  averageConfidence: number;
}

// ==================== ENUMS ====================

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum ZapierStatus {
  PENDING = 'pending',
  CREATED = 'created',
  FAILED = 'failed',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ActivityModule {
  CHAT = 'chat',
  CALENDAR = 'calendar',
  PDF = 'pdf',
  SYSTEM = 'system',
}

export enum ConfigType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}
