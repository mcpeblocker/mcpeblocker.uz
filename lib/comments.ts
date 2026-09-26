// Server-only: post comments live in GitHub Discussions of this repo (no database).
// One discussion per post, created on the first comment. Visitors don't sign in:
// the API route posts on their behalf with GITHUB_COMMENTS_TOKEN (fine-grained,
// this repo only, "Discussions: read & write") and stores their name in a marker.

const OWNER = 'mcpeblocker'
const REPO = 'mcpeblocker.uz'
const CATEGORY = process.env.COMMENTS_CATEGORY || 'Announcements'

export type PublicComment = {
  id: string
  name: string
  isAuthor: boolean // written by the site owner directly on GitHub
  text: string
  createdAt: string
}

type RawComment = {
  id: string
  body: string
  bodyText: string
  createdAt: string
  author: { login: string } | null
}
type Discussion = { id: string; title: string; body: string; comments: { nodes: RawComment[] } }

// Pluggable for tests; defaults to the real GitHub API.
let fetchImpl: typeof fetch = (...args) => fetch(...args)
export const __setFetch = (f: typeof fetch) => (fetchImpl = f)

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = process.env.GITHUB_COMMENTS_TOKEN
  if (!token) throw new Error('Comments are not configured (GITHUB_COMMENTS_TOKEN)')
  const res = await fetchImpl('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (!res.ok || json.errors) throw new Error(json.errors?.[0]?.message ?? `GitHub ${res.status}`)
  return json.data
}

const NAME_MARKER = /^<!-- comment-name: (.*?) -->\n?/
const slugMarker = (slug: string) => `<!-- slug: ${slug} -->`

/** Names can't break out of the HTML comment they're stored in. */
export const cleanName = (name: string) =>
  name
    .replace(/-->|[<>]/g, '')
    .replace(/\s+/g, ' ') // incl. newlines, which would end the marker line
    .trim()
    .slice(0, 50) || 'Anonymous'

export const encodeComment = (name: string, text: string) =>
  `<!-- comment-name: ${cleanName(name)} -->\n${text.trim()}`

export const decodeComment = (c: RawComment): PublicComment => {
  const m = c.body.match(NAME_MARKER)
  if (m) {
    const text = c.body.slice(m[0].length).trim()
    return { id: c.id, name: m[1], isAuthor: false, text, createdAt: c.createdAt }
  }
  // Written directly on GitHub (the owner replying, or an old Giscus comment).
  const login = c.author?.login ?? 'ghost'
  return {
    id: c.id,
    name: login,
    isAuthor: login === OWNER,
    text: c.bodyText,
    createdAt: c.createdAt,
  }
}

let ids: { repositoryId: string; categoryId: string } | null = null
async function repoIds() {
  if (ids) return ids
  const data = await gql<{
    repository: { id: string; discussionCategories: { nodes: { id: string; name: string }[] } }
  }>(
    `query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) { id discussionCategories(first: 25) { nodes { id name } } }
    }`,
    { owner: OWNER, name: REPO }
  )
  const category = data.repository.discussionCategories.nodes.find((c) => c.name === CATEGORY)
  if (!category) throw new Error(`Discussion category "${CATEGORY}" not found`)
  ids = { repositoryId: data.repository.id, categoryId: category.id }
  return ids
}

// A post's discussions: ours carry a slug marker; old Giscus ones only match by title.
// ponytail: scans the latest 100 discussions; paginate once the blog outgrows that.
async function discussionsFor(slug: string, title: string) {
  const { categoryId } = await repoIds()
  const data = await gql<{ repository: { discussions: { nodes: Discussion[] } } }>(
    `query($owner: String!, $name: String!, $category: ID!) {
      repository(owner: $owner, name: $name) {
        discussions(first: 100, categoryId: $category, orderBy: { field: CREATED_AT, direction: ASC }) {
          nodes { id title body comments(first: 100) { nodes { id body bodyText createdAt author { login } } } }
        }
      }
    }`,
    { owner: OWNER, name: REPO, category: categoryId }
  )
  return data.repository.discussions.nodes.filter(
    (d) => d.body.includes(slugMarker(slug)) || d.title === title
  )
}

export async function getComments(slug: string, title: string): Promise<PublicComment[]> {
  const discussions = await discussionsFor(slug, title)
  return discussions
    .flatMap((d) => d.comments.nodes.map(decodeComment))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function addComment(
  post: { slug: string; title: string; url: string },
  name: string,
  text: string
): Promise<PublicComment> {
  let discussion = (await discussionsFor(post.slug, post.title))[0]
  if (!discussion) {
    const { repositoryId, categoryId } = await repoIds()
    const created = await gql<{ createDiscussion: { discussion: Discussion } }>(
      `mutation($repo: ID!, $category: ID!, $title: String!, $body: String!) {
        createDiscussion(input: { repositoryId: $repo, categoryId: $category, title: $title, body: $body }) {
          discussion { id title body comments(first: 1) { nodes { id body bodyText createdAt author { login } } } }
        }
      }`,
      {
        repo: repositoryId,
        category: categoryId,
        title: post.title,
        body: `Comments on [${post.title}](${post.url})\n\n${slugMarker(post.slug)}`,
      }
    )
    discussion = created.createDiscussion.discussion
  }
  const added = await gql<{ addDiscussionComment: { comment: RawComment } }>(
    `mutation($id: ID!, $body: String!) {
      addDiscussionComment(input: { discussionId: $id, body: $body }) {
        comment { id body bodyText createdAt author { login } }
      }
    }`,
    { id: discussion.id, body: encodeComment(name, text) }
  )
  return decodeComment(added.addDiscussionComment.comment)
}
