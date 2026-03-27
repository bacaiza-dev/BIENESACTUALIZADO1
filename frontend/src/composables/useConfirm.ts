import { createApp, h } from 'vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

type ConfirmOptions = {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

export function confirm(options: string | ConfirmOptions): Promise<boolean> {
  const opts: ConfirmOptions =
    typeof options === 'string' ? { message: options } : options

  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const app = createApp({
      render() {
        return h(ConfirmModal, {
          ...opts,
          onConfirm: () => {
            cleanup()
            resolve(true)
          },
          onCancel: () => {
            cleanup()
            resolve(false)
          },
        })
      },
    })

    const cleanup = () => {
      app.unmount()
      if (container.parentNode) container.parentNode.removeChild(container)
    }

    app.mount(container)
  })
}

export default confirm
