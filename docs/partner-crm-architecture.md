# Área do Parceiro

## Objetivo

Criar uma área autenticada para consultores, SDRs e gestores dos parceiros operarem os leads vindos do diagnóstico e do fluxo de recomendação do Resolva Seu Negócio.

## Recomendação de stack

### Banco e autenticação

Recomendação principal: **Supabase**

Motivos:

- já entrega Postgres gerenciado
- autenticação nativa para múltiplos usuários por parceiro
- Row Level Security para separar instâncias
- storage e functions no mesmo stack
- acelera o MVP sem exigir infraestrutura própria logo no início

### Quando Railway faria sentido

Railway faz sentido se o time quiser:

- operar autenticação por conta própria
- controlar toda a infra manualmente
- usar backend customizado desde o início

Para este produto, isso aumenta o tempo de entrega sem gerar ganho imediato no MVP.

## Públicos

### Empresário

- faz o diagnóstico
- recebe a recomendação
- envia os dados no modal
- opcionalmente agenda reunião

### Parceiro

- acessa sua instância autenticada
- visualiza leads recebidos
- entende contexto do quiz
- entra em contato
- agenda reuniões
- atualiza status comercial

## Estrutura inicial da área do parceiro

### Dashboard

- leads recebidos
- leads em contato
- leads qualificados
- reuniões marcadas

### Leads

- nome da empresa
- contato principal
- cargo
- diagnóstico
- objetivo principal
- urgência
- status comercial

### Agenda

- disponibilidade do parceiro
- reuniões marcadas
- slots livres

### Perfil

- dados públicos do parceiro
- foco
- canal principal
- configurações da operação comercial

## Entidades principais

- `partner_instances`
- `partner_users`
- `partner_profiles`
- `leads`
- `lead_diagnoses`
- `lead_assignments`
- `lead_notes`
- `availability_rules`
- `blocked_slots`
- `appointments`

## Evolução natural

1. login real com Supabase Auth
2. persistência de leads do modal e quiz
3. distribuição por parceiro e consultor
4. agenda integrada com slots
5. integração com Google Calendar
