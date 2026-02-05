import { supabase } from '@/lib/supabase';

class CustomLinkModel {
  // Get all custom links for a user
  static async getByUserId(userId) {
    try {
      console.log("Fetching custom links for userId:", userId);
      const { data, error } = await supabase
        .from('custom_links')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Custom links data received:", data);
      return data;
    } catch (error) {
      console.error('Error fetching custom links:', error);
      throw error;
    }
  }

  // Get all custom links for a user by username
  static async getByUsername(username) {
    try {
      // First get the user's clerk_id from username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('clerk_id')
        .eq('username', username)
        .single();

      if (userError) throw userError;

      // Then get custom links
      const { data, error } = await supabase
        .from('custom_links')
        .select('*')
        .eq('user_id', userData.clerk_id)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching custom links by username:', error);
      return null;
    }
  }

  // Add a new custom link
  static async create(userId, linkData) {
    try {
      // Get the highest order_index for this user
      const { data: existingLinks } = await supabase
        .from('custom_links')
        .select('order_index')
        .eq('user_id', userId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = existingLinks && existingLinks.length > 0 
        ? existingLinks[0].order_index + 1 
        : 0;

      const { data, error } = await supabase
        .from('custom_links')
        .insert({
          user_id: userId,
          title: linkData.title,
          url: linkData.url,
          icon: linkData.icon || 'globe',
          order_index: linkData.order_index !== undefined ? linkData.order_index : nextOrderIndex,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating custom link:', error);
      return null;
    }
  }

  // Update a custom link
  static async update(linkId, linkData) {
    try {
      const { data, error } = await supabase
        .from('custom_links')
        .update({
          title: linkData.title,
          url: linkData.url,
          icon: linkData.icon,
          order_index: linkData.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating custom link:', error);
      return null;
    }
  }

  // Delete a custom link (soft delete by setting is_active to false)
  static async delete(linkId) {
    try {
      const { data, error } = await supabase
        .from('custom_links')
        .update({ is_active: false })
        .eq('id', linkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting custom link:', error);
      return null;
    }
  }

  // Reorder custom links
  static async reorder(userId, linkOrders) {
    try {
      const updates = linkOrders.map(({ id, order_index }) =>
        supabase
          .from('custom_links')
          .update({ order_index })
          .eq('id', id)
          .eq('user_id', userId)
      );

      const results = await Promise.all(updates);
      
      // Check if any update failed
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Failed to reorder some links');
      }

      return true;
    } catch (error) {
      console.error('Error reordering custom links:', error);
      return false;
    }
  }
}

export default CustomLinkModel;
