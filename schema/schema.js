const graphql = require("graphql")
const axios = require("axios")

// We don't need to use lodash since we will be using 'axios'
// Lodash helps us walk through collections of data and work through collections of data. (a helper library)
// So it will walk through the users(line 12)
// const _ = require("lodash")

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema   //takes in a root query and returns a GraphQL schema instance
} = graphql

// If you encounter circular references, add an arrow function in the fields.
// This means that wait for UserType to load before running CompanyType because we are using UserType for returns the
// list of users from a company. (Closures)
// Example:
// Before:      fields: { id: {type:GraphQLString}}
// After:       fields: ()=> ({ id: {type:GraphQLString}})
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    description: {type: GraphQLString},
    users: {    // teach GraphQL to return list of users from a company
      type: new GraphQLList(UserType),
      resolve(parentValue, args){
        console.log("company: ", parentValue);
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`).then(res => res.data)
      }
    }
  })
})

// We are using 'GraphQLObjectType' to instruct GraphQL about the presence of a user in our application
// Think of it similarly to a MongoDB schema(POV)
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: ()=> ({
    id: {type: GraphQLString},
    firstName: {type: GraphQLString},
    age: {type: GraphQLInt},
    company: {
      type: CompanyType,
      resolve(parentValue, args){     // Using resolve, we can query to another object
        console.log("user: ",parentValue);
        return axios.get(`http://127.0.0.1:3000/companies/${parentValue.companyId}`).then(res => res.data)
      }
    }
  })
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
        console.log("rootQueryUser: ", args);
        console.log("parentValueRootQuery: ", parentValue);
        return axios.get(`http://127.0.0.1:3000/users/${args.id}`).then(res=> res.data)
        // const { data } = res
        // return data
      }
    },
    company: {
      type: CompanyType,
      args: {
        id: {type: GraphQLString}
      },
      resolve(parentValue, args){
        // The 'companies' data can be found in the db.json, similar to 'user'
        return axios.get(`http://127.0.0.1:3000/companies/${args.id}`).then(res=> res.data)
      }
    }
  }
})  

// The fields of the mutation describes the operation that it will gonna take
// So in this objecttype, instead of using 'user' or 'company' in the fields, we will use 'addUser'
// NOTE: The collection of data and the 'type' of data might not always be the same 
// Example: in the 'addUser' where we defined type: 'UserType' will not always be 'UserType' or return nothing at all
// GraphQLNonNull = ensures that whenever we use 'addUser', the 'firstName' and 'age' should not be null
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: {type: new GraphQLNonNull(GraphQLString)},
        age: {type: new GraphQLNonNull(GraphQLInt)},
        companyId: {type: GraphQLString}
      },
      resolve(parentValue, {firstName, age}){
        return axios.post("http://127.0.0.1:3000/users", { firstName, age }).then(res => res.data)
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        userId: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve(parentValue, {userId}){
        return axios.delete(`http://127.0.0.1:3000/users/${userId}`).then(res => res.data)
      }
    },
    editUser: {
      type: UserType,
      args: {
        userId: {type: new GraphQLNonNull(GraphQLString)},
        firstName: {type: GraphQLString},
        age: {type: GraphQLInt},
        companyId: {type: GraphQLString}
      },
      resolve(parentValue, args){
        // We can pass the whole args in this case because the third party 'json-server' ignores the 'id' property in args
        return axios.patch(`http://127.0.0.1:3000/users/${args.userId}`, args).then(res => res.data)
      }

    }
  }
})


//The GraphQLSchema takes in a root query and returns a GraphQL schema instance
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
})