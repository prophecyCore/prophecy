Para criar um README intuitivo para os usuários, com instruções claras sobre como usar a extensão e destacando que é um projeto open-source, você pode seguir este formato:

---

# Prophecy Extension for Visual Studio Code

![Logo](images/logo.png)

## O que é o Prophecy?

O **Prophecy** é uma extensão para o **Visual Studio Code** que facilita a criação de testes unitários para o seu código TypeScript. Com um simples clique com o botão direito, você pode gerar automaticamente testes unitários para os arquivos `.ts` em sua pasta de trabalho.

---

## Como Usar

### Passo 1: Instalar a Extensão

1. Acesse o **Visual Studio Code Marketplace**.
2. Procure por **Prophecy** ou [clique aqui para instalar](https://marketplace.visualstudio.com/items?itemName=prophecyCore.prophecy).
3. Clique em "Instalar".

---

### Passo 2: Gerar Testes Unitários

1. Abra um arquivo TypeScript `.ts` no seu projeto.
2. Clique com o botão direito do mouse sobre o código dentro do arquivo.
3. No menu de contexto, escolha a opção **"Gerar Teste Unitário com Prophecy"**.
   
   ![Clique com o Botão Direito](images/context-menu.png)

4. O teste será gerado na mesma pasta onde o arquivo original está localizado.

   **Exemplo**:
   - Arquivo original: `src/app/exemplo.ts`
   - Teste gerado: `src/app/exemplo.test.ts`

---

### Passo 3: Executando os Testes

1. Após a geração do teste, você pode executar os testes utilizando o **Test Runner** do Visual Studio Code ou outra ferramenta de testes de sua preferência (por exemplo, Jest, Mocha).

---

## Funcionalidades

- **Geração automática de testes unitários** para funções em arquivos TypeScript.
- **Criação de arquivos de teste** na mesma pasta do arquivo original.
- Suporte para **tipagem e integração** com outras ferramentas de testes populares.

---

## Contribuições

Este é um projeto **open-source**. Se você deseja contribuir, fique à vontade para enviar *pull requests* ou reportar problemas.

**Link do repositório**: [https://github.com/prophecyCore/prophecy](https://github.com/prophecyCore/prophecy)

Se você encontrou algum bug ou tem sugestões para melhorias, sinta-se à vontade para abrir uma **issue** no nosso repositório GitHub.

---

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## Badge de Open Source

[![Open Source](https://img.shields.io/badge/Open%20Source-%F0%9F%93%96%20prophecyCore%2Fprophecy-green)](https://github.com/prophecyCore/prophecy)
