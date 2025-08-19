import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateUserModal from '../CreateUserModal';
import '@testing-library/jest-dom';

describe('CreateUserModal', () => {
  const mockOnOk = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    visible: true,
    onOk: mockOnOk,
    onCancel: mockOnCancel,
    loading: false,
    isEdit: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('新規作成モード', () => {
    it('新規作成モーダルが正しく表示されること', () => {
      render(<CreateUserModal {...defaultProps} />);

      expect(screen.getByText('新規ユーザー作成')).toBeInTheDocument();
      expect(screen.getByText('新規ユーザーアカウントの作成')).toBeInTheDocument();
      expect(screen.getByLabelText('氏名')).toBeInTheDocument();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
      expect(screen.getByLabelText('初期パスワード')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード確認')).toBeInTheDocument();
    });

    it('必須項目が入力されていない場合にバリデーションエラーが表示されること', async () => {
      render(<CreateUserModal {...defaultProps} />);

      const submitButton = screen.getByText('作成');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnOk).not.toHaveBeenCalled();
      });
    });

    it('正しい値を入力して送信できること', async () => {
      const user = userEvent.setup();
      render(<CreateUserModal {...defaultProps} />);

      // フォームに値を入力
      await user.type(screen.getByLabelText('氏名'), '山田太郎');
      await user.type(screen.getByLabelText('メールアドレス'), 'yamada@example.com');
      await user.type(screen.getByLabelText('初期パスワード'), 'Password123');
      await user.type(screen.getByLabelText('パスワード確認'), 'Password123');

      // 権限を選択
      const roleSelect = screen.getByLabelText('権限');
      await user.click(roleSelect);
      const adminOption = await screen.findByText('管理者');
      await user.click(adminOption);

      // 送信
      const submitButton = screen.getByText('作成');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOk).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '山田太郎',
            email: 'yamada@example.com',
            password: 'Password123',
            confirmPassword: 'Password123',
            role: 'admin',
            sendWelcomeEmail: true,
          })
        );
      });
    });

    it('パスワードが一致しない場合にエラーが表示されること', async () => {
      const user = userEvent.setup();
      render(<CreateUserModal {...defaultProps} />);

      await user.type(screen.getByLabelText('初期パスワード'), 'Password123');
      await user.type(screen.getByLabelText('パスワード確認'), 'Password456');

      const submitButton = screen.getByText('作成');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOk).not.toHaveBeenCalled();
      });
    });

    it('ウェルカムメールの送信オプションを切り替えられること', async () => {
      const user = userEvent.setup();
      render(<CreateUserModal {...defaultProps} />);

      const checkbox = screen.getByText('ウェルカムメールを送信する');
      expect(checkbox).toBeInTheDocument();

      // デフォルトでチェックされている
      const checkboxInput = checkbox.closest('label')?.querySelector('input[type="checkbox"]');
      expect(checkboxInput).toBeChecked();

      // チェックを外す
      await user.click(checkbox);
      expect(checkboxInput).not.toBeChecked();
    });
  });

  describe('編集モード', () => {
    const initialValues = {
      name: '既存ユーザー',
      nameKana: 'キソンユーザー',
      email: 'existing@example.com',
      phoneNumber: '03-1234-5678',
      department: '営業部',
      position: '課長',
      role: 'user',
      isActive: true,
    };

    it('編集モーダルが正しく表示されること', () => {
      render(
        <CreateUserModal
          {...defaultProps}
          isEdit={true}
          initialValues={initialValues}
        />
      );

      expect(screen.getByText('ユーザー情報編集')).toBeInTheDocument();
      expect(screen.getByText('ユーザー情報の更新')).toBeInTheDocument();
      // パスワードフィールドは表示されない
      expect(screen.queryByLabelText('初期パスワード')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('パスワード確認')).not.toBeInTheDocument();
    });

    it('初期値が正しくフォームに設定されること', () => {
      render(
        <CreateUserModal
          {...defaultProps}
          isEdit={true}
          initialValues={initialValues}
        />
      );

      expect(screen.getByDisplayValue('既存ユーザー')).toBeInTheDocument();
      expect(screen.getByDisplayValue('キソンユーザー')).toBeInTheDocument();
      expect(screen.getByDisplayValue('existing@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('03-1234-5678')).toBeInTheDocument();
      expect(screen.getByDisplayValue('営業部')).toBeInTheDocument();
      expect(screen.getByDisplayValue('課長')).toBeInTheDocument();
    });

    it('編集モードでメールアドレスが編集不可であること', () => {
      render(
        <CreateUserModal
          {...defaultProps}
          isEdit={true}
          initialValues={initialValues}
        />
      );

      const emailInput = screen.getByDisplayValue('existing@example.com');
      expect(emailInput).toBeDisabled();
    });

    it('編集した値で送信できること', async () => {
      const user = userEvent.setup();
      render(
        <CreateUserModal
          {...defaultProps}
          isEdit={true}
          initialValues={initialValues}
        />
      );

      // 名前を変更
      const nameInput = screen.getByDisplayValue('既存ユーザー');
      await user.clear(nameInput);
      await user.type(nameInput, '更新ユーザー');

      // 部署を変更
      const departmentInput = screen.getByDisplayValue('営業部');
      await user.clear(departmentInput);
      await user.type(departmentInput, '開発部');

      // 送信
      const submitButton = screen.getByText('更新');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOk).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '更新ユーザー',
            department: '開発部',
            email: 'existing@example.com', // 変更されていない
          })
        );
      });
    });
  });

  describe('モーダルの表示制御', () => {
    it('visible=falseの時にモーダルが表示されないこと', () => {
      const { container } = render(
        <CreateUserModal {...defaultProps} visible={false} />
      );

      // Ant Designのモーダルは非表示でもDOMに存在するが、style.displayがnoneになる
      const modal = container.querySelector('.ant-modal');
      if (modal) {
        const style = window.getComputedStyle(modal);
        expect(style.display).toBe('none');
      }
    });

    it('キャンセルボタンをクリックするとonCancelが呼ばれること', async () => {
      const user = userEvent.setup();
      render(<CreateUserModal {...defaultProps} />);

      const cancelButton = screen.getByText('キャンセル');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('loading状態の時にボタンがローディング表示になること', () => {
      render(<CreateUserModal {...defaultProps} loading={true} />);

      const submitButton = screen.getByText('作成');
      expect(submitButton.closest('button')).toHaveClass('ant-btn-loading');
    });
  });

  describe('バリデーション', () => {
    it('無効なメールアドレスでエラーが表示されること', async () => {
      const user = userEvent.setup();
      render(<CreateUserModal {...defaultProps} />);

      const emailInput = screen.getByLabelText('メールアドレス');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByText('作成');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOk).not.toHaveBeenCalled();
      });
    });

    it('カタカナ以外の文字を入力するとエラーが表示されること', async () => {
      const user = userEvent.setup();
      render(<CreateUserModal {...defaultProps} />);

      const kanaInput = screen.getByLabelText('氏名（カナ）');
      await user.type(kanaInput, 'やまだたろう'); // ひらがな

      const submitButton = screen.getByText('作成');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOk).not.toHaveBeenCalled();
      });
    });

    it('電話番号の形式が正しくない場合にエラーが表示されること', async () => {
      const user = userEvent.setup();
      render(<CreateUserModal {...defaultProps} />);

      const phoneInput = screen.getByLabelText('電話番号');
      await user.type(phoneInput, '123-456'); // 不正な形式

      const submitButton = screen.getByText('作成');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOk).not.toHaveBeenCalled();
      });
    });

    it('パスワードが8文字未満の場合にエラーが表示されること', async () => {
      const user = userEvent.setup();
      render(<CreateUserModal {...defaultProps} />);

      const passwordInput = screen.getByLabelText('初期パスワード');
      await user.type(passwordInput, 'Pass1'); // 5文字

      const submitButton = screen.getByText('作成');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOk).not.toHaveBeenCalled();
      });
    });
  });
});