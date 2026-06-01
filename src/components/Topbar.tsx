type Props = { title: string; subtitle: string; onNew: () => void };

export default function Topbar({ title, subtitle, onNew }: Props) {
  return (
    <header className="cl-topbar">
      <div>
        <h1 className="cl-topbar-title">{title}</h1>
        <p className="cl-topbar-sub">{subtitle}</p>
      </div>
      <button className="cl-btn-primary" onClick={onNew}>
        + Nova Entrega
      </button>
    </header>
  );
}
