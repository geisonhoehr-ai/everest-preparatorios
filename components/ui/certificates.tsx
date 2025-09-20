"use client"

import { Award } from "lucide-react"

interface Certificate {
  id: string
  title: string
  description: string
  date: string
}

interface CertificatesProps {
  certificates: Certificate[]
}

export function Certificates({ certificates }: CertificatesProps) {
  if (certificates.length === 0) {
    return (
      <div className="flex flex-1 w-full h-full min-h-[4rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-1 p-1">
        <div className="flex items-center space-x-2 p-2 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-700" style={{ opacity: 1, transform: 'none' }}>
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <Award className="h-3 w-3 text-white" />
          </div>
          <div>
            <p className="font-medium text-xs text-neutral-700 dark:text-neutral-200">
              Nenhum certificado
            </p>
            <p className="text-xs text-neutral-500">
              ainda
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 w-full h-full min-h-[4rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2 p-1 overflow-y-auto">
      {certificates.map((certificate) => (
        <div key={certificate.id} className="flex items-center space-x-2 p-2 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-700" style={{ opacity: 1, transform: 'none' }}>
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <Award className="h-3 w-3 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-xs text-neutral-700 dark:text-neutral-200">
              {certificate.title}
            </p>
            <p className="text-xs text-neutral-500">
              {certificate.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
