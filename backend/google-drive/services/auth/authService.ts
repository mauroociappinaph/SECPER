import { OAuth2Client } from 'google-auth-library';
import { GoogleDriveServiceError } from '../../../utils/errors';

/**
 * Servicio especializado para autenticación OAuth2 con Google Drive
 * Optimizado para minimizar el uso de tokens
 */
export class DriveAuthService {
  private oauth2Client: OAuth2Client | null = null;
  private isInitialized = false;

  /**
   * Inicializa el cliente OAuth2 solo cuando es necesario (lazy loading)
   */
  private initializeAuth(): void {
    if (this.isInitialized) return;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.warn('[DriveAuthService] Google Drive credentials not configured');
      return;
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    this.isInitialized = true;

    console.log('[DriveAuthService] OAuth2 client initialized');
  }

  /**
   * Verifica si las credenciales están configuradas
   */
  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Obtiene el cliente OAuth2 (inicializa si es necesario)
   */
  getOAuth2Client(): OAuth2Client {
    this.initializeAuth();

    if (!this.oauth2Client) {
      throw new GoogleDriveServiceError('Google Drive no está configurado', 'DRIVE_NOT_CONFIGURED');
    }

    return this.oauth2Client;
  }

  /**
   * Configura el token de acceso para el usuario
   */
  setAccessToken(accessToken: string, refreshToken?: string): void {
    const client = this.getOAuth2Client();

    client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    console.log('[DriveAuthService] Access token configured');
  }

  /**
   * Genera URL de autorización para OAuth2
   */
  getAuthUrl(): string {
    const client = this.getOAuth2Client();

    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
    ];

    return client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Intercambia código de autorización por tokens
   */
  async getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      const client = this.getOAuth2Client();
      const { tokens } = await client.getToken(code);

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
      };
    } catch (error: unknown) {
      console.error('[DriveAuthService] Error getting tokens:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error obteniendo tokens: ${errorMessage}`,
        'TOKEN_EXCHANGE_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Verifica si el token actual es válido
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const client = this.getOAuth2Client();
      const tokenInfo = await client.getTokenInfo(client.credentials.access_token!);
      return !!tokenInfo;
    } catch {
      return false;
    }
  }

  /**
   * Refresca el token de acceso si es necesario
   */
  async refreshTokenIfNeeded(): Promise<void> {
    try {
      const client = this.getOAuth2Client();

      if (!client.credentials.refresh_token) {
        throw new GoogleDriveServiceError('No hay refresh token disponible', 'NO_REFRESH_TOKEN');
      }

      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);

      console.log('[DriveAuthService] Token refreshed successfully');
    } catch (error: unknown) {
      console.error('[DriveAuthService] Error refreshing token:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error refrescando token: ${errorMessage}`,
        'TOKEN_REFRESH_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Verifica si el servicio está listo para usar
   */
  isHealthy(): boolean {
    return this.isConfigured() && this.isInitialized;
  }
}

// Instancia singleton del servicio de autenticación
export const driveAuthService = new DriveAuthService();
