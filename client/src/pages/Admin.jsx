import React, { useEffect, useState } from "react";
import { callApi, downloadFile } from "../api.js";
import Message from "../components/Message.jsx";

export default function Admin() {
    const [jobs, setJobs] = useState([]);
    const [applicationJobs, setApplicationJobs] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    async function load() {
        setLoading(true);
        setLoadError("");
        try {
            const [waitingJobs, jobsWithApplications] = await Promise.all([
                callApi("/jobs/review"),
                callApi("/jobs/applications"),
            ]);
            setJobs(waitingJobs);
            setApplicationJobs(jobsWithApplications);
        } catch (err) {
            setLoadError(err.message);
        } finally {
            setLoading(false);
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
    useEffect(() => {
        load();
    }, []);
    async function act(id, action) {
        try {
            await callApi(
                action === "approve" ? `/jobs/${id}/approve` : `/jobs/${id}`,
                action === "approve" ? { method: "PATCH" } : { method: "DELETE" },
            );
            setMessage(action === "approve" ? "Job approved" : "Job removed");
            load();
        } catch (err) {
            setMessage(err.message);
        }
    }
    return (
        <main className="content">
            <p className="tag">Admin space</p>
            <h1>Admin dashboard</h1>
            <p>
                Approve jobs and view applicants, like the recruiter and seeker pages
                combined.
            </p>
            <Message text={message} />
            <Message text={loadError} error />
            <h2 className="section-head">Jobs waiting for approval</h2>
            <section className="job-list">
                {loading && <p>Loading admin data...</p>}
                {jobs.map((job) => (
                    <article className="panel job" key={job._id}>
                        <div>
                            <h2>{job.title}</h2>
                            <p>
                                {job.company} · {job.place}
                            </p>
                            <p>Posted by {job.owner?.name}</p>
                            <p className="details">{job.details}</p>
                        </div>
                        <div className="actions">
                            <button onClick={() => act(job._id, "approve")}>Approve</button>
                            <button className="light" onClick={() => act(job._id, "remove")}>
                                Remove
                            </button>
                        </div>
                    </article>
                ))}
                {!loading && !loadError && jobs.length === 0 && (
                    <p>All clear. No jobs waiting for review.</p>
                )}
            </section>
            <h2 className="section-head">Applications and resumes</h2>
            <section className="job-list">
                {applicationJobs.flatMap((job) => [
                    ...job.applications.map((application) => (
                        <article className="panel applicant-card" key={application._id}>
                            <div>
                                <h3>{application.candidate?.name || "Applicant"}</h3>
                                <p>{application.candidate?.email}</p>
                                <p>{job.title} · {job.company}</p>
                            </div>
                            <button className="light" onClick={() => getResume(job, application)}>
                                Download resume
                            </button>
                        </article>
                    )),
                    ...job.applicants
                        .filter((person) => !job.applications.some((application) => String(application.candidate?._id) === String(person._id)))
                        .map((person) => (
                            <article className="panel applicant-card" key={`${job._id}-${person._id}`}>
                                <div>
                                    <h3>{person.name}</h3>
                                    <p>{person.email}</p>
                                    <p>{job.title} · {job.company}</p>
                                    <p>Resume not uploaded for this older application.</p>
                                </div>
                            </article>
                        )),
                ])}
                {!loading && !loadError && applicationJobs.every((job) => job.applications.length === 0 && job.applicants.length === 0) && (
                    <p>No resumes have been submitted yet.</p>
                )}
            </section>
        </main>
    );
}
