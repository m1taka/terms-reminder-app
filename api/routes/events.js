const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Event = require('../models/Event');

// GET all events with filters
router.get('/', [
  query('date').optional().isISO8601(),
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000 }),
  query('type').optional().isString(),
  query('status').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, month, year, type, status } = req.query;
    const filter = {};

    if (date) {
      const queryDate = new Date(date);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: queryDate, $lt: nextDay };
    } else if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      filter.date = { $gte: startDate, $lt: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    const events = await Event.find(filter)
      .populate('documentId')
      .sort({ date: 1, time: 1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('documentId');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST create new event
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('type').optional().isIn(['meeting', 'deadline', 'court', 'consultation', 'reminder']),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled']),
  body('attendees').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = new Event(req.body);
    await event.save();

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT update event
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('date').optional().isISO8601(),
  body('time').optional().notEmpty(),
  body('type').optional().isIn(['meeting', 'deadline', 'court', 'consultation', 'reminder']),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled']),
  body('attendees').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('documentId');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
