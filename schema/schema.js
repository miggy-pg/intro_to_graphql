const graphql = require("graphql")
// Lodash helps us walk through collections of data and work through collections of data. (a helper library)
// So it will walk through the users(line 12)
const _ = require("lodash")

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema   //takes in a root query and returns a GraphQL schema instance
} = graphql

const users = [
  {id: '23', firstName: 'Bill', age: 20},
  {id: '47', firstName: 'Samantha', age: 24}
]



// We are using 'GraphQLObjectType' to instruct GraphQL about the presence of a user in our application
// Think of it similarly to a MongoDB schema(POV)
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {type: GraphQLString},
    firstName: {type: GraphQLString},
    age: {type: GraphQLInt}
  }
})

// The field in our RootQuery will be interesting because of its purpose
// PURPOSE: Allow GraphQL to jump and land into a very specific node from our data

// HOW THIS WORKS:
// 'user': this means look for me a user  
// 'args'(arguments): is the field/parameter we need to provide in this object/instance which in any case the 'id' of the user. 
// 'type': means that it will return the user
// 'resolve': is a function where it goes to the database/datastore and find the actual data we are looking for
// resolve params:  
//           'parentValue' = somewhat notorious because it won't be used ever
//           'args' = the actual object that gets called with whatever arguments were passed into the original query.
//                    For example, in our 'args' parameter, if we declare/assign an 'id', the 'id' data will also be present when we display the data in our resolve 'args'
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: {
        id: {type: GraphQLString}
      },
      resolve(parentValue, args){
        return _.find(users, {id:args.id})
      }
    }
  }
})  

//The GraphQLSchema takes in a root query and returns a GraphQL schema instance
module.exports = new GraphQLSchema({
  query: RootQuery,
})