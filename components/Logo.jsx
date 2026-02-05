import { PartyPopper } from "lucide-react";
import { QrCode } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="logo select-none hover:bg-secondary py-1 px-3 rounded-md flex items-center gap-1.5"
    >
      <h1 className="logo-text text-lg font-semibold">LinkShot</h1>
      <PartyPopper className="!h-4 !w-4" />
    </Link>
  );
}
