import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { StarsIcon } from "lucide-react";
import { CornerRightUp } from "lucide-react";
import { CornerRightDown } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

export default function Hero() {
  const { isSignedIn } = useUser();
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      
      // Check if any dropdown is open
      const dropdownOpen = document.querySelector('[data-state="open"]');
      if (dropdownOpen) return;
      
      const rect = heroRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / 50;
      const moveY = (y - centerY) / 50;
      
      const leftImg = document.querySelector('.overlay-img');
      const rightImg = document.querySelector('.overlay-img-right');
      
      if (leftImg) {
        leftImg.style.transform = `rotate(-15deg) translateX(${moveY * 0.5}px) translateY(${-moveX * 0.5}px)`;
      }
      if (rightImg) {
        rightImg.style.transform = `rotate(15deg) translateX(${-moveY * 0.5}px) translateY(${moveX * 0.5}px)`;
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div className="hero-section py-14 px-6 md:px-20 lg:px-32 grid" ref={heroRef}>
      <div className="border mb-4 w-fit mx-auto py-1.5 px-3 rounded-full bg-background">
          <p className="text-xs flex items-center justify-center gap-1">
            <StarsIcon className="h-4 w-4" />
            LinkShot ბეტა ვერსია V1.0.1
            <ArrowRight className="h-4 w-4" />
          </p>
      </div>
      <div className="grid place-content-center sm:text-center gap-2">
        <h2 className="hero-title text-3xl max-w-md sm:max-w-3xl md:max-w-4xl sm:text-4xl font-medium md:text-5xl text-gray-900 dark:text-gray-50">გააზიარე შენი სოციალი
           <span className="hero-title animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-slate-500 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">ხარისხიანად , მარტივად !</span></h2>
        <p className="hero-des md:text-xl text-base sm:text-lg text-[13.5px] max-w-sm md:max-w-2xl text-center sm:mx-auto text-foreground/70 mt-4">
          მოგესალმებით ჩვენ ვართ პლატფორმა LinkShot , ჩვენი მთავარი მიზანია დაეხმაროს ხალხს 
          თავიანთი სოციალის , ხარისხიანად და მარტივად გაზიარებისთვის.
        </p>
      </div>
      <div className="hero-buttons flex items-center justify-center gap-2.5 mt-10">
        <Button asChild>
          <Link
            to={!isSignedIn ? "/auth/sign-in" : "/dashboard/manage"}
            className="hero-btn gap-2"
          >
            დაიწყე ახლავე
            <CornerRightDown className="!h-4 !w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="hero-btn">
          <a
            href="/pixeny"
            className="flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            დემოს ნახვა <ArrowRight className="h-4 w-4 -rotate-45" />
          </a>
        </Button>
      </div>
      <div className="mt-32 w-fit h-fit border-primary/10 border-2 rounded-lg mx-auto relative">
        <img
          className="demoimg rounded-lg"
          src="/assets/homepage-dark.png"
          alt="Preview"
        />
      </div>
    </div>
  );
}
