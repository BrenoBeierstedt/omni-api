export const User = `
type C650USR{
  usr_cod:ID
  username: String!
  full_name: String!
  email: String! 
  password: String! @hideTheField
  avatar: String
  settings: [Settings] @relation(name: "HAS_SETTINGS", direction: "OUT")
  isActive: Boolean!  
  locations:[Location] @relation(name: "OWN_LOCATION", direction:"OUT")
  Zones:[Zone] @relation(name: "OWN_ZONE", direction:"OUT")
  Devices:[Device] @relation(name: "OWN_DEVICE", direction:"OUT")
  roles: [Role] @relation(name: "PLAYS", direction: "OUT")

}
`

/* Queries */
export const Users = `
  Users(full_name: String): [C650USR]
`

export const UserById = `
  UserById(usr_cod: String!): [C650USR]
`

export const UsersByName = `
  UsersByName(substring: String): [C650USR]
    @cypher(
      statement: "MATCH (u:C650USR) WHERE u.full_name CONTAINS $substring and u.isActive=true RETURN u"
    )
`

/* Mutations */
export const CreateUser = `
  CreateUser (
    searchUserInput: searchUserInput
    dataUserInput: dataUserInput
  ): C650USR
    @cypher(
      statement: 
        "MATCH (p:Phone {phone_country: $phoneInput.phone_country, phone_number: $phoneInput.phone_number}) \
        MERGE (u:C650USR {email: $searchUserInput.email}) \
        ON CREATE SET \
          u.ID = apoc.create.uuid(), \
          u.full_name = $dataUserInput.full_name, \
          u.email = $searchUserInput.email, \
          u.password = $dataUserInput.password, \
          u.token = $dataUserInput.token, \
          u.created = datetime(), \
          u.softDeleted = false, \
          u.verified = false \
        ON MATCH SET \
          u.full_name = $dataUserInput.full_name, \
          u.password = $dataUserInput.password, \
          u.token = $dataUserInput.token, \
          u.updated = datetime() \
        MERGE (r:Role {name: 'SUBSCRIBER'}) \
        CREATE (u)-[rp:PLAYS]->(r) \
        CREATE (u)-[rhp:HAS_PHONE]->(p) \
        MERGE(s:Settings { \
          ID: apoc.create.uuid(), \
          allow_location: true, \
          push_notification: true, \
          reminders_push_notification: true, \
          reminders_emails: true, \
          reminders_text_messages: true, \
          promotions_tips_push_notification: true, \
          promotions_tips_emails: true, \
          promotions_tips_text_messages: true}) \
        CREATE (u)-[ust:HAS_SETTINGS]->(s) \
        RETURN u"
    )
`

export const UpdateUser = `
  UpdateUser (
    searchUserInput: searchUserInput
    dataUserInput: dataUserInput
  ): C650USR
    @cypher(
      statement: 
        "MERGE (u:C650USR {email: $searchUserInput.email}) \
        ON CREATE SET \
          u.id = apoc.create.uuid(), \
          u.first_name = $dataUserInput.first_name, \
          u.last_name = $dataUserInput.last_name, \
          u.email = $searchUserInput.email, \
          u.password = $dataUserInput.password, \
          u.created = datetime(), \
          u.softDeleted = false, \
          u.verified = false \
        ON MATCH SET \
          u.last_name = $dataUserInput.full_name, \
          u.email = $dataUserIpnut.email, \
          u.password = $dataUserInput.password, \
          u.verified = $dataUserInput.verified, \
          u.updated = datetime() \
        RETURN u"
    )
`

export const LoginUser = `
  LoginUser (
    loginUserInput: loginUserInput
  ): LoginUser
`

export const ForgotPassword = `
  ForgotPassword (
    phoneInput: phoneInput
  ): Boolean
`

export const UserInputs = `
input searchUserInput {
  email: String!
}

input dataUserInput {
  full_name: String!
  password: String!
}

input loginUserInput {
  phone_country: String!
  phone_number: String!
  password: String!
}
`
