# <p align="center">API leitura de consumo de água e gás - Teste técnico Shopper</p>

<p align="center">
  <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/aliine98/teste-backend-shopper?color=magenta&style=flat">
  <a href="https://www.linkedin.com/in/aline-bevilacqua/"><img alt="Linkedin URL" src="https://img.shields.io/twitter/url?label=Conecte-se comigo&logo=linkedin&style=social&url=https%3A%2F%2Fwww.linkedin.com%2Fin%2Faline-bevilacqua%2F"></a>
</p>

> Table of Contents
> <ol>
>   <li><a href="#-sobre-o-projeto">Sobre</a></li>
>   <li><a href="#-tecnologias">Tecnologias</a></li>
>   <li><a href="#-endpoints">Endpoints</a></li>
>   <li><a href="#-responses">Responses</a></li>
>   <li><a href="#-rodando-localmente">Rodando localmente</a></li>
>   <li><a href="#-como-contribuir-para-o-projeto">Como contribuir para o projeto</a></li>
>   <li><a href="#-licença">Licença</a>
> </ol>

## 💻 Sobre o projeto

Uma API desenvolvida para o teste técnico da Shopper.

Back-end de um serviço que gerencia a leitura individualizada de consumo de água e gás. Para facilitar a coleta da informação, o serviço utilizará IA para obter a medição através da foto de um medidor.

## 🛠 Tecnologias

- [![Express](https://img.shields.io/static/v1?style=for-the-badge&message=Express&color=000000&logo=Express&logoColor=FFFFFF&label=)](https://expressjs.com/)
- [![MongoDB](https://img.shields.io/static/v1?style=for-the-badge&message=MongoDB&color=47A248&logo=MongoDB&logoColor=FFFFFF&label=)](https://www.mongodb.com/)
- [![Mongoose](https://img.shields.io/static/v1?style=for-the-badge&message=Mongoose&color=880000&logo=Mongoose&logoColor=FFFFFF&label=)](https://tailwindcss.com/)
- [![Docker](https://img.shields.io/static/v1?style=for-the-badge&message=Docker&color=2496ED&logo=Docker&logoColor=FFFFFF&label=)](https://www.docker.com/)
- [![Google AI API](https://img.shields.io/static/v1?style=for-the-badge&message=Google+Gemini+API&color=8E75B2&logo=Google+Gemini&logoColor=FFFFFF&label=)](https://ai.google.dev/gemini-api/docs/vision?lang=node)

## 📍 Endpoints

URL base: `https://localhost:3333`

<table><thead>
  <tr>
    <th>Método</th>
    <th>Endpoint</th>
    <th>Descrição</th>
    <th>Body da requisição</th>
  </tr></thead>
<tbody>
  <tr>
    <td><code>GET</code></td>
    <td><code>/&lt;customer_list&gt;/list?measure_type=</code></td>
    <td>Responsável por listar as medidas realizadas por um determinado cliente, podendo filtrar pelo tipo: "WATER" ou "GAS"</td>
    <td>
        -
    </td>
  </tr>
  <tr>
    <td><code>POST</code></td>
    <td><code>/upload</code></td>
    <td>Responsável por receber uma imagem em base 64, consultar o Gemini e retornar a medida lida pela API</td>
    <td><pre>{
    "image": "base64",
    "customer_code": "string",
    "measure_datetime": "datetime",
    "measure_type": "WATER" ou "GAS"
}</pre></td>
  </tr>
  <tr>
    <td><code>PATCH</code></td>
    <td><code>/confirm</code></td>
    <td>Responsável por confirmar ou corrigir o valor lido pelo LLM</td>
    <td><pre>{
    "measure_uuid": "string",
    "confirmed_value": integer
}</pre></td>
  </tr>
</tbody>
</table>

## ✅ Responses

`GET /<cutomer_code>/list?measure_type=`
<table><thead>
  <tr>
    <th>Status Code</th>
    <th>Descrição</th>
    <th>Resposta</th>
  </tr></thead>
<tbody>
  <tr>
    <td>200</td>
    <td>Operação realizada com sucesso</td>
    <td><pre>{
    "customer_code": string,
    "measures": [
    {
        "measure_uuid": string,
        "measure_datetime": datetime,
        "measure_type": string,
        "has_confirmed":boolean,
        "image_url": string
    },
    {
        "measure_uuid": string,
        "measure_datetime": datetime,
        "measure_type": string,
        "has_confirmed":boolean,
        "image_url": string
    }
 ]
}
</pre></td>
  </tr>
  <tr>
    <td>400</td>
    <td>Parâmetro measure type diferente de WATER ou GAS</td>
    <td><pre>{
    "error_code": "INVALID_TYPE",
    "error_description": “Tipo de medição não permitida”
}</pre></td>
  </tr>
  <tr>
    <td>404</td>
    <td>Nenhum registro encontrado</td>
    <td><pre>{
    "error_code": "MEASURES_NOT_FOUND",
    "error_description": "Nenhuma leitura encontrada"
}</pre></td>
  </tr>
</tbody>
</table>

`POST /upload`

<table><thead>
  <tr>
    <th>Status Code</th>
    <th>Descrição</th>
    <th>Resposta</th>
  </tr></thead>
<tbody>
  <tr>
    <td>200</td>
    <td>Operação realizada com sucesso</td>
    <td><pre>{
    "image_url": string,
    "measure_value": integer,
    "measure_uuid": string
}

</pre></td>
  </tr>
  <tr>
    <td>400</td>
    <td>Os dados fornecidos no corpo da requisição são inválidos
</td>
    <td><pre>{
    "error_code": "INVALID_DATA",
    "error_description": Dados inválidos. Por favor informe customer_code, measure_datetime, measure_type válidos e imagem no formato base64.
}
</pre></td>
  </tr>
  <tr>
    <td>409</td>
    <td>Já existe uma leitura para este tipo no mês atual</td>
    <td><pre>{
    "error_code": "DOUBLE_REPORT",
    "error_description": "Leitura do mês já realizada"
}</pre></td>
  </tr>
</tbody>
</table>

`PATCH /mulheres/$id`

<table><thead>
  <tr>
    <th>Status Code</th>
    <th>Descrição</th>
    <th>Resposta</th>
  </tr></thead>
<tbody>
  <tr>
    <td>200</td>
    <td>Operação realizada com sucesso</td>
    <td><pre>{
    "success": true
}
</pre></td>
  </tr>
  <tr>
    <td>400</td>
    <td>Os dados fornecidos no corpo da requisição são inválidos</td>
    <td><pre>{
    "error_code": "INVALID_DATA",
    "error_description": Dados inválidos. Por favor informe measure_uuid e confirmed_value válidos.
}</pre></td>
  </tr>
  <tr>
    <td>404</td>
    <td>Leitura não encontrada</td>
    <td><pre>{
    "error_code": "MEASURE_NOT_FOUND",
    "error_description": "Leitura não encontrada"
}</pre></td>
  </tr>
  <tr>
    <td>409</td>
    <td>Leitura já confirmada</td>
    <td><pre>{
    "error_code": "CONFIRMATION_DUPLICATE",
    "error_description": "Leitura do mês já confirmada"
}</pre></td>
  </tr>
</tbody>
</table>

## 🚀 Rodando localmente

Clone o projeto

```bash
  git clone https://github.com/aliine98/teste-backend-shopper
```

Entre no diretório do projeto

```bash
  cd teste-backend-shopper
```

Instale as depêndencias

```bash
  npm install
```

Inicie o docker

```bash
  docker compose up
```

Feito com ❤️ por <a href="https://github.com/aliine98">Aline Bevilacqua</a>!

<a href="#API-leitura-de-consumo-de-água-e-gás---Teste-técnico-Shopper">⬆ Voltar ao topo</a>