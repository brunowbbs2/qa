# SGU QA - Sistema de Gerenciamento de Usuários (Ambiente de Testes)

Esta é uma aplicação web simples desenvolvida especificamente para servir como laboratório em **aulas de Quality Assurance (QA)**, testes funcionais manuais e automação de testes (utilizando ferramentas como Cypress, Selenium ou Playwright).

O sistema contém **6 bugs intencionais** em seus fluxos de login, cadastro, listagem, edição e exclusão de usuários para que os alunos possam identificá-los, reportá-los e automatizar a detecção de regressões.

---

## 🚀 Como Executar Localmente (Instalação e Deploy)

Como a aplicação é estruturada puramente em **HTML5, CSS3 e JavaScript Vanilla**, não há necessidade de compilação ou instalação de dependências pesadas do Node.js. Você pode executá-la de várias formas rápidas:

### Método 1: Direto no Navegador (Sem Servidor)
1. Navegue até a pasta do projeto.
2. Dê um duplo-clique no arquivo `index.html`.
3. O sistema abrirá diretamente no navegador.

### Método 2: Usando Servidor HTTP em Python (Recomendado)
Se tiver o Python instalado na máquina:
1. Abra o terminal na pasta `/Users/wesleybruno/.gemini/antigravity-ide/scratch/qa-buggy-app`.
2. Execute o comando:
   ```bash
   python3 -m http.server 8000
   ```
3. Abra o navegador e acesse: `http://localhost:8000`

### Método 3: Usando Node.js (Static Server)
Se possuir o Node instalado:
1. Abra o terminal na pasta do projeto.
2. Inicialize o servidor sem instalar nada:
   ```bash
   npx serve .
   ```
3. Acesse a URL gerada (geralmente `http://localhost:3000`).

---

## 🐞 Catálogo de Bugs Intencionais (Gabarito do Instrutor)

Aqui estão detalhados todos os bugs implementados na aplicação e como reproduzi-los:

### 1. Bug no Login
* **Comportamento Incorreto**: 
  1. O campo de e-mail aceita qualquer texto simples sem verificar o formato de e-mail (ex: aceita `admin` ou `usuario-sem-arroba`).
  2. A senha aceita login **apenas se tiver entre 1 e 7 caracteres**. Se a senha possuir 8 ou mais caracteres (o padrão mínimo recomendado de segurança), o sistema rejeita o login com erro.
* **Como Reproduzir**: 
  * Tente logar com e-mail `admin` e senha `12345` (Sucesso).
  * Tente logar com e-mail `admin@sgu.com` e senha `segura12345` (Falha de login).

### 2. Bug no Cadastro (Campos Antigos)
* **Comportamento Incorreto**:
  1. O campo **Idade** aceita ser salvo em branco ou com números negativos (ex: `-10` ou `-5`).
  2. O botão **Salvar Usuário** não é desabilitado após ser clicado. Isso permite que múltiplos cliques rápidos enviem o formulário várias vezes seguidas, gerando múltiplos registros duplicados idênticos no banco de dados (LocalStorage).
* **Como Reproduzir**:
  * Deixe a Idade em branco ou digite `-25` e salve. O registro será adicionado com sucesso.
  * Preencha os dados e clique 3 vezes de forma rápida no botão "Salvar Usuário". Verifique na tabela que o usuário foi inserido 3 vezes.

### 3. Bug no Cadastro (Campos Novos)
* **Comportamento Incorreto**:
  1. O campo **CPF** aceita letras e símbolos arbitrariamente sem qualquer formatação de máscara visual ou validação do algoritmo do CPF.
  2. O campo **Data de Nascimento** permite que o usuário selecione e salve datas futuras (ex: amanhã ou o ano que vem).
  3. O campo **Telefone** não possui limite de caracteres no formulário ou no banco de dados, permitindo textos infinitos que quebram o layout.
* **Como Reproduzir**:
  * Digite `meu-cpf-com-letras` no campo CPF e salve.
  * Selecione uma data do ano que vem no campo Data de Nascimento e salve.
  * Copie e cole um texto extremamente longo no campo Telefone e salve.

### 4. Bug na Listagem
* **Comportamento Incorreto**:
  * Os registros na tabela são exibidos de forma estática ordenados do mais antigo para o mais novo (**ASC** - ordem crescente de criação), contrariando a usabilidade padrão de sistemas modernos onde os registros novos aparecem no topo (DESC) ou em ordem alfabética.
* **Como Reproduzir**:
  * Cadastre um usuário chamado "Zélia" e depois um chamado "Amanda". Note que o usuário cadastrado por último ("Amanda") sempre aparecerá na última linha da tabela, forçando o rolamento da página à medida que a base cresce.

### 5. Bug na Edição
* **Comportamento Incorreto**:
  * O sistema atualiza corretamente os dados no LocalStorage ao editar um usuário, mas recarrega a página inteira instantaneamente (`location.reload()`) sem exibir nenhuma notificação, toast ou modal de sucesso. O usuário não tem feedback se a ação deu certo ou não.
* **Como Reproduzir**:
  * Clique no ícone de lápis de algum usuário para editar, altere o nome e clique em "Atualizar Usuário". A página sofrerá um refresh abrupto e nenhuma mensagem de confirmação será exibida.

### 6. Bug na Exclusão
* **Comportamento Incorreto**:
  * Ao clicar no botão de exclusão (lixeira), o registro é removido na mesma hora do LocalStorage e da tela, sem apresentar nenhum aviso, caixa de diálogo (`confirm()`) ou modal de confirmação.
* **Como Reproduzir**:
  * Clique no botão de lixeira de um usuário. O usuário sumirá na hora, impossibilitando prevenir cliques acidentais.

---

## 🛠️ Dicas para Automação de Testes (QA)
* **IDs Exclusivos**: Todos os elementos interativos possuem IDs semânticos (ex: `login-email`, `login-password`, `btn-login`, `user-name`, `user-cpf`, `btn-save-user`, `search-input`) para facilitar a seleção de seletores no Cypress (`cy.get('#login-email')`) ou Selenium.
* **Banco de Dados Local**: Como os dados residem no `LocalStorage` sob a chave `sgu_users`, os scripts de automação podem limpar o banco de dados antes de rodar os testes simplesmente executando:
  ```javascript
  // No Cypress (antes de cada teste)
  cy.clearLocalStorage();
  ```
# qa
