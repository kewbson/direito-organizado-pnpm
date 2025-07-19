# 📚 Formato JSON dos Documentos no Firebase

## Visão Geral

Este documento descreve a estrutura completa dos documentos JSON que são enviados para o Firebase Firestore pelo Lei Scraper V2.0. O sistema processa leis brasileiras do site Planalto.gov.br e gera documentos estruturados compatíveis com projetos React.

## 🏗️ Estrutura Base de um Documento

### Documento Padrão (< 1MB)

```json
{
  // ====== METADADOS BÁSICOS ======
  "id": "abusoautoridade",                    // ID único da lei (baseado na URL)
  "titulo": "L13869",                         // Título oficial da lei
  "ano": 2019,                               // Ano de publicação
  "dataPublicacao": "2019-09-05",           // Data de publicação (ISO 8601)
  "status": "vigente",                       // "vigente" | "revogada"
  "orgaoResponsavel": "Congresso Nacional",  // Órgão responsável pela lei
  "area": "administrativo",                  // Área do direito
  "categoria": "penal",                      // Categoria principal
  "jurisdicao": "federal",                   // Jurisdição da lei
  "fonte": "http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/L13869.htm",
  "url": "http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/L13869.htm",
  "nome": "Lei de Abuso de Autoridade",      // Nome popular da lei
  "alias": "Nova Lei de Abuso de Autoridade", // Nome alternativo
  "prioridade": 24,                          // Prioridade de indexação (1-100)

  // ====== METADADOS DE SCRAPING ======
  "scraping": {
    "dataExtracao": "2025-07-18T21:18:42.054Z", // Timestamp ISO da extração
    "versao": "2.0",                            // Versão do scraper utilizada
    "tamanhoOriginal": 78958,                   // Tamanho original em bytes
    "hash": "2bbcd9b6"                          // Hash MD5 do conteúdo
  },

  // ====== CONTEÚDO COMPLETO ======
  "conteudo": "<div class='lei-conteudo'>\n<h1>L13869</h1>\n<p>Art. 1º Esta Lei define...</p>\n</div>",

  // ====== ARTIGOS ESTRUTURADOS ======
  "artigos": {
    "1": {
      "numero": "1º",                          // Número do artigo
      "titulo": "autoridade, cometidos por agente público...", // Resumo/título
      "texto": "Art. 1º Esta Lei define os crimes de abuso de autoridade...", // Texto completo
      "incisos": [],                           // Array de incisos (se houver)
      "paragrafos": [],                        // Array de parágrafos (se houver)
      "anchor": "#art-1"                       // Âncora para navegação
    },
    "2": {
      "numero": "2º",
      "titulo": "qualquer agente público, servidor ou não...",
      "texto": "Art. 2º É sujeito ativo do crime...",
      "incisos": [
        "I - servidores públicos e militares...",
        "II - membros do Poder Legislativo...",
        "III - membros do Poder Executivo..."
      ],
      "paragrafos": [
        "Parágrafo único. Reputa-se agente público..."
      ],
      "anchor": "#art-2"
    }
    // ... mais artigos
  },

  // ====== ÍNDICE NAVEGÁVEL ======
  "indice": [
    {
      "titulo": "CAPÍTULO I - DISPOSIÇÕES GERAIS",
      "nivel": 1,
      "anchor": "#cap1"
    },
    {
      "titulo": "CAPÍTULO II - DOS SUJEITOS DO CRIME", 
      "nivel": 1,
      "anchor": "#cap2"
    }
  ],

  // ====== ESTATÍSTICAS ======
  "totalArtigos": 45                          // Número total de artigos na lei
}
```

## 🔧 Otimizações para Documentos Grandes

### Limite do Firestore
- **Limite por documento**: 1MB (1.048.576 bytes)
- **Limite por campo**: ~1MB
- **Estratégia**: Compressão e divisão automática

### 1. Compressão Automática

Quando um documento se aproxima do limite, o sistema aplica otimizações:

```json
{
  "id": "cc",
  "titulo": "Código Civil",
  
  // CONTEÚDO COMPRIMIDO
  "conteudo": "HTML comprimido (espaços removidos, truncado em 800KB)",
  "conteudo_truncado": true,  // ⚠️ Flag indicando truncamento
  
  // ARTIGOS LIMITADOS
  "artigos": {
    "1": {
      "numero": "1º",
      "texto": "Texto truncado em 1000 caracteres...", 
      "titulo": "Título completo mantido"
    }
    // Apenas primeiros 500 artigos mantidos
  },
  "artigos_truncados": true,  // ⚠️ Flag indicando truncamento
  
  "totalArtigos": 2046        // Número real mantido nos metadados
}
```

### 2. Divisão em Múltiplos Documentos

Para leis muito grandes (Constituição, Código Civil, Código Penal), o sistema cria múltiplos documentos:

#### Documento Principal
```json
{
  "id": "cf",
  "tipo": "principal",                        // 🔑 Identificador do tipo
  "titulo": "Constituição",
  "ano": 1988,
  "status": "vigente",
  "categoria": "constitucional",
  "totalArtigos": 250,
  "indice": [
    {
      "titulo": "TÍTULO I - DOS PRINCÍPIOS FUNDAMENTAIS",
      "nivel": 1,
      "anchor": "#tit1"
    }
  ],
  "partes": [                                 // 📋 Lista de documentos relacionados
    "cf_conteudo_1",
    "cf_conteudo_2",
    "cf_conteudo_3",
    "cf_artigos_1", 
    "cf_artigos_2"
  ]
}
```

#### Partes de Conteúdo
```json
{
  "id": "cf_conteudo_1",
  "tipo": "conteudo",                         // 🔑 Tipo da parte
  "parte": 1,                                // Número sequencial da parte
  "total_partes": 3,                         // Total de partes deste tipo
  "lei_principal": "cf",                     // 🔗 Referência ao documento principal
  "conteudo": "<div class='lei-conteudo'>... primeira parte do HTML ...</div>"
}
```

#### Partes de Artigos
```json
{
  "id": "cf_artigos_1",
  "tipo": "artigos",                         // 🔑 Tipo da parte
  "parte": 1,                                // Número sequencial da parte
  "total_partes": 2,                         // Total de partes deste tipo  
  "lei_principal": "cf",                     // 🔗 Referência ao documento principal
  "artigos": {
    "1": {
      "numero": "1º",
      "titulo": "A República Federativa do Brasil...",
      "texto": "Art. 1º A República Federativa...",
      "incisos": [
        "I - a soberania;",
        "II - a cidadania;",
        "III - a dignidade da pessoa humana;"
      ],
      "paragrafos": [
        "Parágrafo único. Todo o poder emana do povo..."
      ],
      "anchor": "#art-1"
    }
    // Artigos 1-125 (primeira metade)
  }
}
```

## 📊 Estrutura no Firestore

### Coleção Principal
- **Nome**: `vademecum`
- **Tipo**: Collection no Firebase Firestore

### Tipos de Documentos
1. **Documento Único**: Lei completa em um documento (< 1MB)
2. **Documento Principal**: Metadados + referências às partes
3. **Partes de Conteúdo**: Fragmentos do HTML
4. **Partes de Artigos**: Fragmentos dos artigos estruturados

### Identificadores
- **Lei única**: `abusoautoridade`, `cdc`, `eca`
- **Lei dividida - principal**: `cf`, `cc`, `cp`
- **Partes de conteúdo**: `cf_conteudo_1`, `cf_conteudo_2`
- **Partes de artigos**: `cf_artigos_1`, `cf_artigos_2`

## 🔍 Como Ler os Dados

### 1. Documento Simples (< 1MB)

```javascript
// React/JavaScript
const lei = await db.collection('vademecum').doc('abusoautoridade').get();
const data = lei.data();

// Acessar dados
console.log(data.titulo);           // "L13869"
console.log(data.artigos['1']);     // Primeiro artigo
console.log(data.totalArtigos);     // 45
console.log(data.status);           // "vigente"

// Renderizar no React
<div dangerouslySetInnerHTML={{ __html: data.conteudo }} />
```

### 2. Documento Dividido (> 1MB)

```javascript
// Função para reconstitir documento completo
async function getLeiCompleta(id) {
  // 1. Buscar documento principal
  const principal = await db.collection('vademecum').doc(id).get();
  const mainData = principal.data();
  
  // 2. Verificar se é documento dividido
  if (mainData.tipo !== 'principal' || !mainData.partes) {
    return mainData; // Documento simples
  }
  
  // 3. Buscar todas as partes
  const partes = await Promise.all(
    mainData.partes.map(partId => 
      db.collection('vademecum').doc(partId).get()
    )
  );
  
  // 4. Reconstruir conteúdo
  let conteudoCompleto = '';
  let artigosCompletos = {};
  
  // Ordenar e processar partes
  partes
    .map(p => p.data())
    .sort((a, b) => a.parte - b.parte)
    .forEach(partData => {
      if (partData.tipo === 'conteudo') {
        conteudoCompleto += partData.conteudo;
      } else if (partData.tipo === 'artigos') {
        Object.assign(artigosCompletos, partData.artigos);
      }
    });
  
  // 5. Retornar documento completo
  return {
    ...mainData,
    conteudo: conteudoCompleto,
    artigos: artigosCompletos,
    tipo: 'completo' // Flag indicando reconstituição
  };
}

// Uso
const constituicao = await getLeiCompleta('cf');
console.log(constituicao.artigos['1']); // Art. 1º da CF
```

### 3. Busca por Categoria

```javascript
// Buscar todas as leis de uma categoria
const leisPenais = await db.collection('vademecum')
  .where('categoria', '==', 'penal')
  .where('tipo', '!=', 'artigos')  // Excluir partes
  .where('tipo', '!=', 'conteudo') // Excluir partes
  .get();

leisPenais.docs.forEach(doc => {
  const lei = doc.data();
  console.log(`${lei.titulo} (${lei.ano})`);
});
```

### 4. Busca por Status

```javascript
// Buscar leis vigentes
const leisVigentes = await db.collection('vademecum')
  .where('status', '==', 'vigente')
  .where('tipo', 'in', ['principal', undefined]) // Apenas principais ou simples
  .orderBy('prioridade')
  .get();
```

## 🏷️ Campos de Controle Especiais

### Identificadores de Tipo
- `tipo`: `"principal"` | `"conteudo"` | `"artigos"` | `undefined`
- `parte`: Número da parte (1, 2, 3...)
- `total_partes`: Total de partes do mesmo tipo
- `lei_principal`: ID do documento principal (para partes)

### Arrays de Referência
- `partes[]`: Lista de IDs das partes (no documento principal)

### Flags de Otimização
- `conteudo_truncado`: Boolean - conteúdo foi truncado
- `artigos_truncados`: Boolean - artigos foram limitados

### Navegação
- `anchor`: String - âncora HTML para navegação (`#art-1`)
- `indice[]`: Array - estrutura hierárquica da lei

## 📋 Categorias Disponíveis

### Categorias Principais
- `constitucional` - Constituição e emendas
- `civil` - Direito civil, família, contratos
- `penal` - Direito penal e criminal
- `trabalhista` - Direito do trabalho
- `tributario` - Direito tributário e fiscal
- `administrativo` - Direito administrativo
- `consumidor` - Direito do consumidor
- `processual` - Direito processual

### Status Possíveis
- `vigente` - Lei em vigor
- `revogada` - Lei revogada ou não vigente

## 🚀 Exemplos de Uso Avançado

### Componente React para Lei
```jsx
import { useState, useEffect } from 'react';

function LeiViewer({ leiId }) {
  const [lei, setLei] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLei() {
      try {
        const leiData = await getLeiCompleta(leiId);
        setLei(leiData);
      } catch (error) {
        console.error('Erro ao carregar lei:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLei();
  }, [leiId]);

  if (loading) return <div>Carregando...</div>;
  if (!lei) return <div>Lei não encontrada</div>;

  return (
    <div className="lei-container">
      <header>
        <h1>{lei.nome || lei.titulo}</h1>
        <p>Ano: {lei.ano} | Status: {lei.status}</p>
        <p>Categoria: {lei.categoria} | Total de Artigos: {lei.totalArtigos}</p>
      </header>

      {/* Índice */}
      {lei.indice && (
        <nav className="indice">
          <h3>Índice</h3>
          {lei.indice.map((item, i) => (
            <a key={i} href={item.anchor} className={`nivel-${item.nivel}`}>
              {item.titulo}
            </a>
          ))}
        </nav>
      )}

      {/* Conteúdo */}
      <main dangerouslySetInnerHTML={{ __html: lei.conteudo }} />

      {/* Artigos estruturados */}
      <section className="artigos">
        {Object.entries(lei.artigos || {}).map(([num, artigo]) => (
          <article key={num} id={artigo.anchor?.replace('#', '')}>
            <h4>Artigo {artigo.numero}</h4>
            <p>{artigo.texto}</p>
            {artigo.incisos?.length > 0 && (
              <ul>
                {artigo.incisos.map((inciso, i) => (
                  <li key={i}>{inciso}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
```

### Busca Textual
```javascript
// Buscar artigos que contenham termo específico
function buscarArtigos(lei, termo) {
  const resultados = [];
  
  Object.entries(lei.artigos || {}).forEach(([num, artigo]) => {
    if (artigo.texto.toLowerCase().includes(termo.toLowerCase())) {
      resultados.push({
        numero: artigo.numero,
        texto: artigo.texto,
        anchor: artigo.anchor
      });
    }
  });
  
  return resultados;
}

// Uso
const resultados = buscarArtigos(lei, 'responsabilidade civil');
```

## ⚠️ Considerações Importantes

### Limitações do Firestore
- Máximo 1MB por documento
- Máximo 20.000 campos por documento
- Consultas limitadas a 100 resultados por padrão

### Otimizações Aplicadas
- Remoção de espaços desnecessários no HTML
- Truncamento de artigos muito longos
- Divisão automática de documentos grandes
- Compressão de conteúdo preservando estrutura

### Compatibilidade
- Formato compatível com React/Next.js
- Suporte a SSR (Server-Side Rendering)
- Estrutura otimizada para buscas
- Navegação por âncoras HTML

---

**Gerado por**: Lei Scraper V2.0  
**Data**: Julho 2025  
**Versão**: 2.0.0
