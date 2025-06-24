import { DriveAuthService } from '../../services/auth/authService';

describe('DriveAuthService', () => {
  let service: DriveAuthService;

  beforeEach(() => {
    service = new DriveAuthService();
  });

  it('debería retornar false si las credenciales no están configuradas', () => {
    process.env.GOOGLE_CLIENT_ID = '';
    process.env.GOOGLE_CLIENT_SECRET = '';
    process.env.GOOGLE_REDIRECT_URI = '';
    expect(service.isConfigured()).toBe(false);
  });

  // Agrega más tests para otros métodos públicos aquí
});
