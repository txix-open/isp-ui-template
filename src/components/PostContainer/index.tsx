import { useNavigate } from 'react-router-dom';

import { postService } from '../../services/PostService';
import { IPost } from '../../types/IPost';
import PostItem from './PostItem';

export default function PostContainer() {
  const { data: posts, isLoading, error } = postService.useFetchAllQuery(100);
  const navigate = useNavigate();
  const [create, {}] = postService.useCreateMutation();
  const [update, {}] = postService.useUpdateMutation();
  const [remove, {}] = postService.useRemoveMutation();

  if (isLoading) {
    return <h1>Загрузка.....</h1>;
  }
  if (error) {
    return <h1>Ошибка</h1>;
  }

  const handleCreate = async () => {
    const title = prompt('');
    await create({ title, body: title } as IPost);
  };

  const handleRemove = (post: IPost) => {
    remove(post);
  };

  const handleUpdate = (post: IPost) => {
    update(post);
  };

  return (
    <div className="post__list">
      <button onClick={() => navigate('/users')}>users</button>
      <button onClick={handleCreate}>добавить новый опрос</button>
      {posts &&
        posts.map((post) => (
          <PostItem
            remove={handleRemove}
            update={handleUpdate}
            key={post.id}
            post={post}
          />
        ))}
    </div>
  );
}
