import React from "react";

export default function TopBar({ user, onHome, onLogin, onLogout }) {
  return (
    <header className="topbar">
      <button className="logo" onClick={onHome}>
        hire<span>fast</span>
      </button>
      <nav>
        <button className="link" onClick={onHome}>
          Home
        </button>
        {user ? (
          <>
            <span>Hello, {user.name}</span>
            <button className="link" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <button onClick={onLogin}>Log in</button>
        )}
      </nav>
    </header>
  );
}
