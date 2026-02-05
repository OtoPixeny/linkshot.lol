import express from 'express';
import UserModel from '@/models/user';

const router = express.Router();

// Endpoint to update ranks for top 3 users
// This should be called periodically or when needed
router.post('/update-ranks', async (req, res) => {
  try {
    const result = await UserModel.updateRanksForTopUsers();
    res.json({ 
      success: true, 
      message: 'Ranks updated successfully',
      data: result 
    });
  } catch (error) {
    console.error('Error updating ranks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update ranks',
      error: error.message 
    });
  }
});

// Endpoint to manually add a rank to a user
router.post('/add-rank', async (req, res) => {
  try {
    const { username, rank } = req.body;
    
    if (!username || !rank) {
      return res.status(400).json({
        success: false,
        message: 'Username and rank are required'
      });
    }
    
    const result = await UserModel.addRank(username, rank);
    res.json({ 
      success: true, 
      message: 'Rank added successfully',
      data: result 
    });
  } catch (error) {
    console.error('Error adding rank:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add rank',
      error: error.message 
    });
  }
});

// Endpoint to manually remove a rank from a user
router.post('/remove-rank', async (req, res) => {
  try {
    const { username, rank } = req.body;
    
    if (!username || !rank) {
      return res.status(400).json({
        success: false,
        message: 'Username and rank are required'
      });
    }
    
    const result = await UserModel.removeRank(username, rank);
    res.json({ 
      success: true, 
      message: 'Rank removed successfully',
      data: result 
    });
  } catch (error) {
    console.error('Error removing rank:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove rank',
      error: error.message 
    });
  }
});

export default router;
