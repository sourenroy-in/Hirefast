import React, { useState } from "react";
import TopBar from "./components/TopBar.jsx";
import Welcome from "./pages/Welcome.jsx";
import Account from "./pages/Account.jsx";
import Jobs from "./pages/Jobs.jsx";
import Recruiter from "./pages/Recruiter.jsx";
import Admin from "./pages/Admin.jsx";

function savedUser() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (["seeker", "recruiter", "admin"].includes(user?.role)) return user;
  } catch {
    // An old or incomplete saved login should not stop the page from opening.
  }
  return null;
}

export default function App() {
  const [user, setUser] = useState(savedUser);
  const [page, setPage] = useState(user ? "dashboard" : "home");

  function logIn(result) {
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
    setPage("dashboard");
  }
  function logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
  }

  return (
    <>
      <TopBar
        user={user}
        onHome={() => setPage(user ? "dashboard" : "home")}
        onLogin={() => setPage("login")}
        onLogout={logOut}
      />
      {page === "home" && (
        <Welcome
          onLogin={() => setPage("login")}
          onRegister={() => setPage("register")}
          onBrowse={() => setPage("jobs")}
        />
      )}
      {(page === "login" || page === "register") && (
        <Account startAt={page} onDone={logIn} onBack={() => setPage("home")} />
      )}
      {page === "jobs" && <Jobs user={user} onLogin={() => setPage("login")} />}
      {page === "dashboard" && user?.role === "seeker" && <Jobs user={user} />}
      {page === "dashboard" && user?.role === "recruiter" && <Recruiter />}
      {page === "dashboard" && user?.role === "admin" && <Admin />}
      <footer>HireFast<br></br> A MERN project from DAITM</footer>
    </>
  );
}
