import { createRouter, useBase } from 'h3'

const router = createRouter()

export interface ProjectRead {
  id: number
  title: string
  fee: number
  is_active: boolean
  owner_id: string
}

export interface UserRead {
  id: string
  email: string
  is_active: boolean
  is_superuser: boolean
  is_verifie: boolean
  projects: Array<ProjectRead>
}

router.get('/user', defineEventHandler(async (req) => {
  let authToken = getHeader(req, 'authorization')
  if (authToken === undefined) {
    authToken = ''
  }
  const response = await $fetch(`http://backend:8000/users/me/projects`,{
    headers: {Authorization: authToken},
  })
  return response
}))

router.get('/user/records', defineEventHandler(async (req) => {
  let authToken = getHeader(req, 'authorization')
  if (authToken === undefined) {
    authToken = ''
  }
  const response = await $fetch(`http://backend:8000/users/me/records`,{
    headers: {Authorization: authToken},
  })
  return response
}))

router.post('/', defineEventHandler(async (req) => {
  let authToken = getHeader(req, 'authorization')
  if (authToken === undefined) {
    authToken = ''
  }
  const body = await readBody(req)
  const response = await $fetch(`http://backend:8000/users/me/project`, {
    method: 'POST',
    body: body,
    headers: {Authorization: authToken}
  })
  return response
}))

router.post('/:projectId', defineEventHandler(async (req) => {
  let authToken = getHeader(req, 'authorization')
  if (authToken === undefined) {
    authToken = ''
  }
  const body = await readBody(req)
  const response = await $fetch(
    `http://backend:8000/users/me/project/${req.context.params.projectId}`, {
    method: 'PATCH',
    body: body,
    headers: {Authorization: authToken}
  })
  return response
}))

router.post(`/:projectId/record`, defineEventHandler(async (req) => {
  let authToken = getHeader(req, 'authorization')
  if (authToken === undefined) {
    authToken = ''
  }
  const body = await readBody(req)
  const response = await $fetch(
    `http://backend:8000/users/me/project/${req.context.params.projectId}/record`, {
    method: 'POST',
    body: body,
    headers: {Authorization: authToken},
  })
  return response
}))

router.post(`/record/:recordId`, defineEventHandler(async (req) => {
  let authToken = getHeader(req, 'authorization')
  if (authToken === undefined) {
    authToken = ''
  }
  const body = await readBody(req)
  const response = await $fetch(
    `http://backend:8000/users/me/project/record/${req.context.params.recordId}`, {
    method: 'PATCH',
    body: body,
    headers: {Authorization: authToken},
  })
  return response
}))

router.delete(`/record/:recordId`,defineEventHandler( async (req) => {
  let authToken = getHeader(req, 'authorization')
  if (authToken === undefined) {
    authToken = ''
  }
  const response = await $fetch(
    `http://backend:8000/users/me/project/record/${req.context.params.recordId}`, {
    method: 'DELETE',
    headers: {Authorization: authToken},
  })
  return response
}))

export default useBase('/api/projects', router.handler)
