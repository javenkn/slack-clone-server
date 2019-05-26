export default `
  type Team {
    id: ID!
    name: String!
    members: [User!]!
    channels: [Channel!]!
    admin: Boolean!
  }

  type CreateTeamResponse {
    ok: Boolean!
    team: Team
    errors: [Error!]
  }

  type VoidResponse {
    ok: Boolean!
    errors: [Error!]
  }

  type Query {
    allTeams: [Team!]!
    memberOfTeams: [Team!]!
  }

  type Mutation {
    createTeam(name: String!): CreateTeamResponse!
    addTeamMember(email: String!, teamId: ID!): VoidResponse!
  }
`;
