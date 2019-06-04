export default `
  type Message {
    id: ID!
    text: String
    user: User!
    channel: Channel!
    createdAt: String!
    url: String
    fileType: String
  }

  type Subscription {
    messageCreated(channelId: ID!): Message!
  }

  type Query {
    messages(channelId: ID!, offset: Int!): [Message!]!
  }

  type Mutation {
    createMessage(channelId: ID!, text: String, file: Upload): Boolean!
  }
`;
