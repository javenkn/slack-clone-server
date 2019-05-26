export default `
  type DirectMessage {
    id: ID!
    text: String!
    sender: User!
    receiverId: ID!
    createdAt: String!
  }

  type Subscription {
    messageCreated(channelId: ID!): Message!
  }

  type Query {
    directMessages: [DirectMessage!]!
  }

  type Mutation {
    createDirectMessage(receiverId: ID!, text: String!): Boolean!
  }
`;
