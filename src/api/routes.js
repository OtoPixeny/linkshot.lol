import express from 'express';
// import UserModel from '@/models/user';
import analyticsRoutes from './analytics.js';

const router = express.Router();

// Use analytics routes
router.use('/analytics', analyticsRoutes);

// Endpoint to update ranks for top 3 users
// This should be called periodically or when needed
router.post('/update-ranks', async (req, res) => {
  try {
    // const result = await UserModel.updateRanksForTopUsers();
    res.json({ 
      success: true, 
      message: 'Ranks updated successfully',
      data: 'mock result'
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

export default router;
