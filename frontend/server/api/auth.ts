import { createRouter, useBase } from 'h3'

const router = createRouter()

interface Token {
  access_token: string,
  token_type: string
}

router.post('/login', defineEventHandler(async (req) => {
  const body = await readBody(req)
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
}))

router.post('/signup', defineEventHandler(async (req) => {
  const body = await readBody(req)
  const userData = await $fetch(`http://backend:8000/auth/register`, {
    method: 'POST',
		body: body,
    async onRequestError({ request, options, error }) {
      // Log error
      console.log('[fetch request error]', request, options, error)
    }
  })
  return userData
}))

router.post('/forgot-password', defineEventHandler(async (req) => {
  const body = await readBody(req)
  const token = await $fetch<Token>(`http://backend:8000/auth/forgot-password`, {
    method: 'POST',
		body: body,
    async onRequestError({ request, options, error }) {
      // Log error
      console.log('[fetch request error]', request, options, error)
    }
  })
  return true
}))

router.post('/request-verify-token', defineEventHandler(async (req) => {
  const body = await readBody(req)
  await $fetch(`http://backend:8000/auth/request-verify-token`, {
    method: 'POST',
		body: body,
    async onRequestError({ request, options, error }) {
      // Log error
      console.log('[fetch request error]', request, options, error)
    }
  })
}))

router.post('/verify', defineEventHandler(async (req) => {
  const body = await readBody(req)
  await $fetch(`http://backend:8000/auth/verify`, {
    method: 'POST',
		body: body,
    async onRequestError({ request, options, error }) {
      // Log error
      console.log('[fetch request error]', request, options, error)
    }
  })
}))

export default useBase('/api/auth', router.handler)