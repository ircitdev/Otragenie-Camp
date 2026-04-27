import { useEffect } from 'react';

/**
 * Блокирует прокрутку body когда модальное окно открыто.
 * Сохраняет текущую scroll-позицию и восстанавливает после закрытия.
 * Работает корректно на iOS Safari (где обычный overflow:hidden не помогает).
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    // Сохраняем оригинальные стили
    const originalBodyStyle = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };
    const originalHtmlOverflow = html.style.overflow;

    // Компенсируем исчезновение скроллбара (desktop)
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    // iOS-safe scroll lock
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    html.style.overflow = 'hidden';

    return () => {
      body.style.overflow = originalBodyStyle.overflow;
      body.style.position = originalBodyStyle.position;
      body.style.top = originalBodyStyle.top;
      body.style.width = originalBodyStyle.width;
      body.style.paddingRight = originalBodyStyle.paddingRight;
      html.style.overflow = originalHtmlOverflow;
      // Восстанавливаем позицию скролла
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
