"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type TooltipPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  placement?: TooltipPlacement
  delayMs?: number
  hideDelayMs?: number
  className?: string
  wrapperClassName?: string
}

export function Tooltip({
  content,
  children,
  placement = "top",
  delayMs = 250,
  hideDelayMs = 200,
  className,
  wrapperClassName,
}: TooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const timeoutRef = React.useRef<number | null>(null)
  const hideTimeoutRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    setIsMounted(true)
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const show = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const { top, left, width, height } = rect
      let tooltipTop = top
      let tooltipLeft = left
      switch (placement) {
        case "top":
          tooltipTop = top + window.scrollY
          tooltipLeft = left + window.scrollX // align to trigger's left edge
          break
        case "bottom":
          tooltipTop = top + height + window.scrollY
          tooltipLeft = left + window.scrollX // align to trigger's left edge
          break
        case "left":
          tooltipTop = top + window.scrollY
          tooltipLeft = left + window.scrollX
          break
        case "right":
          tooltipTop = top + window.scrollY
          tooltipLeft = left + width + window.scrollX
          break
      }
      setCoords({ top: tooltipTop, left: tooltipLeft })
      setIsOpen(true)
    }, delayMs)
  }

  const hide = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current)
    hideTimeoutRef.current = window.setTimeout(() => setIsOpen(false), hideDelayMs)
  }

  const trigger = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      const childRef = (children as any).ref
      if (typeof childRef === "function") {
        childRef(node)
      } else if (childRef && typeof childRef === "object") {
        // Only set .current on valid mutable ref objects
        ;(childRef as React.MutableRefObject<HTMLElement | null>).current = node
      }
      ;(triggerRef as React.MutableRefObject<HTMLElement | null>).current = node
    },
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e)
      show()
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e)
      hide()
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e)
      show()
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e)
      hide()
    },
    // Remove native title to avoid double tooltips if passed
    title: undefined,
    "aria-describedby": isOpen ? "tooltip" : undefined,
  })

  const tooltipNode = isOpen && coords ? (
    <div
      role="tooltip"
      id="tooltip"
      style={{ position: "absolute", top: coords.top, left: coords.left, transform: placement === "top" ? "translate(0, -100%)" : placement === "bottom" ? "translate(0, 0)" : placement === "left" ? "translate(-100%, 0)" : "translate(0, 0)", pointerEvents: "none", zIndex: 99999 }}
      className={cn(
        "rounded-md px-2.5 py-1.5 text-xs shadow-md border",
        // Theme-aware: dark in Light mode, light in Dark mode
        "bg-black text-white border-black/60",
        "dark:bg-white dark:text-black dark:border-white/60",
        className
      )}
      onMouseEnter={() => {
        if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current)
        setIsOpen(true)
      }}
      onMouseLeave={() => hide()}
    >
      {content}
    </div>
  ) : null

  return (
    <span style={{ display: "inline-flex" }} className={wrapperClassName}>
      {trigger}
      {isMounted && tooltipNode ? createPortal(tooltipNode, document.body) : null}
    </span>
  )
}

export default Tooltip


