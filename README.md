# Prism - GraphQL Client



Installation
----------
```
npm install prism-client graphql

yarn add prism-client graphql 
```

Usage
----------

#### `createResolver()`

```js
import { createResolver } from 'prism-client';

const Resolver = createResolver({
  host: 'http://localhost:3001',
  headers: { Authorization: 'Bearer 12345' }
});
```

#### `new Resolver()`

```js
const postResolver = new Resolver({
  url: '/posts',
  entityName: 'posts',
  serialize: underscore
});
```

#### Resolver - HTTP actions

- `resolver.index()` - GET (collection)

  ```js
  Query: {
    posts: postResolver.index({
      url: ({title}) => ({ params: {title} })
    })
  }
  ```

- `resolver.show()` - GET

  ```js
  Query: {
    post: postResolver.show()
  }
  ```

- `resolver.create()` - POST

  ```js
  Mutation: {
    addPost: postResolver.create()
  }
  ```
- `resolver.update()` - PUT (or PATCH)

  ```js
  Mutation: {
    editPost: postResolver.update()
  }
  ```

- `resolver.delete()` - DELETE

  ```js
  deleteComment: commentResolver.delete({
    update: ({posts}, {id}) => remove(posts, 'commentIds', id)
  })
  ```
