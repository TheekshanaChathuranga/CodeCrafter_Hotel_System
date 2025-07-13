import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events';

const eventService = {
  async getAllEvents() {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  async createEvent(eventData) {
    try {
      const response = await axios.post(API_URL, eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  async updateEvent(id, eventData) {
    try {
      console.log('Updating event with data:', eventData);
      const response = await axios.put(`${API_URL}/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  async deleteEvent(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  }
};

export default eventService; 