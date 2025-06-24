import { GoogleDriveService } from '../../services/driveService';

// Mock de dependencias (puedes ajustar según tus mocks reales)
jest.mock('../../services/auth/authService', () => ({
  driveAuthService: {
    setAccessToken: jest.fn(),
    getAuthUrl: jest.fn().mockReturnValue('mock-url'),
    getTokensFromCode: jest.fn().mockResolvedValue({ accessToken: 'mock', refreshToken: 'mock' }),
    isTokenValid: jest.fn().mockResolvedValue(true),
    refreshTokenIfNeeded: jest.fn(),
    isHealthy: jest.fn().mockReturnValue(true),
    isConfigured: jest.fn().mockReturnValue(true),
  },
}));

jest.mock('../../services/files/fileOperationsService', () => ({
  driveFileOperationsService: {
    uploadPdf: jest
      .fn()
      .mockResolvedValue({ fileId: '1', webViewLink: 'link', webContentLink: 'link' }),
    downloadPdf: jest.fn().mockResolvedValue(Buffer.from('mock')),
    deletePdf: jest.fn().mockResolvedValue(undefined),
    getFileInfo: jest.fn().mockResolvedValue({
      id: '1',
      name: 'file',
      size: '100',
      mimeType: 'application/pdf',
      createdTime: '',
      modifiedTime: '',
      webViewLink: '',
      webContentLink: '',
    }),
    createFolder: jest.fn().mockResolvedValue('folderId'),
    isHealthy: jest.fn().mockReturnValue(true),
  },
}));

jest.mock('../../services/search/searchService', () => ({
  driveSearchService: {
    listPdfs: jest.fn().mockResolvedValue({ files: [], nextPageToken: undefined }),
    searchPdfs: jest.fn().mockResolvedValue({ files: [] }),
    advancedSearch: jest.fn().mockResolvedValue({ files: [] }),
    getFolderStats: jest.fn().mockResolvedValue({ totalFiles: 0, totalSize: 0 }),
    isHealthy: jest.fn().mockReturnValue(true),
  },
}));

describe('GoogleDriveService', () => {
  let service: GoogleDriveService;

  beforeEach(() => {
    service = new GoogleDriveService();
  });

  it('debería retornar la URL de autenticación', () => {
    const url = service.getAuthUrl();
    expect(url).toBe('mock-url');
  });

  // Agrega más tests para otros métodos públicos aquí
});
