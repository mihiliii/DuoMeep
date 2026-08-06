import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer center">
      <span>© {new Date().getFullYear()} DuoMeep</span>
    </footer>
  );
}
