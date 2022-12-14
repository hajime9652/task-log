import { defineStore, acceptHMRUpdate } from 'pinia'

export const useUserStore = defineStore('user', () => {

  interface createProject {title: string, fee: number, is_active: boolean}
  interface updateProject  {id: number, title: string, fee: number, is_active: boolean, owner_id: string}
  interface creteaRecord {memo:string, fee:number, startTime:string, endTime:string}
  interface updateRecord {memo:string, fee:number, startTime:string, endTime:string}

  const token = ref('')
  const logined = ref(false)
  const projects = ref([
    {title: '受託開発', fee: 2000, is_active: true, owner_id:'none', id: 100000},
    {title: '個人開発', fee: 2000, is_active: true, owner_id:'none', id: 0},
  ])
  const records = ref([
    {
      project_id: 0,
      memo: 'test',
      startTime: '2022-10-11 am 11:00',
      endTime: '2022-10-11 pm 3:00',
      fee: 100,
      id: 0,
      time_updated: '',
      time_created: "2022-08-05T01:48:47",
    }
  ])

  const getProjectTitle = (projectId:number) => {
    const _project = projects.value.find(({id}) => id===projectId)
    if (_project) {
      return _project.title
    }
    else {
      return ''
    }
  }

  const getProjectRecord = async () => {
    if (logined.value) {
      const responseProjects = await $fetch(`/api/projects/user`, {
        headers: {authorization: `Bearer ${token.value}`}
      })
      console.log("responceProjects")
      console.log(responseProjects)
      projects.value = responseProjects
  
      const responceRecords = await $fetch(`/api/projects/user/records`, {
        headers: {authorization: `Bearer ${token.value}`}
      })
      records.value = responceRecords
    }
  }

  const logIn = async (payload: {username: string, password: string}) => {
    token.value = await $fetch(`/api/auth/login`, {method:'POST', body: payload})
    logined.value = true
    localStorage.setItem('auth:token', token.value)
    getProjectRecord()
  }

  const checkLogIn = async () => {
    if (!(logined.value||token.value)) {
      const authToken = localStorage.getItem('auth:token')
      if (authToken) {
        token.value = authToken
        logined.value = true
      }
      else {
        token.value = ''
        logined.value = false
      }
    }
  }

  const logOut = async () => {
    token.value = ''
    logined.value = false
    localStorage.setItem('auth:token', token.value)
    projects.value = [
      {title: '受託開発', fee: 2000, is_active: true, owner_id:'none', id: 100000},
      {title: '個人開発', fee: 2000, is_active: true, owner_id:'none', id: 0},
    ]
    records.value = [
      {
        project_id: 0,
        memo: 'test',
        startTime: '2022-10-11 am 11:00',
        endTime: '2022-10-11 pm 3:00',
        fee: 100,
        id: 0,
        time_updated: '',
        time_created: "2022-08-05T01:48:47",
      }
    ]
  }

  const forgotPassword = async (payload: {email: string}) => {
    await $fetch(`/api/auth/forgot-password`, {method:'POST', body: payload})
  }

  const signUp = async (payload :{email:string, password:string}) => {
    const userData = await $fetch(`/api/auth/signup`, {
      method:'POST',
      body: {
        ...payload,
        "is_active": true,
        "is_superuser": false,
        "is_verified": false
      }
    })

    const token = await $fetch(`/api/auth/request-verify-token`, {
      method: 'POST',
      body: {
        email: userData.email
      }
    })
  }

  const verifyMail = async (
    payload: { token: string }
  ) => {
    try {
      const response = await $fetch(`/api/auth/verify`, { method: 'POST', body:payload })
      logined.value = true
      localStorage.setItem('auth:token', token.value)
      getProjectRecord()
      return true
    } catch (e) {
      return false
    }
  }

  const addProject = async (payload: createProject) => {
    await $fetch(`/api/projects`, {
      method: 'POST',
      body: payload,
      headers: {authorization: `Bearer ${token.value}`}
    })
    getProjectRecord()
  }

  const archiveProject = async (payload: updateProject) => {
    payload.is_active = false
    await $fetch(`/api/projects/${payload.id}`, {
      method: 'POST',
      body: payload,
      headers: {authorization: `Bearer ${token.value}`}
    })
    getProjectRecord()
  }

  const addRecord = async (selectedProjectId:number, payload: creteaRecord) => {
    if (logined.value) {
      await $fetch(`/api/projects/${selectedProjectId}/record`, {
        method: 'POST',
        body: payload,
        headers: {authorization: `Bearer ${token.value}`}
      })
      getProjectRecord()
    }
    else {
      const _project = projects.value.find(({id}) => id===selectedProjectId)
      let maxId = 0
      records.value.forEach(record => {
        if (record.id > maxId) {
          maxId = record.id;
        }
      })
      if (_project) {
        records.value.push({
          id:maxId+1,
          project_id:_project.id,
          ...payload,
          time_created:"no tracking",
          time_updated:""})
      }
    }
  }

  const updateRecord = async (selectedProjectId:number, payload: updateRecord ) => {
    await $fetch(`/api/projects/record/${selectedProjectId}`, {
      method: 'POST',
      body: payload,
      headers: {authorization: `Bearer ${token.value}`}
    })
    getProjectRecord()
  }

  const deleteRecord = async (selectedProjectId:number) => {
    await $fetch(`/api/projects/record/${selectedProjectId}`, {
      method: 'DELETE',
      headers: {authorization: `Bearer ${token.value}`}
    })
    getProjectRecord()
  }


  return {
    token, logined, projects, records, getProjectTitle,
    logIn, logOut, checkLogIn, forgotPassword, signUp, verifyMail,
    getProjectRecord,
    addProject, archiveProject, 
    addRecord, updateRecord, deleteRecord
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
