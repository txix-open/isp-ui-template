import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchUsers } from '../../store/reducers/ActionCreators';

export default function UserContainer() {
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector(
    (state) => state.userReducer,
  );

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  if (isLoading) {
    return <h1>Идет загрузка....</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return <div className="user-container">{JSON.stringify(users, null, 2)}</div>;
}
