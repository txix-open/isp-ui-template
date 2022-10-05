import { ErrorMessage } from '@hookform/error-message';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';

import { IFormData } from './defaultValue';
import './from-container.scss';

interface FormContainerProps {
  defaultValues: IFormData;
}

export default function FormContainer({ defaultValues }: FormContainerProps) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<IFormData>({
    defaultValues,
    mode: 'onChange',
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cities',
  });

  const sleep = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const onSubmit: SubmitHandler<IFormData> = (data) => {
    sleep(3000)
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('data', data);
        setError('profile.firstName', { type: 'validate', message: 'test' });
      })
      .catch(() => {});
  };
  const renderErrorMessage = (fiendName: string) => (
    <ErrorMessage
      errors={errors}
      name={fiendName}
      render={({ message }) => <p className="form__error-field">{message}</p>}
    />
  );

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form__nested-wrapper">
        <h2>nested obj</h2>
        <div className="form__nested-wrapper__form-fields">
          <div>
            <input
              placeholder="First Name"
              {...register('profile.firstName', {
                required: {
                  value: true,
                  message: 'Поле является обязательным',
                },
                minLength: {
                  value: 2,
                  message: 'Имя не может быть короче 2 символов',
                },
              })}
            />
            {renderErrorMessage('profile.firstName')}
          </div>
          <input placeholder="Last Name" {...register('profile.lastName')} />
          <div>
            <input
              placeholder="Age"
              {...register('profile.age', {
                validate: async (value) => {
                  await sleep(1000);
                  return (
                    (value >= 10 && value <= 99) ||
                    'Неверные параметры возраста'
                  );
                },
              })}
            />
            {renderErrorMessage('profile.age')}
          </div>
        </div>
      </div>
      <div className="form__array-fields__wrapper">
        <h2>array fields</h2>
        <button
          onClick={() => append({ name: '', description: '', beenHere: false })}
        >
          Добавить поле
        </button>
        {fields.map((field, index) => (
          <div className="form__array-fields__wrapper__fields" key={field.id}>
            <input
              placeholder="Название города"
              {...register(`cities.${index}.name`, {
                required: {
                  value: true,
                  message: 'Поле обязательное',
                },
              })}
            />
            {renderErrorMessage(`cities.${index}.name`)}
            <input
              placeholder="Описание города"
              {...register(`cities.${index}.description`)}
            />
            <label htmlFor="beenHere">
              <input
                type="checkbox"
                id="beenHere"
                {...register(`cities.${index}.beenHere`)}
              />
              Были здесь
            </label>
            <button onClick={() => remove(index)}>Удалить</button>
          </div>
        ))}
      </div>
      <input type="submit" />
    </form>
  );
}
