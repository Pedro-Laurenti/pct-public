
### 1. **Inicialize o Git no projeto (se ainda não estiver inicializado)**
Se o Git ainda não foi inicializado no seu repositório local, abra o terminal na pasta do projeto e execute:
```bash
git init
```

### 2. **Adicione os arquivos ao controle de versão**
Adicione todos os arquivos do projeto ao controle de versão:
```bash
git add .
```

### 3. **Faça um commit inicial**
Crie um commit inicial com as mudanças:
```bash
git commit -m "Commit inicial"
```

### 4. **Crie um repositório no GitHub**
1. Acesse o [GitHub](https://github.com) e faça login.
2. Clique no botão **"+"** no canto superior direito e selecione **"New repository"**.
3. Dê um nome ao repositório, configure as opções desejadas e clique em **"Create repository"**.

### 5. **Conecte o repositório local ao repositório remoto**
No terminal, configure o repositório remoto com o URL fornecido na página do novo repositório no GitHub. Algo como:
```bash
git remote add origin https://github.com/<seu-usuario>/<nome-repositorio>.git
```

### 6. **Envie os arquivos para o GitHub**
Envie os arquivos do repositório local para o repositório remoto:
```bash
git branch -M main
git push -u origin main
```

### 7. **Verifique no navegador**
Agora, você deverá conseguir ver o repositório no seu GitHub. Acesse-o pelo URL: `https://github.com/<seu-usuario>/<nome-repositorio>`.
