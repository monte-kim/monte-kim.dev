/** Site logo mark. Strokes follow `currentColor`, so it adapts to
 *  light/dark through the text color of its parent (design token `ink`). */
export function LogoMark({
  size = 26,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={34}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 248 75 L 115 320 L 248 320 Z M 305 145 L 305 320 L 415 305 Z M 78 375 L 452 360 L 410 452 L 110 452 Z" />
    </svg>
  );
}
