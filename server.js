const express = require("express")
const expressgraphQL = require("express-graphql").graphqlHTTP

const app = express()

app.use("/graphql", expressgraphQL({
  graphiql: true    //Only intended for development
}))

app.listen(4000, ()=>{
  console.log("Port listening to 4000");
})