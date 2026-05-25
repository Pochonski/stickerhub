declare module "react-pageflip" {
  import type { ReactNode, RefAttributes } from "react";

  interface PageFlipInstance {
    on: (event: string, callback: (e: { data: number }) => void) => void;
    off: (event: string) => void;
    flipNext: (corner?: string) => void;
    flipPrev: (corner?: string) => void;
    turnToPage: (page: number) => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
    clear: () => void;
  }

  interface HTMLFlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startPage?: number;
    showCover?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    renderOnlyPageLengthChange?: boolean;
    startZIndex?: number;
    mobileScrollSupport?: boolean;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    children?: ReactNode;
    onChangeOrientation?: (e: { data: string }) => void;
    onChangeState?: (e: { data: string }) => void;
    onInit?: (e: { data: number }) => void;
    onUpdate?: (e: { data: number }) => void;
    onFlip?: (e: { data: number }) => void;
    ref?: React.Ref<{ pageFlip: () => PageFlipInstance }>;
  }

  const HTMLFlipBook: React.FC<HTMLFlipBookProps>;
  export default HTMLFlipBook;
}
