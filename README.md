# Resolva Seu Negócio

Frontend React + Vite para diagnóstico empresarial, recomendação de especialistas/parceiros/SaaS e operação inicial da área do parceiro.

O objetivo do produto hoje é transformar uma dor difusa do empresário em:

1. leitura de contexto
2. diagnóstico principal
3. recomendação mais aderente
4. abertura de contato comercial

## Estado atual real do produto

O projeto já implementa uma experiência única no frontend com seis telas/estados principais:

- `landing`
- `quiz`
- `loading`
- `result`
- `explore`
- `consultor`

Não existe backend ativo no app atual. Toda a experiência roda com estado local, catálogos estáticos e dados mockados.

## Stack atual

- React 18
- TypeScript
- Vite 5
- CSS global em arquivo único

Arquivos centrais:

- [src/App.tsx](/Users/kauanbatista/Resolva Seu Negócio/src/App.tsx)
- [src/styles.css](/Users/kauanbatista/Resolva Seu Negócio/src/styles.css)
- [docs/partner-crm-architecture.md](/Users/kauanbatista/Resolva Seu Negócio/docs/partner-crm-architecture.md)
- [database/schema.sql](/Users/kauanbatista/Resolva Seu Negócio/database/schema.sql)

## Fluxo atualizado do produto

Fluxo principal do empresário:

1. entra na `landing`
2. descreve um desafio livre ou usa um atalho popular
3. inicia o `quiz`
4. responde 6 etapas de diagnóstico
5. vai para `loading`, que simula a análise
6. recebe a tela `result` com diagnóstico, resumo e recomendação principal
7. abre o modal de contato, preenche dados e libera o CTA de WhatsApp
8. pode seguir para `explore` para comparar alternativas

Fluxos secundários já implementados:

- navegação direta da `landing` para `explore` por categoria
- navegação para `consultor` pela topbar e CTAs da landing
- `explore` em dois modos: aberto e personalizado pelo diagnóstico

## Telas existentes

### `landing`

Tela comercial principal com:

- hero com busca por dor inicial
- chips de desafios populares
- marquee de áreas do ecossistema
- seção "como funciona"
- números animados
- vitrine de parceiros em destaque
- categorias clicáveis para explorar soluções
- seção comparativa antes/depois
- CTA para diagnóstico e CTA para área do parceiro

### `quiz`

Fluxo de diagnóstico em 6 etapas:

1. `revenueProfile`
2. `businessMoment`
3. `decisionMaking`
4. `currentBottleneck`
5. `solutionExperience`
6. `primaryGoal`

O `challenge` livre capturado na landing continua no estado e influencia a inferência da área recomendada.

### `loading`

Tela intermediária de transição. Hoje ela apenas sustenta a narrativa de análise e, após timeout local, leva para `result`.

### `result`

Tela de fechamento do diagnóstico com:

- título do diagnóstico principal
- resumo do cenário
- recomendação principal
- recomendações secundárias
- CTA para contato
- desbloqueio de WhatsApp após preenchimento do modal

### `explore`

Vitrine de soluções com:

- busca por nome, categoria, foco ou descrição
- filtro por categorias
- destaque de recomendação quando o fluxo vem do quiz
- catálogo misto de `Consultor`, `Parceiro` e `SaaS`

### `consultor`

Área do parceiro já visível no frontend, ainda sem backend real.

Estado atual da tela:

- login mockado com `email`, `password` e `instance`
- autenticação apenas local no estado
- navegação interna por seções

Seções implementadas:

- `dashboard`: métricas resumidas, leads recentes e agenda do time
- `leads`: tabela com empresa, diagnóstico, objetivo, status e atualização
- `agenda`: disponibilidade padrão e reuniões marcadas
- `perfil`: perfil público do parceiro e recomendação de stack

Dados atuais da área do parceiro:

- leads mockados no próprio `App.tsx`
- agenda mockada no próprio `App.tsx`
- estatísticas derivadas desses mocks com `useMemo`

## Modelo atual de diagnóstico

O app usa heurística local para inferir a área principal do negócio:

- `financeiro`
- `marketing`
- `vendas`
- `gestao`
- fallback em `outros`

A inferência combina:

- palavras-chave do campo `challenge`
- respostas de `primaryGoal`
- respostas de `currentBottleneck`
- faixa de `revenueProfile`

Com base nisso, o app gera:

- `specialist` principal
- `diagnosis.title`
- `diagnosis.summary`
- categoria preferencial do `explore`
- recomendação principal e secundárias na tela `result`

## `FormData` atual

O payload atual do usuário no frontend é:

```ts
type FormData = {
  challenge: string;
  revenueProfile: RevenueProfile | "";
  businessMoment: BusinessMoment | "";
  decisionMaking: DecisionMaking | "";
  currentBottleneck: CurrentBottleneck | "";
  solutionExperience: SolutionExperience | "";
  primaryGoal: PrimaryGoal | "";
  name: string;
  email: string;
  phone: string;
  role: string;
  mainPain: string;
};
```

Diferença importante em relação ao README antigo:

- saíram campos como `segment`, `employees`, `area`, `timing`, `company` e derivados antigos
- entraram campos orientados a maturidade e decisão, mais adequados ao posicionamento atual do produto
- os dados pessoais agora são coletados no modal de contato, não dentro do quiz principal

## Catálogos estáticos atuais

O frontend hoje depende de dados fixos em [src/App.tsx](/Users/kauanbatista/Resolva Seu Negócio/src/App.tsx):

- especialistas por área
- parceiros em destaque da landing
- categorias do ecossistema
- itens do `explore`
- leads mockados da área do parceiro
- agenda mockada da área do parceiro

Isso mantém o MVP rápido para iteração, mas também concentra demais regra, conteúdo e UI num único arquivo.

## O que o produto ainda não tem

- autenticação real
- persistência de leads
- persistência do quiz
- CRM funcional de parceiro
- agendamento real
- integração com WhatsApp Business API
- integração com CRM externo
- distribuição automática de leads por parceiro
- painel admin separado
- backend para regras, logs e auditoria

## Riscos atuais

### 1. Estado e domínio concentrados demais

Quase toda a aplicação vive em [src/App.tsx](/Users/kauanbatista/Resolva Seu Negócio/src/App.tsx), incluindo tipos, catálogos, regras de inferência, navegação e renderização. Isso aumenta acoplamento e torna a evolução mais arriscada.

### 2. Heurística de diagnóstico ainda frágil

A recomendação depende de palavras-chave livres e condicionais locais. Isso pode gerar diagnósticos inconsistentes ou enviesados conforme o texto digitado.

### 3. Área do parceiro é apenas protótipo visual

A tela `consultor` passa sensação de produto operacional, mas hoje não há autenticação real, multi-tenant, escrita em banco, agenda persistida ou histórico de atendimento.

### 4. Dados comerciais podem se perder

O fluxo de contato monta mensagem e libera WhatsApp, mas não grava lead em backend. Se a sessão for perdida, não há trilha operacional confiável.

### 5. Conteúdo estático dificulta escala

Especialistas, categorias, copy e catálogo estão hardcoded. Isso dificulta onboarding de novos parceiros e ajustes rápidos sem deploy.

### 6. Falta de separação entre jornada do empresário e operação do parceiro

As duas experiências coexistem no mesmo arquivo e no mesmo frontend sem fronteira clara de domínio, autenticação ou autorização.

## Roadmap técnico recomendado

Ordem pragmática para evolução:

### Fase 1. Consolidar a base do frontend

- extrair tipos e catálogos para módulos dedicados
- separar features por fluxo: `landing`, `quiz`, `result`, `explore`, `consultor`
- isolar a lógica de diagnóstico em funções puras testáveis
- preparar um contrato único para lead e diagnóstico

### Fase 2. Persistência e autenticação

Base recomendada já documentada em [docs/partner-crm-architecture.md](/Users/kauanbatista/Resolva Seu Negócio/docs/partner-crm-architecture.md): `Supabase`

Prioridades:

- autenticação real para parceiros
- Postgres gerenciado
- isolamento por instância com RLS
- persistência de leads, diagnósticos e usuários

### Fase 3. Operação comercial mínima

- gravar o lead ao concluir contato
- vincular lead ao diagnóstico gerado
- criar status comercial persistido
- permitir notas internas e histórico de atendimento
- distribuir leads por parceiro/consultor

### Fase 4. Agenda e integração

- persistir disponibilidade do parceiro
- criar slots reais de agenda
- confirmar reuniões
- integrar com Google Calendar
- integrar com CRM/WhatsApp conforme canal definido

### Fase 5. Otimização do matching

- revisar a heurística atual
- adicionar scoring por resposta
- registrar conversão por recomendação
- medir aderência entre diagnóstico, contato e fechamento

## Arquitetura futura sugerida

Extração natural do estado atual:

- `src/features/landing`
- `src/features/quiz`
- `src/features/result`
- `src/features/explore`
- `src/features/consultant`
- `src/data`
- `src/lib/diagnosis`
- `src/types`

## Banco e modelagem já iniciados

Existe base inicial em [database/schema.sql](/Users/kauanbatista/Resolva Seu Negócio/database/schema.sql), indicando intenção de evolução para:

- parceiros e instâncias
- usuários com papéis como `owner`, `manager`, `sdr`, `consultant`
- leads e diagnósticos
- agenda e operação comercial

O frontend ainda não consome esse schema.

## Resumo objetivo

Hoje o Resolva Seu Negócio já é um MVP navegável com:

- landing comercial
- quiz novo de 6 etapas
- recomendação heurística
- vitrine de soluções
- modal de captura para contato
- área do parceiro prototipada no frontend

O próximo salto técnico não é adicionar mais tela. É transformar a recomendação e a área do parceiro em fluxo persistido, autenticado e operacional.
