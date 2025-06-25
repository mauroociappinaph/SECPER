/**
 * @deprecated Este archivo se mantiene por compatibilidad hacia atrás.
 * Usa la nueva estructura modular en ./errors/ en su lugar.
 *
 * Sistema de errores modularizado - Punto de entrada de compatibilidad
 *
 * MIGRACIÓN:
 * - Reemplaza: import { ... } from '../utils/errors'
 * - Por: import { ... } from '../utils/errors'
 *
 * La nueva estructura modular está en:
 * - ./errors/base.ts - Clases base y tipos
 * - ./errors/http.ts - Errores HTTP
 * - ./errors/services.ts - Errores de servicios
 * - ./errors/factory.ts - Factory de errores
 * - ./errors/utils.ts - Utilidades
 * - ./errors/index.ts - Punto de entrada principal
 */

// Re-exportar todo desde la nueva estructura modular
export * from './errors/index';
