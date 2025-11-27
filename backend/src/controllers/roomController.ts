import { Request, Response } from 'express';
import Room from '../models/Room';

export const createRoom = async (req: Request, res: Response) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    const { roomType } = req.query;
    const query = roomType ? { roomType } : {};
    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const initializeRooms = async (req: Request, res: Response) => {
  try {
    const defaultRooms = [
      { roomNumber: 'Lab1', roomType: 'lab', capacity: 30, facilities: ['Projector', 'Whiteboard'], isAvailable: true },
      { roomNumber: 'Lab2', roomType: 'lab', capacity: 30, facilities: ['Projector', 'Whiteboard'], isAvailable: true },
      { roomNumber: 'Lab3', roomType: 'lab', capacity: 30, facilities: ['Projector', 'Whiteboard'], isAvailable: true },
      { roomNumber: 'CR1', roomType: 'classroom', capacity: 50, facilities: ['Projector', 'Whiteboard'], isAvailable: true },
      { roomNumber: 'CR2', roomType: 'classroom', capacity: 50, facilities: ['Projector', 'Whiteboard'], isAvailable: true },
      { roomNumber: 'CR3', roomType: 'classroom', capacity: 50, facilities: ['Projector', 'Whiteboard'], isAvailable: true },
      { roomNumber: 'CR4', roomType: 'classroom', capacity: 50, facilities: ['Projector', 'Whiteboard'], isAvailable: true },
      { roomNumber: 'CR5', roomType: 'classroom', capacity: 50, facilities: ['Projector', 'Whiteboard'], isAvailable: true },
    ];

    const createdRooms = [];
    for (const roomData of defaultRooms) {
      const existing = await Room.findOne({ roomNumber: roomData.roomNumber });
      if (!existing) {
        const room = new Room(roomData);
        await room.save();
        createdRooms.push(room);
      } else {
        createdRooms.push(existing);
      }
    }

    res.json({ message: 'Rooms initialized', rooms: createdRooms });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
