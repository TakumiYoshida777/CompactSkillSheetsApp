import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractBearerToken,
  decodeToken,
} from '../jwt';

// JWTライブラリのモック
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('JWT Utils', () => {
  const mockPayload = {
    userId: 1,
    email: 'test@example.com',
    roles: ['engineer'],
  };

  const mockToken = 'mock.jwt.token';
  const mockRefreshToken = 'mock.refresh.token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('アクセストークンを生成する', () => {
      mockedJwt.sign.mockReturnValue(mockToken as any);

      const token = generateAccessToken(mockPayload);

      expect(token).toBe(mockToken);
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        { expiresIn: '15m' }
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('リフレッシュトークンを生成する', () => {
      mockedJwt.sign.mockReturnValue(mockRefreshToken as any);

      const token = generateRefreshToken(mockPayload);

      expect(token).toBe(mockRefreshToken);
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        { expiresIn: '7d' }
      );
    });
  });

  describe('generateTokenPair', () => {
    it('アクセストークンとリフレッシュトークンのペアを生成する', () => {
      mockedJwt.sign
        .mockReturnValueOnce(mockToken as any)
        .mockReturnValueOnce(mockRefreshToken as any);

      const tokens = generateTokenPair(mockPayload);

      expect(tokens).toEqual({
        accessToken: mockToken,
        refreshToken: mockRefreshToken,
      });
      expect(mockedJwt.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyAccessToken', () => {
    it('有効なアクセストークンを検証する', () => {
      mockedJwt.verify.mockReturnValue(mockPayload as any);

      const payload = verifyAccessToken(mockToken);

      expect(payload).toEqual(mockPayload);
      expect(mockedJwt.verify).toHaveBeenCalledWith(
        mockToken,
        expect.any(String)
      );
    });

    it('期限切れトークンでエラーをスローする', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      expect(() => verifyAccessToken(mockToken)).toThrow(
        'トークンの有効期限が切れています'
      );
    });

    it('無効なトークンでエラーをスローする', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      expect(() => verifyAccessToken(mockToken)).toThrow(
        '無効なトークンです'
      );
    });

    it('その他のエラーをそのまま再スローする', () => {
      const error = new Error('Unknown error');
      mockedJwt.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => verifyAccessToken(mockToken)).toThrow(error);
    });
  });

  describe('verifyRefreshToken', () => {
    it('有効なリフレッシュトークンを検証する', () => {
      mockedJwt.verify.mockReturnValue(mockPayload as any);

      const payload = verifyRefreshToken(mockRefreshToken);

      expect(payload).toEqual(mockPayload);
      expect(mockedJwt.verify).toHaveBeenCalledWith(
        mockRefreshToken,
        expect.any(String)
      );
    });

    it('期限切れリフレッシュトークンでエラーをスローする', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      expect(() => verifyRefreshToken(mockRefreshToken)).toThrow(
        'リフレッシュトークンの有効期限が切れています'
      );
    });

    it('無効なリフレッシュトークンでエラーをスローする', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      expect(() => verifyRefreshToken(mockRefreshToken)).toThrow(
        '無効なリフレッシュトークンです'
      );
    });
  });

  describe('extractBearerToken', () => {
    it('正しいBearerトークンを抽出する', () => {
      const authHeader = 'Bearer ' + mockToken;
      const token = extractBearerToken(authHeader);

      expect(token).toBe(mockToken);
    });

    it('Bearerプレフィックスがない場合nullを返す', () => {
      const authHeader = 'Token ' + mockToken;
      const token = extractBearerToken(authHeader);

      expect(token).toBeNull();
    });

    it('フォーマットが不正な場合nullを返す', () => {
      const authHeader = 'Bearer';
      const token = extractBearerToken(authHeader);

      expect(token).toBeNull();
    });

    it('undefinedの場合nullを返す', () => {
      const token = extractBearerToken(undefined);

      expect(token).toBeNull();
    });

    it('複数のスペースがある場合nullを返す', () => {
      const authHeader = 'Bearer token extra';
      const token = extractBearerToken(authHeader);

      expect(token).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('トークンをデコードする', () => {
      mockedJwt.decode.mockReturnValue(mockPayload as any);

      const payload = decodeToken(mockToken);

      expect(payload).toEqual(mockPayload);
      expect(mockedJwt.decode).toHaveBeenCalledWith(mockToken);
    });

    it('デコードに失敗した場合nullを返す', () => {
      mockedJwt.decode.mockImplementation(() => {
        throw new Error('Decode error');
      });

      const payload = decodeToken('invalid-token');

      expect(payload).toBeNull();
    });

    it('nullを返す場合の処理', () => {
      mockedJwt.decode.mockReturnValue(null);

      const payload = decodeToken(mockToken);

      expect(payload).toBeNull();
    });
  });
});