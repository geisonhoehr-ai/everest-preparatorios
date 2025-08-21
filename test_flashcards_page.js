require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const puppeteer = require('puppeteer');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando simulação da página de flashcards...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simular a função getAllSubjects do arquivo actions.ts
async function getAllSubjects() {
  console.log("🔍 [Server Action] getAllSubjects() iniciada")
  console.log("🔍 [Server Action] Supabase client obtido")
  
  try {
    const { data, error } = await supabase.from("subjects").select("id, name").order("name")
    console.log("🔍 [Server Action] Query executada, data:", data, "error:", error)
    
    if (error) {
      console.error("❌ [Server Action] Erro ao buscar matérias:", error)
      return []
    }
    
    console.log("✅ [Server Action] Matérias encontradas:", data)
    return data || []
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado em getAllSubjects:", error)
    return []
  }
}

// Simular a função loadSubjects da página de flashcards
async function loadSubjects() {
  try {
    console.log("🔍 [DEBUG] Iniciando loadSubjects...")
    console.log("🔍 [DEBUG] Chamando getAllSubjects()...")
    const subjectsData = await getAllSubjects()
    console.log("📚 [DEBUG] Resposta de getAllSubjects():", subjectsData)
    console.log("📚 [DEBUG] Tipo de subjectsData:", typeof subjectsData)
    console.log("📚 [DEBUG] É array?", Array.isArray(subjectsData))
    console.log("📚 [DEBUG] Length:", subjectsData?.length)
    
    if (subjectsData && Array.isArray(subjectsData)) {
      console.log("✅ [DEBUG] Dados válidos, setando subjects...")
      console.log("✅ [DEBUG] Subjects setados:", subjectsData)
      
      // Se não há subjects, carregar tópicos diretamente
      if (subjectsData.length === 0) {
        console.log("📚 [DEBUG] Nenhum subject encontrado, carregando tópicos diretamente...")
        return []
      }
      
      return subjectsData
    } else {
      console.error("❌ [DEBUG] Dados inválidos:", subjectsData)
      // Carregar tópicos diretamente se não há subjects
      console.log("📚 [DEBUG] Carregando tópicos diretamente devido a dados inválidos...")
      return []
    }
  } catch (error) {
    console.error("❌ [DEBUG] Erro ao carregar matérias:", error)
    console.error("❌ [DEBUG] Stack trace:", error instanceof Error ? error.stack : 'N/A')
    // Carregar tópicos diretamente em caso de erro
    console.log("📚 [DEBUG] Carregando tópicos diretamente devido a erro...")
    return []
  }
}

async function testFlashcardsPage() {
  console.log('🧪 [TEST] Iniciando teste da página de flashcards...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Interceptar requisições para debug
    page.on('request', request => {
      console.log(`🌐 [TEST] Request: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`📡 [TEST] Response: ${response.status()} ${response.url()}`);
    });
    
    // Interceptar console logs
    page.on('console', msg => {
      console.log(`📝 [TEST] Console: ${msg.type()} ${msg.text()}`);
    });
    
    // Interceptar erros
    page.on('pageerror', error => {
      console.error(`❌ [TEST] Page Error: ${error.message}`);
    });
    
    console.log('🧪 [TEST] Navegando para /flashcards...');
    await page.goto('http://localhost:3000/flashcards', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('🧪 [TEST] Aguardando carregamento...');
    await page.waitForTimeout(5000);
    
    // Verificar se há conteúdo visível
    const hasContent = await page.evaluate(() => {
      const body = document.body;
      const hasText = body.textContent && body.textContent.trim().length > 0;
      const hasElements = body.children.length > 0;
      const hasFlashcardsText = body.textContent.includes('Flashcards');
      
      return {
        hasText,
        hasElements,
        hasFlashcardsText,
        bodyText: body.textContent.substring(0, 200),
        childrenCount: body.children.length
      };
    });
    
    console.log('📊 [TEST] Resultado da verificação:', hasContent);
    
    // Tirar screenshot
    await page.screenshot({ 
      path: 'flashcards-page-test.png',
      fullPage: true 
    });
    
    console.log('📸 [TEST] Screenshot salvo como flashcards-page-test.png');
    
    if (hasContent.hasFlashcardsText) {
      console.log('✅ [TEST] Página carregou corretamente!');
    } else {
      console.log('❌ [TEST] Página não carregou corretamente');
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erro durante o teste:', error);
  } finally {
    await browser.close();
  }
}

testFlashcardsPage(); 