import { NAV } from "../data";
import type { NavKey, User } from "../types";
import Avatar from "./Avatar";
import Logo from "./Logo";

type Props = {
  active: NavKey;
  onNav: (item: NavKey) => void;
  user: User;
  onLogout: () => void;
};

export default function Sidebar({ active, onNav, user, onLogout }: Props) {
  return (
    <aside className="cl-sidebar">
      <div className="cl-brand">
        <Logo />
        <div className="cl-brand-text">
          <span className="cl-brand-name">CheetahLog</span>
          <span className="cl-brand-ver">v2.0</span>
        </div>
      </div>
      <nav className="cl-nav">
        {NAV.map((item) => {
          const on = item === active;
          return (
            <button
              key={item}
              className={"cl-nav-item" + (on ? " on" : "")}
              onClick={() => onNav(item)}
            >
              {on && <span className="cl-nav-accent" />}
              {item}
            </button>
          );
        })}
      </nav>
      <div className="cl-user">
        <Avatar name={user.nome} tint="rgb(230,241,251)" size={32} />
        <div className="cl-user-text">
          <span className="cl-user-name">{user.nome}</span>
          <span className="cl-user-role">{user.role}</span>
        </div>
        <button className="cl-logout" onClick={onLogout} title="Sair">
          Sair
        </button>
      </div>
    </aside>
  );
}
