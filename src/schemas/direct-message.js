export default `
  type DirectMessage {
    id: ID!
    text: String!
    sender: User!
    receiverId: ID!
    createdAt: String!
  }

  type Subscription {
    directMessageCreated(teamId: ID!, userId: ID!): DirectMessage!
  }

  type Query {
    directMessages(teamId: ID!, otherUserId: ID!): [DirectMessage!]!
  }

  type Mutation {
    createDirectMessage(receiverId: ID!, teamId: ID!, text: String!): Boolean!
  }
`;
