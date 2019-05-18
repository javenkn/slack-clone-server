/**
 * Wraps resolver for authentication
 */
const createResolver = resolver => {
  const baseResolver = resolver;
  baseResolver.createResolver = childResolver => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

/**
 * Runs require auth before the childResolver
 */
export const requiresAuth = createResolver((parent, args, { userId }) => {
  if (!userId) {
    throw new Error('Not authenticated');
  }
});
