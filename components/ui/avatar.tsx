"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Componente Avatar com avatar automático
interface AvatarWithAutoFallbackProps {
  src?: string | null
  alt?: string
  fallback?: string
  email?: string | null
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  userId?: string | null
}

const AvatarWithAutoFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarWithAutoFallbackProps
>(({ src, alt, fallback, email, className, size = "md", userId, ...props }, ref) => {
  const [imageError, setImageError] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null)
  const [customAvatarUrl, setCustomAvatarUrl] = React.useState<string | null>(null)

  // Buscar avatar personalizado do banco de dados
  const fetchCustomAvatar = React.useCallback(async () => {
    if (!userId) return

    try {
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single()
      
      if (profile?.avatar_url) {
        setCustomAvatarUrl(profile.avatar_url)
      }
    } catch (error) {
      console.log('Avatar personalizado não encontrado:', error)
    }
  }, [userId])

  // Gerar avatar baseado no email
  const generateAvatarUrl = React.useCallback((userEmail: string) => {
    if (!userEmail) return null
    
    // Usar DiceBear API para gerar avatar baseado no email
    const seed = userEmail.toLowerCase().trim()
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
  }, [])

  // Gerar iniciais do email
  const generateInitials = React.useCallback((userEmail: string) => {
    if (!userEmail) return "U"
    
    const parts = userEmail.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return userEmail.substring(0, 2).toUpperCase()
  }, [])

  // Efeito para buscar avatar personalizado
  React.useEffect(() => {
    fetchCustomAvatar()
  }, [fetchCustomAvatar])

  // Efeito para gerar avatar quando email mudar
  React.useEffect(() => {
    if (email && !src && !customAvatarUrl) {
      const generatedUrl = generateAvatarUrl(email)
      setAvatarUrl(generatedUrl)
    }
  }, [email, src, customAvatarUrl, generateAvatarUrl])

  // Resetar erro quando src mudar
  React.useEffect(() => {
    setImageError(false)
  }, [src])

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-lg"
  }

  // Prioridade: src > customAvatarUrl > avatarUrl (gerado) > fallback
  const finalSrc = src || customAvatarUrl || avatarUrl

  return (
    <Avatar
      ref={ref}
      className={cn(sizeClasses[size], className)}
      {...props}
    >
      <AvatarImage
        src={finalSrc || undefined}
        alt={alt}
        onError={() => setImageError(true)}
        className={cn(
          "aspect-square h-full w-full object-cover",
          imageError && "hidden"
        )}
      />
      <AvatarFallback 
        className={cn(
          "bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium",
          textSizeClasses[size]
        )}
      >
        {fallback || (email ? generateInitials(email) : "U")}
      </AvatarFallback>
    </Avatar>
  )
})
AvatarWithAutoFallback.displayName = "AvatarWithAutoFallback"

export { Avatar, AvatarImage, AvatarFallback, AvatarWithAutoFallback }
