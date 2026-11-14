import React, { useState } from "react";
import { callApi } from "../api.js";
import Message from "../components/Message.jsx";

export default function Account({ startAt, onDone, onBack }) {
    const [mode, setMode] = useState(startAt);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "seeker",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setMessage("");
        try {
            if (mode === "register") {
                await callApi("/users/register", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
                setMode("login");
                setMessage("Account made. Now log in.");
            } else {
                const result = await callApi("/users/login", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
                onDone(result);
            }
        } catch (err) {
            setError(true);
            setMessage(err.message);
        }
    }

    function change(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    return (
        <main className="account-wrap">
            <form className="panel account" onSubmit={submit}>
                <button type="button" className="back" onClick={onBack}>
                    ← Back
                </button>
                <p className="tag">Welcome to HireFast</p>
                <h2>{mode === "login" ? "Good to see you" : "Create your account"}</h2>
                {mode === "register" && (
                    <>
                        <label>
                            Your name
                            <input name="name" value={form.name} onChange={change} required />
                        </label>
                        <label>
                            I am a
                            <select name="role" value={form.role} onChange={change}>
                                <option value="seeker">Looking for a job</option>
                                <option value="recruiter">Hiring people</option>
                            </select>
                        </label>
                        <p className="form-hint">
                            For the local admin demo, use <strong>admin@hirefast.com</strong>.
                        </p>
                    </>
                )}
                <label>
                    Email
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={change}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={change}
                        required
                        minLength="6"
                    />
                </label>
                <Message text={message} error={error} />
                <button className="wide">
                    {mode === "login" ? "Log in" : "Join HireFast"}
                </button>
                <p className="switch">
                    {mode === "login" ? "New here?" : "Already joined?"}{" "}
                    <button
                        type="button"
                        className="link"
                        onClick={() => {
                            setMode(mode === "login" ? "register" : "login");
                            setMessage("");
                            setError(false);
                        }}
                    >
                        {mode === "login" ? "Create an account" : "Log in"}
                    </button>
                </p>
            </form>
        </main>
    );
}
