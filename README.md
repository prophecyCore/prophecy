# Profecia - Extensão para Gerar Testes Unitários Angular

**Profecia** é uma extensão para o Visual Studio Code que ajuda na geração automática de testes unitários no Angular, com Karma e Jasmine. Ela resolve e mocka automaticamente as dependências e variáveis necessárias, facilitando o processo de criação e execução de testes.

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/seu-usuario/profecia/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/seu-usuario/profecia/ci.yml?branch=main)](https://github.com/seu-usuario/profecia/actions)
[![Coverage](https://img.shields.io/codecov/c/github/seu-usuario/profecia?branch=main)](https://codecov.io/gh/seu-usuario/profecia)

## Pré-Requisitos

- **Node.js** (recomendado a versão LTS): [Baixe aqui](https://nodejs.org/)
- **Angular CLI** (se você ainda não tiver o Angular instalado): [Instruções de instalação](https://angular.io/cli)
- **VS Code**: [Baixe aqui](https://code.visualstudio.com/)

## Como Instalar

1. **Baixe o repositório**:
   Se você deseja usar a extensão localmente antes de instalar diretamente do marketplace, siga os seguintes passos:

   - Clone ou baixe o repositório:
   ```bash
   git clone https://github.com/pedroHenriqueMaia/prophecy.git
   ```

2. **Instalar dependências**:
   Navegue até a pasta do projeto e instale as dependências com o comando:
   ```bash
   npm install
   ```

3. **Abrir no VS Code**:
   Abra a pasta do projeto no VS Code:
   ```bash
   code .
   ```

4. **Iniciar a Extensão**:
   No VS Code, pressione `F5` para compilar a extensão e iniciar o modo de desenvolvimento. Isso abrirá uma nova janela do VS Code com a sua extensão carregada.

5. **Instalar via Marketplace**:
   Caso você queira disponibilizar a extensão para outras pessoas via **VS Code Marketplace**, basta buscar por "Profecia" diretamente no marketplace do VS Code e clicar em **Instalar**.

## Como Usar

Após a instalação, a extensão estará pronta para uso. Para gerar os testes unitários no seu projeto Angular, siga estas etapas:

1. **Comando Profecia**:
   - No **Command Palette** (Ctrl+Shift+P), busque por **Profecia: Gerar Testes Unitários**.
   - A extensão automaticamente irá configurar os mocks, gerar testes e configurar as dependências para o seu projeto Angular.

## Como Contribuir

Se você deseja contribuir para o desenvolvimento da extensão **Profecia**, siga estas etapas:

1. **Fork o repositório**.
2. **Crie uma branch** para suas alterações (`git checkout -b feature/alteracao`).
3. Faça as alterações desejadas.
4. **Teste as mudanças** localmente.
5. Envie um pull request com suas melhorias.


## Licença

Este projeto é licenciado sob a [MIT License](LICENSE).

---

### Notas Adicionais

Se você encontrar algum problema, por favor, abra uma **issue** ou **pull request**. Agradecemos por contribuir com o **Profecia**!

---

**Badges Explicativas:**

- **Versão**: Mostra a versão atual do projeto.
- **Licença**: Exibe a licença que o projeto segue (MIT).
- **Status da Build**: Status atual da CI (integração contínua), mostrando se a build está passando.
- **Cobertura de Testes**: Mostra a porcentagem de cobertura de testes do código, com um link para a plataforma de cobertura.
