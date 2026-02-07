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
import { Share2, Eye, Shield, X, Music, Play, Pause, Volume2 } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/user-avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";

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
  const { trackClick } = useAnalytics();

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
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarColors, setAvatarColors] = useState({ dominant: '#6366f1', secondary: '#a855f7' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioRef, setAudioRef] = useState(null);

  const handleLinkClick = (linkType, url) => {
    trackClick(userDataName, linkType);
    window.open(url, '_blank');
  };

  const handleMusicPlayPause = (trackUrl, trackType) => {
    if (currentTrack === trackUrl && isPlaying) {
      // Pause current track
      if (audioRef) {
        audioRef.pause();
      }
      setIsPlaying(false);
      setCurrentTrack(null);
    } else {
      // Play new track
      if (audioRef) {
        audioRef.pause();
      }
      
      const audio = new Audio();
      audio.src = getDirectAudioUrl(trackUrl, trackType);
      audio.play().then(() => {
        setAudioRef(audio);
        setIsPlaying(true);
        setCurrentTrack(trackUrl);
        trackClick(userDataName, 'music_play');
      }).catch(error => {
        console.error('Error playing audio:', error);
        // Fallback to opening in new tab
        window.open(trackUrl, '_blank');
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTrack(null);
      });
    }
  };

  const getDirectAudioUrl = (url, type) => {
    // For YouTube, we'll use the embed URL for better compatibility
    if (type === 'youtube') {
      return getMusicEmbedUrl(url);
    }
    
    // For Spotify and other platforms, return original URL
    // Note: Direct audio playback from Spotify requires API integration
    // For now, we'll use the original URL
    return url;
  };

  const getMusicEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube URL conversion
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    }
    
    // YouTube short URL
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    }
    
    // SoundCloud embed
    if (url.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=true`;
    }
    
    return url;
  };

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

  // Extract colors from avatar image
  const extractAvatarColors = (imageUrl) => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Sample from center area of image
      const sampleSize = 50;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      
      const sourceSize = Math.min(img.width, img.height) * 0.3;
      const sourceX = (img.width - sourceSize) / 2;
      const sourceY = (img.height - sourceSize) / 2;
      
      ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, sampleSize, sampleSize);
      
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;
      
      let r = 0, g = 0, b = 0;
      let pixelCount = 0;
      
      // Sample pixels and calculate average
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        pixelCount++;
      }
      
      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);
      
      // Convert to hex and create complementary colors
      const dominant = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      
      // Create a lighter, more vibrant version for secondary
      const secondary = `#${Math.min(255, r + 40).toString(16).padStart(2, '0')}${Math.min(255, g + 40).toString(16).padStart(2, '0')}${Math.min(255, b + 40).toString(16).padStart(2, '0')}`;
      
      setAvatarColors({ dominant, secondary });
    };
    
    img.onerror = () => {
      // Fallback to default colors
      setAvatarColors({ dominant: '#6366f1', secondary: '#a855f7' });
    };
    
    img.src = imageUrl;
  };

  useEffect(() => {
    let username = userDataName;
    const loadUserData = async () => {
      try {
        const userData = await UserModel.getByUsername(username);
        
        if (userData) {
          console.log('User data loaded for:', username);
          console.log('AccessKey found:', userData.accessKey);
          setImage(userData.avatar_url || userData.image);
          setName(userData.name);
          setBio(userData.bio);
          setLinks(userData);
          setViews(userData.views || 0);
          setRank(userData.rank || "მომხმარებელი");
          const data = getAllRankData(userData.rank || "მომხმარებელი");
          setRankData(data);
          console.log('User rank:', userData.rank, 'Rank data:', data);
          
          // Extract colors from avatar
          const avatarUrl = userData.avatar_url || userData.image;
          if (avatarUrl) {
            extractAvatarColors(avatarUrl);
          }
          
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
      <div 
        className={`absolute top-0 z-[-2] w-full h-full dark:bg-neutral-950 ${links?.accessKey && !showPrivate ? 'blur-[50px]' : ''}`}
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% -20%, ${avatarColors.dominant}39, ${avatarColors.secondary}38, rgba(255,255,255,0))`
        }}
      ></div>
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
          <div className="avatar-user rounded-full overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg" onClick={() => setShowAvatarModal(true)}>
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
          {/* Debug info */}
          {console.log('Password protection check:', {
            hasAccessKey: !!links?.accessKey,
            accessKey: links?.accessKey,
            showPrivate: showPrivate
          })}
          
          {/* Check if profile is password protected */}
          {links?.accessKey && !showPrivate ? (
            <div className="w-full max-w-md mx-auto mt-20">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    პროფილი დაცულია
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    ეს პროფილი დაცულია 4 სიმბოლოიანი პაროლით
                  </p>
                  <div className="space-y-3">
                    <Input
                      type="password"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value.slice(0, 4))}
                      placeholder="შეიყვანეთ პაროლი"
                      maxLength={4}
                      className="text-center text-lg tracking-widest"
                    />
                    <Button onClick={handleInput} className="w-full" disabled={inputKey.length !== 4}>
                      შესვლა
                    </Button>
                    {accessError && (
                      <p className="text-red-500 text-sm mt-2">არასწორი პაროლი</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
          {/* Music Player */}
          {(links.music || links.spotify) && (
            <div className="w-full max-w-[420px] mb-[-30px]">
              <Card className="music-card bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Music className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-purple-700 dark:text-purple-300">მუსიკა</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* YouTube Music Player */}
                    {links.music && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          YouTube
                        </div>
                        
                        {/* Embedded YouTube Player */}
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-black">
                          <iframe
                            src={getMusicEmbedUrl(links.music)}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        
                        {/* Fallback Play Button */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLinkClick('music', links.music)}
                            className="flex items-center gap-2 border-red-200 hover:border-red-400 dark:border-red-800"
                          >
                            <Play className="w-4 h-4" />
                            ახალ ფანჯარაში
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            თუ პლეერი არ იმუშავებს
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Spotify Player */}
                    {links.spotify && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Spotify
                        </div>
                        
                        {/* Spotify Embed Player */}
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-black">
                          <iframe
                            src={`https://open.spotify.com/embed${links.spotify.includes('track') ? '/track' : links.spotify.includes('playlist') ? '/playlist' : '/'}${links.spotify.split('/').pop()}`}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="encrypted-media"
                            frameBorder="0"
                            allowtransparency="true"
                          />
                        </div>
                        
                        {/* Fallback Play Button */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLinkClick('spotify', links.spotify)}
                            className="flex items-center gap-2 border-green-200 hover:border-green-400 dark:border-green-800"
                          >
                            <Play className="w-4 h-4" />
                            Spotify აპლიკაციაში
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            თუ პლეერი არ იმუშავებს
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Instructions */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      🎵 მუსიკა იკვრება პირდაპირ საიტზე! თუ პლეერი არ ჩანს, გამოიყენეთ ღილაკები.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                  onClick={() => handleLinkClick(key, generateSocialUrl(key, value))}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                  {key.charAt(0).toUpperCase() + key.slice(1)}
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
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                  onClick={() => handleLinkClick(key, generateSocialUrl(key, value))}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                  {key.charAt(0).toUpperCase() + key.slice(1)}
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
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                  onClick={() => handleLinkClick(key, generateSocialUrl(key, value))}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                  {key.charAt(0).toUpperCase() + key.slice(1)}
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
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                  onClick={() => handleLinkClick(key, generateSocialUrl(key, value))}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                  {key.charAt(0).toUpperCase() + key.slice(1)}
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
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                  onClick={() => handleLinkClick(key, generateSocialUrl(key, value))}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              );
            })}

          {/* Miscellaneous Links */}
          {Object.entries(links || {})
            .filter(([key, value]) => miscellaneous.includes(key) && value && typeof value === "string" && value.trim() !== "")
            .map(([key, value]) => {
              const Icon = getIcon(key);
              return (
                <Button
                  key={key}
                  variant="outline"
                  className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                  onClick={() => handleLinkClick(key, generateSocialUrl(key, value))}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              );
            })}

          {/* Custom Links */}
          {customLinks.map((link) => {
            const Icon = getIcon("website");
            return (
              <Button
                key={link.id}
                variant="outline"
                className="social-link w-full max-w-[420px] justify-start gap-3 h-14 rounded-[15px]"
                onClick={() => handleLinkClick('custom', link.url)}
              >
                {Icon && <Icon className="w-6 h-6" />}
                {link.title}
              </Button>
            );
          })}
          </>
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
      
      {/* Avatar Modal */}
      {showAvatarModal && image && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAvatarModal(false);
              }}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-300 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={image} 
              alt={name || 'User'} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl animate-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm font-medium">{name || 'User'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Password Protection Overlay */}
      {links?.accessKey && !showPrivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
          <div className="w-full max-w-md mx-auto p-6">
            <Card className="text-center shadow-2xl border-0 bg-background/95 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Shield className="w-6 h-6 text-blue-600" />
                  პროფილი დაცულია
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  ეს პროფილი დაცულია 4 სიმბოლოიანი პაროლით
                </p>
                <div className="space-y-4">
                  <Input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value.slice(0, 4))}
                    placeholder="შეიყვანეთ პაროლი"
                    maxLength={4}
                    className="text-center text-xl tracking-widest h-12 text-lg font-mono"
                    autoFocus
                  />
                  <Button 
                    onClick={handleInput} 
                    className="w-full h-12 text-base font-medium" 
                    disabled={inputKey.length !== 4}
                  >
                    შესვლა
                  </Button>
                  {accessError && (
                    <p className="text-red-500 text-sm mt-2 animate-pulse">არასწორი პაროლი</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
