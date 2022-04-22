import { json, Link, redirect, useActionData } from "remix";
import {db} from '~/utils/db.server'
import {getUser} from '~/utils/session.server'

//validation for title field
function valdateTitle(title) {
    if(typeof title !== 'string' || title.length < 3){
        return 'Title length must be greater than 3 letters long'
    }
}

//validation for body field
function valdateBody(body) {
    if(typeof body !== 'string' || body.length < 10){
        return 'Body length must be greater than 10 letters long'
    }
}

//Handling bad request
function badRequest(data){
    return json(data, {status:400})
}

export const action = async ({request}) => {
    const form = await request.formData();
    const title = form.get('title');
    const body = form.get('body');
    const user = await getUser(request)

    const fields = {title, body}

    const fieldErrors = {
        title: valdateTitle(title),
        body: valdateBody(body)
    }

    if(Object.values(fieldErrors).some(Boolean)){
        return badRequest({fieldErrors, fields}, {status:400})
    }

    const post = await db.post.create({data:{...fields,userId:user.id}})

    return redirect(`/posts/${post.id }`)
}

//creating new post
function NewPost() {

    const actionData = useActionData()

    return (
        <>
        <div className="page-header">
            <h1>New Posts</h1>
            <Link to ='/posts' className="btn btn-reverse">
                Back
            </Link>
        </div>

        <div className="page-content">
            <form method="POST">
                <div className="form-control">
                    <label htmlFor="title">Title</label>
                    <input type="text" name="title" id="title" defaultValue={actionData?.fields?.title} />
                    <div className="error">
                        <p>{actionData?.fieldErrors?.title && (actionData?.fieldErrors?.title)}</p>
                    </div>
                </div>
                <div className="form-control">
                    <label htmlFor="body">Post Body</label>
                    <textarea type="text" name="body" id="body" defaultValue={actionData?.fields?.body}/>
                    <div className="error">
                        <p>{actionData?.fieldErrors?.body && (actionData?.fieldErrors?.body)}</p>
                    </div>
                </div>
                <button className="btn btn-block" type="submit">Add Post</button>
            </form>
        </div>
        </>
    )
}

export default NewPost
