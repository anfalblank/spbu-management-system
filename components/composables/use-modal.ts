'use client'

import { useState, useCallback } from 'react'

/**
 * Generic modal state management hook
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)
  const [data, setData] = useState<any>(null)

  const open = useCallback((modalData?: any) => {
    setData(modalData)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    // Clear data after animation
    setTimeout(() => setData(null), 300)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
    data,
    setData,
  }
}

/**
 * Multi-modal hook for managing multiple modals
 */
export function useModals<T extends string>(modals: T[]) {
  const [openModals, setOpenModals] = useState<Set<T>>(new Set())
  const [modalData, setModalData] = useState<Partial<Record<T, any>>>({})

  const open = useCallback((modal: T, data?: any) => {
    setOpenModals(prev => new Set(prev).add(modal))
    if (data !== undefined) {
      setModalData(prev => ({ ...prev, [modal]: data }))
    }
  }, [])

  const close = useCallback((modal: T) => {
    setOpenModals(prev => {
      const next = new Set(prev)
      next.delete(modal)
      return next
    })
    setModalData(prev => {
      const next = { ...prev }
      delete next[modal]
      return next
    })
  }, [])

  const closeAll = useCallback(() => {
    setOpenModals(new Set())
    setModalData({})
  }, [])

  const is_open = useCallback((modal: T) => {
    return openModals.has(modal)
  }, [openModals])

  const getData = useCallback((modal: T) => {
    return modalData[modal]
  }, [modalData])

  return {
    open,
    close,
    closeAll,
    isOpen,
    getData,
    anyOpen: openModals.size > 0,
    openModals: Array.from(openModals),
  }
}

/**
 * Confirmation modal hook
 */
export function useConfirm() {
  const modal = useModal()

  const confirm = useCallback(
    (options: {
      title?: string
      message?: string
      onConfirm: () => void | Promise<void>
      onCancel?: () => void
    }) => {
      modal.open({
        title: options.title || 'Konfirmasi',
        message: options.message || 'Apakah Anda yakin?',
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      })
    },
    [modal]
  )

  const handleConfirm = async () => {
    const { onConfirm } = modal.data || {}
    if (onConfirm) {
      await onConfirm()
    }
    modal.close()
  }

  const handleCancel = () => {
    const { onCancel } = modal.data || {}
    if (onCancel) {
      onCancel()
    }
    modal.close()
  }

  return {
    ...modal,
    confirm,
    handleConfirm,
    handleCancel,
    title: modal.data?.title,
    message: modal.data?.message,
  }
}
