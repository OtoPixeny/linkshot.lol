import UserModel from '@/models/user'

export async function GET(req) {
  try {
    const { userId } = req.query
    
    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 })
    }

    const user = await UserModel.getByUserId(userId)
    
    return Response.json({ 
      success: true, 
      data: user 
    })
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { userId, ...userData } = body

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 })
    }

    // Check if user exists
    let user = await UserModel.getByUserId(userId)
    
    if (user) {
      // Update existing user
      user = await UserModel.update(userId, userData)
    } else {
      // Create new user
      user = await UserModel.create({ clerk_id: userId, ...userData })
    }

    return Response.json({ 
      success: true, 
      data: user,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
