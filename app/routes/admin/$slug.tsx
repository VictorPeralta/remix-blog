import {
  ActionFunction,
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import type { LoaderFunction } from "remix";
import { createPost, getPost } from "~/post";
import invariant from "tiny-invariant";

export let loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "expected params.slug");
  return getPost(params.slug);
};

export let action: ActionFunction = async ({ request }) => {
  await new Promise((res) => setTimeout(res, 1000));

  let formData = await request.formData();
  let title = formData.get("title");
  let slug = formData.get("slug");
  let markdown = formData.get("markdown");
  let errors: Record<string, boolean> = {};
  if (!title) errors.title = true;
  if (!slug) errors.slug = true;
  if (!markdown) errors.markdown = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof title === "string");
  invariant(typeof slug === "string");
  invariant(typeof markdown === "string");
  await createPost({ title, slug, markdown });

  return redirect("/admin");
};

export default function PostSlug() {
  let post = useLoaderData();
  let errors = useActionData();
  let transition = useTransition();

  return (
    <div>
      <h1>{post.title}</h1>
      <Form method="post">
        <p>
          <label>
            Post Title: {errors?.title && <em>Title is required</em>}
            <input type="text" name="title" defaultValue={post.title} />
          </label>
        </p>
        <p>
          <label>
            Post Slug: {errors?.slug && <em>Slug is required</em>}
            <input type="text" name="slug" defaultValue={post.slug} />
          </label>
        </p>
        <p>
          <label htmlFor="markdown">Markdown:</label>{" "}
          {errors?.markdown && <em>Markdown is required</em>}
          <br />
          <textarea rows={20} name="markdown" defaultValue={post.body} />
        </p>
        <p>
          <button type="submit">
            {transition.submission ? "Creating..." : "Create Post"}
          </button>
        </p>
      </Form>
    </div>
  );
}
