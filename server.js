const express = require("express")
const expressgraphQL = require("express-graphql").graphqlHTTP
const schema = require("./schema/schema")

const app = express()

// In line 9, since we are using ES6 syntax here, we do not need to assign key-value objects
// So schema:schema == schema
app.use("/graphql", expressgraphQL({
  schema,
  graphiql: true    //Only intended for development
}))

app.listen(4000, ()=>{
  console.log("Port listening to 4000");
})