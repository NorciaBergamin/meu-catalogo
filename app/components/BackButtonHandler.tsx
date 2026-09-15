'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'

export default function BackButtonHandler() {
  useEffect(() => {
    // Escuta o evento do botão de voltar nativo do Android
    const listenerPromise = App.addListener('backButton', ({ canGoBack }) => {
      // Se estiver na página inicial, fecha o app
      if (window.location.pathname === '/') {
        App.exitApp()
      } else {
        // Se estiver em qualquer outra página (produto, carrinho, etc), volta na histórico
        window.history.back()
      }
    })

    return () => {
      listenerPromise.then(listener => listener.remove())
    }
  }, [])

  return null
}