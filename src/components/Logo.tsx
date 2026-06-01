type Props = { size?: number; radius?: number };

export default function Logo({ size = 32, radius = 8 }: Props) {
  return (
    <span className="cl-logo" style={{ width: size, height: size, borderRadius: radius }}>
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7h11v8H3z" />
        <path d="M14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="17" r="1.6" />
        <circle cx="17.5" cy="17" r="1.6" />
      </svg>
    </span>
  );
}
