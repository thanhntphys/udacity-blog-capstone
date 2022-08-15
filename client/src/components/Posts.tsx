import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createPost, deletePost, getPosts, patchPost, searchPosts } from '../api/posts-api'
import Auth from '../auth/Auth'
import { Post } from '../types/Post'
import { SearchPostRequest } from '../types/SearchPostRequest'

interface PostsProps {
  auth: Auth
  history: History
}

interface PostsState {
  posts: Post[]
  newPostTitle: string
  searchPost: string
  loadingPosts: boolean
}

export class Posts extends React.PureComponent<PostsProps, PostsState> {
  state: PostsState = {
    posts: [],
    newPostTitle: '',
    searchPost: '',
    loadingPosts: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostTitle: event.target.value })
  }
  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchPost: event.target.value })
  }

  onEditButtonClick = (postId: string) => {
    this.props.history.push(`/posts/${postId}/edit`)
  }

  onPostCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newPost = await createPost(this.props.auth.getIdToken(), {
        title: this.state.newPostTitle,
        dueDate
      })
      this.setState({
        posts: [...this.state.posts, newPost],
        newPostTitle: ''
      })
    } catch {
      alert('Post creation failed')
    }
  }

  onPostSearch = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const searchPost = this.state.searchPost
      console.log('Search post with keyword: ', searchPost)

      if (searchPost) {
        console.log('Enter search post')
        const searchReq:SearchPostRequest = {keyword: searchPost}

        const posts = await searchPosts(this.props.auth.getIdToken(), searchReq)
        this.setState({
          posts,
          loadingPosts: false
        })
      } else {
        console.log('Empty search. Enter fetch post')
        this.componentDidMount()
      }
    } catch (e) {
      if (e instanceof Error) {
        alert(`Failed to fetch posts: ${e.message}`)
      }
    }
  }

  onPostDelete = async (postId: string) => {
    try {
      await deletePost(this.props.auth.getIdToken(), postId)
      this.setState({
        posts: this.state.posts.filter(post => post.postId !== postId)
      })
    } catch {
      alert('Post deletion failed')
    }
  }

  // onTodoCheck = async (pos: number) => {
  //   try {
  //     const todo = this.state.todos[pos]
  //     await patchPost(this.props.auth.getIdToken(), todo.todoId, {
  //       name: todo.name,
  //       dueDate: todo.dueDate,
  //       done: !todo.done
  //     })
  //     this.setState({
  //       todos: update(this.state.todos, {
  //         [pos]: { done: { $set: !todo.done } }
  //       })
  //     })
  //   } catch {
  //     alert('Post deletion failed')
  //   }
  // }

  async componentDidMount() {
    try {
      const posts = await getPosts(this.props.auth.getIdToken())
      this.setState({
        posts,
        loadingPosts: false
      })
    } catch (e) {
      if (e instanceof Error) {
        alert(`Failed to fetch posts: ${e.message}`)
      }
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">POSTs</Header>
        {this.renderPostSearch()}
        {this.renderCreatePostInput()}

        {this.renderPosts()}
      </div>
    )
  }

  renderPostSearch() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'search',
              content: 'Search post name',
              onClick: this.onPostSearch
            }}
            fluid
            actionPosition="left"
            placeholder="Search your note here..."
            onChange={this.handleSearch}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderCreatePostInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New post',
              onClick: this.onPostCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPosts() {
    if (this.state.loadingPosts) {
      return this.renderLoading()
    }

    return this.renderPostsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderPostsList() {
    return (
      <Grid padded>
        {this.state.posts.map((post, pos) => {
          return (
            <Grid.Row key={post.postId}>
              {/* <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  // onChange={() => this.onTodoCheck(pos)}
                  // checked={post.done}
                />
              </Grid.Column> */}
              <Grid.Column width={10} verticalAlign="middle">
                {post.title}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {post.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(post.postId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPostDelete(post.postId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {post.attachmentUrl && (
                <Image src={post.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
