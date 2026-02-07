import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/use-toast";
import { useUser, useAuth } from "@clerk/clerk-react";
import UserModel from "@/models/user";
import { Music, Play, Save } from "lucide-react";

export default function MusicManager() {
  const { toast } = useToast();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          const userData = await UserModel.getByUserId(user.id);
          if (userData) {
            setSpotifyUrl(userData.spotify || "");
            setYoutubeUrl(userData.music || "");
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        } finally {
          setFetchLoading(false);
        }
      }
    };

    loadUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = {
        spotify: spotifyUrl,
        music: youtubeUrl,
      };

      console.log("Updating music data:", userData);
      const result = await UserModel.update(user.id, userData);

      if (result) {
        toast({
          title: "წარმატებით",
          description: "მუსიკის ბმულები წარმატებით განახლდა!",
        });
      } else {
        toast({
          title: "შეცდომა",
          description: "მუსიკის ბმულების განახლება ვერ მოხერხდა",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating music data:", error);
      toast({
        title: "შეცდომა",
        description: error.message || "მუსიკის ბმულების განახლება ვერ მოხერხდა",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
    <div className="max-w-2xl mx-auto mt-6 px-4">
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
            <Music className="w-6 h-6" />
            მუსიკის მართვა
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            დაამატეთ თქვენი საყვარელი მუსიკა Spotify და YouTube ბმულებით
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spotify" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Spotify URL
                </Label>
                <Input
                  id="spotify"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  className="border-green-200 focus:border-green-400 dark:border-green-800"
                />
                <p className="text-xs text-muted-foreground">
                  შეიყვანეთ Spotify ტრეკის, პლეილისტის ან პროფილის ბმული
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  YouTube URL
                </Label>
                <Input
                  id="youtube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="border-red-200 focus:border-red-400 dark:border-red-800"
                />
                <p className="text-xs text-muted-foreground">
                  შეიყვანეთ YouTube ვიდეოს ბმული (მუსიკა, რომელიც გამოჩნდება თქვენს პროფილზე)
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    იტვირთება...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    შენახვა
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSpotifyUrl("");
                  setYoutubeUrl("");
                }}
                className="px-6"
              >
                გასუფთავება
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                <Play className="w-4 h-4" />
                როგორ მუშაობს?
              </h4>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>• YouTube მუსიკა გამოჩნდება როგორც ჩაშენებული პლეერი თქვენს პროფილზე</li>
                <li>• Spotify ბმულზე დაჭერით გადახვალთ Spotify აპლიკაციაში</li>
                <li>• ორივე ბმული იქნება ხილული თქვენი პროფილის მნახველთათვის</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
