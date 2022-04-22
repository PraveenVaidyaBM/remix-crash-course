import bcrypt from "bcrypt";
import {db} from "./db.server"
import { createCookieSessionStorage,redirect } from "remix";

//login functionality
export async function login({username,password}){
    const user = await db.user.findUnique({
        where:{
            username
        }
    })

    if(!user) return null;

    const isCorrectPassword = await bcrypt.compare(password,user.passwordHash)

    if(!isCorrectPassword) return null;

    return user
}

//Register functionality

export async function register({username, password}){
    const passwordHash = await bcrypt.hash(password,10)
    return db.user.create({username, passwordHash})
}

//get session secret key
const sessionSecret = process.env.SESSION_SECRET

if(!sessionSecret){
    throw new Error('No session secret')
}

//create session storage object

const storage = createCookieSessionStorage({
    cookie:{
        name: 'remixblog_session',
        secure:process.env.NODE_ENV === 'production',
        secrets: [sessionSecret],
        sameSite: 'lax',
        path: '/',
        maxAge: 60*60*24*60,
        httpOnly: true
    }
})

//create session

export async function createUserSession(userId: string, redirectTo: string){
    const session = await storage.getSession()
    session.set('userID',userId)
    return redirect(redirectTo,{
        headers:{
            'set-cookie': await storage.commitSession(session)
        }
    })
}

//get user session details

export function getUserSession(request: Request){
    return storage.getSession(request.headers.get('cookie'))
}

//get loggedin user data

export async function getUser(request: Request){
    const session =await getUserSession(request)
    const userId = session.get('userId')
    if(!userId || typeof(userId) !== 'string'){
        return null
    }
    try {
        const user = await db.user.findUnique({
            where: {
                id: userId
            }
        })
        return user
    } catch (error) {
        return null
    }
}

//log out user and destroy session

export async function logout(request: Request){
    const session = await storage.getSession(request.headers.get('Cookie'));
    return redirect('/auth/logout',{
        headers: {
            'Set-Cookie': await storage.destroySession(session)
        }
    })
}