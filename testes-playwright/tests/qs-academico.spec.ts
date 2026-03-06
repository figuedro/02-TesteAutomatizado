import { test, expect } from "@playwright/test";

test.describe("QS Acadêmico — Testes do Sistema de Notas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://figuedro.github.io/02-TesteAutomatizado/");
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe("Cadastro de Alunos", () => {
    test("deve cadastrar um aluno com dados válidos", async ({ page }) => {
      await page.getByLabel("Nome do Aluno").fill("João Silva");
      await page.getByLabel("Nota 1").fill("7");
      await page.getByLabel("Nota 2").fill("8");
      await page.getByLabel("Nota 3").fill("6");

      await page.getByRole("button", { name: "Cadastrar" }).click();

      // Verificar que o aluno aparece na tabela
      const linhasTabela = page.locator("#tabela-alunos tbody tr");

      await expect(linhasTabela).toHaveCount(1);

      await expect(
        linhasTabela.getByRole("cell", { name: "João Silva", exact: true })
      ).toBeVisible();
    });

    test("deve exibir mensagem de sucesso após cadastro", async ({ page }) => {
      await page.getByLabel("Nome do Aluno").fill("Ana Costa");
      await page.getByLabel("Nota 1").fill("9");
      await page.getByLabel("Nota 2").fill("8");
      await page.getByLabel("Nota 3").fill("10");

      await page.getByRole("button", { name: "Cadastrar" }).click();

      await expect(page.locator("#mensagem")).toContainText(
        "cadastrado com sucesso"
      );
    });

    test("não deve cadastrar aluno sem nome", async ({ page }) => {
      await page.getByLabel("Nota 1").fill("7");
      await page.getByLabel("Nota 2").fill("8");
      await page.getByLabel("Nota 3").fill("6");

      await page.getByRole("button", { name: "Cadastrar" }).click();

      // A tabela deve continuar sem dados reais
      await expect(
        page.locator("#tabela-alunos tbody td.texto-central")
      ).toBeVisible();
    });
  });

  //   // ========== GRUPO 2: Cálculo de Média ==========

  test.describe("Cálculo de Média", () => {
    test("deve calcular a média aritmética das três notas", async ({
      page,
    }) => {
      await page.getByLabel("Nome do Aluno").fill("Pedro Santos");
      await page.getByLabel("Nota 1").fill("8");
      await page.getByLabel("Nota 2").fill("6");
      await page.getByLabel("Nota 3").fill("10");

      await page.getByRole("button", { name: "Cadastrar" }).click();

      // Média esperada: (8 + 6 + 10) / 3 = 8.00
      const celulaMedia = page.locator("#tabela-alunos tbody tr td").nth(4);
      await expect(celulaMedia).toHaveText("8.00");
    });
  });

  // ========== GRUPO 3: Validação de Notas: ==========

  test.describe("validação de notas", () => {
    test("Verificar que o sistema rejeita notas fora do intervalo 0–10", async ({
      page,
    }) => {
      await page.getByLabel("Nome do Aluno").fill("Matheus Santos");
      await page.getByLabel("Nota 1").fill("11");
      await page.getByLabel("Nota 2").fill("-1");
      await page.getByLabel("Nota 3").fill("20");

      await page.getByRole("button", { name: "Cadastrar" }).click();
    });
  });

  // ========== GRUPO 4: Busca por nome: ==========

  test.describe("Busca por Nome", () => {
    test("deve filtrar alunos pelo nome digitado", async ({ page }) => {
      await page.getByLabel("Nome do Aluno").fill("João Silva");
      await page.getByLabel("Nota 1").fill("7");
      await page.getByLabel("Nota 2").fill("8");
      await page.getByLabel("Nota 3").fill("9");
      await page.getByRole("button", { name: "Cadastrar" }).click();

      await page.getByLabel("Nome do Aluno").fill("Maria Souza");
      await page.getByLabel("Nota 1").fill("6");
      await page.getByLabel("Nota 2").fill("7");
      await page.getByLabel("Nota 3").fill("8");
      await page.getByRole("button", { name: "Cadastrar" }).click();

      await page.getByLabel("Buscar por nome").fill("Maria");

      const linhasTabela = page.locator("#tabela-alunos tbody tr");

      await expect(linhasTabela).toHaveCount(1);

      await expect(
        linhasTabela.getByRole("cell", { name: "Maria Souza", exact: true })
      ).toBeVisible();
    });
  });

  test.describe("Exclusão de Aluno", () => {
    test("deve cadastrar um aluno, excluí-lo e verificar tabela vazia", async ({
      page,
    }) => {
      // Cadastrar aluno
      await page.getByLabel("Nome do Aluno").fill("Lucas Pereira");
      await page.getByLabel("Nota 1").fill("7");
      await page.getByLabel("Nota 2").fill("8");
      await page.getByLabel("Nota 3").fill("9");
      await page.getByRole("button", { name: "Cadastrar" }).click();

      // Verificar que o aluno foi cadastrado
      const linhasTabela = page.locator("#tabela-alunos tbody tr");
      await expect(linhasTabela).toHaveCount(1);
      await expect(
        linhasTabela.getByRole("cell", { name: "Lucas Pereira", exact: true })
      ).toBeVisible();

      // Excluir aluno
      await linhasTabela
        .getByRole("button", { name: /Excluir Lucas Pereira/ })
        .click();

      // Verificar que a tabela voltou a exibir "Nenhum aluno cadastrado."
      await expect(
        page.locator("#tabela-alunos tbody td.texto-central")
      ).toHaveText("Nenhum aluno cadastrado.");
    });
  });

  test.describe("Estatísticas de Alunos", () => {
    test("deve atualizar corretamente os cards de estatísticas", async ({
      page,
    }) => {
      // Aluno Aprovado (média ≥ 7)
      await page.getByLabel("Nome do Aluno").fill("Aluno A");
      await page.getByLabel("Nota 1").fill("8");
      await page.getByLabel("Nota 2").fill("7");
      await page.getByLabel("Nota 3").fill("9");
      await page.getByRole("button", { name: "Cadastrar" }).click();

      // Aluno Recuperação (média entre 5 e 6.9)
      await page.getByLabel("Nome do Aluno").fill("Aluno B");
      await page.getByLabel("Nota 1").fill("6");
      await page.getByLabel("Nota 2").fill("6");
      await page.getByLabel("Nota 3").fill("6");
      await page.getByRole("button", { name: "Cadastrar" }).click();

      // Aluno Reprovado (média < 5)
      await page.getByLabel("Nome do Aluno").fill("Aluno C");
      await page.getByLabel("Nota 1").fill("3");
      await page.getByLabel("Nota 2").fill("4");
      await page.getByLabel("Nota 3").fill("2");
      await page.getByRole("button", { name: "Cadastrar" }).click();

      // Validar cards de estatísticas
      await expect(page.locator("#stat-aprovados")).toHaveText("1");
      await expect(page.locator("#stat-recuperacao")).toHaveText("1");
      await expect(page.locator("#stat-reprovados")).toHaveText("1");
      await expect(page.locator("#stat-total")).toHaveText("3");
    });
  });

  test.describe("Situação do Aluno — Aprovado", () => {
    test('deve cadastrar um aluno com média ≥ 7 e exibir "Aprovado"', async ({
      page,
    }) => {
      // Cadastrar aluno com média ≥ 7
      await page.getByLabel("Nome do Aluno").fill("Aluno Aprovado");
      await page.getByLabel("Nota 1").fill("8");
      await page.getByLabel("Nota 2").fill("7");
      await page.getByLabel("Nota 3").fill("9");
      await page.getByRole("button", { name: "Cadastrar" }).click();

      // Localizar a célula da tabela com a situação
      const situacao = page.locator("#tabela-alunos tbody tr td").nth(5);

      // Verificar se a situação é "Aprovado"
      await expect(situacao).toHaveText("Aprovado");
    });
  });

  test.describe("Situação do Aluno — Reprovado", () => {
    test('deve cadastrar um aluno com média < 5 e exibir "Reprovado"', async ({
      page,
    }) => {
      // Cadastrar aluno com média < 5
      await page.getByLabel("Nome do Aluno").fill("Aluno Reprovado");
      await page.getByLabel("Nota 1").fill("3");
      await page.getByLabel("Nota 2").fill("4");
      await page.getByLabel("Nota 3").fill("2");
      await page.getByRole("button", { name: "Cadastrar" }).click();

      // Localizar a célula da tabela com a situação
      const situacao = page.locator("#tabela-alunos tbody tr td").nth(5);

      // Verificar se a situação é "Reprovado"
      await expect(situacao).toHaveText("Reprovado");
    });
  });

  test.describe("Múltiplos Cadastros", () => {
    test("deve cadastrar 3 alunos consecutivos e exibir 3 linhas na tabela", async ({
      page,
    }) => {
      for (let i = 1; i <= 3; i++) {
        await page.getByLabel("Nome do Aluno").fill(`Aluno ${i}`);
        await page.getByLabel("Nota 1").fill("7");
        await page.getByLabel("Nota 2").fill("8");
        await page.getByLabel("Nota 3").fill("9");
        await page.getByRole("button", { name: "Cadastrar" }).click();
      }

      const linhasTabela = page.locator("#tabela-alunos tbody tr");

      // Verifica se há 3 linhas (alunos) na tabela
      await expect(linhasTabela).toHaveCount(3);
    });
  });
});
