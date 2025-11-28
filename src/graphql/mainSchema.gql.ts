import { GraphQLSchema } from 'graphql'
import { queryType } from './query/modules/query';



const mainSchema = new GraphQLSchema ({
    query : queryType
})

export default mainSchema;