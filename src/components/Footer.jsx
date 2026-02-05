import { Link } from "react-router-dom";
import Logo from "./Logo";
import { ModeToggle } from "./ModeToggle";

export default function Footer() {
  return (
    <footer className="px-6 h-32 flex items-center justify-center sm:px-10 md:px-30 text-center sm:text-left">
      <p className="text-sm text-foreground/80 sm:text-base">
        ააწყეთ თქვენი სოციალ ფეიჯი <a href="/"className="text-foreground underline">LinkShot</a> - ის საშალებით  {" "}
        <a
          className="text-foreground underline"
          href="/"
        >
           დაწყება
        </a>
        .
      </p>
    </footer>
  );
}
