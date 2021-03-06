import { Outlet,LiveReload, Link, Links,Meta,useLoaderData } from "remix"
import globalStylesUrl from "~/styles/global.css"
import { getUser } from "./utils/session.server";

// css style referrence
export const links = () => [{
  rel:'stylesheet', href:globalStylesUrl
}]

export const meta = () => { 

  const description = 'Blog built with Remix'
  const keywords = 'remix,react,javascript'

  return {description,keywords}
 }

 export const loader = async ({request}) => {
    const user = await getUser(request)
    const data ={
     user
   }
    return data
 }

export default function App(){
  return (
    <Document>
      <Layout>
        <Outlet/>
      </Layout>
    </Document>
  )
}

function Document ({children,title}){
  return (
    <html lang="en">
    <head>
       <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <Meta/>
        <Links/>
        <title>{title ? title : 'Remix Crash Course'}</title>
    </head>
    <body>
      {children}
      {process.env.NODE_ENV === 'development' ? <LiveReload/> : null}
    </body>
  </html>
  )
}

function Layout({ children }){
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">
            Remix
        </Link>
        <ul className="nav">
          <li>
            <Link to="/posts">Posts</Link>
          </li>
            {user? (
              <li>
                <form action="/auth/logout" method="POST">
                  <button className="btn" type="submit">Logout {user.username}</button>
                </form>
              </li>
            ):(
                         <li>
            <Link to="/auth/login">Login</Link>
          </li>
            )}
        </ul>
      </nav>
      <div className='container'>{children}</div>
    </>
  )
}

export function ErrorBoundary ({error}){
    return (
        <Document>
          <Layout>
            <div>
              <h1>Error</h1>
              <p>{error.message}</p>
            </div>
          </Layout>
        </Document>
    )
}
