import './About.css';

function About() {
  return (
    <section className="about-hero">
      <h1 className="about-title">About</h1>
      <div className="about-content">
        <div className="about-left">
          <div className="about-us">US</div>
          <p className="about-small">Two is a good start.</p>
        </div>
        <div className="about-right">
          <div className="panel panel-2" />
        </div>
      </div>
    </section>
  );
}

export default About;
