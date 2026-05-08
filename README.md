# ⚽ FutScore

Aplicação web de estatísticas do futebol com dados reais consumidos via API. Desenvolvida como projeto de portfólio para demonstrar integração com APIs externas, manipulação assíncrona de dados e design de interface responsivo.

🔗 **[Acesse o projeto ao vivo](https://dvd-2405.github.io/FutScore/)**

---

## 📸 Preview 
<img width="950" height="959" alt="{D9B39D90-4FFB-40D8-B599-F43DDF805E57}" src="https://github.com/user-attachments/assets/353fba06-ff31-4b0b-bfe8-d0dbfed4cb19" />

<img width="941" height="909" alt="{86413334-56DC-48E6-B65F-419CA8124A62}" src="https://github.com/user-attachments/assets/2a774245-1599-4145-b4ce-537f280080f7" />


![FutScore Preview](assets/dark.png)

---

## 🚀 Funcionalidades

- **Tabela de Classificação** — standings completos com pontos, saldo de gols, forma recente e indicadores visuais de posição (campeão, Libertadores, Sul-Americana, rebaixamento)
- **Artilheiros** — top 5 artilheiros da temporada com foto, clube e total de gols
- **Próximos Jogos** — fixtures com times, placar e informações de rodada
- **Jogos Ao Vivo** — card dinâmico que aparece automaticamente quando há partidas em andamento, com atualização a cada 60 segundos
- **Múltiplos Campeonatos** — suporte a Brasileirão Série A e B, Copa do Brasil, Libertadores, Sul-Americana, Premier League, La Liga, Bundesliga, Serie A e Ligue 1
- **Ordenação dinâmica** — classificação ordenável por pontos, gols marcados ou saldo de gols
- **Skeleton Loading** — feedback visual durante carregamento dos dados
- **Tratamento de erros** — estados de erro e vazio com opção de retry

---

## 🛠️ Tecnologias

- **HTML5** semântico com ARIA para acessibilidade
- **CSS3** — variáveis, Grid, Flexbox, animações e design responsivo
- **JavaScript** — assíncrono com `async/await` e `Promise.all`
- **API-Football** (api-sports.io) — dados reais de futebol em tempo real
- **LocalStorage** — persistência da chave de API entre sessões
- **Google Fonts** — Bebas Neue + Barlow Condensed

---

## ▶️ Como usar

O projeto consome dados reais da [API-Football](https://api-sports.io). Para rodar localmente com dados reais:

1. Crie uma conta gratuita em [api-sports.io](https://api-sports.io)
2. Copie sua API Key no dashboard
3. Abra o projeto e cole a chave no campo indicado
4. Os dados carregam automaticamente

> O plano gratuito oferece 100 requisições/dia — suficiente para explorar o projeto.

---

## 📁 Estrutura

```
FutScore/
├── index.html       # Estrutura e marcação semântica
├── style.css        # Estilização completa
├── futstats.js      # Lógica, integração com API e renderização
└── assets/
    └── dark.png     # Preview do projeto
```

---

## 👨‍💻 Autor

Desenvolvido por **[David Vieira](https://github.com/dvd-2405)** — Projeto de Portfólio 2026

[![LinkedIn](https://img.shields.io/badge/LinkedIn-David%20Vieira-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/david-vieira-dev/)
[![GitHub](https://img.shields.io/badge/GitHub-dvd--2405-181717?style=flat&logo=github)](https://github.com/dvd-2405)
