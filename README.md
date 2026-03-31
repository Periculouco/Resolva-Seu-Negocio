# Resolva Seu Negócio

Aplicação frontend em React + Vite para diagnóstico empresarial orientado a conversão.

O produto foi desenhado como um MVP de recomendação guiada:

`landing -> input inicial -> quiz -> loading de análise -> explore personalizado -> conexão com especialista/solução`

Este documento existe para dar contexto rápido e técnico para próximos colaboradores humanos ou IAs.

## Visão Macro

### O que o produto é

O Resolva Seu Negócio é uma interface de diagnóstico para empresas que ainda não sabem exatamente qual frente está travando o crescimento.

O objetivo não é funcionar como marketplace aberto clássico.

O objetivo atual é:

- captar a dor inicial do empresário
- aprofundar contexto com um quiz curto
- inferir a frente mais crítica
- recomendar especialistas, parceiros ou SaaS mais aderentes
- empurrar o usuário para o próximo passo comercial

### O que o produto não é, neste estágio

- não há autenticação
- não há backend
- não há persistência de dados
- não há CMS
- não há integração real com CRM, WhatsApp ou banco de dados
- não existe engine de matching externa; a lógica atual é local e heurística

### Stack atual

- React 18
- TypeScript
- Vite 5
- CSS global em arquivo único

### Filosofia de arquitetura

O projeto está propositalmente simples e monolítico.

Hoje a aplicação vive basicamente em:

- [src/App.tsx](/Users/kauanbatista/Resolva Seu Negócio/src/App.tsx)
- [src/styles.css](/Users/kauanbatista/Resolva Seu Negócio/src/styles.css)

Essa decisão faz sentido no MVP porque:

- o fluxo ainda muda com frequência
- o domínio ainda está sendo lapidado
- há mais valor em velocidade do que em abstração prematura

Quando o produto estabilizar, a extração natural será:

1. `data/` para catálogos estáticos
2. `components/` para blocos reutilizáveis
3. `features/` por fluxo: landing, quiz, explore, result
4. `lib/` para regras de matching e helpers

## Visão de Produto

### Jornada principal

1. Usuário entra na landing
2. Digita uma dor inicial ou usa um atalho popular
3. Inicia o diagnóstico
4. Responde 6 etapas
5. Entra em uma tela intermediária de análise
6. Vai para a tela `explore`, já personalizada pela leitura do diagnóstico
7. Pode revisar a recomendação e iniciar contato

### Telas existentes

- `landing`
- `quiz`
- `loading`
- `explore`
- `result`

### Intenção de cada tela

#### `landing`

Função comercial.

Responsável por:

- explicar a proposta de valor
- provocar identificação com dores reais
- converter o usuário para o diagnóstico
- permitir navegação secundária para `explore`

#### `quiz`

Função de qualificação.

Responsável por:

- levantar contexto da empresa
- identificar a área mais crítica
- entender maturidade atual
- capturar percepção explícita de gargalo
- medir urgência
- coletar lead

#### `loading`

Função narrativa e de transição.

Responsável por:

- sustentar a sensação de análise
- preparar a passagem para recomendação personalizada

#### `explore`

Função de recomendação e descoberta.

Tem dois modos:

- aberto: navegação normal por categorias
- personalizado: entra após o quiz com filtros e destaque guiados pelo diagnóstico

#### `result`

Função de fechamento.

Responsável por:

- sintetizar o diagnóstico
- apontar o especialista principal
- abrir caminho para contato comercial

## Visão Micro

## Estrutura de código

### Arquivo principal

[src/App.tsx](/Users/kauanbatista/Resolva Seu Negócio/src/App.tsx) concentra:

- tipos da aplicação
- catálogo estático de especialistas
- catálogo estático do `explore`
- configuração de categorias e conteúdo da landing
- lógica de diagnóstico
- controle de navegação por tela
- renderização de toda a interface

### Estilos

[src/styles.css](/Users/kauanbatista/Resolva Seu Negócio/src/styles.css) concentra:

- tokens visuais da marca
- layout
- estados de hover
- responsividade
- animações leves

## Modelo de estado

O estado principal é controlado localmente com `useState`.

Variáveis centrais:

- `screen`
- `currentStep`
- `formData`
- `activeExploreCategory`
- `exploreQuery`
- `isPersonalizedExplore`

### `screen`

Define qual experiência está ativa:

- `"landing"`
- `"explore"`
- `"quiz"`
- `"loading"`
- `"result"`

### `currentStep`

Controla a etapa atual do quiz.

Hoje o quiz possui 6 etapas.

### `formData`

É o payload completo da jornada de diagnóstico.

Campos atuais:

- `challenge`
- `segment`
- `revenue`
- `employees`
- `area`
- `customArea`
- `alreadyInvested`
- `currentSolutionArea`
- `currentSolutionOther`
- `perceivedBottleneck`
- `timing`
- `name`
- `email`
- `phone`
- `company`

## Tipos de domínio

### `Area`

Enum lógica:

- `vendas`
- `marketing`
- `gestao`
- `financeiro`
- `outros`

Importante:

Os valores internos de regra permanecem em ASCII por estabilidade de comparação.

Exemplo:

- interno: `gestao`
- display: `Gestão`

Essa diferença é intencional.

### `Specialist`

Representa a recomendação de especialista principal por frente.

Campos:

- `id`
- `name`
- `title`
- `focus`
- `description`
- `bullets`
- `whatsapp`

### `ExploreItem`

Representa itens da vitrine/recomendação.

Campos:

- `id`
- `name`
- `kind`
- `category`
- `focus`
- `audience`
- `description`
- `badge`

### `NumberItem`

Representa os cards de prova/escala da landing.

Campos:

- `value`
- `prefix`
- `suffix`
- `label`

### `SignalItem`

Representa entradas da lista animada de “principais dores”.

Campos:

- `title`
- `description`
- `icon`
- `accent`
- `time`

## Componentes locais relevantes

### `AnimatedSignalList`

Lista animada vertical usada na seção de “Principais dores”.

Função:

- criar sensação de movimento e recorrência de dores
- reforçar prova contextual sem depender de backend

### `AnimatedNumber`

Contador progressivo simples baseado em `requestAnimationFrame`.

Função:

- animar os números da seção de prova sem usar ticker por dígito
- manter responsividade e previsibilidade visual

Critério atual:

- anima apenas quando entra na viewport
- usa easing cúbico simples
- não depende de biblioteca externa

### `formatCategoryLabel`

Helper de exibição.

Resolve rótulos internos ASCII para display com acento.

Exemplo:

- `Gestao & Estrategia` -> `Gestão & Estratégia`
- `Financas` -> `Finanças`
- `Operacoes` -> `Operações`

## Regras de Negócio Atuais

### Diagnóstico

O diagnóstico é calculado em um `useMemo`, com base principalmente em:

- `area`
- `alreadyInvested`
- `currentSolutionArea`
- `perceivedBottleneck`

Hoje a inferência é heurística, usando combinações simples de:

- área escolhida
- presença de certas palavras na descrição do gargalo
- maturidade percebida

Isso é suficiente para o MVP, mas ainda não é uma engine robusta.

### Recomendação do `explore`

Após o quiz:

- o sistema entra em `loading`
- um `setTimeout` simula a análise
- a categoria do `explore` é pré-selecionada conforme a área detectada
- a busca recebe a dor inicial ou área personalizada
- `isPersonalizedExplore` muda para `true`

Depois disso:

- o `explore` destaca um item como recomendação principal
- a lista continua navegável

### Cálculo do item recomendado

O item recomendado é obtido por uma heurística simples:

- mapeia `formData.area` para uma categoria do `explore`
- tenta encontrar o primeiro item da mesma categoria dentro da lista filtrada
- se não achar, usa o primeiro item disponível

## Conteúdo Estático

Atualmente quase todo o conteúdo é local e estático:

- especialistas
- cards da landing
- categorias
- parceiros em destaque
- itens do `explore`
- números
- lista de dores

Isso permite iterar rápido, mas tem implicações:

- cada alteração de catálogo exige deploy
- não existe separação entre camada de conteúdo e camada de UI
- revisões de copy tendem a acontecer dentro de `App.tsx`

## Sistema Visual

### Direção de marca

A identidade atual usa:

- base escura
- laranja como cor de acento
- neutros quentes
- serifada editorial nos títulos
- UI premium com hover discreto

### Princípios de interface

- hover sutil, nunca agressivo
- cards como unidade interativa, não só botões internos
- contraste controlado, evitando “preto máximo + laranja máximo” o tempo todo
- mobile first nas áreas mais sensíveis

### Ponto de atenção

O projeto já passou por algumas tentativas visuais mais intensas. A direção atual busca:

- manter força de marca
- evitar parecer cópia da G4
- preservar clareza comercial

## Responsividade

O CSS já possui breakpoints principais para:

- até `1100px`
- até `860px`
- até `640px`

Áreas mais sensíveis para validar sempre:

- hero principal
- topbar e logo
- seção de números
- cards de categoria
- sidebar e listagem do `explore`
- quiz

Sempre que mexer em layout, revisar desktop e mobile.

## Convenções práticas

### Texto

- interface em português brasileiro
- evitar inglês desnecessário
- manter acentuação correta em display
- não alterar chaves internas ASCII sem revisar toda a lógica

### Navegação

A navegação é local e controlada por estado, não por roteador.

Isso significa:

- não existem URLs por página
- não existe deep-link real
- a tela atual depende do estado da aplicação

Se futuramente o produto crescer, a migração natural é para `react-router`.

### Dados

Não existe camada de API.

Se um backend entrar, os pontos naturais de integração serão:

- envio do lead do quiz
- catálogo de especialistas
- catálogo de soluções do `explore`
- tracking de recomendação clicada

## Riscos técnicos atuais

### 1. Arquivo único grande

`App.tsx` concentra muita responsabilidade.

Risco:

- manutenção mais lenta
- conflito de edição mais frequente
- regressão visual ao alterar partes não relacionadas

### 2. Regras de matching frágeis

A inferência depende de condicionais simples e `includes()`.

Risco:

- baixa precisão em casos ambíguos
- pouca explicabilidade estruturada

### 3. Sem persistência

Hoje nenhum lead é salvo.

Risco:

- todo o valor do diagnóstico é apenas demonstrativo

### 4. Sem roteamento real

Boa para MVP, ruim para compartilhamento e escala.

## Próximos refactors naturais

Ordem recomendada:

1. extrair catálogos estáticos para `src/data/`
2. extrair blocos da landing em `src/components/`
3. extrair regra de diagnóstico para `src/lib/diagnosis.ts`
4. extrair `Explore` para um módulo próprio
5. adicionar persistência do lead
6. integrar contato real com especialista

## Próximas integrações de produto

As integrações de maior impacto seriam:

- backend para persistir leads
- webhook/CRM
- WhatsApp por especialista
- analytics por etapa
- tracking de clique nas recomendações

## Como rodar

### Desenvolvimento

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Preview local do build

```bash
npm run preview
```

## Resumo executivo para quem acabou de chegar

Se você for mexer no projeto pela primeira vez, o mínimo que precisa saber é:

1. o app é um MVP frontend-only, monolítico, em React
2. tudo importante está em [src/App.tsx](/Users/kauanbatista/Resolva Seu Negócio/src/App.tsx) e [src/styles.css](/Users/kauanbatista/Resolva Seu Negócio/src/styles.css)
3. a jornada principal é `landing -> quiz -> loading -> explore -> result`
4. o `explore` também funciona isoladamente como vitrine
5. categorias internas usam strings ASCII; labels visíveis usam acento
6. qualquer ajuste visual precisa ser revisado em desktop e mobile
7. qualquer ajuste de copy deve preservar o tom comercial, direto e em português brasileiro

## Guia curto para futuras IAs

Antes de alterar qualquer coisa:

1. identifique se a mudança é de conteúdo, regra ou layout
2. verifique se o texto é display ou chave interna
3. teste a jornada completa
4. rode build
5. valide responsividade nas seções críticas

Ao editar:

- prefira mudanças incrementais
- evite “refatorar tudo” sem pedido explícito
- não substitua identidade da marca por estética genérica
- preserve a lógica de personalização do `explore` após o quiz

