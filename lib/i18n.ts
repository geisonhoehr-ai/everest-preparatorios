'use client'

interface Translation {
  [key: string]: string | Translation
}

interface I18nConfig {
  defaultLocale: string
  supportedLocales: string[]
  fallbackLocale: string
  enableFallback: boolean
  enablePluralization: boolean
  enableInterpolation: boolean
  enableNamespace: boolean
}

interface I18nState {
  locale: string
  translations: Record<string, Translation>
  isLoading: boolean
  error: string | null
}

class I18nService {
  private config: I18nConfig
  private state: I18nState
  private listeners: Set<() => void> = new Set()

  constructor(config: Partial<I18nConfig> = {}) {
    this.config = {
      defaultLocale: 'pt-BR',
      supportedLocales: ['pt-BR', 'en-US', 'es-ES'],
      fallbackLocale: 'pt-BR',
      enableFallback: true,
      enablePluralization: true,
      enableInterpolation: true,
      enableNamespace: true,
      ...config
    }

    this.state = {
      locale: this.config.defaultLocale,
      translations: {},
      isLoading: false,
      error: null
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar locale do localStorage
    const savedLocale = localStorage.getItem('everest-locale')
    if (savedLocale && this.config.supportedLocales.includes(savedLocale)) {
      this.state.locale = savedLocale
    }

    // Carregar traduções iniciais
    this.loadTranslations(this.state.locale)
  }

  // Carregar traduções
  async loadTranslations(locale: string): Promise<void> {
    if (!this.config.supportedLocales.includes(locale)) {
      this.state.error = `Locale '${locale}' is not supported`
      this.notifyListeners()
      return
    }

    this.state.isLoading = true
    this.state.error = null
    this.notifyListeners()

    try {
      // Carregar traduções do arquivo
      const translations = await this.fetchTranslations(locale)
      this.state.translations[locale] = translations
      this.state.locale = locale
      
      // Salvar no localStorage
      localStorage.setItem('everest-locale', locale)
      
      this.state.isLoading = false
      this.notifyListeners()
    } catch (error) {
      this.state.error = `Failed to load translations for '${locale}': ${error}`
      this.state.isLoading = false
      this.notifyListeners()
    }
  }

  private async fetchTranslations(locale: string): Promise<Translation> {
    try {
      // Tentar carregar do arquivo
      const response = await fetch(`/locales/${locale}.json`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn(`Failed to load translations from file for ${locale}:`, error)
    }

    // Fallback para traduções embutidas
    return this.getEmbeddedTranslations(locale)
  }

  private getEmbeddedTranslations(locale: string): Translation {
    const translations: Record<string, Translation> = {
      'pt-BR': {
        common: {
          save: 'Salvar',
          cancel: 'Cancelar',
          delete: 'Excluir',
          edit: 'Editar',
          create: 'Criar',
          search: 'Pesquisar',
          loading: 'Carregando...',
          error: 'Erro',
          success: 'Sucesso',
          warning: 'Aviso',
          info: 'Informação'
        },
        navigation: {
          dashboard: 'Dashboard',
          flashcards: 'Flashcards',
          quiz: 'Quiz',
          profile: 'Perfil',
          settings: 'Configurações',
          logout: 'Sair'
        },
        flashcards: {
          title: 'Flashcards',
          create: 'Criar Flashcard',
          edit: 'Editar Flashcard',
          delete: 'Excluir Flashcard',
          question: 'Pergunta',
          answer: 'Resposta',
          subject: 'Matéria',
          topic: 'Tópico'
        },
        quiz: {
          title: 'Quiz',
          create: 'Criar Quiz',
          edit: 'Editar Quiz',
          delete: 'Excluir Quiz',
          start: 'Iniciar Quiz',
          finish: 'Finalizar Quiz',
          score: 'Pontuação',
          time: 'Tempo'
        }
      },
      'en-US': {
        common: {
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit',
          create: 'Create',
          search: 'Search',
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          warning: 'Warning',
          info: 'Information'
        },
        navigation: {
          dashboard: 'Dashboard',
          flashcards: 'Flashcards',
          quiz: 'Quiz',
          profile: 'Profile',
          settings: 'Settings',
          logout: 'Logout'
        },
        flashcards: {
          title: 'Flashcards',
          create: 'Create Flashcard',
          edit: 'Edit Flashcard',
          delete: 'Delete Flashcard',
          question: 'Question',
          answer: 'Answer',
          subject: 'Subject',
          topic: 'Topic'
        },
        quiz: {
          title: 'Quiz',
          create: 'Create Quiz',
          edit: 'Edit Quiz',
          delete: 'Delete Quiz',
          start: 'Start Quiz',
          finish: 'Finish Quiz',
          score: 'Score',
          time: 'Time'
        }
      },
      'es-ES': {
        common: {
          save: 'Guardar',
          cancel: 'Cancelar',
          delete: 'Eliminar',
          edit: 'Editar',
          create: 'Crear',
          search: 'Buscar',
          loading: 'Cargando...',
          error: 'Error',
          success: 'Éxito',
          warning: 'Advertencia',
          info: 'Información'
        },
        navigation: {
          dashboard: 'Panel',
          flashcards: 'Tarjetas',
          quiz: 'Cuestionario',
          profile: 'Perfil',
          settings: 'Configuración',
          logout: 'Cerrar sesión'
        },
        flashcards: {
          title: 'Tarjetas',
          create: 'Crear Tarjeta',
          edit: 'Editar Tarjeta',
          delete: 'Eliminar Tarjeta',
          question: 'Pregunta',
          answer: 'Respuesta',
          subject: 'Materia',
          topic: 'Tema'
        },
        quiz: {
          title: 'Cuestionario',
          create: 'Crear Cuestionario',
          edit: 'Editar Cuestionario',
          delete: 'Eliminar Cuestionario',
          start: 'Iniciar Cuestionario',
          finish: 'Finalizar Cuestionario',
          score: 'Puntuación',
          time: 'Tiempo'
        }
      }
    }

    return translations[locale] || translations[this.config.fallbackLocale]
  }

  // Traduzir chave
  t(key: string, params?: Record<string, any>, options?: { count?: number; namespace?: string }): string {
    const { count, namespace } = options || {}
    
    // Construir chave completa
    let fullKey = key
    if (namespace) {
      fullKey = `${namespace}.${key}`
    }

    // Obter tradução
    let translation = this.getTranslation(fullKey)
    
    // Fallback se não encontrado
    if (!translation && this.config.enableFallback && this.state.locale !== this.config.fallbackLocale) {
      translation = this.getTranslation(fullKey, this.config.fallbackLocale)
    }

    // Se ainda não encontrado, retornar a chave
    if (!translation) {
      return key
    }

    // Aplicar pluralização
    if (count !== undefined && this.config.enablePluralization) {
      translation = this.applyPluralization(translation, count)
    }

    // Aplicar interpolação
    if (params && this.config.enableInterpolation) {
      translation = this.applyInterpolation(translation, params)
    }

    return translation
  }

  private getTranslation(key: string, locale?: string): string | undefined {
    const targetLocale = locale || this.state.locale
    const translations = this.state.translations[targetLocale]
    
    if (!translations) {
      return undefined
    }

    const keys = key.split('.')
    let current: any = translations

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return undefined
      }
    }

    return typeof current === 'string' ? current : undefined
  }

  private applyPluralization(translation: string, count: number): string {
    // Implementação simples de pluralização
    if (count === 1) {
      return translation.replace(/\|.*$/, '')
    } else {
      const plural = translation.split('|')[1]
      return plural || translation
    }
  }

  private applyInterpolation(translation: string, params: Record<string, any>): string {
    return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match
    })
  }

  // Mudar locale
  async changeLocale(locale: string): Promise<void> {
    if (locale === this.state.locale) {
      return
    }

    await this.loadTranslations(locale)
  }

  // Obter locale atual
  getCurrentLocale(): string {
    return this.state.locale
  }

  // Obter locales suportados
  getSupportedLocales(): string[] {
    return [...this.config.supportedLocales]
  }

  // Verificar se locale é suportado
  isLocaleSupported(locale: string): boolean {
    return this.config.supportedLocales.includes(locale)
  }

  // Obter estado
  getState(): I18nState {
    return { ...this.state }
  }

  // Adicionar listener
  addListener(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<I18nConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): I18nConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return true
  }

  getTranslations(locale?: string): Translation {
    const targetLocale = locale || this.state.locale
    return this.state.translations[targetLocale] || {}
  }

  // Formatação de números
  formatNumber(number: number, locale?: string): string {
    const targetLocale = locale || this.state.locale
    return new Intl.NumberFormat(targetLocale).format(number)
  }

  // Formatação de moeda
  formatCurrency(amount: number, currency: string = 'BRL', locale?: string): string {
    const targetLocale = locale || this.state.locale
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency
    }).format(amount)
  }

  // Formatação de data
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions, locale?: string): string {
    const targetLocale = locale || this.state.locale
    return new Intl.DateTimeFormat(targetLocale, options).format(date)
  }

  // Formatação de tempo relativo
  formatRelativeTime(date: Date, locale?: string): string {
    const targetLocale = locale || this.state.locale
    const rtf = new Intl.RelativeTimeFormat(targetLocale, { numeric: 'auto' })
    
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (Math.abs(days) >= 1) {
      return rtf.format(days, 'day')
    } else if (Math.abs(hours) >= 1) {
      return rtf.format(hours, 'hour')
    } else if (Math.abs(minutes) >= 1) {
      return rtf.format(minutes, 'minute')
    } else {
      return rtf.format(seconds, 'second')
    }
  }
}

// Instância global
export const i18nService = new I18nService()

// Hook para usar i18n
export function useI18n() {
  return {
    t: i18nService.t.bind(i18nService),
    changeLocale: i18nService.changeLocale.bind(i18nService),
    getCurrentLocale: i18nService.getCurrentLocale.bind(i18nService),
    getSupportedLocales: i18nService.getSupportedLocales.bind(i18nService),
    isLocaleSupported: i18nService.isLocaleSupported.bind(i18nService),
    getState: i18nService.getState.bind(i18nService),
    addListener: i18nService.addListener.bind(i18nService),
    formatNumber: i18nService.formatNumber.bind(i18nService),
    formatCurrency: i18nService.formatCurrency.bind(i18nService),
    formatDate: i18nService.formatDate.bind(i18nService),
    formatRelativeTime: i18nService.formatRelativeTime.bind(i18nService),
    isEnabled: i18nService.isEnabled.bind(i18nService),
    getTranslations: i18nService.getTranslations.bind(i18nService),
    updateConfig: i18nService.updateConfig.bind(i18nService),
    getConfig: i18nService.getConfig.bind(i18nService)
  }
}
