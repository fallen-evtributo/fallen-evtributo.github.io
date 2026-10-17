# FallenEVTributo — Theme

Theme gótico, melancólico e elegante do Onda Artist Kit, inspirado na atmosfera artística do Evanescence e do rock gótico / metal alternativo dos anos 2000: escuridão profunda atravessada por luzes azuis, névoa, vidro escuro, metal prateado e tipografia serifada refinada.

## Ativação

Em `data/site.json`:

```json
{ "theme": "fallenevtributo" }
```

## Estrutura

```text
themes/fallenevtributo/
├── theme.json     # manifesto (id, name, version, description, themeColor)
├── theme.css      # tokens sobrescritos + refinamentos de componentes
└── README.md      # esta documentação
```

Sem assets externos: toda a textura (névoa, vinheta, brilhos) é feita com gradients CSS e nenhuma fonte é baixada — a tipografia serifada usa a pilha do sistema (Palatino/Georgia com fallbacks).

## Identidade visual

| Papel | Cor |
| --- | --- |
| Preto profundo (fundo) | `#05070d` |
| Azul noturno (superfícies) | `#0b1526` / `#10203a` |
| Azul glacial (ação principal) | `#4a90c3` |
| Azul espectral (interações, foco) | `#78bce8` |
| Prata metálico (bordas, detalhes) | `#a8b2c1` |
| Prata claro (títulos) | `#dce3eb` |
| Branco frio (texto) | `#f1f5fa` |

## O que o tema customiza

- **Tokens** (`:root`): cores, glow, gradientes, fontes, raios, sombras frias, transições lentas e anel de foco azul espectral;
- **Body**: névoa azulada em duas luzes + vinheta suave (`background-attachment: fixed`);
- **Hero**: gradientes de luz azul, camada de névoa flutuante animada (26s) e fade-in discreto do conteúdo;
- **Navegação**: sublinhado em gradiente azul que desliza no hover/ativo;
- **Botões**: `btn--primary` com gradiente azul glacial → espectral e halo no hover; `btn--ghost` com contorno prateado;
- **Cards**: superfície em gradiente de vidro escuro, fio metálico prateado e brilho azul no hover;
- **Cabeçalho/rodapé/seções**: divisores prateados e fundo em camadas de azul noturno;
- **Badges/chips**: contornos prateados com acentos azuis.

## Acessibilidade e desempenho

- `--color-on-accent` escuro sobre azul glacial garante contraste AA+ nos botões;
- Foco visível (`:focus-visible`) em azul espectral sobre fundo escuro;
- `prefers-reduced-motion: reduce` desliga a névoa animada e o fade-in;
- `@media print` remove névoa e brilhos;
- Zero requisições externas; efeitos exclusivamente em `background`/`box-shadow`/`transform` (composites baratos).

## Personalização

- Troque a intensidade dos brilhos ajustando os canais alfa de `--glow-accent` e `--glow-accent-2`;
- Para títulos menos serifados, altere `--font-display` para uma pilha `system-ui`;
- A névoa do hero pode ser removida limpando a regra `.hero::before`;
- O ritmo das animações muda via `fallen-mist` / `fallen-fade-in` (durações) — mantenha o bloco `prefers-reduced-motion` intacto.
