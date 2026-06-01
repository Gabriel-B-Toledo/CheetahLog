import { AVATAR_FG, initials } from "../data";

type Props = { name: string; tint?: string; size?: number };

export default function Avatar({ name, tint, size = 34 }: Props) {
  const t = tint ?? "rgb(225,245,238)";
  return (
    <span
      className="cl-avatar"
      style={{
        width: size,
        height: size,
        background: t,
        color: AVATAR_FG[t] ?? "rgb(95,94,90)",
        fontSize: size <= 32 ? 11 : 12,
      }}
    >
      {initials(name)}
    </span>
  );
}
