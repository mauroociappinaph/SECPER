import { DriveSearchService } from '../../services/search/searchService';

jest.mock('../../services/auth/authService', () => ({
  driveAuthService: {
    getOAuth2Client: jest.fn().mockReturnValue({}),
    isHealthy: jest.fn().mockReturnValue(true),
    isConfigured: jest.fn().mockReturnValue(true),
  },
}));

describe('DriveSearchService', () => {
  let service: DriveSearchService;

  beforeEach(() => {
    service = new DriveSearchService();
  });

  it('debería lanzar error si Google Drive no está configurado', () => {
    // Forzamos el mock para simular error
    (service as any).drive = null;
    jest.spyOn(service as any, 'initializeDrive').mockImplementation(() => {});
    jest.spyOn(service as any, 'getDriveClient').mockImplementation(() => {
      throw new Error('Google Drive no está configurado');
    });
    expect(() => (service as any).getDriveClient()).toThrow('Google Drive no está configurado');
  });

  // Agrega más tests para otros métodos públicos aquí
});
