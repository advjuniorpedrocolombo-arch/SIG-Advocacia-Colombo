# Conector e-SAJ — SIG Advocacia Colombo

Este conector lê somente a página do processo já aberta e autenticada no e-SAJ no navegador local. Ele não envia certificado digital, token físico nem PIN para o SIG.

## Instalação no Chrome/Edge

1. Baixe este repositório em ZIP e extraia a pasta `esaj-connector`.
2. Abra `chrome://extensions` no Chrome ou `edge://extensions` no Edge.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta `esaj-connector`.
6. Fixe a extensão **SIG Advocacia Colombo — Conector e-SAJ** na barra do navegador.

## Uso

1. Faça login normalmente no SIG.
2. Acesse e autentique-se normalmente no e-SAJ.
3. Abra a página de detalhes do processo.
4. Clique na extensão e depois em **Enviar processo aberto ao SIG**.
5. O importador do SIG será aberto e os dados terão sido copiados localmente.
6. Clique em **Ler dados copiados**.
7. O SIG localiza ou cadastra o processo e importa as movimentações que ainda não existirem.

A primeira versão limita a importação às movimentações mais recentes capturadas na página atual, evitando duplicações pela descrição da movimentação.
