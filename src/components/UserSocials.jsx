import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/ui/loader";
import { Icons } from "@/components/icons";
import UserModel from "../models/user";
import CustomLinkModel from "../models/customLink";
import { Share2, Eye } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/user-avatar";
import { useToast } from "@/components/ui/use-toast";

// Lazy load icons only when needed
const getIcon = (iconName) => {
  return Icons[iconName] || Icons.globe;
};

// Get rank icon based on rank name
const getRankIcon = (rank) => {
  const rankIcons = {
    "მომხმარებელი": "/rank-img/member.png",
    "ბუსტერი": "/rank-img/booster.png", 
    "ადმინისტრატორი": "/rank-img/administrator.png",
    "მოდერატორი": "/rank-img/moderator.png",
    "owner": "/rank-img/owner.png",
    "მფლობელი": "/rank-img/owner.png",
    "sponsor": "/rank-img/sponsor.png",
    "სპონსორი": "/rank-img/sponsor.png",
    "პარტნიორი": "/rank-img/partner.png"
  };
  return rankIcons[rank] || rankIcons["მომხმარებელი"];
};

// Get all rank icons and names from comma-separated ranks
const getAllRankData = (ranks) => {
  if (!ranks) return [{ icon: getRankIcon("მომხმარებელი"), name: "მომხმარებელი" }];
  
  const rankArray = ranks.split(',').map(r => r.trim());
  return rankArray.map(rank => ({
    icon: getRankIcon(rank),
    name: rank
  })).filter(item => item.icon);
};

export default function UserSocials({ userDataName }) {
  const [loading, setLoading] = useState(true);
  const { user, isSignedIn } = useAuth();
  const { toast } = useToast();

  const [image, setImage] = useState("");
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");

  const [links, setLinks] = useState([]);
  const [customLinks, setCustomLinks] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const [showPrivate, setShowPrivate] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState(false);
  const [accessError, setAccessError] = useState(false);
  const [views, setViews] = useState(0);
  const [showFullBio, setShowFullBio] = useState(false);
  const [rank, setRank] = useState("მომხმარებელი");
  const [rankData, setRankData] = useState([{ icon: getRankIcon("მომხმარებელი"), name: "მომხმარებელი" }]);

  const handleInput = () => {
    if (!inputKey) return;

    if (inputKey === links?.accessKey) {
      setShowPrivate(true);
      setAccessError(false);
    } else {
      setAccessError(true);
      setShowPrivate(false);
    }
  };

  useEffect(() => {
    let username = userDataName;
    const loadUserData = async () => {
      try {
        const userData = await UserModel.getByUsername(username);
        
        if (userData) {
          console.log('User data loaded for:', username);
          setImage(userData.avatar_url || userData.image);
          setName(userData.name);
          setBio(userData.bio);
          setLinks(userData);
          setViews(userData.views || 0);
          setRank(userData.rank || "მომხმარებელი");
          const data = getAllRankData(userData.rank || "მომხმარებელი");
          setRankData(data);
          console.log('User rank:', userData.rank, 'Rank data:', data);
          
          // Check if user is in top 3
          // Intro disabled for top 3 users
          
          // Load custom links
          const customLinksData = await CustomLinkModel.getByUsername(username);
          setCustomLinks(customLinksData || []);
          
          // Increment views in background without blocking UI
          setTimeout(() => {
            UserModel.incrementViews(username).catch(error => {
              console.error('Error incrementing views:', error);
            });
          }, 100);
          
          setLoading(false);
        } else {
          console.log('User not found:', username);
          setNotFound(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
        setNotFound(true);
      }
    };

    loadUserData();
  }, [userDataName]);

  const proffesional = [
    "linkedIn",
    "gitHub",
    "stackoverflow",
    "leetcode",
    "codeforces",
    "hackerrank",
    "codechef",
    "geeksforgeeks",
  ];
  const social = [
    "youtube",
    "instagram",
    "facebook",
    "snapchat",
    "twitter",
    "threads",
    "reddit",
  ];
  const creative = ["twitch", "soundcloud", "spotify", "apple music"];
  const messaging = ["discord", "telegram", "whatsapp", "skype"];
  const storefront = [
    "amazon storefront",
    "shopify",
    "ko-fi",
    "buy me a coffee",
    "patreon",
  ];
  const miscellaneous = ["website", "blog", "email", "phone"];

  const handleEmailClick = (email) => {
    navigator.clipboard.writeText(email).then(() => {
      toast({
        title: "ემაილი დაკოპირდა!",
        description: `${email} წარმატებით დაკოპირდა ბუფერში`,
        duration: 3000,
      });
    }).catch(err => {
      console.error('Failed to copy email:', err);
      toast({
        title: "შეცდომა",
        description: "ემაილის დაკოპირება ვერ მოხერხდა",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  const generateSocialUrl = (platform, username) => {
    if (!username || typeof username !== "string") return "";
    
    const cleanUsername = username.trim();
    
    // If already a full URL, return as is
    if (cleanUsername.startsWith("http://") || cleanUsername.startsWith("https://")) {
      return cleanUsername;
    }
    
    // Generate URLs based on platform
    const urlPatterns = {
      instagram: `https://instagram.com/${cleanUsername}`,
      facebook: `https://facebook.com/${cleanUsername}`,
      twitter: `https://twitter.com/${cleanUsername}`,
      threads: `https://threads.net/${cleanUsername}`,
      youtube: `https://youtube.com/${cleanUsername}`,
      snapchat: `https://snapchat.com/add/${cleanUsername}`,
      reddit: `https://reddit.com/user/${cleanUsername}`,
      linkedIn: `https://linkedin.com/in/${cleanUsername}`,
      gitHub: `https://github.com/${cleanUsername}`,
      stackoverflow: `https://stackoverflow.com/users/${cleanUsername}`,
      leetcode: `https://leetcode.com/${cleanUsername}`,
      codeforces: `https://codeforces.com/profile/${cleanUsername}`,
      hackerrank: `https://hackerrank.com/${cleanUsername}`,
      codechef: `https://codechef.com/users/${cleanUsername}`,
      geeksforgeeks: `https://auth.geeksforgeeks.org/user/${cleanUsername}`,
      twitch: `https://twitch.tv/${cleanUsername}`,
      soundcloud: `https://soundcloud.com/${cleanUsername}`,
      spotify: cleanUsername.includes("spotify.com") ? cleanUsername : `https://open.spotify.com/user/${cleanUsername}`,
      "apple music": cleanUsername.includes("music.apple.com") ? cleanUsername : `https://music.apple.com/profile/${cleanUsername}`,
      discord: cleanUsername.includes("discord.gg") ? cleanUsername : `https://discord.com/users/${cleanUsername}`,
      telegram: cleanUsername.includes("t.me") ? cleanUsername : `https://t.me/${cleanUsername}`,
      whatsapp: cleanUsername.includes("wa.me") ? cleanUsername : `https://wa.me/${cleanUsername}`,
      skype: cleanUsername.includes("skype:") ? cleanUsername : `skype:${cleanUsername}?chat`,
      amazon: cleanUsername.includes("amazon.com") ? cleanUsername : `https://amazon.com/stores/${cleanUsername}`,
      shopify: cleanUsername.includes("shopify.com") ? cleanUsername : `https://${cleanUsername}.myshopify.com`,
      "ko-fi": cleanUsername.includes("ko-fi.com") ? cleanUsername : `https://ko-fi.com/${cleanUsername}`,
      "buy me a coffee": cleanUsername.includes("buymeacoffee.com") ? cleanUsername : `https://buymeacoffee.com/${cleanUsername}`,
      patreon: cleanUsername.includes("patreon.com") ? cleanUsername : `https://patreon.com/${cleanUsername}`,
      website: cleanUsername.startsWith("http") ? cleanUsername : `https://${cleanUsername}`,
      blog: cleanUsername.startsWith("http") ? cleanUsername : `https://${cleanUsername}`,
      email: cleanUsername.includes("@") ? cleanUsername : `mailto:${cleanUsername}`,
      phone: cleanUsername.startsWith("+") || /^\d+$/.test(cleanUsername) ? `tel:${cleanUsername}` : cleanUsername
    };
    
    return urlPatterns[platform] || cleanUsername;
  };

  return (
    <div className="relative px-6 md:px-20 lg:px-32 py-20 grid place-content-center min-h-screen">
      <div className="absolute top-0 z-[-2] w-full h-full dark:bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="fixed top-5 right-5 md:top-10 md:right-32 flex gap-2">
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full border">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">{views}</span>
        </div>
        {!loading && !notFound && (
          <div className="user-ranks flex items-center justify-center bg-background/80 backdrop-blur-sm p-2 rounded-full border gap-1">
            {rankData.map((rank, index) => (
              <div key={index} className="relative group">
                <img 
                  src={rank.icon} 
                  alt={rank.name}
                  className="w-7 h-7 filter grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
                  onLoad={() => console.log('Rank icon loaded:', rank.icon)}
                  onError={(e) => {
                    console.error('Failed to load rank icon:', rank.icon);
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {rank.name}
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          onClick={() => {
            navigator.share({ url: window.location.href, title: name, text: name });
          }}
        >
          <Button
            variant="pulseBtn"
            className="w-10 h-10 rounded-full p-0 flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="grid place-content-center mb-5 mt-14">
        {loading && <div className="relative w-24 h-24"><Loader /></div>}
        
        {!loading && !notFound && image && (
          <div className="avatar-user rounded-full overflow-hidden">
            <img 
              src={image} 
              alt={name || 'User'} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold" style={{display: 'none'}}>
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        )}
        
        {!loading && !notFound && !image && (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>
      {!loading && !notFound && (
        <div className="grid place-content-center mb-6 text-center gap-3 px-2">
          <h1 className="text-3xl font-bold flex justify-center items-center text-center">
            {name}
            {name && <FaCheckCircle className="!h-4 !w-4 opacity-50 ml-2" />}
          </h1>

          <p className="text-base dark:text-gray-400 text-foreground/80 max-w-[320px] mx-auto">
            {bio ? (
              <>
                {showFullBio ? bio : (bio.length > 70 ? bio.slice(0, 70) + "..." : bio)}
                {bio.length > 70 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="moer-btn text-sm hover:underline"
                  >
                    {showFullBio ? "ნაკლები" : "მეტი"}
                  </button>
                )}
              </>
            ) : (
              "მოგესალმებით ჩემს სოც ფეიჯზე !"
            )}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-8"><Loader /></div>
          <div className="relative w-[300px] h-14"><Loader /></div>
          <div className="grid gap-3 max-w-[600px] w-full">
            <div className="relative w-[300px] h-14 mx-auto"><Loader /></div>
            <div className="relative w-[300px] h-14 mx-auto"><Loader /></div>
            <div className="relative w-[300px] h-14 mx-auto"><Loader /></div>
            <div className="relative w-[300px] h-14 mx-auto"><Loader /></div>
          </div>
        </div>
      )}

      {!loading && !notFound && (
        <div className="mt-10 flex flex-col items-center gap-3">
          {/* Check if any links exist */}
          {Object.entries(links || {}).filter(([key, value]) => {
            return (social.includes(key) || proffesional.includes(key) || creative.includes(key) || 
                    messaging.includes(key) || storefront.includes(key) || miscellaneous.includes(key)) && 
                   value && typeof value === "string" && value.trim() !== "";
          }).length === 0 && customLinks.length === 0 && (
            <div className="text-center py-10">
              <p className="text-foreground/60">ჯერ არაფერია მითითებული</p>
              <p className="text-foreground/40 text-sm mt-2">მომხმარებელს ჯერ არ დაუმატებია სოციალური ქსელების ლინკები</p>
            </div>
          )}

          {/* Social Links */}
          {Object.entries(links || {})
            .filter(([key, value]) => social.includes(key) && value && typeof value === "string" && value.trim() !== "")
            .map(([key, value]) => {
              const Icon = getIcon(key);
              return (
                <Button
                  key={key}
                  asChild
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                >
                  <a href={generateSocialUrl(key, value)} target="_blank" rel="noopener noreferrer">
                    {Icon && <Icon className="w-6 h-6" />}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                </Button>
              );
            })}

          {/* Professional Links */}
          {Object.entries(links || {})
            .filter(([key, value]) => proffesional.includes(key) && value && typeof value === "string" && value.trim() !== "")
            .map(([key, value]) => {
              const Icon = getIcon(key);
              return (
                <Button
                  key={key}
                  asChild
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                >
                  <a href={generateSocialUrl(key, value)} target="_blank" rel="noopener noreferrer">
                    {Icon && <Icon className="w-6 h-6" />}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                </Button>
              );
            })}

          {/* Creative Links */}
          {Object.entries(links || {})
            .filter(([key, value]) => creative.includes(key) && value && typeof value === "string" && value.trim() !== "")
            .map(([key, value]) => {
              const Icon = getIcon(key);
              return (
                <Button
                  key={key}
                  asChild
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                >
                  <a href={generateSocialUrl(key, value)} target="_blank" rel="noopener noreferrer">
                    {Icon && <Icon className="w-6 h-6" />}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                </Button>
              );
            })}

          {/* Messaging Links */}
          {Object.entries(links || {})
            .filter(([key, value]) => messaging.includes(key) && value && typeof value === "string" && value.trim() !== "")
            .map(([key, value]) => {
              const Icon = getIcon(key);
              return (
                <Button
                  key={key}
                  asChild
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                >
                  <a href={generateSocialUrl(key, value)} target="_blank" rel="noopener noreferrer">
                    {Icon && <Icon className="w-6 h-6" />}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                </Button>
              );
            })}

          {/* Storefront Links */}
          {Object.entries(links || {})
            .filter(([key, value]) => storefront.includes(key) && value && typeof value === "string" && value.trim() !== "")
            .map(([key, value]) => {
              const Icon = getIcon(key);
              return (
                <Button
                  key={key}
                  asChild
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                >
                  <a href={generateSocialUrl(key, value)} target="_blank" rel="noopener noreferrer">
                    {Icon && <Icon className="w-6 h-6" />}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                </Button>
              );
            })}
          
          {/* Custom Links */}
          {customLinks.map((link) => {
            const Icon = getIcon(link.icon);
            return (
              <Button
                key={link.id}
                asChild
                variant="outline"
                className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
              >
                <a href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer">
                  {Icon && <Icon className="w-6 h-6" />}
                  {link.title}
                </a>
              </Button>
            );
          })}

          {/* Miscellaneous Links */}
          {Object.entries(links || {})
            .filter(([key, value]) => miscellaneous.includes(key) && value && typeof value === "string" && value.trim() !== "")
            .map(([key, value]) => {
              const Icon = getIcon(key);
              const isEmail = key === 'email';
              return (
                <Button
                  key={key}
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                  onClick={isEmail ? () => handleEmailClick(value) : undefined}
                  asChild={!isEmail}
                >
                  {isEmail ? (
                    <div className="flex items-center gap-3 w-full">
                      {Icon && <Icon className="w-6 h-6" />}
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                  ) : (
                    <a href={generateSocialUrl(key, value)} target="_blank" rel="noopener noreferrer">
                      {Icon && <Icon className="w-6 h-6" />}
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </a>
                  )}
                </Button>
              );
            })}

          {links?.accessKey && (
            <div className="border mt-10 px-4 py-3 rounded-lg mx-auto max-w-[420px]">
              <p className="text-sm text-foreground/80 mb-2">Private Links</p>
              <div className="flex items-center gap-2">
                <Input
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Enter Access Key"
                />
                <Button onClick={handleInput}>Unlock</Button>
              </div>
              {accessError && (
                <p className="text-red-500 text-sm mt-2">Invalid Access Key</p>
              )}
              {showPrivate && (
                <div className="mt-4 grid gap-3">
                  {Object.entries(links || {})
                    .filter(([key, value]) => miscellaneous.includes(key) && value && (typeof value === "string" || typeof value === "number") && String(value).trim() !== "")
                    .map(([key, value]) => {
                      const Icon = getIcon(key);
                      return (
                        <Button
                          key={key}
                          asChild
                          variant="outline"
                          className="w-full max-w-[420px] mx-auto justify-start gap-3 h-12 rounded-[15px]"
                        >
                          <a href={generateSocialUrl(key, String(value))} target="_blank" rel="noopener noreferrer">
                            {Icon && <Icon className="w-6 h-6" />}
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </a>
                        </Button>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {notFound && (
        <div className="flex flex-col items-center justify-center px-4 -mt-[200px]">
          <div className="max-w-[800px] w-full mx-auto">
            <img 
              src="/404-numbers-bro.png" 
              alt="404 - User Not Found" 
              className="w-full h-auto max-w-[800px] mx-auto block"
              style={{ maxHeight: '600px', objectFit: 'contain' }}
            />
          </div>
          <div className="text-center mt-4">
            <h1 className="font-bold text-3xl mb-2">
              მომხმარებელი არ მოიძებნა<span className="text-blue-600">!</span>
            </h1>
            <p className="text-sm text-foreground/70 mb-6">
              გთხოვთ შეამოწმოთ სახელი <br /> და სცადეთ თავიდან
            </p>
            <Button
              asChild
              className="border-rad w-full max-w-xs mx-auto"
            >
              <a href="/">← უკან დაბრუნება</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
