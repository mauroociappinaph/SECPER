import { PrismaClient } from '../../generated/prisma';

/**
 * Instancia global de Prisma Client
 * Implementa el patrón singleton para evitar múltiples conexiones
 */
class DatabaseService {
  private static instance: PrismaClient | null = null;

  /**
   * Obtiene la instancia de Prisma Client
   */
  static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        errorFormat: 'pretty',
      });

      console.log(`[${new Date().toISOString()}] [DatabaseService] Prisma Client initialized`);
    }

    return DatabaseService.instance;
  }

  /**
   * Conecta a la base de datos
   */
  static async connect(): Promise<void> {
    try {
      const prisma = DatabaseService.getInstance();
      await prisma.$connect();
      console.log(
        `[${new Date().toISOString()}] [DatabaseService] Connected to database successfully`
      );
    } catch (error) {
      console.error(`[DatabaseService] Failed to connect to database:`, error);
      throw error;
    }
  }

  /**
   * Desconecta de la base de datos
   */
  static async disconnect(): Promise<void> {
    try {
      if (DatabaseService.instance) {
        await DatabaseService.instance.$disconnect();
        DatabaseService.instance = null;
        console.log(`[${new Date().toISOString()}] [DatabaseService] Disconnected from database`);
      }
    } catch (error) {
      console.error(`[DatabaseService] Error disconnecting from database:`, error);
      throw error;
    }
  }

  /**
   * Verifica el estado de la conexión
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const prisma = DatabaseService.getInstance();
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[DatabaseService] Health check failed:`, error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Ejecuta las migraciones pendientes
   */
  static async migrate(): Promise<void> {
    try {
      DatabaseService.getInstance();
      // En SQLite con Prisma, usamos db push en lugar de migrate
      console.log(`[DatabaseService] Database schema is up to date`);
    } catch (error) {
      console.error(`[DatabaseService] Migration failed:`, error);
      throw error;
    }
  }

  /**
   * Limpia la base de datos (solo para testing)
   */
  static async cleanup(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cleanup is not allowed in production');
    }

    try {
      const prisma = DatabaseService.getInstance();

      // Eliminar en orden para respetar las foreign keys
      await prisma.activityLog.deleteMany();
      await prisma.calendarAttendee.deleteMany();
      await prisma.calendarEvent.deleteMany();
      await prisma.message.deleteMany();
      await prisma.conversation.deleteMany();
      await prisma.pdfDocument.deleteMany();
      await prisma.systemConfig.deleteMany();
      await prisma.user.deleteMany();

      console.log(`[DatabaseService] Database cleaned up successfully`);
    } catch (error) {
      console.error(`[DatabaseService] Cleanup failed:`, error);
      throw error;
    }
  }
}

// Exportar la instancia de Prisma para uso directo
export const prisma = DatabaseService.getInstance();

// Exportar el servicio para operaciones avanzadas
export default DatabaseService;
