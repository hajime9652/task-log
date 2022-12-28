<script setup lang="ts">
  import { useUserStore } from '@/store/user'
  const userState = useUserStore()
  const route = useRoute()
  const router = useRouter()
  
  onMounted(async () => {
    const verifyFlag = await userState.verifyMail({token:route.query.token as string})
    if (verifyFlag) {
      router.push('/')
    }
  })

  const submit = async () => {
    await $fetch(`/api/auth/request-verify-user`, {
      method: 'POST',
      body: {
        email: route.query.email
      }
    })
    router.push('/')
  }
</script>

<template>
  <form class="mt-8 space-y-6 w-full max-w-xs mx-auto" action="#" method="POST">
    <div>
      <button
        type="submit"
        class="btn btn-primary"
        @click.prevent="submit"
      >
        メールを再送信する
      </button>
    </div>
  </form>
</template>