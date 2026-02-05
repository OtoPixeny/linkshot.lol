import UserModel from '@/models/user'

export async function POST(req) {
  try {
    const body = await req.json()
    const { username } = body

    if (!username) {
      return Response.json({ error: 'Username required' }, { status: 400 })
    }

    const user = await UserModel.getByUsername(username)
    
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
