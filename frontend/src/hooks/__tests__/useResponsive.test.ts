import { renderHook, act } from '@testing-library/react';
import useResponsive from '../useResponsive';

describe('useResponsive', () => {
  const originalInnerWidth = window.innerWidth;

  beforeAll(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      enumerable: true,
      configurable: true,
      value: 1920,
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      enumerable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      enumerable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event('resize'));
  };

  it('デスクトップサイズを正しく判定', () => {
    const { result } = renderHook(() => useResponsive());
    
    act(() => {
      setWindowWidth(1920);
    });

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.screenSize).toBe('xxl');
  });

  it('タブレットサイズを正しく判定', () => {
    const { result } = renderHook(() => useResponsive());
    
    act(() => {
      setWindowWidth(1024);
    });

    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.screenSize).toBe('lg');
  });

  it('モバイルサイズを正しく判定', () => {
    const { result } = renderHook(() => useResponsive());
    
    act(() => {
      setWindowWidth(375);
    });

    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.screenSize).toBe('xs');
  });

  it('ブレークポイントの境界値を正しく判定', () => {
    const { result } = renderHook(() => useResponsive());

    // xs -> sm
    act(() => {
      setWindowWidth(576);
    });
    expect(result.current.screenSize).toBe('sm');

    // sm -> md
    act(() => {
      setWindowWidth(768);
    });
    expect(result.current.screenSize).toBe('md');

    // md -> lg
    act(() => {
      setWindowWidth(992);
    });
    expect(result.current.screenSize).toBe('lg');

    // lg -> xl
    act(() => {
      setWindowWidth(1200);
    });
    expect(result.current.screenSize).toBe('xl');

    // xl -> xxl
    act(() => {
      setWindowWidth(1600);
    });
    expect(result.current.screenSize).toBe('xxl');
  });

  it('リサイズイベントで状態が更新される', () => {
    const { result } = renderHook(() => useResponsive());

    act(() => {
      setWindowWidth(1920);
    });
    expect(result.current.isDesktop).toBe(true);

    act(() => {
      setWindowWidth(375);
    });
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });
});