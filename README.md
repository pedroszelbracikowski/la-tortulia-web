# O Pátio La Tertúlia

Landing page responsiva do Pátio La Tertúlia, desenvolvida em HTML, CSS e JavaScript, com animações GSAP e ScrollTrigger.

## Arquivos

- `index.html`: conteúdo, seções, menu e formulário.
- `style.css`, `depth.css`, `journey.css`, `signature.css`: estilos e responsividade, nesta ordem de carregamento.
- `app.js`: menu, formulário, galeria e interações principais.
- `depth.js`: experiência horizontal, vídeos e ajuste do nome no rodapé.
- `motion.js`: animações GSAP, entradas e fechamento dos diálogos.
- `assets/`: imagens, SVG, sequências de vídeo e bibliotecas locais.
- `ASSETS.md`: procedência dos arquivos de mídia e bibliotecas.

Não é necessário instalar dependências nem executar um build. Mantenha a pasta `assets` ao lado do `index.html`.

## Enviar para o GitHub pelo navegador

1. Extraia este ZIP.
2. Acesse https://github.com/new e escolha seu perfil como proprietário.
3. Dê ao repositório o nome `la-tortulia-web`, escolha a visibilidade e crie sem adicionar um README (este pacote já inclui um).
4. Na página inicial do repositório vazio, clique em **uploading an existing file**. Se ele já tiver arquivos, use **Add file → Upload files**.
5. Abra a pasta extraída `la-tortulia-web` e arraste seu conteúdo para o upload: os arquivos e a pasta `assets`. O `index.html` deve ficar na raiz do repositório. Não envie o arquivo ZIP.
6. Escreva uma mensagem como `Adiciona site do Pátio La Tertúlia` e confirme em **Commit changes**.

## Publicar também no GitHub Pages (opcional)

No repositório, abra **Settings → Pages**. Em **Source**, escolha **Deploy from a branch**. Selecione `main`, a pasta `/(root)` e clique em **Save**. Aguarde a publicação; o endereço será mostrado nessa tela.

No plano GitHub Free, o repositório precisa ser público para usar GitHub Pages. Guardar o código em um repositório privado é uma opção separada de publicar o site.

## Visualização local

Abra `index.html` em um navegador. Se preferir servir os arquivos por HTTP e tiver Python instalado, rode `python3 -m http.server 8000` nesta pasta e acesse http://localhost:8000.

## Funcionamento

- O formulário prepara uma mensagem para o WhatsApp do Pátio; não há backend, banco de dados ou envio de e-mail.
- As fontes são carregadas pelo Google Fonts e precisam de conexão à internet.
- Os MP4 incluídos são sequências animadas de fotografias do espaço, não filmagens.
- GSAP e ScrollTrigger são servidos localmente em `assets/vendor`, com os avisos originais preservados.
- Esta exportação corresponde à versão 28 do site, com a correção de largura do nome no rodapé.
- A cópia enviada ao GitHub não sincroniza automaticamente com o site hospedado atualmente.

## Referências

- https://docs.github.com/pt/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
