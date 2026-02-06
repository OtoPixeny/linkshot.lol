"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/use-toast";
import { useUser, useAuth } from "@clerk/clerk-react";
import UserModel from "@/models/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomLinksManager from "./CustomLinksManager";
import { useAvatarSync } from "@/hooks/useAvatarSync";

export default function ManageForm() {
  const { toast } = useToast();
  const { user } = useUser();
  const { getToken } = useAuth();
  
  // Enable avatar synchronization
  useAvatarSync();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [insta, setInsta] = useState("");
  const [face, setFace] = useState("");
  const [github, setGithub] = useState("");
  const [snapchat, setSnapchat] = useState("");
  const [youtube, setYoutube] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [threads, setThreads] = useState("");
  const [reddit, setReddit] = useState("");
  const [stackoverflow, setStackoverflow] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [codeforces, setCodeforces] = useState("");
  const [hackerrank, setHackerrank] = useState("");
  const [codechef, setCodechef] = useState("");
  const [geeksForGeeks, setGeeksForGeeks] = useState("");
  const [twitch, setTwitch] = useState("");
  const [soundcloud, setSoundcloud] = useState("");
  const [spotify, setSpotify] = useState("");
  const [applemusic, setApplemusic] = useState("");
  const [discord, setDiscord] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [skype, setSkype] = useState("");
  const [amazon, setAmazon] = useState("");
  const [shopify, setShopify] = useState("");
  const [kofi, setkofi] = useState("");
  const [buyMeACoffee, setBuyMeACoffee] = useState("");
  const [patreon, setPatreon] = useState("");
  const [website, setWebsite] = useState("");
  const [blog, setBlog] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accessKey, setAccessKey] = useState("");

  const [loding, setLoding] = useState(false);
  const [fetchLoding, setFetchLoding] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          const userData = await UserModel.getByUserId(user.id);
          if (userData) {
            setUsername(userData.username || "");
            setName(userData.name || "");
            setBio(userData.bio || "");
            setInsta(userData.instagram || "");
            setFace(userData.facebook || "");
            setGithub(userData.gitHub || "");
            setSnapchat(userData.snapchat || "");
            setYoutube(userData.youtube || "");
            setLinkedin(userData.linkedIn || "");
            setTwitter(userData.twitter || "");
            setThreads(userData.threads || "");
            setReddit(userData.reddit || "");
            setStackoverflow(userData.stackoverflow || "");
            setLeetcode(userData.leetcode || "");
            setCodeforces(userData.codeforces || "");
            setHackerrank(userData.hackerrank || "");
            setCodechef(userData.codechef || "");
            setGeeksForGeeks(userData.geeksforgeeks || "");
            setTwitch(userData.twitch || "");
            setSoundcloud(userData.soundcloud || "");
            setSpotify(userData.spotify || "");
            setApplemusic(userData["apple music"] || "");
            setDiscord(userData.discord || "");
            setTelegram(userData.telegram || "");
            setWhatsapp(userData.whatsapp || "");
            setSkype(userData.skype || "");
            setAmazon(userData.amazon || "");
            setShopify(userData.shopify || "");
            setkofi(userData["ko-fi"] || "");
            setBuyMeACoffee(userData["buy me a coffee"] || "");
            setPatreon(userData.patreon || "");
            setWebsite(userData.website || "");
            setBlog(userData.blog || "");
            setEmail(userData.email || "");
            setPhone(userData.phone || "");
            setAccessKey(userData.accessKey || "");
            
            // Ensure avatar URL is set if it's null
            if (!userData.avatar_url && user.imageUrl) {
              await UserModel.syncAvatarUrl(user.id, user.imageUrl);
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          // User might not exist yet, that's okay
        } finally {
          setFetchLoding(false);
        }
      }
    };

    loadUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoding(true);

    const data = {
      username,
      name,
      bio,
      instagram: insta,
      facebook: face,
      gitHub: github,
      snapchat,
      youtube,
      linkedIn: linkedin,
      twitter,
      threads,
      reddit,
      stackoverflow,
      leetcode,
      codeforces,
      hackerrank,
      codechef,
      geeksforgeeks: geeksForGeeks,
      twitch,
      soundcloud,
      spotify,
      "apple music": applemusic,
      discord,
      telegram,
      whatsapp,
      skype,
      amazon,
      shopify,
      "ko-fi": kofi,
      "buy me a coffee": buyMeACoffee,
      patreon,
      website,
      blog,
      email,
      phone,
      accessKey,
    };

    try {
      const userData = {
        username,
        name,
        bio,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '',
        avatar_url: user.imageUrl, // Always include current Clerk avatar URL
        instagram: insta,
        facebook: face,
        gitHub: github,
        snapchat,
        youtube,
        linkedIn: linkedin,
        twitter,
        threads,
        reddit,
        stackoverflow,
        leetcode,
        codeforces,
        hackerrank,
        codechef,
        geeksforgeeks: geeksForGeeks,
        twitch,
        soundcloud,
        spotify,
        "apple music": applemusic,
        discord,
        telegram,
        whatsapp,
        skype,
        amazon,
        shopify,
        "ko-fi": kofi,
        "buy me a coffee": buyMeACoffee,
        patreon,
        website,
        blog,
        phone,
        accessKey,
      };

      console.log("Sending userData:", userData);
      const result = await UserModel.update(user.id, userData);

      if (result) {
        toast({
          title: "წარმატებით",
          description: "პროფილი წარმატებით განახლდა!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoding(false);
    }
  };

  if (fetchLoding) {
    return (
      <div className="space-y-4 flex flex-col items-center justify-center min-h-[200px]">
        <div className="relative w-12 h-12">
          <Loader />
        </div>
        <p className="text-sm text-muted-foreground">იტვირთება...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="manage-form space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">მომხმარებლის სახელი</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">სახელი</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">ჩემს შესახებ</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>
      </div>

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger className="hello" value="social">კლასიკური</TabsTrigger>
          <TabsTrigger  className="hello" value="professional">პროფესიური</TabsTrigger>
          <TabsTrigger  className="hello" value="creative">კრეატიული</TabsTrigger>
          <TabsTrigger  className="hello" value="messaging">სამესიჯო</TabsTrigger>
          <TabsTrigger className="hello"  value="other">სხვა</TabsTrigger>                  
          <TabsTrigger  className="hello" value="custom">პირადი</TabsTrigger>
        </TabsList>

        <div className="tabs-content">
          <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={insta}
                onChange={(e) => setInsta(e.target.value)}
                placeholder="Instagram username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={face}
                onChange={(e) => setFace(e.target.value)}
                placeholder="Facebook username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="Twitter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threads">Threads</Label>
              <Input
                id="threads"
                value={threads}
                onChange={(e) => setThreads(e.target.value)}
                placeholder="Threads username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="YouTube channel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="snapchat">Snapchat</Label>
              <Input
                id="snapchat"
                value={snapchat}
                onChange={(e) => setSnapchat(e.target.value)}
                placeholder="Snapchat username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reddit">Reddit</Label>
              <Input
                id="reddit"
                value={reddit}
                onChange={(e) => setReddit(e.target.value)}
                placeholder="Reddit username"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="GitHub username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="LinkedIn username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stackoverflow">Stack Overflow</Label>
              <Input
                id="stackoverflow"
                value={stackoverflow}
                onChange={(e) => setStackoverflow(e.target.value)}
                placeholder="Stack Overflow username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leetcode">LeetCode</Label>
              <Input
                id="leetcode"
                value={leetcode}
                onChange={(e) => setLeetcode(e.target.value)}
                placeholder="LeetCode username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeforces">Codeforces</Label>
              <Input
                id="codeforces"
                value={codeforces}
                onChange={(e) => setCodeforces(e.target.value)}
                placeholder="Codeforces username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hackerrank">HackerRank</Label>
              <Input
                id="hackerrank"
                value={hackerrank}
                onChange={(e) => setHackerrank(e.target.value)}
                placeholder="HackerRank username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codechef">CodeChef</Label>
              <Input
                id="codechef"
                value={codechef}
                onChange={(e) => setCodechef(e.target.value)}
                placeholder="CodeChef username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geeksforgeeks">GeeksforGeeks</Label>
              <Input
                id="geeksforgeeks"
                value={geeksForGeeks}
                onChange={(e) => setGeeksForGeeks(e.target.value)}
                placeholder="GeeksforGeeks username"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="creative" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="twitch">Twitch</Label>
              <Input
                id="twitch"
                value={twitch}
                onChange={(e) => setTwitch(e.target.value)}
                placeholder="Twitch username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soundcloud">SoundCloud</Label>
              <Input
                id="soundcloud"
                value={soundcloud}
                onChange={(e) => setSoundcloud(e.target.value)}
                placeholder="SoundCloud username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spotify">Spotify</Label>
              <Input
                id="spotify"
                value={spotify}
                onChange={(e) => setSpotify(e.target.value)}
                placeholder="Spotify profile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applemusic">Apple Music</Label>
              <Input
                id="applemusic"
                value={applemusic}
                onChange={(e) => setApplemusic(e.target.value)}
                placeholder="Apple Music profile"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="discord" className="text-sm">Discord</Label>
              <Input
                id="discord"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="Discord username"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="telegram" className="text-sm">Telegram</Label>
              <Input
                id="telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="Telegram username"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp number"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="skype" className="text-sm">Skype</Label>
              <Input
                id="skype"
                value={skype}
                onChange={(e) => setSkype(e.target.value)}
                placeholder="Skype username"
                className="h-9 text-sm"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Your website URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog">Blog</Label>
              <Input
                id="blog"
                value={blog}
                onChange={(e) => setBlog(e.target.value)}
                placeholder="Your blog URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amazon">Amazon Storefront</Label>
              <Input
                id="amazon"
                value={amazon}
                onChange={(e) => setAmazon(e.target.value)}
                placeholder="Amazon storefront URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopify">Shopify</Label>
              <Input
                id="shopify"
                value={shopify}
                onChange={(e) => setShopify(e.target.value)}
                placeholder="Shopify store URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kofi">Ko-fi</Label>
              <Input
                id="kofi"
                value={kofi}
                onChange={(e) => setkofi(e.target.value)}
                placeholder="Ko-fi username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buymeacoffee">Buy Me a Coffee</Label>
              <Input
                id="buymeacoffee"
                value={buyMeACoffee}
                onChange={(e) => setBuyMeACoffee(e.target.value)}
                placeholder="Buy Me a Coffee username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patreon">Patreon</Label>
              <Input
                id="patreon"
                value={patreon}
                onChange={(e) => setPatreon(e.target.value)}
                placeholder="Patreon username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessKey">Access Key (for private links)</Label>
              <Input
                id="accessKey"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Access key for private links"
                type="password"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <CustomLinksManager />
        </TabsContent>
        </div>
      </Tabs>

      <Button type="submit" disabled={loding} className="w-full">
        {loding ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            იტვირთება...
          </>
        ) : (
          "პროფილის განახლება"
        )}
      </Button>
    </form>
  );
}
