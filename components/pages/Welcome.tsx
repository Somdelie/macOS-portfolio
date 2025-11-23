"use client"
import gsap from "gsap"
import type React from "react"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"

const FONT_WEIGHTS = {
  subTitle: { min: 100, max: 400, default: 100 },
  title: { min: 400, max: 900, default: 400 },
}

const renderText = (text: string, className: string, baseWeight = 400): React.ReactNode[] => {
  return [...text].map((ch, i) => (
    <span
      key={i}
      className={className}
      style={{
        fontVariationSettings: `'wght' ${baseWeight}`,
      }}
    >
      {ch === " " ? "\u00A0" : ch}
    </span>
  ))
}

const setUpTextHover = (container: HTMLElement | null, type: keyof typeof FONT_WEIGHTS) => {
  if (!container) return () => {}

  const letters = container.querySelectorAll("span")
  const { max, default: base } = FONT_WEIGHTS[type]

  const activeAnimations = new Map<HTMLSpanElement, gsap.core.Tween>()

  const animateLetter = (letter: HTMLSpanElement, weight: number, duration = 0.25) => {
    // Kill existing animation for this letter
    activeAnimations.get(letter)?.kill()

    const tween = gsap.to(letter, {
      duration,
      ease: "power2.out",
      fontVariationSettings: `'wght' ${weight}`,
    })

    activeAnimations.set(letter, tween)
    return tween
  }

  const handleMouseMove = (e: MouseEvent) => {
    const { left } = container.getBoundingClientRect()
    const mouseX = e.clientX - left

    letters.forEach((letter) => {
      const { left: l, width: w } = letter.getBoundingClientRect()
      const distance = Math.abs(mouseX - (l - left + w / 2))
      const intensity = Math.exp(-(distance ** 2) / 2000)

      const weight = base + (max - base) * intensity

      animateLetter(letter, weight, 0.2)
    })
  }

  const handleMouseLeave = () => {
   

    letters.forEach((letter) => {
      animateLetter(letter, base, 0.3)
    })
  }

  container.addEventListener("mousemove", handleMouseMove)
  container.addEventListener("mouseleave", handleMouseLeave)

  return () => {
    container.removeEventListener("mousemove", handleMouseMove)
    container.removeEventListener("mouseleave", handleMouseLeave)
    activeAnimations.forEach((tween) => tween.kill())
    activeAnimations.clear()
  }
}

const Welcome = () => {
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const subtitleRef = useRef<HTMLParagraphElement | null>(null)

  useGSAP(() => {
    const cleanupTitle = setUpTextHover(titleRef.current, "title")
    const cleanupSubtitle = setUpTextHover(subtitleRef.current, "subTitle")

    return () => {
      cleanupTitle?.()
      cleanupSubtitle?.()
    }
  }, [])

  return (
    <section id="welcome">
      <p ref={subtitleRef}>{renderText("Hey, I'm Cautious! Welcome to my", "text-3xl font-georama", 100)}</p>
      <h1 ref={titleRef} className="mt-7">
        {renderText("portfolio", "text-9xl italic font-georama")}
      </h1>
      <div className="small-screen">
        <p>This Portfolio is designed for desktop/tablet screens only</p>
      </div>
    </section>
  )
}

export default Welcome
