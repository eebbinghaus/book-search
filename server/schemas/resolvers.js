const { Book, User } = require("../models");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("Must be logged in");
    },
  },

  Mutations: {
    addUser: async (parent, { user, email, password }) => {
      const user = await User.create({ user, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const userbook = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: bookData },
          },
          {
            new: true,
          }
        );
        return userbook;
      }
      throw new AuthenticationError("Must be logged In...");
    },
    deleteBook: async (parent, { bookId }, context) => {
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user with this email found!");
      }

      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(user);
      return { token, user };
    },
  },
};
