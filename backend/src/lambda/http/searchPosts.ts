import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { searchPost } from '../../businessLogic/posts'
import { getUserId } from '../utils';
import { SearchPostRequest } from '../../requests/SearchPostRequest'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event)
    const requestSearchNote: SearchPostRequest = JSON.parse(event.body)
    const notes = await searchPost(userId, requestSearchNote.keyword)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: notes
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
