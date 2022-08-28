import { createRouter, useBase } from 'h3'

const router = createRouter()

interface Token {
  access_token: string,
  token_type: string
}

router.post('/login', async (req) => {
  const body = await useBody(req)
  const token = await $fetch<Token>(`http://backend:8000/auth/jwt/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		body: new URLSearchParams(body),
    async onRequestError({ request, options, error }) {
      // Log error
      console.log('[fetch request error]', request, options, error)
    }
  })

  return token.access_token
})

router.post('/signup', async (req) => {
  const body = await useBody(req)
  const token = await $fetch<Token>(`http://backend:8000/auth/register`, {
    method: 'POST',
		body: body,
    async onRequestError({ request, options, error }) {
      // Log error
      console.log('[fetch request error]', request, options, error)
    }
  })
  return token
})

router.post('/forgot-password', async (req) => {
  const body = await useBody(req)
  const token = await $fetch<Token>(`http://backend:8000/auth/forgot-password`, {
    method: 'POST',
		body: body,
    async onRequestError({ request, options, error }) {
      // Log error
      console.log('[fetch request error]', request, options, error)
    }
  })
  return true
})

export default useBase('/api/auth', router.handler)