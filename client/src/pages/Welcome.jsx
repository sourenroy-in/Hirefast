
export default function Welcome({ onLogin, onRegister, onBrowse }) {
  return (
    <main>
      <section className="hero">
        <p className="tag">A simpler way to start</p>
        <h1>
          Your next job
          <br />
          starts here.
        </h1>
        <p className="intro">
          Find a good opportunity, or meet the right person for your team.
        </p>
        <div className="actions">
          <button onClick={onBrowse}>Browse jobs</button>
          <button className="light" onClick={onRegister}>
            Create an account
          </button>
        </div>
      </section>
      <section className="steps">
        <article>
          <b>01</b>
          <h3>Make a profile</h3>
          <p>Join as a job seeker or recruiter.</p>
        </article>
        <article>
          <b>02</b>
          <h3>Find your match</h3>
          <p>Browse jobs or share an opening.</p>
        </article>
        <article>
          <b>03</b>
          <h3>Take the next step</h3>
          <p>Apply and start a conversation.</p>
        </article>
      </section>
    </main>
  );
}
