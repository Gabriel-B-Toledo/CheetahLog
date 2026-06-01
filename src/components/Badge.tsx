import { STATUS } from "../data";
import type { StatusKey } from "../types";

export default function Badge({ status }: { status: StatusKey }) {
  const s = STATUS[status];
  return (
    <span className="cl-badge" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}
