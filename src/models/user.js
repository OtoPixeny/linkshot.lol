import { supabase, createSupabaseClientWithToken } from '@/lib/supabase'

// Map database column names to frontend field names
const columnMapping = {
  github: 'gitHub',
  linkedin: 'linkedIn',
  "apple music": 'apple music',
  amazon: 'amazon',
  "ko-fi": 'ko-fi',
  "buy me a coffee": 'buy me a coffee',
  geeksforgeeks: 'geeksforgeeks',
  accesskey: 'accessKey', // Handle lowercase accesskey
  accessKey: 'accessKey', // Handle camelCase accessKey
  avatar_url: 'avatar_url' // Handle avatar URL
};

// Helper function to map database data to frontend format
const mapDataToFrontend = (data) => {
  if (!data) return data;
  
  const mappedData = {};
  Object.keys(data).forEach(key => {
    const mappedKey = columnMapping[key] || key;
    mappedData[mappedKey] = data[key];
  });
  
  return mappedData;
};

export class UserModel {
  static async getByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', userId)
        .maybeSingle()
      
      if (error) {
        console.error('Error fetching user:', error)
        throw error
      }
      
      return mapDataToFrontend(data)
    } catch (error) {
      console.error('Supabase error:', error.message)
      throw error
    }
  }

  static async getByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle()
      
      if (error) {
        console.error('Error fetching user by username:', error)
        throw error
      }
      
      return mapDataToFrontend(data)
    } catch (error) {
      console.error('Supabase error:', error.message)
      throw error
    }
  }

  static async create(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .maybeSingle()
      
      if (error) {
        console.error('Error creating user:', error)
        throw error
      }
      
      return mapDataToFrontend(data)
    } catch (error) {
      console.error('Supabase error:', error.message)
      throw error
    }
  }

  static async incrementViews(username) {
    try {
      // First try the RPC function, if it fails, fall back to direct update
      let updatedViews;
      
      try {
        const { data, error } = await supabase.rpc('increment_user_views', { 
          user_username: username 
        });
        
        if (error) throw error;
        updatedViews = data;
      } catch (rpcError) {
        console.warn('RPC function failed, falling back to direct update:', rpcError.message);
        
        // Fallback: get current views and update directly
        const { data: userData } = await supabase
          .from('users')
          .select('views')
          .eq('username', username)
          .single();
          
        const currentViews = userData?.views || 0;
        const { data: updatedData } = await supabase
          .from('users')
          .update({ views: currentViews + 1 })
          .eq('username', username)
          .select('views')
          .single();
          
        updatedViews = updatedData?.views || currentViews + 1;
      }
      
      // Update ranks for top 3 users after view increment
      // This is done asynchronously to not block the view increment
      setTimeout(async () => {
        try {
          await this.updateRanksForTopUsers();
          console.log('Ranks updated successfully after view increment');
        } catch (error) {
          console.error('Failed to update ranks after view increment:', error);
        }
      }, 1000); // Delay by 1 second to ensure the view update is processed first
      
      return updatedViews;
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  static async syncAvatarUrl(userId, avatarUrl) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('clerk_id', userId)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error syncing avatar URL:', error);
        throw error;
      }
      
      return mapDataToFrontend(data);
    } catch (error) {
      console.error('Supabase error:', error.message);
      throw error;
    }
  }

  static async ensureAvatarUrl(userId, avatarUrl) {
    try {
      // First check if avatar_url is null
      const { data: userData } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('clerk_id', userId)
        .maybeSingle();
      
      // If avatar_url is null or empty, update it
      if (!userData?.avatar_url) {
        return await this.syncAvatarUrl(userId, avatarUrl);
      }
      
      return userData;
    } catch (error) {
      console.error('Error ensuring avatar URL:', error);
      throw error;
    }
  }

  static async getTopUsers(limit = 3) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, name, avatar_url, views, rank')
        .not('views', 'is', null)
        .not('username', 'is', null)
        .order('views', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('Error fetching top users:', error)
        throw error
      }
      
      return data.map(user => mapDataToFrontend(user))
    } catch (error) {
      console.error('Supabase error:', error.message)
      throw error
    }
  }

  static async updateRanksForTopUsers() {
    try {
      // Get current top 3 users
      const topUsers = await this.getTopUsers(3);
      const topUsernames = topUsers.map(user => user.username);
      
      // Get all users who currently have "ბუსტერი" rank
      const { data: boosterUsers, error: boosterError } = await supabase
        .from('users')
        .select('username, rank')
        .like('rank', '%ბუსტერი%');
      
      if (boosterError) {
        console.error('Error fetching booster users:', boosterError);
        throw boosterError;
      }
      
      // Remove "ბუსტერი" from users who are no longer in top 3
      for (const user of boosterUsers) {
        if (!topUsernames.includes(user.username)) {
          await this.removeRank(user.username, 'ბუსტერი');
        }
      }
      
      // Add "ბუსტერი" to top 3 users who don't have it
      for (const user of topUsers) {
        await this.addRank(user.username, 'ბუსტერი');
      }
      
      return { success: true, updatedUsers: topUsers };
    } catch (error) {
      console.error('Error updating ranks for top users:', error);
      throw error;
    }
  }

  static async addRank(username, rankToAdd) {
    try {
      // Get current user data
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('rank')
        .eq('username', username)
        .single();
      
      if (fetchError) {
        console.error('Error fetching user for rank addition:', fetchError);
        throw fetchError;
      }
      
      const currentRanks = userData.rank || 'მომხმარებელი';
      const rankArray = currentRanks.split(',').map(r => r.trim());
      
      // Check if user already has this rank
      if (rankArray.includes(rankToAdd)) {
        return { success: true, message: 'User already has this rank' };
      }
      
      // Add the new rank
      rankArray.push(rankToAdd);
      const updatedRanks = [...new Set(rankArray)].join(', '); // Remove duplicates and join
      
      // Update user with new ranks
      const { data, error } = await supabase
        .from('users')
        .update({ rank: updatedRanks })
        .eq('username', username)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding rank:', error);
        throw error;
      }
      
      return { success: true, data: mapDataToFrontend(data) };
    } catch (error) {
      console.error('Supabase error:', error.message);
      throw error;
    }
  }

  static async removeRank(username, rankToRemove) {
    try {
      // Get current user data
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('rank')
        .eq('username', username)
        .single();
      
      if (fetchError) {
        console.error('Error fetching user for rank removal:', fetchError);
        throw fetchError;
      }
      
      const currentRanks = userData.rank || 'მომხმარებელი';
      const rankArray = currentRanks.split(',').map(r => r.trim());
      
      // Remove the specified rank
      const filteredRanks = rankArray.filter(rank => rank !== rankToRemove);
      
      // If user has no ranks left, default to "მომხმარებელი"
      const updatedRanks = filteredRanks.length > 0 ? filteredRanks.join(', ') : 'მომხმარებელი';
      
      // Update user with new ranks
      const { data, error } = await supabase
        .from('users')
        .update({ rank: updatedRanks })
        .eq('username', username)
        .select()
        .single();
      
      if (error) {
        console.error('Error removing rank:', error);
        throw error;
      }
      
      return { success: true, data: mapDataToFrontend(data) };
    } catch (error) {
      console.error('Supabase error:', error.message);
      throw error;
    }
  }

  static async updateAccessKey(clerkId, accessKey) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ accesskey: accessKey })
        .eq('clerk_id', clerkId)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error updating access key:', error);
        throw error;
      }
      
      return mapDataToFrontend(data);
    } catch (error) {
      console.error('Supabase error:', error.message);
      throw error;
    }
  }

  static async update(userId, updateData, clerkToken = null) {
    try {
      // Use regular client since RLS is disabled
      const client = supabase;
      
      // First check if user exists
      const existingUser = await client
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .maybeSingle();
      
      if (existingUser.error) {
        console.error('Error checking existing user:', existingUser.error);
        throw existingUser.error;
      }
      
      // Map frontend field names to actual database column names
      const mappedData = {};
      Object.keys(updateData).forEach(key => {
        // Reverse mapping: from frontend to database
        const dbColumn = Object.keys(columnMapping).find(dbKey => columnMapping[dbKey] === key) || key;
        mappedData[dbColumn] = updateData[key];
      });

      // Remove accessKey from updateData to avoid column conflicts
      const { accesskey, 'accessKey': accessKeyCamel, ...dataToUpdate } = mappedData;
      
      // Always ensure avatar_url is included if provided in updateData
      // The frontend should always provide the current avatar_url from Clerk
      
      console.log("Final data to update:", dataToUpdate);
      
      let result;
      if (existingUser.data) {
        // User exists, update them
        const { data, error } = await client
          .from('users')
          .update(dataToUpdate)
          .eq('clerk_id', userId)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating user:', error);
          throw error;
        }
        result = data;
      } else {
        // User doesn't exist, create them
        const createData = { clerk_id: userId, ...dataToUpdate };
        const { data, error } = await client
          .from('users')
          .insert([createData])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating user:', error);
          throw error;
        }
        result = data;
      }
      
      return mapDataToFrontend(result);
    } catch (error) {
      console.error('Supabase error:', error.message);
      throw error;
    }
  }
}

export default UserModel
