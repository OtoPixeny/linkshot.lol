import { Button } from "./ui/button";

export default function LinkCard({ href, icon: Icon, title, className }) {
  return (
    <Button
      asChild
      variant="outline"
      className={`w-full max-w-[420px] mx-auto justify-start gap-3 h-14 ${className || ''}`}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        {Icon && <Icon className="w-6 h-6" />}
        {title}
      </a>
    </Button>
  );
}
