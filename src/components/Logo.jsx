import { PartyPopper } from "lucide-react";
import { QrCode } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="logo-full select-none hover:bg-secondary py-1 px-3 rounded-md flex items-center gap-1.5"
    >
      <picture>
        <source media="(max-width: 768px)" srcSet="https://i.imgur.com/ES8tURJ.png" />
        <img src="https://i.imgur.com/ES8tURJ.png" width={200} alt="LinkShot Logo" className="logo logo-img max-w-[50px] mt-1 md:max-w-none" />
      </picture>
      <h1 className="logo-text" style={{fontSize:'20px' , fontWeight:'bolder !important'}}>linkshot.lol</h1>
    </Link>
  );
}
