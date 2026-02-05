import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Trophy, Crown, Medal, Eye, User } from "lucide-react";
import UserModel from "@/models/user";
import { useNavigate } from "react-router-dom";

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

const getPositionIcon = (position) => {
  switch(position) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    case 2:
      return <Trophy className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    default:
      return <Trophy className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
  }
};

const getPositionStyle = (position) => {
  switch(position) {
    case 1:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600";
    case 2:
      return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600";
    case 3:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600";
  }
};

export default function Top3() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTopUsers = async () => {
      console.log('Starting to load top users...');
      try {
        const users = await UserModel.getTopUsers(3);
        console.log('Top users loaded:', users);
        setTopUsers(users);
      } catch (error) {
        console.error("Error loading top users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTopUsers();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute top-0 z-[-2] w-full h-full dark:bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="relative">
          <div className="w-24 h-24">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full px-4 py-20">
      {/* Header */}
      <div className="relative z-10 text-center mb-12 max-w-4xl mx-auto px-4">
        <div className="flex justify-center mb-6">
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          ტოპ 3 ლიდერბორდი
        </h1>
        <p className="text-lg text-foreground/70">
          ყველაზე პოპულარული მომხმარებლები ნახვების მიხედვით
        </p>
      </div>

      {/* Top 3 Cards */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        {topUsers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground/60 text-lg">ჯერ მომხმარებლები არ არიან დარეგისტრირებული</p>
          </div>
        ) : (
          <div className="top-card grid grid-cols-1 md:grid-cols-3 gap-6 items-start justify-center">
            {topUsers.map((user, index) => {
              const position = index + 1;
              const rankIcon = getRankIcon(user.rank || "მომხმარებელი");
              
              return (
                <div 
                  key={user.username}
                  className="relative group w-full max-w-sm mx-auto"
                >
                  {/* Position Badge */}
                  <div className="card-badge absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPositionStyle(position)}`}>
                      {getPositionIcon(position)}
                    </div>
                  </div>

                  {/* Main Card */}
                  <Card className={`relative pt-8 pb-4 transition-all duration-200 hover:shadow-md w-full ${
                    position === 1 ? 'ring-1 ring-gray-200 dark:ring-gray-700' : ''
                  }`}>
                    <CardContent className="p-4 text-center">
                      {/* Avatar */}
                      <div className="relative mb-3 mx-auto w-16 h-16">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.name || user.username}
                            className="top-avatar w-full h-full rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 text-lg font-medium"
                          style={{ display: user.avatar_url ? 'none' : 'flex' }}
                        >
                          {(user.name || user.username || '?').charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Rank Icon */}
                        <div className="rank-icon absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                          <img 
                            src={rankIcon} 
                            alt="Rank"
                            className="w-4 h-4"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <h3 className="text-lg font-bold mb-1 text-foreground">
                        {user.name || user.username}
                      </h3>
                      <p className="text-sm text-foreground/60 mb-3">
                        @{user.username}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-xl font-bold text-foreground">
                          {user.views || 0}
                        </span>
                        <span className="text-foreground/40 text-xs">ნახვა</span>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => navigate(`/${user.username}`)}
                        variant="outline"
                        className="view-btn w-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200"
                      >
                        პროფილის ნახვა
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="relative z-10 text-center mt-12">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="px-6 py-2 border-2 border-foreground/20 hover:border-foreground/40 transition-all duration-200"
        >
          ← უკან დაბრუნება
        </Button>
      </div>
    </div>
  );
}
