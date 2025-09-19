# 🔄 Sistema de Backup - Everest Preparatórios

## 📋 Visão Geral

O sistema de backup automatizado garante a segurança e resiliência dos dados críticos da plataforma Everest Preparatórios.

## 🚀 Funcionalidades

### ✅ Backup Automatizado
- **Frequência**: Diário às 2:00 AM (configurável)
- **Retenção**: 30 dias (configurável)
- **Tabelas**: Todas as tabelas críticas
- **Formato**: JSON estruturado
- **Localização**: `./backups/` (configurável)

### ✅ Backup Manual
- Backup sob demanda via API
- Backup antes de operações sensíveis
- Verificação de integridade

### ✅ Restauração
- Restauração completa do banco
- Restauração seletiva por tabela
- Verificação de integridade

## 🛠️ Configuração

### Variáveis de Ambiente

```bash
# Habilitar sistema de backup
BACKUP_ENABLED=true

# Horário do backup (cron expression)
BACKUP_SCHEDULE=0 2 * * *

# Dias de retenção
BACKUP_RETENTION_DAYS=30

# Localização dos backups
BACKUP_STORAGE_LOCATION=./backups

# Criptografar backups
BACKUP_ENCRYPT=false
```

### Tabelas Incluídas no Backup

```typescript
const tables = [
  'user_profiles',      // Perfis de usuários
  'subjects',           // Matérias
  'topics',             // Tópicos
  'flashcards',         // Flashcards
  'quiz_questions',     // Questões de quiz
  'quiz_attempts',      // Tentativas de quiz
  'flashcard_progress', // Progresso dos flashcards
  'study_sessions',     // Sessões de estudo
  'audio_courses',      // Cursos de áudio
  'audio_lessons',      // Lições de áudio
  'calendar_events',    // Eventos do calendário
  'member_classes'      // Turmas de membros
]
```

## 📡 API Endpoints

### GET /api/backup

**Listar backups:**
```bash
GET /api/backup?action=list
```

**Verificar integridade:**
```bash
GET /api/backup?action=verify&backupId=backup_1234567890
```

### POST /api/backup

**Criar backup:**
```bash
POST /api/backup
Content-Type: application/json

{
  "action": "create"
}
```

**Restaurar backup:**
```bash
POST /api/backup
Content-Type: application/json

{
  "action": "restore",
  "backupId": "backup_1234567890"
}
```

## 🤖 Backup Automatizado

### Configuração do Cron Job

```bash
# Editar crontab
crontab -e

# Adicionar linha para backup diário às 2 AM
0 2 * * * cd /path/to/everest-preparatorios && node scripts/backup-automated.js >> /var/log/everest-backup.log 2>&1
```

### Execução Manual

```bash
# Executar backup manual
node scripts/backup-automated.js

# Ou via npm script
npm run backup
```

## 📊 Monitoramento

### Logs de Backup

O sistema registra todas as operações de backup:

```typescript
// Exemplo de log
logger.info('Backup completo realizado com sucesso', 'BACKUP', {
  backupId: 'backup_1234567890',
  size: 1024000,
  tables: 12
})
```

### Verificação de Integridade

```typescript
// Verificar se backup é válido
const isValid = await verifyBackup('backup_1234567890')
```

## 🔒 Segurança

### Proteção de Dados
- Backups são armazenados localmente
- Dados sensíveis são mascarados nos logs
- Verificação de integridade automática
- Limpeza automática de backups antigos

### Acesso Restrito
- API de backup protegida por autenticação
- Logs de todas as operações
- Verificação de permissões

## 🚨 Procedimentos de Emergência

### Restauração Rápida

1. **Identificar backup mais recente:**
```bash
curl -X GET "https://api.everest.com/backup?action=list"
```

2. **Verificar integridade:**
```bash
curl -X GET "https://api.everest.com/backup?action=verify&backupId=backup_1234567890"
```

3. **Restaurar backup:**
```bash
curl -X POST "https://api.everest.com/backup" \
  -H "Content-Type: application/json" \
  -d '{"action": "restore", "backupId": "backup_1234567890"}'
```

### Backup de Emergência

```bash
# Criar backup imediato
curl -X POST "https://api.everest.com/backup" \
  -H "Content-Type: application/json" \
  -d '{"action": "create"}'
```

## 📈 Métricas e Alertas

### Métricas Importantes
- Frequência de backups
- Tamanho dos backups
- Tempo de restauração
- Taxa de sucesso

### Alertas Configurados
- Falha no backup automatizado
- Backup não realizado em 24h
- Erro de integridade
- Espaço em disco baixo

## 🔧 Manutenção

### Limpeza Manual

```bash
# Listar backups
ls -la ./backups/

# Remover backup específico
rm ./backups/backup_1234567890.json
```

### Verificação de Espaço

```bash
# Verificar espaço usado pelos backups
du -sh ./backups/
```

## 📚 Exemplos de Uso

### Backup Programático

```typescript
import { createBackup, restoreBackup, listBackups } from '@/lib/backup-system'

// Criar backup
const result = await createBackup()
console.log('Backup criado:', result.backupId)

// Listar backups
const backups = await listBackups()
console.log('Backups disponíveis:', backups.length)

// Restaurar backup
const restoreResult = await restoreBackup('backup_1234567890')
console.log('Restauração:', restoreResult.success)
```

### Backup Antes de Operação Sensível

```typescript
import { createPreOperationBackup } from '@/lib/backup-system'

// Antes de deletar dados
const backup = await createPreOperationBackup('delete_user_data')
if (backup.success) {
  // Proceder com a operação
  await deleteUserData(userId)
}
```

## 🆘 Suporte

Em caso de problemas com o sistema de backup:

1. Verificar logs em `./logs/backup.log`
2. Verificar espaço em disco
3. Verificar permissões de escrita
4. Contatar administrador do sistema

---

**⚠️ IMPORTANTE**: Sempre teste a restauração de backups em ambiente de desenvolvimento antes de usar em produção!
