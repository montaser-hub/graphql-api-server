
# 🚀 GraphQL API with Express & Mongoose

This project is a simple **GraphQL API** for managing `Users` and `Companies`.  
It demonstrates how to integrate **GraphQL** with **Express.js** and **Mongoose** in a clean and structured way.

---

## 📂 Project Structure

```

server/
├── database/
│   ├── connect.js        # MongoDB connection helper
│   ├── models.js         # Mongoose models (User, Company)
├── graphql/
│   ├── schema.js         # GraphQL Schema (queries + mutations)
│   ├── types.js          # GraphQL object types
├── server.js             # Express server entry point
├── package.json
└── .env                  # Environment variables

````

---

## ⚙️ Setup

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd server
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/graphql_app
PORT=4000
```

### 4. Start the server

```bash
npm start
```

By default, GraphQL Playground is available at:

```
http://localhost:4000/graphql
```

---

## 📌 GraphQL Schema Overview

### User

```graphql
type User {
  id: ID!
  firstName: String
  age: Int
  company: Company
}
```

### Company

```graphql
type Company {
  id: ID!
  name: String
  slogan: String
  users: [User]
}
```

---

## 🔎 Queries

### Get all users

```graphql
query {
  users {
    id
    firstName
    age
    company {
      name
    }
  }
}
```

### Get a user by ID

```graphql
query {
  user(id: "USER_ID_HERE") {
    id
    firstName
    age
    company {
      name
    }
  }
}
```

### Get all companies

```graphql
query {
  companies {
    id
    name
    slogan
    users {
      firstName
    }
  }
}
```

### Get a company by ID

```graphql
query {
  company(id: "COMPANY_ID_HERE") {
    id
    name
    slogan
    users {
      firstName
    }
  }
}
```

---

## ✏️ Mutations

### Create a user

```graphql
mutation {
  createUser(firstName: "Montaser", age: 29, companyId: "COMPANY_ID_HERE") {
    id
    firstName
    age
    company {
      name
    }
  }
}
```

### Update a user

```graphql
mutation {
  updateUser(id: "USER_ID_HERE", firstName: "Updated Name", age: 30) {
    id
    firstName
    age
    company {
      name
    }
  }
}
```

### Delete a user

```graphql
mutation {
  deleteUser(id: "USER_ID_HERE")
}
```

---

### Create a company

```graphql
mutation {
  createCompany(name: "OpenAI", slogan: "Discover the Future") {
    id
    name
    slogan
  }
}
```

### Update a company

```graphql
mutation {
  updateCompany(id: "COMPANY_ID_HERE", slogan: "Innovation for Tomorrow") {
    id
    name
    slogan
  }
}
```

### Delete a company

```graphql
mutation {
  deleteCompany(id: "COMPANY_ID_HERE")
}
```

---

## ✅ Example Flow

1. **Create a Company**
2. **Create Users** under that company
3. **Query Users** with their company info
4. **Update User/Company** details
5. **Delete Users/Companies** when no longer needed

---

## 🛠️ Tech Stack

* [Node.js](https://nodejs.org/)
* [Express.js](https://expressjs.com/)
* [GraphQL](https://graphql.org/)
* [Express-GraphQL](https://www.npmjs.com/package/express-graphql)
* [Mongoose](https://mongoosejs.com/)
* [MongoDB](https://www.mongodb.com/)

---

## 📜 License

This project is licensed under the **MIT License**.

```


