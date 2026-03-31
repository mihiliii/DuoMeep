import heroImage from '../../assets/background.webp';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <img src={heroImage} alt="Hero" className="HomeImage" />
        <button className="hero-button">Find a Meep</button>
      </div>
    </div>
  );
}

export default Home;
