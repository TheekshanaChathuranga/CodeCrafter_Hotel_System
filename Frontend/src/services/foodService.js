const API_URL = '/api/fooditems';

const foodService = {
  getAllFoodItems: async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch food items');
    }
    return response.json();
  },
};

export default foodService; 