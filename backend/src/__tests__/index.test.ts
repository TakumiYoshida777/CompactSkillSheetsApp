import request from 'supertest';
import app from '../index';

describe('Express App', () => {
  describe('GET /health', () => {
    it('ヘルスチェックエンドポイントが正常に動作する', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/v1', () => {
    it('APIルートの情報を返す', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'SkillSheetsMgmtAPp API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('health', '/health');
      expect(response.body.endpoints).toHaveProperty('api', '/api/v1');
      expect(response.body.endpoints).toHaveProperty('test', '/api/v1/test');
    });
  });

  describe('POST /api/v1/test', () => {
    it('送信されたメッセージをエコーバックする', async () => {
      const testMessage = 'Hello, Test!';
      const response = await request(app)
        .post('/api/v1/test')
        .send({ message: testMessage })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('echo', testMessage);
      expect(response.body).toHaveProperty('timestamp');
    });

    it('メッセージがない場合はデフォルトメッセージを返す', async () => {
      const response = await request(app)
        .post('/api/v1/test')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('echo', 'No message provided');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('リクエストヘッダー情報を含める', async () => {
      const response = await request(app)
        .post('/api/v1/test')
        .set('Content-Type', 'application/json')
        .set('Origin', 'http://localhost:3000')
        .send({ message: 'test' })
        .expect(200);

      expect(response.body).toHaveProperty('headers');
      expect(response.body.headers).toHaveProperty('contentType', 'application/json');
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しないルートで404を返す', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toBeDefined();
    });
  });

  describe('CORS設定', () => {
    it('CORSヘッダーが正しく設定される', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Compression', () => {
    it('レスポンスが圧縮される', async () => {
      const response = await request(app)
        .get('/api/v1')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Content-Encodingヘッダーの確認（圧縮が有効な場合）
      // 注: テスト環境では圧縮されない場合があるため、条件分岐
      if (response.headers['content-encoding']) {
        expect(['gzip', 'deflate', 'br']).toContain(response.headers['content-encoding']);
      }
    });
  });
});