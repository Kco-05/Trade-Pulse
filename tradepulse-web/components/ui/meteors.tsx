"use client"

import React, { useMemo } from "react"

import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  const meteorStyles = useMemo(() => {
    const count = Math.max(0, number)
    const delaySpan = Math.max(0, maxDelay - minDelay)
    const durationSpan = Math.max(0, maxDuration - minDuration)

    return Array.from({ length: count }, (_, idx) => {
      const t = count <= 1 ? 0 : idx / (count - 1)
      return {
        ["--angle" as string]: `${-angle}deg`,
        top: "-5%",
        left: `${(idx * 47) % 100}%`,
        animationDelay: `${minDelay + t * delaySpan}s`,
        animationDuration: `${Math.floor(minDuration + t * durationSpan)}s`,
      } as React.CSSProperties
    })
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle])

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          style={style}
          className={cn(
            "animate-meteor pointer-events-none absolute size-0.5 rotate-(--angle) rounded-full bg-zinc-500 shadow-[0_0_0_1px_#ffffff10]",
            className
          )}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-12.5 -translate-y-1/2 bg-linear-to-r from-zinc-500 to-transparent" />
        </span>
      ))}
    </>
  )
}
