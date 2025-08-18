import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OfferStatusBadge } from '../OfferStatusBadge';

describe('OfferStatusBadge', () => {
  it('SENT ステータスを正しく表示する', () => {
    render(<OfferStatusBadge status="SENT" />);
    
    const badge = screen.getByText('送信済み');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('ant-badge-status-processing');
  });

  it('OPENED ステータスを正しく表示する', () => {
    render(<OfferStatusBadge status="OPENED" />);
    
    const badge = screen.getByText('開封済み');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('ant-badge-status-default');
  });

  it('PENDING ステータスを正しく表示する', () => {
    render(<OfferStatusBadge status="PENDING" />);
    
    const badge = screen.getByText('検討中');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('ant-badge-status-warning');
  });

  it('ACCEPTED ステータスを正しく表示する', () => {
    render(<OfferStatusBadge status="ACCEPTED" />);
    
    const badge = screen.getByText('承諾');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('ant-badge-status-success');
  });

  it('DECLINED ステータスを正しく表示する', () => {
    render(<OfferStatusBadge status="DECLINED" />);
    
    const badge = screen.getByText('辞退');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('ant-badge-status-error');
  });

  it('WITHDRAWN ステータスを正しく表示する', () => {
    render(<OfferStatusBadge status="WITHDRAWN" />);
    
    const badge = screen.getByText('撤回');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('ant-badge-status-default');
  });

  it('カスタムクラス名を適用できる', () => {
    const { container } = render(
      <OfferStatusBadge status="SENT" className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('カウント付きで表示できる', () => {
    render(<OfferStatusBadge status="PENDING" count={5} />);
    
    expect(screen.getByText('検討中')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});