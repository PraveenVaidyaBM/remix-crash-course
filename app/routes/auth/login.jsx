import {useActionData,redirect,json} from 'remix'
import {db} from '~/utils/db.server'
import {login,createUserSession,register} from "~/utils/session.server"

// validating usernameto certainformat
function validateUserName(username) {
    if(typeof username !== 'string' || username.length < 3){
        return 'username length must be greater than 3 letters long'
    }
}

//validating password certain format
function validatePassword(password) {
    if(typeof password !== 'string' || password.length < 3){
        return 'password length must be greater than 3 letters long'
    }
}

// handling bad requests
function badRequest(data){
    return json(data, {status:400})
}

export const action = async ({request}) => {
    const form = await request.formData()
    const loginType = form.get('loginType')
    const username = form.get('username')
    const password = form.get('password')

    const fields = {loginType, username, password}

    const fieldErrors = {
        username: validateUserName(username),
        password: validatePassword(password)
    }

      if(Object.values(fieldErrors).some(Boolean)){
        return badRequest({fieldErrors, fields})
    }

    switch(loginType){
        case "login":{
            //find user
            const user = await login(username, password)
            //check user
            if(!user){
                badRequest({fieldErrors:{username:"Invalid Credentials"}, fields})
            }
            //create user session
            return createUserSession(user.id,'/posts')
        }

        case "register":{
            //cehck if user exists
            const userExists = await db.user.findFirst({
                where:{
                    username
                }
            })

            if(!userExists){
                return badRequest(fields,fieldErrors({username:`User ${username} already exists`}))
            }
            //create user

            const user = await register({username, password})

            if(!user){
                return badRequest({fields,fieldErrors:'Something Went Wrong'})
            }

            return createUserSession(user.id,'/posts')

            //create user session
        }
        default:{
            return badRequest({
                fields,
                formErrors:"Login Type is Not Valid"
            })
        }
    }

}

//login function
function Login() {

    const actionData = useActionData()

    return (
        <div className="auth-container">
            <div className="page-header">
                <h1>Login</h1>
            </div>
            <div className="page-content">
                <form method="POST">
                    <fieldset>
                        <legend>
                            Login or Register
                        </legend>
                        <label>
                            <input type="radio" name="loginType" value="login" 
                            defaultChecked={!actionData?.fields?.loginType || actionData.fields?.loginType==="login"} /> Login
                        </label>
                        <label>
                            <input type="radio" name="loginType" value="register" /> Sign Up
                        </label>
                    </fieldset>
                    <div className="form-control">
                        <label htmlFor="username">Username</label>
                        <input type="text" name="username" id="username"  
                        defaultValue={actionData?.fields?.username}/>
                        <div className="error">
                            {actionData?.fieldErrors?.username && actionData?.fieldErrors?.username}
                        </div>
                    </div>
                    <div className="form-control">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" id="password"
                        defaultValue={actionData?.fields?.password} />
                        <div className="error">
                            {actionData?.fieldErrors?.password && actionData?.fieldErrors?.password}
                        </div>
                    </div>
                    <button className="btn btn-block" type="submit">Submit</button>
                </form>
            </div>
        </div>
    )
}

export default Login
