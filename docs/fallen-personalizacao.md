# Fallen Evanescence Tributo — como personalizar o site

Este guia explica como atualizar o conteúdo do site da **Fallen EV Tributo** sem mexer em HTML, CSS ou JavaScript. Tudo o que aparece nas páginas vem dos arquivos JSON de `data/`, seguindo a arquitetura do [Onda Artist Kit](../README.md).

> A fonte oficial das informações é o arquivo [`Fallen-resumo.md`](../Fallen-resumo.md). Quando for alterar um dado, confira-o primeiro — e não publique informações que não estejam confirmadas.

## Executar o site localmente

Os JSONs são carregados por `fetch`, então o site precisa ser servido por HTTP (abrindo o arquivo direto com `file://`, o conteúdo estático das páginas funciona como fallback):

```bash
# na raiz do repositório
python3 -m http.server 8000
# abra http://localhost:8000/
```

Qualquer outro servidor estático serve (GitHub Pages, Netlify, etc.). Não há etapa de build nem dependências.

## Arquivos de conteúdo

| Arquivo | Alimenta | Páginas |
| --- | --- | --- |
| `data/band.json` | nome, slogan, localização, ficha, biografia, integrantes, identidade musical | Home, Release, Agenda |
| `data/release.json` | apresentação, história, destaques, experiência, contratação | Home (contratação), Release |
| `data/repertoire.json` | músicas em destaque e repertório completo | Home (destaques), Release (lista) |
| `data/shows.json` | agenda de shows | Home (próximo show), Agenda, Release (próximas datas) |
| `data/links.json` | redes sociais e presença digital | Home, Release |
| `data/site.json` | tema selecionado (`"theme": "fallenevtributo"`) | todas |
| `data/calendar.json` | fonte da agenda (local ou Google Calendar) | Agenda |

## Alterar dados da banda (`data/band.json`)

- `name`, `tagline` e `lead`: identificação do hero e do cabeçalho;
- `city`, `state`, `region` e `genre`: localização, região e categoria;
- `about`: parágrafos da seção **Sobre a Fallen**;
- `members`: integrantes (`{ "name", "role" }`) — a ficha técnica mostra automaticamente o total;
- `musicalIdentity`: texto da identidade musical no Release;
- `genres`: badges da identidade musical;
- `logo` / `photo`: quando não houver arquivo oficial, mantenha `null` — o site usa a marca padrão do Core e oculta a foto (nunca referencie imagens inventadas).

## Alterar músicas em destaque

Em `data/repertoire.json`, ajuste a lista `highlights` (a seção da Home se chama **Mais tocadas e pedidas**):

```json
"highlights": [
  { "title": "Bring Me to Life", "album": "Fallen (2003)" },
  { "title": "Wasted on You", "album": "The Bitter Truth (2021)" }
]
```

- Aceita objeto (`{ "title", "album" }`) ou apenas string (`"Título"`);
- **Sem ranking**: a ordem do arquivo é a ordem exibida — o site não atribui posições ou estatísticas;
- Lista vazia: a seção inteira some da Home automaticamente;
- Arquivo ausente: o conteúdo estático do HTML permanece.

## Atualizar o repertório completo

Ainda em `data/repertoire.json`, edite `songs` (lista exibida no Release, seção **Repertório completo**):

```json
"songs": [
  "Call Me When You're Sober",
  "My Heart Is Broken"
]
```

- Preserve os títulos oficiais das músicas;
- A numeração (01, 02, …) é gerada automaticamente;
- `intro` controla os parágrafos de apresentação da seção e `note` a observação de rodapé;
- Mantenha `highlights` e `songs` no mesmo arquivo: uma música em destaque deve existir também em `songs`, se fizer parte do repertório;
- Lista vazia: a seção do Release é ocultada.

> **Por que um arquivo próprio?** A banda não tem lançamentos autorais: `data/release.json` não possui `discography` e não deve receber músicas do Evanescence como se fossem lançamentos da Fallen. `repertoire.json` mantém a semântica correta e é um recurso genérico do Core para bandas tributo (veja [`core-arquitetura.md`](core-arquitetura.md#repertório--bandas-tributo-extensão-da-fase-3)).

## Atualizar a agenda (`data/shows.json`)

Cada show é um objeto da lista `shows`:

```json
{
  "id": "show-2026-11-14-nome",
  "title": "Nome do evento",
  "date": "2026-11-14",
  "startTime": "20:00",
  "endTime": "22:00",
  "venue": "Casa de show",
  "city": "Brasília",
  "state": "DF",
  "mapUrl": "https://...",
  "ticketUrl": "https://...",
  "status": "confirmed"
}
```

- `id` estável e único; `date` em ISO; horários em `HH:mm`;
- `status`: `confirmed`, `cancelled` (cancelado) ou `postponed` (com `originalDate`);
- Próximos shows e histórico são separados automaticamente — não faça isso manualmente;
- **Não cadastre datas sem confirmação** — sem eventos, a agenda exibe o estado vazio (“Novas datas em breve”);
- Para usar o Google Calendar, configure `data/calendar.json` (`enabled`, `mode: "google"`, `calendarId` ou `publicUrl`) — havendo falha, a agenda volta para `shows.json` sozinha (documentado em [`core-arquitetura.md`](core-arquitetura.md)).

## Contatos e redes

- `data/release.json` → `booking`: texto de contratação, `email` e `phone` (`null` oculta o botão). O telefone atual é o contato comercial informado em `Fallen-resumo.md`;
- `data/links.json`: lista `{ label, url }` — use apenas perfis confirmados (hoje: Instagram oficial e WhatsApp comercial). Não adicione links que não estejam identificados nos documentos oficiais.

## Tema visual

O tema ativo é `fallenevtributo`, definido em `data/site.json`:

```json
{ "theme": "fallenevtributo" }
```

- Identidade: **azul, preto e prata**, atmosfera sombria/gótica, tudo dentro de [`themes/fallenevtributo/`](../themes/fallenevtributo/);
- O tema não contém conteúdo da banda — nome, biografia, agenda e repertório continuam em `data/`;
- Se o tema faltar ou estiver quebrado, o site cai automaticamente no tema `default` (nunca quebra);
- Ajustes visuais (glows, fontes, raios) ficam documentados no [README do tema](../themes/fallenevtributo/README.md).

## SEO e metadados

Títulos e descrições das três páginas estão no `<head>` de `index.html`, `release.html` e `agenda.html`. O Release ainda sincroniza `<title>` e `meta description` com os dados no carregamento. Se trocar nome ou slogan da banda, revise esses textos.

## Checklist após qualquer alteração

1. Valide os JSONs: `python3 -m json.tool data/seu-arquivo.json > /dev/null`;
2. Suba o servidor local e confira Home, Release e Agenda;
3. Confira as seções que dependem do arquivo alterado (inclusive o estado vazio);
4. Teste o layout em telas pequenas e a impressão do Release (Ctrl+P → Salvar como PDF);
5. Confirme que nenhum conteúdo de demonstração do kit voltou a aparecer.
