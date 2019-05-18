export default `
  type User {
    id: Int!
    username: String!
    email: String!
    teams: [Team!]! 
  }

  type Query {
    getUser(id: Int!): User!
    allUsers: [User!]!
  }

  type RegisterResponse {
    ok: Boolean!
    user: User
    errors: [Error!]
  }

  type LoginResponse {
    ok: Boolean!
    token: String
    errors: [Error!]
  }

  type Mutation {
    login(email: String!, password: String!): LoginResponse!
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): RegisterResponse!
  }
`;
