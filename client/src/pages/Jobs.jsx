import React, { useEffect, useState } from "react";
import { callApi } from "../api.js";
import Message from "../components/Message.jsx";

export default function Jobs({ user, onLogin }) {
  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [showApplied, setShowApplied] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const list = await callApi(showApplied ? "/jobs/applied" : "/jobs");
      setJobs(list);
      if (user?.role === "seeker" && !showApplied) {
        const applied = await callApi("/jobs/applied");
        setAppliedIds(applied.map((job) => job._id));
      }
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [showApplied]);
  async function apply(id) {
    if (!files[id]) {
      setMessage("Choose your resume first (PDF, DOC or DOCX).");
      return;
    }
    try {
      const form = new FormData();
      form.append("resume", files[id]);
      const result = await callApi(`/jobs/${id}/apply`, {
        method: "POST",
        body: form,
      });
      setMessage(result.message);
      setFiles({ ...files, [id]: null });
      setAppliedIds([...new Set([...appliedIds, id])]);
      if (showApplied) await load();
    } catch (err) {
      setMessage(err.message);
    }
  }
  const shown = jobs.filter((job) =>
    `${job.title} ${job.company} ${job.place}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="content">
      <div className="page-title">
        <div>
          <p className="tag">Find your place</p>
          <h1>{showApplied ? "My applications" : "Open jobs"}</h1>
        </div>
        <input
          className="search"
          placeholder="Search jobs or places"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {user?.role === "seeker" && (
        <button className="light" onClick={() => setShowApplied(!showApplied)}>
          {showApplied ? "Browse open jobs" : "My applications"}
        </button>
      )}
      {!user && (
        <p>
          To apply for a job,{" "}
          <button className="link" onClick={onLogin}>
            log in as a job seeker
          </button>
          .
        </p>
      )}
      <Message text={message} />
      <Message text={loadError} error />
      <section className="job-list">
        {loading && <p>Loading jobs...</p>}
        {shown.map((job) => {
          const alreadyApplied = appliedIds.includes(job._id);
          const canUpload = user?.role === "seeker" &&
            (showApplied ? !job.resumeUploaded : !alreadyApplied);

          return (
          <article className="panel job" key={job._id}>
            <div>
              <span className="tag">{job.place}</span>
              <h2>{job.title}</h2>
              <p>{job.company}</p>
              <p className="details">{job.details}</p>
            </div>
            {user?.role === "seeker" && !showApplied && alreadyApplied && (
              <p className="status ok">You have applied</p>
            )}
            {canUpload && (
              <div className="job-actions">
                <label className="resume-picker">
                  Resume (PDF, DOC, DOCX)
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) =>
                      setFiles({ ...files, [job._id]: event.target.files[0] })
                    }
                  />
                </label>
                <button onClick={() => apply(job._id)}>
                  {showApplied ? "Add resume" : "Apply with resume"}
                </button>
              </div>
            )}
            {user?.role === "seeker" && showApplied && job.resumeUploaded && (
              <p className="status ok">Resume sent with your application</p>
            )}
          </article>
          );
        })}
        {!loading && !loadError && shown.length === 0 && (
          <p>No jobs here yet. Try another search.</p>
        )}
      </section>
    </main>
  );
}
