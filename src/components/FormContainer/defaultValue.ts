type City = {
  name: string;
  description: string;
  beenHere: boolean;
};

export interface IFormData {
  profile: {
    firstName: string;
    lastName: string;
    age?: number;
  };
  cities: City[];
}

export const defaultValues: IFormData = {
  profile: {
    firstName: 'Petya',
    lastName: 'Petrov',
  },
  cities: [
    {
      name: 'Moscow',
      description: 'Moscow is a capital of Russia',
      beenHere: false,
    },
  ],
};
