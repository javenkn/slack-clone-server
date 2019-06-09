export default `
  scalar DateTime

  type Message {
    id: ID!
    text: String
    user: User!
    channel: Channel!
    createdAt: DateTime!
    url: String
    fileType: String
  }

  type Subscription {
    messageCreated(channelId: ID!): Message!
  }

  type Query {
    messages(channelId: ID!, cursor: String): [Message!]!
  }

  type Mutation {
    createMessage(channelId: ID!, text: String, file: Upload): Boolean!
  }
`;
