import { motion, useInView, easeOut, easeIn, easeInOut, cubicBezier } from 'motion/react';
import { useRef, CSSProperties } from 'react';

type Snapshot = Record<string, any>;

interface SplitTextProps {
  text?: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: Snapshot;
  to?: Snapshot;
  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties['textAlign'];
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  onLetterAnimationComplete?: () => void;
  style?: CSSProperties;
}

const easingMap: Record<string, any> = {
  'power3.out': cubicBezier(0.215, 0.61, 0.355, 1),
  'power2.out': cubicBezier(0.25, 0.46, 0.45, 0.94),
  'power4.out': cubicBezier(0.165, 0.84, 0.44, 1),
  'expo.out': cubicBezier(0.19, 1, 0.22, 1),
  'circ.out': cubicBezier(0.075, 0.82, 0.165, 1),
  'sine.out': cubicBezier(0.39, 0.575, 0.565, 1),
  'ease.out': easeOut,
  'ease.in': easeIn,
  'ease.inOut': easeInOut,
};

const resolveEase = (ease: string): any => easingMap[ease] ?? cubicBezier(0.215, 0.61, 0.355, 1);

const SplitText = ({
  text = '',
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
  style,
}: SplitTextProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, {
    once: true,
    amount: threshold,
    margin: rootMargin as any,
  });

  const segments =
    splitType === 'words' || splitType === 'lines'
      ? text.split(' ')
      : text.split('');

  const Tag: any = motion[tag];
  const easingFn = resolveEase(ease);

  const containerStyle: CSSProperties = {
    textAlign,
    display: 'inline-block',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    willChange: 'transform, opacity',
    ...style,
  };

  const lastIdx = segments.length - 1;

  return (
    <Tag ref={ref as any} className={className} style={containerStyle}>
      {segments.map((seg, i) => {
        const isSpace = seg === ' ' || seg === '';
        const display = isSpace ? ' ' : seg;
        const trailingSpace = (splitType === 'words' || splitType === 'lines') && i < lastIdx;
        return (
          <motion.span
            key={i}
            initial={from}
            animate={inView ? to : from}
            transition={{
              duration,
              delay: (i * delay) / 1000,
              ease: easingFn,
            }}
            onAnimationComplete={i === lastIdx ? onLetterAnimationComplete : undefined}
            style={{
              display: 'inline-block',
              willChange: 'transform, opacity',
            }}
          >
            {display}
            {trailingSpace ? ' ' : ''}
          </motion.span>
        );
      })}
    </Tag>
  );
};

export default SplitText;
