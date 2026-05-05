# TODO - Botoes e Formularios Baseados no Swagger

Este documento interpreta as rotas atuais do Swagger para planejar os botoes de envio/acao do front. Nao implementar ainda sem revisar este TODO.

Swagger usado: `http://3.237.223.11:8080/v3/api-docs`

## Prioridade geral

- [x] P0 - Conta: cadastro, login, persistencia e sair.
- [x] P0 - Materiais: botao para enviar novo material.
- [x] P0 - Comentarios/postagens: botao para criar comentario e curtir.
- [x] P0 - Favoritos: botao para favoritar/desfavoritar itens.
- [x] P1 - Perfil: editar usuario logado.
- [x] P1 - Admin: criar/editar/excluir cursos, disciplinas, docentes, semestres e eletivas.
- [x] P2 - Melhorar UX: trocar JSON cru por formularios com inputs reais.

## Conta e usuarios

### POST /usuario

- [x] Criar botao `Criar conta` na tela `/cadastro` ou `/login`.
- [x] Campos do formulario:
  - `nome`
  - `email`
  - `senha`
- [x] Ao sucesso:
  - salvar usuario/logado no `localStorage`
  - mostrar email na navbar
  - redirecionar para o catalogo ou pagina anterior
- [x] Observacao: esta rota cria a conta, nao faz login sozinha segundo o Swagger. O front pode chamar login em seguida para melhorar o fluxo.

### POST /usuario/login

- [x] Criar botao `Entrar` na tela `/login`.
- [x] Campos do formulario:
  - `email`
  - `senha`
- [x] Ao sucesso:
  - persistir resposta em `insperMindAuth`
  - mostrar usuario logado na navbar
  - oferecer botao `Sair`
- [x] Observacao: o Swagger diz que a resposta e uma `string`.

### GET /usuario

- [x] Criar botao `Listar usuarios` em uma tela de administracao simples.
- [x] Usar paginacao `page`, `size`, `sort`.
- [x] Exibir nome, email e data de criacao.

### GET /usuario/{email}

- [x] Criar botao `Buscar usuario` na tela de usuarios/admin.
- [x] Campo:
  - `email`
- [x] Usar tambem para carregar perfil do usuario logado.

### PATCH /usuario/{email}

- [x] Criar botao `Salvar perfil`.
- [x] Campo de path:
  - `email`
- [x] Campos editaveis:
  - `nome`
  - `senha`
  - `email`
- [x] Ao sucesso:
  - atualizar email/nome persistido se foram alterados.

### DELETE /usuario/{id}

- [x] Criar botao `Excluir usuario` somente em area admin ou perfil proprio.
- [x] Campo:
  - `id`
- [x] Exigir confirmacao antes de chamar.
- [x] Se excluir o usuario logado, limpar login local.

## Materiais

### POST /material

- [x] Criar botao principal `Enviar material`.
- [x] Locais sugeridos:
  - pagina `/materiais`
  - pagina de detalhe de disciplina
  - navbar ou atalho quando usuario estiver logado
- [x] Campos do formulario:
  - `titulo`
  - `descricao`
  - `link`
  - `tipo`
  - `emailUsuario`
  - `cursoId`
- [x] Interpretacao:
  - `emailUsuario` deve vir do usuario logado quando possivel.
  - `tipo` deve ser um select simples: `PDF`, `VIDEO`, `SLIDE`, `ARTIGO`, `LINK`, `EXERCICIO`, `OUTRO`.
  - `cursoId` pode ser select carregado por `GET /curso`.
- [x] Ao sucesso:
  - recarregar lista de materiais
  - mostrar mensagem `Material enviado`

### GET /material

- [x] Criar botao `Recarregar materiais`.
- [x] Usar paginacao `page`, `size`, `sort`.
- [x] Manter filtros visuais por tipo no front.

### GET /material/{id}

- [x] Criar botao/link `Ver material`.
- [x] Campo:
  - `id`
- [x] Opcional: criar uma pagina `/materiais/:id` para comentarios e favoritos.

### PUT /material/{id}

- [x] Criar botao `Editar material`.
- [x] Campo de path:
  - `id`
- [x] Campos editaveis:
  - `titulo`
  - `descricao`
  - `link`
  - `tipo`
  - `cursoId`
  - `ativo`
- [x] Exibir apenas para autor/admin se houver regra no futuro.

### DELETE /material/{id}

- [x] Criar botao `Excluir material`.
- [x] Campo:
  - `id`
- [x] Exigir confirmacao.

## Comentarios e postagens

### POST /comentario

- [x] Criar botao `Publicar comentario`.
- [x] Locais sugeridos:
  - detalhe de material
  - perfil do usuario
  - tela simples de rotas/admin
- [x] Campos do formulario:
  - `comentario`
  - `emailUsuario`
- [x] Interpretacao:
  - Pelo Swagger, o comentario nao recebe `materialId`; entao hoje parece ser uma postagem/comentario geral.
  - Se o backend precisar associar a material no futuro, o Swagger deve expor esse campo.
- [x] Ao sucesso:
  - limpar campo
  - recarregar comentarios

### GET /comentario

- [x] Criar botao `Listar comentarios`.
- [x] Usar paginacao `page`, `size`, `sort`.
- [x] Exibir comentario, curtidas, nome/email do usuario e data.

### PUT /comentario/{id}

- [x] Criar botao `Editar comentario`.
- [x] Campo de path:
  - `id`
- [x] Campos editaveis:
  - `comentario`
  - `ativo`

### PATCH /comentario/{id}/curtir

- [x] Criar botao `Curtir`.
- [x] Campo:
  - `id`
- [x] Locais sugeridos:
  - card de comentario
  - lista de comentarios
- [x] Ao sucesso:
  - atualizar contador de curtidas com a resposta.

### DELETE /comentario/{id}

- [x] Criar botao `Excluir comentario`.
- [x] Campo:
  - `id`
- [x] Exigir confirmacao.

## Favoritos

### POST /favorito

- [x] Criar botao `Favoritar`.
- [x] Locais sugeridos:
  - card de material
  - card de disciplina/curso se `tipoItem` permitir
- [x] Campos do formulario/chamada:
  - `emailUsuario`
  - `itemId`
  - `tipoItem`
- [x] Interpretacao:
  - `emailUsuario` vem do login.
  - `itemId` e o id do item clicado.
  - `tipoItem` deve indicar o tipo do item, por exemplo `MATERIAL`, se o backend aceitar esse valor.
- [x] Ao sucesso:
  - mudar estado visual para favoritado.

### GET /favorito

- [x] Criar botao `Meus favoritos`.
- [x] Usar paginacao `page`, `size`, `sort`.
- [x] Filtragem por usuario nao aparece formalmente no Swagger; se usada, tratar como extra opcional.

### DELETE /favorito/{id}

- [x] Criar botao `Remover favorito`.
- [x] Campo:
  - `id` do favorito, nao necessariamente o id do item.

## Cursos

### POST /curso

- [x] Criar botao `Criar curso` em area admin.
- [x] Campo:
  - `nome`

### GET /curso

- [x] Criar botao `Listar cursos`.
- [x] Usar na home/catalogo.

### GET /curso/{id}

- [x] Criar link `Ver curso`.
- [x] Campo:
  - `id`

### PUT /curso/{id}

- [x] Criar botao `Editar curso`.
- [x] Campos:
  - path `id`
  - body `nome`
  - body `ativo`

### DELETE /curso/{id}

- [x] Criar botao `Excluir curso`.
- [x] Exigir confirmacao.

## Disciplinas

### POST /disciplina

- [x] Criar botao `Criar disciplina` em area admin.
- [x] Campos:
  - `nome`
  - `formulaAvaliacao`
  - `temDelta`
  - `criterioBarreira`
- [x] Interpretacao:
  - O Swagger nao mostra `cursoId`, entao associacao a curso nao pode ser enviada por esta rota atualmente.

### GET /disciplina

- [x] Criar botao `Listar disciplinas`.
- [x] Usar em catalogo e detalhe de curso.
- [x] Observacao: filtros como `cursoId` nao aparecem formalmente no Swagger.

### GET /disciplina/{id}

- [x] Criar link `Ver disciplina`.

### PUT /disciplina/{id}

- [x] Criar botao `Editar disciplina`.
- [x] Campos:
  - path `id`
  - `nome`
  - `formulaAvaliacao`
  - `temDelta`
  - `criterioBarreira`

### DELETE /disciplina/{id}

- [x] Criar botao `Excluir disciplina`.
- [x] Exigir confirmacao.

## Docentes

### POST /docente

- [x] Criar botao `Cadastrar docente` em area admin.
- [x] Campos:
  - `nome`
  - `email`

### GET /docente

- [x] Criar botao `Listar docentes`.

### GET /docente/{email}

- [x] Criar link/botao `Ver docente`.
- [x] Campo:
  - `email`

### PATCH /docente/{email}

- [x] Criar botao `Editar docente`.
- [x] Campos:
  - path `email`
  - body `nome`
  - body `email`

### DELETE /docente/{id}

- [x] Criar botao `Excluir docente`.
- [x] Campo:
  - `id`
- [x] Exigir confirmacao.

## Semestres

### POST /semestre

- [x] Criar botao `Criar semestre` em area admin.
- [x] Campo:
  - `nome`

### GET /semestre

- [x] Criar botao `Listar semestres`.

### GET /semestre/{id}

- [x] Criar botao `Ver semestre`.

### PUT /semestre/{id}

- [x] Criar botao `Editar semestre`.
- [x] Campos:
  - path `id`
  - body `nome`
  - body `ativo`

### DELETE /semestre/{id}

- [x] Criar botao `Excluir semestre`.
- [x] Exigir confirmacao.

## Eletivas

### POST /eletivas

- [x] Criar botao `Criar eletiva` em area admin.
- [x] Campos:
  - `cargaHoraria`
  - `semestreMinimo`
  - `ativo`

### GET /eletivas

- [x] Criar botao `Listar eletivas`.

### GET /eletivas/{id}

- [x] Criar botao `Ver eletiva`.

### PUT /eletivas/{id}

- [x] Criar botao `Editar eletiva`.
- [x] Campos:
  - path `id`
  - body `cargaHoraria`
  - body `semestreMinimo`

### DELETE /eletivas/{id}

- [x] Criar botao `Excluir eletiva`.
- [x] Exigir confirmacao.

## Implementacao sugerida

- [x] Criar componentes pequenos e reutilizaveis:
  - `ModalForm`
  - `TextField`
  - `SelectField`
  - `ConfirmButton`
  - `SubmitButton`
- [x] Evitar JSON cru nas telas finais; manter JSON cru apenas em `/rotas`.
- [x] Cada botao deve:
  - validar campos minimos
  - chamar o service correspondente
  - exibir loading
  - exibir erro legivel
  - atualizar a lista/local state apos sucesso
- [x] Usar dados do login:
  - `emailUsuario` deve vir de `insperMindAuth.email`
  - esconder botoes de criar/favoritar/comentar se nao houver login
- [x] Manter `/rotas` como tela tecnica para testar qualquer endpoint do Swagger.
