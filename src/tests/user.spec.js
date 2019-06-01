import axios from 'axios';

describe('user resolvers', () => {
  test('all users', async () => {
    const response = await axios.post('http://localhost:3000/graphql', {
      query: `
        query {
          allUsers {
            id
            username
            email
          }
        }
      `,
    });

    const { data } = response;
    expect(data).toMatchObject({
      data: {
        allUsers: [],
      },
    });
  });

  test('register', async () => {
    const response = await axios.post('http://localhost:3000/graphql', {
      query: `
        mutation {
          register(username:"test", email:"test@test.com", password:"test123") {
            ok
            errors {
              path
              message
            }
            user {
              username
              email
            }
          }
        }
      `,
    });

    const { data } = response;
    expect(data).toMatchObject({
      data: {
        register: {
          ok: true,
          errors: null,
          user: {
            username: 'test',
            email: 'test@test.com',
          },
        },
      },
    });

    const loginResponse = await axios.post('http://localhost:3000/graphql', {
      query: `
        mutation {
          login(email:"test@test.com", password:"test123") {
            token
          }
        }
      `,
    });

    const {
      data: {
        login: { token },
      },
    } = loginResponse.data;

    const teamResponse = await axios.post(
      'http://localhost:3000/graphql',
      {
        query: `
          mutation {
            createTeam(name: "team1") {
              ok
              team {
                name
              }
            }
          }
      `,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    expect(teamResponse.data).toMatchObject({
      data: {
        createTeam: {
          ok: true,
          team: {
            name: 'team1',
          },
        },
      },
    });
  });
});
