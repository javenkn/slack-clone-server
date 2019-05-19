export default `
  type Message {
    id: ID!
    text: String!
    user: User!
    channel: Channel!
  }

  type Mutation {
    createMessage(channelId: ID!, text: String!): Boolean!
  }
`;
