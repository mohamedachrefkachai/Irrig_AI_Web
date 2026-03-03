import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Task from '@/models/Task';
import Worker from '@/models/Worker';
import mongoose from 'mongoose';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
    }

    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    console.log('Token:', token);

    // Parse token format: mobile_USERID_TIMESTAMP
    const parts = token.split('_');
    console.log('Token parts:', parts.length, parts[0]);
    
    if (parts.length < 2 || parts[0] !== 'mobile') {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }

    const userId = parts[1];
    console.log('User ID from token:', userId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid ObjectId format');
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 401 });
    }

    // Find worker by user_id (convert string to ObjectId)
    const worker = await Worker.findOne({ user_id: new mongoose.Types.ObjectId(userId) });
    console.log('Worker found:', worker ? worker._id : 'Not found');
    
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    // Get task
    const task = await Task.findById(id);
    console.log('Task found:', task ? task._id : 'Not found');
    console.log('Task worker_id:', task?.worker_id);
    console.log('Worker _id:', worker._id);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify worker owns this task
    if (task.worker_id.toString() !== worker._id.toString()) {
      console.log('Authorization failed - worker mismatch');
      return NextResponse.json({ error: 'Not authorized to update this task' }, { status: 403 });
    }

    // Get new status from request body
    const { status } = await request.json();
    console.log('New status:', status);
    
    // Validate status
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be TODO, IN_PROGRESS, or DONE' },
        { status: 400 }
      );
    }

    // Update task status
    task.status = status;
    await task.save();
    console.log('Task updated successfully');

    return NextResponse.json({
      success: true,
      task: {
        id: task._id.toString(),
        farm_id: task.farm_id,
        worker_id: task.worker_id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
        created_at: task.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'Failed to update task status', details: error.message },
      { status: 500 }
    );
  }
}
