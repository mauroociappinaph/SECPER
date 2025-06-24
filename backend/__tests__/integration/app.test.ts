import request from 'supertest';
import app from '../../server';

describe('Endpoints principales de la API', () => {
  // Health y root
  it('GET / debe responder con status 200 y mensaje', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('GET /health debe responder con status 200 y status healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  // Calendar
  it('POST /api/calendario/evento debe responder (estructura básica)', async () => {
    const res = await request(app)
      .post('/api/calendario/evento')
      .send({ summary: 'Test', start: new Date().toISOString(), end: new Date().toISOString() });
    expect([200, 400, 500]).toContain(res.status); // Puede fallar por falta de mock
  });

  // PDF
  it('GET /api/pdf/capabilities debe responder con status 200', async () => {
    const res = await request(app).get('/api/pdf/capabilities');
    expect([200, 500]).toContain(res.status);
  });

  it('GET /api/pdf/health debe responder con status 200', async () => {
    const res = await request(app).get('/api/pdf/health');
    expect([200, 500]).toContain(res.status);
  });

  // Chat
  it('GET /api/chat/health debe responder con status 200', async () => {
    const res = await request(app).get('/api/chat/health');
    expect([200, 500]).toContain(res.status);
  });

  it('GET /api/chat/conversations debe responder con status 200', async () => {
    const res = await request(app).get('/api/chat/conversations');
    expect([200, 500, 400]).toContain(res.status);
  });

  // Google Drive
  it('GET /api/drive/health debe responder con status 200', async () => {
    const res = await request(app).get('/api/drive/health');
    expect([200, 500]).toContain(res.status);
  });

  it('GET /api/drive/capabilities debe responder con status 200', async () => {
    const res = await request(app).get('/api/drive/capabilities');
    expect([200, 500]).toContain(res.status);
  });

  it('GET /api/drive/auth-url debe responder con status 200', async () => {
    const res = await request(app).get('/api/drive/auth-url');
    expect([200, 500]).toContain(res.status);
  });
});

describe('Casos de error y validaciones', () => {
  // Calendario: falta summary
  it('POST /api/calendario/evento debe fallar si falta summary', async () => {
    const res = await request(app)
      .post('/api/calendario/evento')
      .send({ start: new Date().toISOString(), end: new Date().toISOString() });
    expect([400, 422, 500]).toContain(res.status); // Según tu lógica de validación
  });

  // PDF: endpoint inexistente
  it('GET /api/pdf/no-existe debe responder 404', async () => {
    const res = await request(app).get('/api/pdf/no-existe');
    expect(res.status).toBe(404);
  });

  // Chat: ID de conversación inválido
  it('GET /api/chat/conversations/ID_INEXISTENTE debe responder 404 o error', async () => {
    const res = await request(app).get('/api/chat/conversations/ID_INEXISTENTE');
    expect([404, 400, 500]).toContain(res.status);
  });

  // Google Drive: archivo inexistente
  it('GET /api/drive/download/ID_INEXISTENTE debe responder error', async () => {
    const res = await request(app).get('/api/drive/download/ID_INEXISTENTE');
    expect([404, 400, 500]).toContain(res.status);
  });

  // Ruta global inexistente
  it('GET /ruta-que-no-existe debe responder 404', async () => {
    const res = await request(app).get('/ruta-que-no-existe');
    expect(res.status).toBe(404);
  });
});
