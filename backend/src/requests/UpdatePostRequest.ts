/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdatePostRequest {
  title: string
  dueDate: string
  body: string
}