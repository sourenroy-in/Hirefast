import React, { useEffect, useState } from "react";
import { callApi, downloadFile } from "../api.js";
import Message from "../components/Message.jsx";

export default function Recruiter() {
    const [jobs, setJobs] = useState([]);
    const [form, setForm] = useState({
        title: "",
        company: "",
        place: "",
        details: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    async function load() {
        setLoading(true);
        setLoadError("");
        try {
            setJobs(await callApi("/jobs/mine"));
        } catch (err) {
            setLoadError(err.message);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
    }, []);
    async function submit(event) {
        event.preventDefault();
        try {
            await callApi("/jobs", { method: "POST", body: JSON.stringify(form) });
            setForm({ title: "", company: "", place: "", details: "" });
            setMessage("Job sent to admin for approval");
            load();
        } catch (err) {
            setMessage(err.message);
        }
    }
    async function removeJob(id) {
        try {
            const result = await callApi(`/jobs/${id}`, { method: "DELETE" });
            setMessage(result.message);
            load();
        } catch (err) {
            setMessage(err.message);
        }
    }
    async function getResume(job, application) {
        try {
            await downloadFile(
                `/jobs/${job._id}/applications/${application._id}/resume`,
                application.resumeName,
            );
        } catch (err) {
            setMessage(err.message);
        }
    }
    return (
        <main className="content">
            <p className="tag">Recruiter space</p>
            <h1>Your job posts</h1>
            <Message text={message} />
            <Message text={loadError} error />
            <form className="panel post-form" onSubmit={submit}>
                <h2>Add a job</h2>
                <div className="form-grid">
                    {[
                        ["title", "Job title"],
                        ["company", "Company"],
                        ["place", "Place"],
                    ].map(([name, label]) => (
                        <label key={name}>
                            {label}
                            <input
                                value={form[name]}
                                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                                required
                            />
                        </label>
                    ))}
                </div>
                <label>
                    Short description
                    <textarea
                        value={form.details}
                        onChange={(e) => setForm({ ...form, details: e.target.value })}
                        required
                    />
                </label>
                <button>Send for approval</button>
            </form>
            <h2 className="section-head">Your posts</h2>
            <section className="job-list">
                {loading && <p>Loading your posts...</p>}
                {jobs.map((job) => (
                    <article className="panel job" key={job._id}>
                        <div>
                            <span className={job.approved ? "status ok" : "status"}>
                                {job.approved ? "Live" : "Waiting for approval"}
                            </span>
                            <h2>{job.title}</h2>
                            <p>
                                {job.company} · {job.place}
                            </p>
                            <p>{job.applicants.length} applicants</p>
                            <button className="light" onClick={() => removeJob(job._id)}>
                                Remove post
                            </button>
                            <h3>Applicants and resumes</h3>
                            {job.applications.map((application) => (
                                <div className="applicant" key={application._id}>
                                    <span>
                                        {application.candidate?.name} ·{" "}
                                        {application.candidate?.email}
                                    </span>
                                    <button
                                        className="light"
                                        onClick={() => getResume(job, application)}
                                    >
                                        Download resume
                                    </button>
                                </div>
                            ))}
                            {job.applicants
                                .filter(
                                    (person) =>
                                        !job.applications.some(
                                            (application) =>
                                                String(application.candidate?._id) === String(person._id),
                                        ),
                                )
                                .map((person) => (
                                    <p key={person._id}>
                                        {person.name} · {person.email} (older application has no
                                        resume)
                                    </p>
                                ))}
                        </div>
                    </article>
                ))}
                {!loading && !loadError && jobs.length === 0 && (
                    <p>You have not posted a job yet.</p>
                )}
            </section>
        </main>
    );
}
