import { SchemaDirectiveVisitor } from 'graphql-tools'

class HideTheFieldDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    field.resolve = async (...args) => 'Not allowed to show'
  }
  visitArgumentDefinition(argument) {
    argument.resolve = async (...args) => 'Not allowed to show'
  }
  visitInputFieldDefinition(field) {
    field.resolve = async (...args) => 'Not allowed to show'
  }
}

export default HideTheFieldDirective

