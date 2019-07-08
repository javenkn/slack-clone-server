export default `
  type User {
    id: ID!
    username: String!
    email: String!
    teams: [Team!]! 
    color: String!
  }

  type Query {
    me: User!
    getUser(userId: ID!): User!
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
