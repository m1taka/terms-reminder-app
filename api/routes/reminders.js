const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
const googleCalendar = require('../services/googleCalendar');

// GET all reminders with filters
router.get('/', [
  query('status').optional().isString(),
  query('type').optional().isString(),
  query('priority').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, type, priority } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (priority) {
      filter.priority = priority;
    }

    const reminders = await Reminder.find(filter)
      .populate('documentId')
      .sort({ dueDate: 1 });
    
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// GET today's reminders
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reminders = await Reminder.find({
      reminderDate: { $gte: today, $lt: tomorrow },
      status: 'active'
    }).populate('documentId').sort({ reminderDate: 1 });

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching today\'s reminders:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s reminders' });
  }
});

// GET single reminder
router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id).populate('documentId');
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: 'Failed to fetch reminder' });
  }
});

// POST create new reminder
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('reminderDate').isISO8601().withMessage('Valid reminder date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('category').isIn(['legal', 'administrative', 'client', 'court', 'deadline', 'meeting']),
  body('type').optional().isIn(['manual', 'deadline', 'court', 'filing', 'meeting']),
  body('status').optional().isIn(['active', 'dismissed', 'completed', 'snoozed']),
  body('documentId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid document ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Clean up empty string fields that should be undefined for ObjectId references
    const reminderData = { ...req.body };
    if (reminderData.documentId === '' || reminderData.documentId === null) {
      delete reminderData.documentId;
    }
    if (reminderData.assignedTo === '') {
      delete reminderData.assignedTo;
    }
    if (reminderData.relatedCase === '') {
      delete reminderData.relatedCase;
    }
    if (reminderData.contractParty1 === '') {
      delete reminderData.contractParty1;
    }
    if (reminderData.contractParty2 === '') {
      delete reminderData.contractParty2;
    }
    if (reminderData.extractedContext === '') {
      delete reminderData.extractedContext;
    }

    const reminder = new Reminder(reminderData);
    await reminder.save();

    // Create Google Calendar event asynchronously (don't block response)
    if (googleCalendar.isConfigured) {
      googleCalendar.createEvent(reminder)
        .then(eventId => {
          if (eventId) {
            reminder.googleCalendarEventId = eventId;
            return reminder.save();
          }
        })
        .catch(err => console.error('Failed to create calendar event:', err));
    }

    res.status(201).json({ message: 'Reminder created successfully', reminder });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// PUT update reminder
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('dueDate').optional().isISO8601(),
  body('reminderDate').optional().isISO8601(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('category').optional().isIn(['legal', 'administrative', 'client', 'court', 'deadline', 'meeting']),
  body('status').optional().isIn(['active', 'dismissed', 'completed', 'snoozed']),
  body('documentId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid document ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Clean up empty string fields that should be undefined for ObjectId references
    const updateData = { ...req.body };
    if (updateData.documentId === '' || updateData.documentId === null) {
      delete updateData.documentId;
    }
    if (updateData.assignedTo === '') {
      delete updateData.assignedTo;
    }
    if (updateData.relatedCase === '') {
      delete updateData.relatedCase;
    }
    if (updateData.contractParty1 === '') {
      delete updateData.contractParty1;
    }
    if (updateData.contractParty2 === '') {
      delete updateData.contractParty2;
    }
    if (updateData.extractedContext === '') {
      delete updateData.extractedContext;
    }

    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('documentId');

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Update Google Calendar event if it exists
    if (googleCalendar.isConfigured && reminder.googleCalendarEventId) {
      googleCalendar.updateEvent(reminder.googleCalendarEventId, reminder)
        .catch(err => console.error('Failed to update calendar event:', err));
    }

    res.json({ message: 'Reminder updated successfully', reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// PUT dismiss reminder
router.put('/:id/dismiss', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'dismissed' } },
      { new: true }
    ).populate('documentId');

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder dismissed successfully', reminder });
  } catch (error) {
    console.error('Error dismissing reminder:', error);
    res.status(500).json({ error: 'Failed to dismiss reminder' });
  }
});

// PUT snooze reminder
router.put('/:id/snooze', [
  body('snoozeUntil').isISO8601().withMessage('Valid snooze date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status: 'snoozed',
          snoozeUntil: req.body.snoozeUntil,
          reminderDate: req.body.snoozeUntil
        } 
      },
      { new: true }
    ).populate('documentId');

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder snoozed successfully', reminder });
  } catch (error) {
    console.error('Error snoozing reminder:', error);
    res.status(500).json({ error: 'Failed to snooze reminder' });
  }
});

// DELETE reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Delete Google Calendar event if it exists
    if (googleCalendar.isConfigured && reminder.googleCalendarEventId) {
      googleCalendar.deleteEvent(reminder.googleCalendarEventId)
        .catch(err => console.error('Failed to delete calendar event:', err));
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

module.exports = router;
