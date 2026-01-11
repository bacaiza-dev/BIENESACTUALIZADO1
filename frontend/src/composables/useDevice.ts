import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Device } from '@capacitor/device'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { Capacitor } from '@capacitor/core'

export function useDevice() {
  const deviceInfo = ref<any>(null)
  const isKeyboardOpen = ref(false)
  const screenSize = ref({ width: 0, height: 0 })
  const orientation = ref('portrait')

  // Detectar tipo de dispositivo
  const deviceType = computed(() => {
    if (!deviceInfo.value) return 'desktop'
    
    const { platform } = deviceInfo.value
    
    if (platform === 'android' || platform === 'ios') {
      return 'mobile'
    }
    
    if (platform === 'web') {
      const width = screenSize.value.width
      if (width < 768) return 'mobile'
      if (width < 1024) return 'tablet'
      return 'desktop'
    }
    
    return 'desktop'
  })

  // Detectar si es móvil
  const isMobile = computed(() => deviceType.value === 'mobile')

  // Detectar si es tablet
  const isTablet = computed(() => deviceType.value === 'tablet')

  // Detectar si es desktop
  const isDesktop = computed(() => deviceType.value === 'desktop')

  // Detectar si es dispositivo nativo
  const isNative = computed(() => Capacitor.isNativePlatform())

  // Detectar si es web
  const isWeb = computed(() => Capacitor.getPlatform() === 'web')

  // Detectar si es Android
  const isAndroid = computed(() => 
    deviceInfo.value?.platform === 'android' || 
    Capacitor.getPlatform() === 'android'
  )

  // Detectar si es iOS
  const isIOS = computed(() => 
    deviceInfo.value?.platform === 'ios' || 
    Capacitor.getPlatform() === 'ios'
  )

  // Clases CSS dinámicas
  const deviceClasses = computed(() => {
    const classes = []
    
    // Tipo de dispositivo
    classes.push(`device-${deviceType.value}`)
    
    // Plataforma
    if (deviceInfo.value?.platform) {
      classes.push(`platform-${deviceInfo.value.platform}`)
    }
    
    // Estado del teclado
    if (isKeyboardOpen.value) {
      classes.push('keyboard-open')
    }
    
    // Orientación
    classes.push(`orientation-${orientation.value}`)
    
    // Nativo vs web
    if (isNative.value) {
      classes.push('native-app')
    } else {
      classes.push('web-app')
    }
    
    return classes.join(' ')
  })

  // Configurar StatusBar para móviles
  const setupStatusBar = async () => {
    if (isNative.value && (isAndroid.value || isIOS.value)) {
      try {
        await StatusBar.setStyle({ style: Style.Dark })
        await StatusBar.setBackgroundColor({ color: '#dc2626' })
        await StatusBar.show()
      } catch (error) {
        console.warn('❌ Error configurando StatusBar:', error)
      }
    }
  }

  // Configurar teclado
  const setupKeyboard = () => {
    if (isNative.value) {
      Keyboard.addListener('keyboardWillShow', () => {
        isKeyboardOpen.value = true
      })

      Keyboard.addListener('keyboardWillHide', () => {
        isKeyboardOpen.value = false
      })
    }
  }

  // Actualizar tamaño de pantalla
  const updateScreenSize = () => {
    screenSize.value = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    // Detectar orientación
    orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  }

  // Obtener información del dispositivo
  const getDeviceInfo = async () => {
    try {
      const info = await Device.getInfo()
      deviceInfo.value = info
      // console.log('📱 Información del dispositivo:', info)
    } catch (error) {
      // console.warn('❌ Error obteniendo información del dispositivo:', error)
      deviceInfo.value = {
        platform: 'web',
        model: 'Unknown',
        operatingSystem: 'Unknown',
        manufacturer: 'Unknown'
      }
    }
  }

  // Configurar viewport para móviles
  const setupViewport = () => {
    if (isMobile.value) {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        )
      }
    }
  }

  // Configurar estilos CSS variables
  const setupCSSVariables = () => {
    const root = document.documentElement
    
    // Variables de tamaño
    root.style.setProperty('--screen-width', `${screenSize.value.width}px`)
    root.style.setProperty('--screen-height', `${screenSize.value.height}px`)
    
    // Variables de dispositivo
    root.style.setProperty('--device-type', deviceType.value)
    root.style.setProperty('--is-mobile', isMobile.value ? '1' : '0')
    root.style.setProperty('--is-tablet', isTablet.value ? '1' : '0')
    root.style.setProperty('--is-desktop', isDesktop.value ? '1' : '0')
    root.style.setProperty('--is-native', isNative.value ? '1' : '0')
    
    // Variables de plataforma
    root.style.setProperty('--is-android', isAndroid.value ? '1' : '0')
    root.style.setProperty('--is-ios', isIOS.value ? '1' : '0')
    
    // Variables de orientación
    root.style.setProperty('--orientation', orientation.value)
    
    // Variables de teclado
    root.style.setProperty('--keyboard-open', isKeyboardOpen.value ? '1' : '0')
  }

  // Configurar listeners
  const setupListeners = () => {
    window.addEventListener('resize', updateScreenSize)
    window.addEventListener('orientationchange', () => {
      setTimeout(updateScreenSize, 100)
    })
  }

  // Limpiar listeners
  const cleanup = () => {
    window.removeEventListener('resize', updateScreenSize)
    window.removeEventListener('orientationchange', updateScreenSize)
  }

  // Inicializar
  const initialize = async () => {
    await getDeviceInfo()
    updateScreenSize()
    setupStatusBar()
    setupKeyboard()
    setupViewport()
    setupCSSVariables()
    setupListeners()
    
    // Aplicar clases al body
    document.body.className = deviceClasses.value
  }

  // Lifecycle hooks
  onMounted(initialize)
  onUnmounted(cleanup)

  // Watchers para actualizar CSS variables
  const updateCSSVariables = () => {
    setupCSSVariables()
    document.body.className = deviceClasses.value
  }

  // Funciones de utilidad
  const getBreakpoint = () => {
    const width = screenSize.value.width
    if (width < 640) return 'xs'
    if (width < 768) return 'sm'
    if (width < 1024) return 'md'
    if (width < 1280) return 'lg'
    if (width < 1536) return 'xl'
    return '2xl'
  }

  const isBreakpoint = (breakpoint: string) => {
    return getBreakpoint() === breakpoint
  }

  const isBreakpointUp = (breakpoint: string) => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpoints.indexOf(getBreakpoint())
    const targetIndex = breakpoints.indexOf(breakpoint)
    return currentIndex >= targetIndex
  }

  const isBreakpointDown = (breakpoint: string) => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpoints.indexOf(getBreakpoint())
    const targetIndex = breakpoints.indexOf(breakpoint)
    return currentIndex <= targetIndex
  }

  return {
    deviceInfo,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isNative,
    isWeb,
    isAndroid,
    isIOS,
    isKeyboardOpen,
    screenSize,
    orientation,
    deviceClasses,
    getBreakpoint,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    updateCSSVariables,
    initialize
  }
}