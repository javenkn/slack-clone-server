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
    directMessages(teamId: ID!, otherUserId: ID!): [DirectMessage!]!
  }

  type Mutation {
    createDirectMessage(receiverId: ID!, teamId: ID!, text: String!): Boolean!
  }
`;
