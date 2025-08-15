import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { nhost } from './nhost';

const httpLink = createHttpLink({
  uri: 'https://xsmfvktixtwwonlrgqsd.hasura.ap-south-1.nhost.run/v1/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  try {
    // Ensure the session is fresh before getting the token
    const session = await nhost.auth.refreshSession();
    const token = session?.accessToken || (await nhost.auth.getAccessToken());

    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  } catch (err) {
    console.error('Error getting access token:', err);
    return { headers };
  }
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
