'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'

export default function BackButtonHandler() {
  useEffect(() => {
    const setupListener = async () => {
      await App.addListener('backButton', () => {
        // Se estiver na página inicial (catálogo), fecha o app
        if (window.location.pathname === '/' || window.location.pathname === '') {
          App.exitApp()
        } else {
          // Se estiver em outra página (produto, carrinho, etc), volta no histórico
          window.history.back()
        }
      })
    }

    setupListener()

    return () => {
      App.removeAllListeners()
    }
  }, [])

  return null
}