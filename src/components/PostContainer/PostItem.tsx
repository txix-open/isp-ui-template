import { MouseEvent } from 'React';

import { IPost } from '../../types/IPost';

interface PostItemProps {
  post: IPost;
  remove: (post: IPost) => void;
  update: (post: IPost) => void;
}

export default function PostItem({ post, remove, update }: PostItemProps) {
  const handleRemove = (event: MouseEvent) => {
    event.stopPropagation();
    remove(post);
  };

  const handleUpdate = () => {
    const title = prompt() || '';
    update({ ...post, title });
  };

  return (
    <div role="presentation" className="post" onClick={handleUpdate}>
      {post.id}. {post.title}
      <button onClick={handleRemove}>Delete</button>
    </div>
  );
}
