export default `
  type Channel {
    id: ID!
    name: String!
    public: Boolean!
    messages: [Message!]!
    users: [User!]!
    dm: Boolean!
  }

  type ChannelResponse {
    ok: Boolean!
    channel: Channel
    errors: [Error!]
  }

  type DMChannelResponse {
    id: ID!
    name: String!
  }

  type Mutation {
    createChannel(name: String!, teamId: ID!, public: Boolean=true, dm: Boolean=false, members: [ID!]): ChannelResponse!
    getDMChannel(teamId: ID!, members: [ID!]!): DMChannelResponse!
  }
`;
