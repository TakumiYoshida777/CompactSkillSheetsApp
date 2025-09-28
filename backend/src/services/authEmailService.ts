import { prisma } from '../lib/prisma';
import { errorLog } from '../utils/logger';

// nodemailerをimportで読み込む
import * as nodemailer from 'nodemailer';

// Gmail SMTP設定
const createTransporter = () => {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
};

// メールテンプレート
const getEmailTemplate = (code: string) => {
  return {
    subject: '【SESスキル管理システム】認証コード',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">認証コードのお知らせ</h2>
        <p>SESスキル管理システムへのログインに必要な認証コードをお送りします。</p>

        <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1890ff; font-size: 36px; margin: 0; letter-spacing: 5px;">${code}</h1>
        </div>

        <p style="color: #666;">
          この認証コードは5分間有効です。<br>
          コードを入力して認証を完了してください。
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #999; font-size: 12px;">
          このメールに心当たりがない場合は、お手数ですが削除してください。<br>
          第三者がアクセスを試みている可能性があります。
        </p>
      </div>
    `,
    text: `
認証コードのお知らせ

SESスキル管理システムへのログインに必要な認証コードをお送りします。

認証コード: ${code}

この認証コードは5分間有効です。
コードを入力して認証を完了してください。

このメールに心当たりがない場合は、お手数ですが削除してください。
第三者がアクセスを試みている可能性があります。
    `.trim(),
  };
};

// 認証コード生成（6桁の数字）
export const generateAuthCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 認証コード送信
export const sendAuthCode = async (
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // メールアドレスがデータベースに存在するか確認
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // セキュリティのため、存在しない場合でも成功を返す
      return {
        success: true,
        message: '認証コードを送信しました',
      };
    }

    // 既存の未使用コードを無効化
    await prisma.$executeRaw`
      UPDATE auth_codes
      SET is_used = true
      WHERE email = ${email}
        AND is_used = false
        AND expires_at > NOW()
    `;

    // 新しい認証コードを生成
    const code = generateAuthCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分後

    // データベースに保存
    await prisma.$executeRaw`
      INSERT INTO auth_codes (email, code, expires_at, ip_address, user_agent)
      VALUES (${email}, ${code}, ${expiresAt}, ${ipAddress || null}, ${userAgent || null})
    `;

    // メール送信
    const transporter = createTransporter();
    if (transporter) {
      const template = getEmailTemplate(code);
      console.log('Sending email to:', email);
      console.log('From:', process.env.GMAIL_USER);
      await transporter.sendMail({
        from: `"SESスキル管理システム" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      console.log('Email sent successfully');
    } else {
      console.log('Transporter is null (test environment)');
    }

    return {
      success: true,
      message: '認証コードを送信しました',
    };
  } catch (error) {
    errorLog('認証コード送信エラー:', error);
    errorLog('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    errorLog('GMAIL_USER:', process.env.GMAIL_USER ? `SET (${process.env.GMAIL_USER})` : 'NOT SET');
    errorLog('GMAIL_PASSWORD:', process.env.GMAIL_PASSWORD ? 'SET' : 'NOT SET');
    return {
      success: false,
      message: 'メール送信に失敗しました',
    };
  }
};

// 認証コード検証
export const verifyAuthCode = async (
  email: string,
  code: string,
  ipAddress?: string
): Promise<{ success: boolean; message: string; user?: any }> => {
  try {
    // 認証コードを取得
    const authCode = await prisma.$queryRaw<any[]>`
      SELECT * FROM auth_codes
      WHERE email = ${email}
        AND code = ${code}
        AND is_used = false
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!authCode || authCode.length === 0) {
      // 試行回数を増やす
      await prisma.$executeRaw`
        UPDATE auth_codes
        SET attempts = attempts + 1
        WHERE email = ${email}
          AND is_used = false
          AND expires_at > NOW()
      `;

      // 最大試行回数を超えているか確認
      const maxAttempts = await prisma.$queryRaw<any[]>`
        SELECT * FROM auth_codes
        WHERE email = ${email}
          AND is_used = false
          AND expires_at > NOW()
          AND attempts >= max_attempts
      `;

      if (maxAttempts && maxAttempts.length > 0) {
        // 最大試行回数を超えた場合、コードを無効化
        await prisma.$executeRaw`
          UPDATE auth_codes
          SET is_used = true
          WHERE email = ${email}
            AND is_used = false
        `;

        return {
          success: false,
          message: '認証に失敗しました。最大試行回数を超えました。',
        };
      }

      return {
        success: false,
        message: '認証コードが正しくないか、有効期限が切れています',
      };
    }

    // 認証コードを使用済みにする
    await prisma.$executeRaw`
      UPDATE auth_codes
      SET is_used = true,
          used_at = NOW()
      WHERE id = ${authCode[0].id}
    `;

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        companyId: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'ユーザーが見つかりません',
      };
    }

    // 最終ログイン日時を更新
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      success: true,
      message: '認証に成功しました',
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        companyId: user.companyId?.toString() || null,
        roles: user.userRoles.map((ur) => ur.role.name),
      },
    };
  } catch (error) {
    errorLog('認証コード検証エラー:', error);
    return {
      success: false,
      message: '認証処理中にエラーが発生しました',
    };
  }
};

// 期限切れの認証コードをクリーンアップ
export const cleanupExpiredCodes = async (): Promise<void> => {
  try {
    await prisma.$executeRaw`
      DELETE FROM auth_codes
      WHERE expires_at < NOW()
        OR (is_used = true AND used_at < NOW() - INTERVAL '1 day')
    `;
  } catch (error) {
    errorLog('認証コードクリーンアップエラー:', error);
  }
};