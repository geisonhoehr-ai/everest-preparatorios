# 🎧 EverCast - Sistema de Áudio para Cursos

## 📖 Sobre o EverCast

O **EverCast** é uma funcionalidade inovadora que transforma os vídeos dos cursos em áudio MP3, permitindo que os alunos estudem em qualquer lugar, a qualquer momento. Inspirado no Spotify, oferece uma experiência de aprendizado auditivo completa.

## ✨ Funcionalidades

### 🎵 Player de Áudio Avançado
- **Controles completos**: Play, Pause, Anterior, Próximo
- **Barra de progresso**: Visualização e controle do tempo
- **Controle de volume**: Com opção de mute
- **Player fixo**: Permanece visível durante a navegação

### 📚 Organização por Cursos e Módulos
- **Estrutura hierárquica**: Curso → Módulo → Aulas
- **Playlist automática**: Reprodução sequencial das aulas
- **Progresso visual**: Indicadores de conclusão
- **Navegação intuitiva**: Interface estilo Spotify

### 📱 Interface Responsiva
- **Design moderno**: Gradiente escuro com elementos roxos
- **Mobile-friendly**: Funciona perfeitamente em dispositivos móveis
- **Acessibilidade**: Controles grandes e intuitivos

## 🚀 Como Usar

### 1. Acesso
- Faça login no sistema
- Clique em **"EverCast"** no menu lateral
- Escolha um curso para começar

### 2. Navegação
- **Selecione um curso** na barra lateral esquerda
- **Escolha um módulo** para ver as aulas
- **Clique em uma aula** para reproduzir

### 3. Controles
- **Play/Pause**: Botão central grande
- **Anterior/Próximo**: Navegar entre aulas
- **Volume**: Controle deslizante
- **Progresso**: Clique na barra para pular

## 🛠️ Configuração Técnica

### Estrutura de Arquivos
```
public/
└── audio/
    └── evercast/
        ├── fonetica-aula1.mp3
        ├── separacao-silabica.mp3
        ├── acentuacao-grafica.mp3
        └── evercast-config.json
```

### Conversão de Vídeos

#### Pré-requisitos
1. **FFmpeg**: [Download](https://ffmpeg.org/download.html)
2. **Node.js**: Para executar o script de conversão

#### Processo de Conversão
1. **Baixe os vídeos** da Pandavideo
2. **Coloque na pasta** `./videos/`
3. **Execute o script**:
   ```bash
   node scripts/convert-videos-to-audio.js
   ```

#### Estrutura de Vídeos Esperada
```
videos/
├── fonetica-aula1.mp4
├── separacao-silabica.mp4
├── acentuacao-grafica.mp4
├── ortografia.mp4
└── ...
```

## 📊 Dados Mockados

Atualmente, o sistema usa dados mockados para demonstração:

### Curso: Extensivo EAOF 2026
- **FRENTE 1 - Fonética e Morfologia** (8 aulas)
- **FRENTE 2 - Período Simples** (5 aulas)

### Estrutura de Dados
```typescript
interface AudioLesson {
  id: string
  title: string
  duration: string
  audioUrl: string
  moduleId: string
  courseId: string
  isCompleted: boolean
  progress: number
}
```

## 🔧 Integração com Pandavideo

### Limitações Atuais
- A Pandavideo **não oferece** conversão automática para MP3
- É necessário **baixar os vídeos** manualmente
- **Conversão local** usando FFmpeg

### Soluções Alternativas
1. **Download manual** dos vídeos
2. **Script automatizado** para conversão
3. **Upload dos MP3s** para o servidor

## 🎯 Próximos Passos

### Funcionalidades Planejadas
- [ ] **Sincronização com Pandavideo** (API)
- [ ] **Download automático** de vídeos
- [ ] **Conversão em nuvem** (servidor)
- [ ] **Histórico de reprodução**
- [ ] **Favoritos e playlists**
- [ ] **Modo offline** (PWA)
- [ ] **Velocidade de reprodução**
- [ ] **Marcadores de tempo**

### Melhorias Técnicas
- [ ] **Cache inteligente** de áudios
- [ ] **Compressão otimizada**
- [ ] **Streaming progressivo**
- [ ] **Analytics de uso**

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Dispositivos
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🔒 Segurança

### Autenticação
- **Login obrigatório** para acesso
- **Verificação de permissões** por role
- **Sessão segura** com Supabase

### Proteção de Conteúdo
- **URLs protegidas** para áudios
- **Verificação de acesso** por curso
- **Logs de reprodução**

## 📈 Analytics

### Métricas Coletadas
- **Tempo de reprodução** por aula
- **Progresso de conclusão**
- **Aulas mais ouvidas**
- **Tempo total de estudo**

### Relatórios
- **Progresso individual**
- **Estatísticas por curso**
- **Engajamento por módulo**

## 🆘 Suporte

### Problemas Comuns
1. **Áudio não reproduz**: Verifique se o arquivo MP3 existe
2. **Player não carrega**: Limpe o cache do navegador
3. **Controles não funcionam**: Verifique JavaScript habilitado

### Contato
- **Email**: suporte@everestpreparatorios.com.br
- **Telegram**: @everest_suporte
- **WhatsApp**: (11) 99999-9999

---

## 🎉 Conclusão

O **EverCast** representa uma evolução significativa na experiência de aprendizado, permitindo que os alunos estudem de forma mais flexível e eficiente. Com sua interface intuitiva e funcionalidades avançadas, está pronto para revolucionar o ensino a distância!

**Desenvolvido com ❤️ pela equipe Everest Preparatórios**
