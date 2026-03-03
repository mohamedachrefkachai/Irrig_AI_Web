# Task Assignment Feature Documentation

## Overview
Farm owners can now assign tasks to workers directly from the web dashboard. Workers will see these assigned tasks in their mobile app under the Tasks tab.

## Features Implemented

### 1. API Endpoints

#### POST /api/owner/tasks/create
Creates a new task and assigns it to a worker.

**Request Body:**
```json
{
  "farm_id": "farm_id_123",
  "worker_id": "worker_id_123",
  "title": "Check irrigation system",
  "description": "Inspect all valves and sensors",
  "priority": "HIGH",
  "due_date": "2026-03-10"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "id": "task_id_123",
    "farm_id": "farm_id_123",
    "worker_id": "worker_id_123",
    "title": "Check irrigation system",
    "description": "Inspect all valves and sensors",
    "priority": "HIGH",
    "status": "TODO",
    "due_date": "2026-03-10T00:00:00.000Z",
    "created_at": "2026-03-03T10:00:00.000Z"
  }
}
```

**Validation:**
- `farm_id`, `worker_id`, and `title` are required
- Worker must belong to the specified farm
- Farm must exist
- Priority: LOW | MEDIUM | HIGH (default: MEDIUM)
- Status: Always starts as TODO
- Due date is optional

**Error Responses:**
- `400` - Missing required fields or worker doesn't belong to farm
- `404` - Farm or worker not found
- `500` - Server error

#### GET /api/owner/tasks/list?farm_id={farmId}
Lists all tasks for a specific farm with worker details.

**Query Parameters:**
- `farm_id` (required) - The farm ID to get tasks for

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task_id_123",
      "farm_id": "farm_id_123",
      "worker": {
        "id": "worker_id_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "title": "Check irrigation system",
      "description": "Inspect all valves and sensors",
      "priority": "HIGH",
      "status": "TODO",
      "due_date": "2026-03-10T00:00:00.000Z",
      "created_at": "2026-03-03T10:00:00.000Z"
    }
  ]
}
```

**Features:**
- Returns tasks sorted by creation date (newest first)
- Populates worker details (name, email)
- Includes all task fields

### 2. Web Interface

#### Location
**URL:** `/owner/tasks`

**Access Points:**
1. **Sidebar Navigation** - "📋 Assign Tasks" button (blue)
2. **Header Quick Actions** - "📋 Tasks" button (orange)

#### Features

##### Task Assignment Form
- **Farm Selection** - Dropdown of all owner's farms
- **Worker Selection** - Dropdown filtered by selected farm
- **Task Title** - Required text input
- **Description** - Optional textarea
- **Priority** - Dropdown: Low, Medium, High
- **Due Date** - Date picker (optional)
- **Submit Button** - "Assign Task to Worker"

##### Task List View
- **Farm Filter** - Dropdown to select which farm's tasks to view
- **Status Filter** - Filter by TODO, IN_PROGRESS, or DONE
- **Task Cards** - Display all task details:
  - Title and description
  - Assigned worker name and email
  - Priority badge (color-coded)
  - Status badge (color-coded)
  - Due date (if set)

##### Color Coding
**Priority:**
- LOW: Gray badge
- MEDIUM: Yellow badge
- HIGH: Red badge

**Status:**
- TODO: Blue badge
- IN_PROGRESS: Orange badge
- DONE: Green badge

### 3. Mobile Integration

#### Worker Mobile App
Workers see assigned tasks automatically in the **Tasks Tab** of WorkerMainActivity.

**Data Source:**
- API: `GET /api/worker/info` (already returns tasks)
- Tasks are filtered by `worker_id` on backend
- Pulls task data: title, description, priority, status, due_date

**Display:**
- RecyclerView with WorkerTaskAdapter
- Pull-to-refresh to reload tasks
- Status and priority badges

## Complete Workflow

### 1. Owner Assigns Task (Web)

```
Owner logs in → Opens /owner/tasks
  ↓
Selects farm from dropdown
  ↓
Selects worker from dropdown (filtered by farm)
  ↓
Fills in task details:
  - Title: "Water Zone A"
  - Description: "Apply 50mm water"
  - Priority: HIGH
  - Due Date: 2026-03-05
  ↓
Clicks "Assign Task to Worker"
  ↓
POST /api/owner/tasks/create
  ↓
Task saved to database
  ↓
Success message displayed
  ↓
Task appears in filtered task list
```

### 2. Worker Sees Task (Mobile)

```
Worker opens mobile app
  ↓
Navigates to Tasks tab
  ↓
GET /api/worker/info (with token)
  ↓
Receives tasks array including new task
  ↓
WorkerTasksFragment displays tasks
  ↓
Worker sees:
  - "Water Zone A"
  - "Apply 50mm water"
  - Priority: HIGH (red badge)
  - Status: TODO (blue badge)
  - Due: March 5, 2026
```

## Database Schema

### Task Model
```javascript
{
  farm_id: ObjectId,        // Reference to Farm
  worker_id: ObjectId,      // Reference to Worker (not User!)
  title: String,
  description: String,
  priority: String,         // LOW, MEDIUM, HIGH
  status: String,           // TODO, IN_PROGRESS, DONE
  due_date: Date,
  created_at: Date
}
```

**Important:** `worker_id` references the **Worker** document, not the User document!

## Testing Guide

### Prerequisites
- Owner account with at least 1 farm
- At least 1 worker assigned to the farm
- Backend running on http://localhost:3000
- MongoDB connection active

### Test Scenario 1: Create Task via Web

**Steps:**
1. Login as owner at http://localhost:3000/login
2. Navigate to http://localhost:3000/owner/tasks
3. Select a farm from "Select Farm" dropdown
4. Select a worker from "Assign to Worker" dropdown
5. Enter task title: "Test Task - Water Plants"
6. Enter description: "Water all plants in Zone A"
7. Select priority: HIGH
8. Set due date: Tomorrow's date
9. Click "Assign Task to Worker"

**Expected Results:**
- ✅ Success message: "Task assigned successfully!"
- ✅ Form resets (except farm selection)
- ✅ If viewing the same farm in filter, task appears immediately in list

### Test Scenario 2: View Tasks by Farm

**Steps:**
1. On /owner/tasks page
2. Select a farm from "Filter by Farm" dropdown
3. Observe task list

**Expected Results:**
- ✅ Tasks for selected farm are displayed
- ✅ Each task shows worker name and email
- ✅ Priority and status badges are colored correctly
- ✅ Due dates are formatted properly

### Test Scenario 3: Filter Tasks by Status

**Steps:**
1. On /owner/tasks page with farm selected
2. Select "To Do" from "Filter by Status" dropdown
3. Select "Done" from "Filter by Status"

**Expected Results:**
- ✅ Tasks are filtered by selected status
- ✅ "All Statuses" shows all tasks

### Test Scenario 4: Worker Sees Task on Mobile

**Prerequisites:**
- Task created for worker in previous tests

**Steps:**
1. Open Android app
2. Login as the worker (email/password from owner's worker list)
3. Navigate to Tasks tab (default view)
4. Observe task list

**Expected Results:**
- ✅ Test task appears in list
- ✅ Title: "Test Task - Water Plants"
- ✅ Description: "Water all plants in Zone A"
- ✅ Priority: HIGH (red badge)
- ✅ Status: TODO (blue badge)
- ✅ Due date displayed

### Test Scenario 5: Pull to Refresh on Mobile

**Steps:**
1. On mobile Tasks tab
2. Swipe down to trigger refresh
3. Wait for loading spinner

**Expected Results:**
- ✅ Spinner appears during refresh
- ✅ Task list updates with latest data
- ✅ No errors displayed

### Test Scenario 6: Create Multiple Tasks

**Steps:**
1. On web /owner/tasks
2. Create 3 tasks:
   - Task 1: Priority LOW, Status will be TODO
   - Task 2: Priority MEDIUM
   - Task 3: Priority HIGH, Due date: 1 week from now
3. All assigned to same worker

**Expected Results:**
- ✅ All 3 tasks created successfully
- ✅ All appear in task list for that farm
- ✅ Mobile shows all 3 tasks for that worker
- ✅ Different priority colors displayed

### Test Scenario 7: No Workers Error

**Steps:**
1. Create a new farm with no workers
2. Go to /owner/tasks
3. Select the new farm

**Expected Results:**
- ✅ Worker dropdown shows "No workers available for this farm"
- ✅ Submit button still enabled but will fail validation
- ✅ Error message if trying to submit without worker

### Test Scenario 8: API Validation

**Using curl or Postman:**

```bash
# Test missing required field
curl -X POST http://localhost:3000/api/owner/tasks/create \
  -H "Content-Type: application/json" \
  -d '{
    "farm_id": "farm_id_123",
    "title": "Test"
  }'
# Expected: 400 - "farm_id, worker_id, and title are required"

# Test worker not in farm
curl -X POST http://localhost:3000/api/owner/tasks/create \
  -H "Content-Type: application/json" \
  -d '{
    "farm_id": "farm_A_id",
    "worker_id": "worker_from_farm_B_id",
    "title": "Test"
  }'
# Expected: 400 - "Worker does not belong to this farm"
```

## Edge Cases Handled

1. **No farms available** - Shows empty state in dropdown
2. **No workers in selected farm** - Shows warning message
3. **Farm filter not selected** - Shows "Select a farm to view tasks" message
4. **No tasks in farm** - Shows "No tasks found for this farm" message
5. **Worker belongs to different farm** - Backend validation prevents creation
6. **Optional fields empty** - Description and due_date can be null
7. **Invalid date format** - HTML5 date picker prevents invalid dates

## UI/UX Features

1. **Form validation** - Required fields marked with red asterisk
2. **Success feedback** - Green success message with auto-dismiss
3. **Error handling** - Red error messages with clear descriptions
4. **Loading states** - "Assigning Task..." button text during submission
5. **Responsive design** - Works on mobile, tablet, desktop
6. **Keyboard navigation** - All form fields are keyboard accessible
7. **Color coding** - Visual priority and status identification

## Files Modified/Created

### Created Files
1. `/app/api/owner/tasks/create/route.ts` - Task creation endpoint
2. `/app/api/owner/tasks/list/route.ts` - Task listing endpoint
3. `/app/owner/tasks/page.tsx` - Web UI for task management

### Modified Files
1. `/app/owner/layout.tsx` - Added navigation links for tasks
2. `/app/api/worker/info/route.ts` - Already returns tasks (no changes needed)

### No Changes Needed
1. `WorkerTasksFragment.java` - Already displays tasks
2. `Task.js` model - Already has correct schema
3. `ApiService.java` - getWorkerInfo() already includes tasks

## Performance Considerations

- **Task listing** - Sorted by created_at with MongoDB index recommended
- **Population** - Worker and user details populated in single query
- **Mobile** - Tasks fetched once on login, refreshed on pull-to-refresh
- **Filtering** - Client-side filtering for status (minimal data volume)

## Security

- ✅ Farm ownership verification (owner can only assign to their farms)
- ✅ Worker-farm association validation
- ✅ Worker can only see their own tasks (backend filtered by worker_id)
- ✅ Session-based authentication for web
- ✅ Token-based authentication for mobile

## Future Enhancements

1. **Task Status Updates** - Workers can mark tasks as IN_PROGRESS or DONE
2. **Task Photos** - Workers upload photo evidence of completion
3. **Task Comments** - Two-way communication about tasks
4. **Task Notifications** - Push notifications when task assigned
5. **Task Templates** - Common task templates for quick assignment
6. **Bulk Task Assignment** - Assign same task to multiple workers
7. **Task Analytics** - Completion rates, average time, etc.
8. **Recurring Tasks** - Auto-create tasks on schedule

## Troubleshooting

### Issue: Tasks not appearing in mobile app

**Solutions:**
1. Check worker_id in task matches Worker document ID (not User ID)
2. Verify worker is logged in (token valid)
3. Pull to refresh on mobile to reload data
4. Check API response from /api/worker/info includes tasks array

### Issue: "Worker does not belong to this farm" error

**Solutions:**
1. Verify worker's farm_id matches task's farm_id in database
2. Re-assign worker to correct farm if needed
3. Check Worker document has correct farm_id reference

### Issue: Worker dropdown empty

**Solutions:**
1. Verify workers exist for selected farm
2. Check /api/owner/workers/list returns workers
3. Add workers to farm via /owner/workers page first

### Issue: Form submission fails

**Solutions:**
1. Check all required fields are filled
2. Verify network connection to backend
3. Check browser console for error details
4. Verify MongoDB connection is active

## API Testing Commands

### Create Task
```bash
curl -X POST http://localhost:3000/api/owner/tasks/create \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "farm_id": "65f1234567890abcdef12345",
    "worker_id": "65f1234567890abcdef12346",
    "title": "Test Task via API",
    "description": "Testing direct API call",
    "priority": "HIGH",
    "due_date": "2026-03-10"
  }'
```

### List Tasks
```bash
curl "http://localhost:3000/api/owner/tasks/list?farm_id=65f1234567890abcdef12345" \
  -H "Cookie: session=..."
```

### Worker Info (Mobile)
```bash
curl http://localhost:3000/api/worker/info \
  -H "Authorization: Bearer mobile_USER_ID_TIMESTAMP"
```

## Success Metrics

A successful implementation will show:
- ✅ Owner can create tasks via web interface
- ✅ Tasks appear in database with correct references
- ✅ Worker sees tasks in mobile app immediately (or after refresh)
- ✅ Priority and status badges display correctly
- ✅ Form validation prevents invalid data
- ✅ Error messages are clear and helpful
- ✅ No console errors on web or mobile

## Conclusion

The task assignment feature is fully integrated into the existing worker management system. Owners have a streamlined interface to assign work, and workers automatically see their assigned tasks in the mobile app without any additional configuration.
