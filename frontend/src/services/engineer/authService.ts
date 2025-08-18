import axios from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  experienceYears?: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      engineerId?: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    profile: {
      id: string;
      name: string;
      email: string;
      phoneNumber?: string;
      experienceYears: number;
      skills: string[];
      availability: string;
      bio?: string;
      githubUrl?: string;
      portfolioUrl?: string;
      certifications?: string[];
      preferredRoles?: string[];
      preferredPhases?: string[];
    };
  };
}

class EngineerAuthService {
  private apiUrl = `${API_URL}/api/engineer/auth`;

  /**
   * エンジニアログイン
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post(`${this.apiUrl}/login`, data);
    
    // トークンを保存
    if (response.data.success && response.data.data.tokens) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      
      // axios のデフォルトヘッダーに設定
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.tokens.accessToken}`;
    }
    
    return response.data;
  }

  /**
   * エンジニア新規登録
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post(`${this.apiUrl}/register`, data);
    
    // トークンを保存
    if (response.data.success && response.data.data.tokens) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      
      // axios のデフォルトヘッダーに設定
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.tokens.accessToken}`;
    }
    
    return response.data;
  }

  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await axios.post(`${this.apiUrl}/logout`, { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // トークンを削除
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  /**
   * トークンリフレッシュ
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('リフレッシュトークンがありません');
    }
    
    const response = await axios.post(`${this.apiUrl}/refresh`, { refreshToken });
    
    // 新しいトークンを保存
    if (response.data.success && response.data.data.tokens) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      
      // axios のデフォルトヘッダーに設定
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.tokens.accessToken}`;
    }
    
    return response.data;
  }

  /**
   * プロフィール取得
   */
  async getProfile(): Promise<ProfileResponse> {
    const response = await axios.get(`${this.apiUrl}/profile`);
    return response.data;
  }

  /**
   * プロフィール更新
   */
  async updateProfile(data: any): Promise<any> {
    const response = await axios.put(`${this.apiUrl}/profile`, data);
    return response.data;
  }

  /**
   * パスワード変更
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await axios.put(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  /**
   * 認証状態チェック
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * 現在のトークン取得
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export const engineerAuthService = new EngineerAuthService();