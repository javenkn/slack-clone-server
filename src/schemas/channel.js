export default `
  type Channel {
    id: ID!
    name: String!
    public: Boolean!
    messages: [Message!]!
    users: [User!]!
  }

  type Mutation {
    createChannel(name: String!, teamId: ID!, public: Boolean=false): Boolean!
  }
`;
