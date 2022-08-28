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

router.get('/user', async (req) => {
  const response = await $fetch(`http://backend:8000/users/me/projects`,{
    headers: {Authorization: req.headers.authorization},
  })
  return response
})

router.get('/user/records', async (req) => {
  const response = await $fetch(`http://backend:8000/users/me/records`,{
    headers: {Authorization: req.headers.authorization},
  })
  return response
})

router.post('/', async (req) => {
  const body = await useBody(req)
  const response = await $fetch(`http://backend:8000/users/me/project`, {
    method: 'POST',
    body: body,
    headers: {Authorization: req.headers.authorization}
  })
  return response
})

router.post('/:projectId', async (req) => {
  const body = await useBody(req)
  const response = await $fetch(
    `http://backend:8000/users/me/project/${req.context.params.projectId}`, {
    method: 'PATCH',
    body: body,
    headers: {Authorization: req.headers.authorization}
  })
  return response
})

router.post(`/:projectId/record`, async (req) => {
  const body = await useBody(req)
  const response = await $fetch(
    `http://backend:8000/users/me/project/${req.context.params.projectId}/record`, {
    method: 'POST',
    body: body,
    headers: {Authorization: req.headers.authorization},
  })
  return response
})

router.post(`/record/:recordId`, async (req) => {
  const body = await useBody(req)
  const response = await $fetch(
    `http://backend:8000/users/me/project/record/${req.context.params.recordId}`, {
    method: 'PATCH',
    body: body,
    headers: {Authorization: req.headers.authorization},
  })
  return response
})

router.delete(`/record/:recordId`, async (req) => {
  const response = await $fetch(
    `http://backend:8000/users/me/project/record/${req.context.params.recordId}`, {
    method: 'DELETE',
    headers: {Authorization: req.headers.authorization},
  })
  return response
})

export default useBase('/api/projects', router.handler)
