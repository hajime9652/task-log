<script setup>
  import { format, formatDistanceStrict } from 'date-fns'
  import { DotsVerticalIcon, ArchiveIcon } from '@heroicons/vue/solid'
  import { useUserStore } from '@/store/user'
  const userState = useUserStore()
  
  const workStatus = ref('休憩中')
  const selectedProjectId = ref(userState.projects[0].id)
  const data = reactive({
    memo: '',
    startTime: '',
    endTime: '',
    fee: 0,
  })
  
  const onFlag = ref(false)
  const alertFlag = ref(false)
  const alertMessage = ref('Error! Login failed.')
  
  const detailItem = reactive({
    project: userState.projects[0],
    record: userState.records[0]
  })
  const detailFlag = ref(false)
  const openDetail = (item) => {
    detailItem.project = userState.projects.find(({id})=>id===item.project_id)
    detailItem.record = item
    detailFlag.value = true
  }
  const deleteRecordHandler = (id) => {
    detailFlag.value = false
    userState.deleteRecord(id)
  }
  
  const changed = () => {
    if (onFlag.value) {
      data.startTime = new Date()
      workStatus.value = '稼働中'
    }
    else {
      data.endTime = new Date()
      const spendTime = formatDistanceStrict(data.endTime, data.startTime, {unit: 'second'})
      const project = userState.projects.find(({id})=>id===selectedProjectId.value)
      if (project) {
        data.fee = Number(spendTime.split(' ')[0]) * project.fee
  
        data.startTime = format(data.startTime, 'y-M-d aaa h:m:s')
        data.endTime = format(data.endTime, 'y-M-d aaa h:m:s')
        userState.addRecord(selectedProjectId.value, data)
  
        workStatus.value = '休憩中'
        data.memo = ''
        data.startTime = ''
        data.endTime = ''
        data.fee = 0
      }
    }
  }
  
  const loginData = reactive({
    username: '',
    password: ''
  })
  const signupData = reactive({
    email: '',
    password: '',
  })
  const resetData = reactive({
    email: '',
  })
  const newProject = reactive({
    title: '',
    fee: 2000,
    is_active: true
  })
  
  onMounted(async () => {
    userState.checkLogIn()
    if (userState.logined) {
      await userState.getProjectRecord()
      selectedProjectId.value = userState.projects[0].id
    }
  })
  
  const colorMode = useColorMode()
  const {data: themes} = await useFetch(`/api/themes`)
  </script>
  
  <template>
    <!-- カラーテーマ設定 -->
    <div class="p-4">
      <select class="select" v-model="colorMode.preference">
        <option disabled selected>Theme</option>
        <option v-for="theme of themes" :key="theme">{{ theme }}</option>
      </select>
    </div>
    <div class="p-4 flex gap-4 items-center">
      <p class="text-2xl font-extralight">Hello Tasks</p>
      <!-- logout -->
      <div v-if="userState.logined">
        <button @click="userState.logOut()" class="btn btn-xs btn-ghost">logout</button>
        <label for="modal-projects" class="btn btn-xs btn-ghost modal-button">projects</label>
      </div>
      <!--  login / singup -->
      <div v-else>
        <label for="modal-login" class="btn btn-xs btn-ghost modal-button">login</label>
        <label for="modal-signup" class="btn btn-xs btn-ghost modal-button">singup</label>
      </div>
    </div>
  
    <div class="grid grid-cols-1 gap-4 justify-items-center">
      <!-- 作業記録・入力 -->
      
      <div class="form-control w-full max-w-sm gap-4">
        <label class="label cursor-pointer">
          <span class="label-text">{{workStatus}}</span>
          <input type="checkbox" class="toggle toggle-primary" v-model="onFlag" @change="changed"/>
        </label>
  
        <!-- <span class="label-text-alt">プロジェクト</span> -->
        <select class="select select-bordered" v-model="selectedProjectId">
          <option selected :value="userState.projects[0].id">{{ userState.projects[0].title }}</option>
          <option v-for="item of userState.projects.slice(1)" :key="item" :value="item.id">{{ item.title }}</option>
        </select>
  
        <!-- <span class="label-text-alt">作業内容</span> -->
        <textarea class="textarea textarea-bordered" placeholder="作業内容" v-model="data.memo"></textarea>
      </div>
  
      <!-- 作業記録・詳細 -->
      <div class="w-full max-w-sm" v-show="detailFlag">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">{{ detailItem.project.title }}</h2>
            <p>{{ detailItem.record.memo }}</p>
            <p class="text-md font-light">（報酬：{{ detailItem.record.fee }}円）</p>
            <div class="text-sm font-extralight">
              <p>{{ detailItem.record.startTime }}</p>
              <p>{{ detailItem.record.endTime }}</p>
            </div>
            <div class="inline-block">
            <div class="card-actions justify-end">
              <button class="btn btn-ghost pr-10" @click="deleteRecordHandler(detailItem.record.id)">削除</button>
              <label for="modal-update-record" class="btn btn-primary modal-button">編集</label>
              <button class="btn btn-secondary" @click="detailFlag = false">close</button>
            </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 作業記録・一覧 -->
      <div class="w-full max-w-sm">
        <table class="table w-full">
          <!-- head -->
          <thead>
            <tr>
              <th>日付</th>
              <th>プロジェクト</th>
              <th>詳細</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover" v-for="item in userState.records" :key="item">
              <td>{{ item.startTime.split(' ')[0] }}</td>
              <td>{{ userState.getProjectTitle(item.project_id) }}</td>
              <td>
                <label class="w-7 btn btn-circle btn-outline" @click="openDetail(item)">
                  <DotsVerticalIcon class="w-4 h-4"/>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- ログインモーダル -->
    <input type="checkbox" id="modal-login" class="modal-toggle" />
    <label for="modal-login" class="modal cursor-pointer">
      <label class="modal-box relative" for="">
        <div class="p-4" v-if="alertFlag">
          <div class="alert alert-error shadow-lg">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{{ alertMessage }}</span>
            </div>
          </div>
        </div>
        <div v-if="userState.logined">
          <div class="w-full gap-8">
            <p class="text-xl pb-4">ログインしました</p>
            <p class="pb-4">username: {{loginData.username}}</p>
            <label for="modal-login" class="w-full btn btn-xs modal-button">close</label>
          </div>
        </div>
        <div v-else>
          <div class="form-control w-full gap-4">
            <label for="modal-login" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
            <input type="text" placeholder="Email address" class="input input-bordered" v-model="loginData.username" />
            <input type="password" placeholder="Password" class="input input-bordered" v-model="loginData.password" />
            <button @click="userState.logIn(loginData)" class="btn">login</button>
            <label for="modal-forget" class="btn btn-xs btn-ghost modal-button">Forgot Password</label>
          </div>
        </div>
      </label>
    </label>

    <!-- パスワード忘れたモーダル -->
    <input type="checkbox" id="modal-forget" class="modal-toggle" />
    <label for="modal-forget" class="modal cursor-pointer">
      <label class="modal-box relative" for="">
        <div class="form-control w-full gap-4">
          <input type="text" placeholder="Email address" class="input input-bordered" v-model="resetData.email" />
          <label for="modal-forget" class="btn">
            <button @click="userState.forgotPassword(resetData)">reset password</button>
          </label>
        </div>
      </label>
    </label>

    <!-- 新規登録モーダル -->
    <input type="checkbox" id="modal-signup" class="modal-toggle" />
    <label for="modal-signup" class="modal cursor-pointer">
      <label class="modal-box relative" for="">
        <div class="form-control w-full gap-4">
          <input type="text" placeholder="Email address" class="input input-bordered" v-model="signupData.email" />
          <input type="password" placeholder="Password" class="input input-bordered" v-model="signupData.password" />
          <button @click="userState.signUp(signupData)" class="btn modal-button">signup</button>
        </div>
      </label>
    </label>

    <!-- レコード更新モーダル -->
    <input type="checkbox" id="modal-update-record" class="modal-toggle" />
    <label for="modal-update-record" class="modal cursor-pointer">
      <label class="modal-box relative" for="">
        <div class="form-control w-full gap-4">
          <input type="textarea textarea-bordered" class="input input-bordered" v-model="detailItem.record.memo" />
          <label for="modal-update-record" class="btn btn-primary">
            <button @click="userState.updateRecord(detailItem.record.id, detailItem.record)" >更新</button>
          </label>
        </div>
      </label>
    </label>

    <!-- プロジェクト確認・設定モーダル -->
    <input type="checkbox" id="modal-projects" class="modal-toggle" />
    <label for="modal-projects" class="modal cursor-pointer">
      <label class="modal-box relative" for="">
        <table class="table table-compact w-full">
          <thead>
            <tr>
              <th>title</th> 
              <th>fee</th>
              <th></th>
            </tr>
          </thead> 
          <tbody>
            <tr v-for="item in userState.projects" :key="item">
              <td>{{item.title}}</td> 
              <td>{{item.fee}}円</td>
              <td>
                <label class="btn btn-ghost" @click="userState.archiveProject(item)">
                  <ArchiveIcon class="w-6 h-6"/>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        <label class="label label-text">New Porject</label>
        <div class="form-control w-full gap-4">
          <label for="modal-projects" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
          <input type="text" class="input input-bordered" placeholder="title" v-model="newProject.title" />
          <input type="text" class="input input-bordered" v-model="newProject.fee" />
          <button @click="userState.addProject(newProject)" class="btn">add</button>
        </div>
      </label>
    </label>
  </template>
    