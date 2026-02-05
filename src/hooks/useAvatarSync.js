import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import UserModel from '@/models/user';

export const useAvatarSync = () => {
  const { user } = useUser();
  const syncIntervalRef = useRef(null);
  const lastAvatarUrlRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const syncAvatar = async () => {
      try {
        const currentAvatarUrl = user.imageUrl;
        
        // Always ensure avatar_url is set (handles null case)
        await UserModel.ensureAvatarUrl(user.id, currentAvatarUrl);
        
        // Also sync if URL has changed
        if (currentAvatarUrl !== lastAvatarUrlRef.current) {
          await UserModel.syncAvatarUrl(user.id, currentAvatarUrl);
          lastAvatarUrlRef.current = currentAvatarUrl;
          console.log('Avatar URL synced:', currentAvatarUrl);
        }
      } catch (error) {
        console.error('Error syncing avatar URL:', error);
      }
    };

    // Initial sync
    syncAvatar();

    // Set up interval to check every 5 seconds
    syncIntervalRef.current = setInterval(syncAvatar, 5000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [user]);

  return null;
};

export default useAvatarSync;
