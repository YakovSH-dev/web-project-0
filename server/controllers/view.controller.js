// server/controllers/view.controller.js
// This controller handles fetching data specifically structured for frontend views.

const mongoose = require('mongoose');
const Assignment = require('../models/Assignment.model.js');
const TaskInstance = require('../models/TaskInstance.model.js');
const TaskDefinition = require('../models/TaskDefinition.model.js');
const Course = require('../models/Course.model.js');
const Semester = require('../models/Semester.model.js');

// Helper function to get start of day
const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Helper function to get end of day
const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Helper function to get start of week (assuming Sunday as start)
const getStartOfWeek = (date) => {
  const dt = new Date(date);
  const day = dt.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = dt.getDate() - day;
  return getStartOfDay(new Date(dt.setDate(diff)));
};

// --- Dashboard: Upcoming Assignments Panel --- 
const getUpcomingAssignments = async (req, res) => {
  console.log(`Processing getUpcomingAssignments request for user: ${req.user?.userId}`);
  try {
    const userId = req.user.userId;
    const daysAhead = parseInt(req.query.daysAhead || '7', 10);
    
    if (isNaN(daysAhead) || daysAhead <= 0) {
      return res.status(400).json({ message: 'Invalid daysAhead parameter.' });
    }

    const today = getStartOfDay(new Date());
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysAhead);
    const endDate = getEndOfDay(futureDate); // End of the Nth day

    const assignments = await Assignment.find({
      userId: userId,
      dueDate: {
        $gte: today,       // Due from today onwards
        $lte: endDate       // Due up to N days from now
      },
      // isCompleted: false // Optional: uncomment to only show incomplete
    })
    .populate('courseId', 'name color') // Populate course name and color
    .sort({ dueDate: 1 }); // Sort by nearest due date first

    console.log(`Found ${assignments.length} upcoming assignments for user ${userId} within ${daysAhead} days.`);
    res.status(200).json(assignments);

  } catch (error) {
    console.error('Error fetching upcoming assignments:', error);
    res.status(500).json({ message: 'Server error while fetching upcoming assignments', error: error.message });
  }
};

// --- Dashboard: Gaps Panel (Past Uncompleted Tasks) ---
const getGapsData = async (req, res) => {
  console.log(`Processing getGapsData request for user: ${req.user?.userId}`);
  try {
    const userId = req.user.userId;
    const lookbackWeeks = parseInt(req.query.lookbackWeeks || '4', 10);

    if (isNaN(lookbackWeeks) || lookbackWeeks <= 0) {
      return res.status(400).json({ message: 'Invalid lookbackWeeks parameter.' });
    }

    const today = getStartOfDay(new Date()); // Find tasks before today
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - (lookbackWeeks * 7)); // Go back N weeks
    const startDate = getStartOfDay(pastDate); // Start of the Nth week ago day

    const gaps = await TaskInstance.find({
      userId: userId,
      date: {
        $gte: startDate, // From N weeks ago
        $lt: today      // Up to (but not including) today
      },
      isCompleted: false // Only show incomplete tasks
    })
    .populate({
      path: 'taskDefinitionId', 
      select: 'type courseId startTime length', // Select fields from TaskDefinition
      populate: {
        path: 'courseId',
        select: 'name color' // Select fields from Course
      }
    })
    .sort({ date: 1 }); // Sort oldest first

    console.log(`Found ${gaps.length} past uncompleted tasks for user ${userId} within ${lookbackWeeks} weeks.`);
    res.status(200).json(gaps);

  } catch (error) {
    console.error('Error fetching gaps data:', error);
    res.status(500).json({ message: 'Server error while fetching gaps data', error: error.message });
  }
};

// --- Dashboard: Main View - Daily --- 
const getDailyViewData = async (req, res) => {
  console.log(`Processing getDailyViewData request for user: ${req.user?.userId}`);
  try {
    const userId = req.user.userId;
    const dateParam = req.query.date; // Expecting YYYY-MM-DD format

    let targetDate;
    if (dateParam) {
      targetDate = new Date(dateParam + 'T00:00:00'); // Ensure parsing as local date
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
    } else {
      targetDate = new Date(); // Default to today
    }

    const startDate = getStartOfDay(targetDate);
    const endDate = getEndOfDay(targetDate);

    const tasks = await TaskInstance.find({
      userId: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate({
      path: 'taskDefinitionId', 
      select: 'type courseId startTime length',
      populate: {
        path: 'courseId',
        select: 'name color'
      }
    })
    // Sort primarily by start time from definition, then by instance date as fallback/tiebreaker
    .sort({ 'taskDefinitionId.startTime': 1, date: 1 }); 

    console.log(`Found ${tasks.length} tasks for date ${startDate.toISOString().split('T')[0]}, user ${userId}`);
    res.status(200).json(tasks);

  } catch (error) {
    console.error('Error fetching daily view data:', error);
    res.status(500).json({ message: 'Server error while fetching daily view data', error: error.message });
  }
};

// --- Dashboard: Main View - Weekly --- 
const getWeeklyViewData = async (req, res) => {
  console.log(`Processing getWeeklyViewData request for user: ${req.user?.userId}`);
  try {
    const userId = req.user.userId;
    const weekStartDateParam = req.query.weekStartDate; // Expecting YYYY-MM-DD format

    let weekStart;
    if (weekStartDateParam) {
      weekStart = new Date(weekStartDateParam + 'T00:00:00');
      if (isNaN(weekStart.getTime())) {
        return res.status(400).json({ message: 'Invalid weekStartDate format. Use YYYY-MM-DD.' });
      }
      weekStart = getStartOfDay(weekStart); // Ensure it's the start of the day
    } else {
      // Default to the start of the current week
      weekStart = getStartOfWeek(new Date()); 
    }

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Get to the following Saturday
    const endDate = getEndOfDay(weekEnd); // End of the 7th day (Saturday)

    const weeklyData = await TaskInstance.aggregate([
      // 1. Match instances for the user within the date range
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: weekStart, $lte: endDate }
        }
      },
      // 2. Lookup Task Definition details
      {
        $lookup: {
          from: 'taskdefinitions', // Collection name for TaskDefinition model
          localField: 'taskDefinitionId',
          foreignField: '_id',
          as: 'taskDefinitionInfo'
        }
      },
      // 3. Unwind the taskDefinitionInfo array (should only be one)
      {
        $unwind: { 
            path: "$taskDefinitionInfo", 
            preserveNullAndEmptyArrays: true // Keep instances even if definition is missing (though unlikely)
        }
      },
      // 4. Lookup Course details from Task Definition
      {
        $lookup: {
          from: 'courses', // Collection name for Course model
          localField: 'taskDefinitionInfo.courseId',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      // 5. Unwind the courseInfo array (should only be one)
      {
         $unwind: { 
            path: "$courseInfo", 
            preserveNullAndEmptyArrays: true // Keep instances even if course is missing
         }
      },
      // 6. Sort by Course Name then Task Date/Time for consistent grouping later
      {
        $sort: {
          'courseInfo.name': 1,
          date: 1,
          'taskDefinitionInfo.startTime': 1
        }
      },
      // 7. Group by Course
      {
        $group: {
          _id: '$courseInfo._id', // Group by course ID
          courseName: { $first: '$courseInfo.name' },
          courseColor: { $first: '$courseInfo.color' },
          instances: {
            $push: {
              // Selectively push relevant instance and definition data
              _id: '$_id', 
              date: '$date',
              description: '$description', 
              isCompleted: '$isCompleted',
              levelOfUnderstanding: '$levelOfUnderstanding',
              taskType: '$taskDefinitionInfo.type',
              taskStartTime: '$taskDefinitionInfo.startTime',
              taskLength: '$taskDefinitionInfo.length'
              // Add any other fields needed by the frontend card
            }
          }
        }
      },
      // 8. Project final shape
      {
        $project: {
          _id: 0, // Exclude the default group _id
          courseId: '$_id', 
          courseName: 1,
          courseColor: 1,
          instances: 1
        }
      },
       // 9. Sort the final list of courses alphabetically
      {
        $sort: { courseName: 1 }
      }
    ]);

    console.log(`Found weekly data structure for ${weeklyData.length} courses for week starting ${weekStart.toISOString().split('T')[0]}, user ${userId}`);
    res.status(200).json(weeklyData);

  } catch (error) {
    console.error('Error fetching weekly view data:', error);
    res.status(500).json({ message: 'Server error while fetching weekly view data', error: error.message });
  }
};

// --- Dashboard: Main View - Semester --- 
const getSemesterViewData = async (req, res) => {
  console.log(`Processing getSemesterViewData request for user: ${req.user?.userId}`);
  try {
    const userId = req.user.userId;
    const { semesterId } = req.query;

    if (!semesterId) {
      return res.status(400).json({ message: 'semesterId query parameter is required' });
    }

    // Validate semesterId format (basic Mongoose check)
    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ message: 'Invalid semesterId format.' });
    }

    // 1. Find all courses belonging to this semester and user
    const courses = await Course.find({ semesterId: semesterId, userId: userId }).select('_id');
    if (!courses || courses.length === 0) {
      console.log(`No courses found for semester ${semesterId}, user ${userId}`);
      return res.status(200).json([]); // Return empty array if no courses
    }
    const courseIds = courses.map(c => c._id);

    // 2. Find all Task Definitions linked to these courses
    const definitions = await TaskDefinition.find({ courseId: { $in: courseIds }, userId: userId }).select('_id');
    const definitionIds = definitions.map(d => d._id);

    if (definitionIds.length === 0) {
        console.log(`No task definitions found for courses in semester ${semesterId}, user ${userId}`);
        // We could still potentially fetch assignments later, but for now return based on task instances
        // Alternatively, fetch courses and return them with empty instance lists
        const courseDataOnly = await Course.find({ _id: { $in: courseIds } }).select('name color').lean();
        const result = courseDataOnly.map(c => ({ courseId: c._id, courseName: c.name, courseColor: c.color, instances: [] }));
        return res.status(200).json(result.sort((a, b) => a.courseName.localeCompare(b.courseName)));
    }

    // 3. Aggregate Task Instances linked to these definitions
    const semesterData = await TaskInstance.aggregate([
      // Match instances belonging to the definitions for this semester/user
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          taskDefinitionId: { $in: definitionIds }
        }
      },
      // Lookup definitions (needed for courseId and type/time)
      {
        $lookup: {
          from: 'taskdefinitions',
          localField: 'taskDefinitionId',
          foreignField: '_id',
          as: 'taskDefinitionInfo'
        }
      },
      { $unwind: { path: "$taskDefinitionInfo", preserveNullAndEmptyArrays: true } },
      // Lookup courses
      {
        $lookup: {
          from: 'courses',
          localField: 'taskDefinitionInfo.courseId',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: { path: "$courseInfo", preserveNullAndEmptyArrays: true } },
      // Ensure we only include instances whose course *actually* belongs to the target semester 
      // (handles edge cases if data integrity is imperfect)
      {
        $match: {
          'courseInfo.semesterId': new mongoose.Types.ObjectId(semesterId)
        }
      },
      // Sort for consistency within groups
      {
        $sort: {
          'courseInfo.name': 1,
          date: 1,
          'taskDefinitionInfo.startTime': 1
        }
      },
      // Group by Course
      {
        $group: {
          _id: '$courseInfo._id',
          courseName: { $first: '$courseInfo.name' },
          courseColor: { $first: '$courseInfo.color' },
          instances: {
            $push: {
              _id: '$_id',
              date: '$date',
              description: '$description',
              isCompleted: '$isCompleted',
              levelOfUnderstanding: '$levelOfUnderstanding',
              taskType: '$taskDefinitionInfo.type',
              taskStartTime: '$taskDefinitionInfo.startTime',
              taskLength: '$taskDefinitionInfo.length'
            }
          }
        }
      },
      // Final projection
      {
        $project: {
          _id: 0,
          courseId: '$_id',
          courseName: 1,
          courseColor: 1,
          instances: 1
        }
      },
      // Sort final course list
      {
        $sort: { courseName: 1 }
      }
    ]);

    // TODO: Consider adding Assignments to this view as well, potentially in a separate property per course.

    console.log(`Found semester view data for ${semesterData.length} courses for semester ${semesterId}, user ${userId}`);
    res.status(200).json(semesterData);

  } catch (error) {
    console.error('Error fetching semester view data:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid semesterId format.' });
    }
    res.status(500).json({ message: 'Server error while fetching semester view data', error: error.message });
  }
};


// Export controller functions
module.exports = {
  getUpcomingAssignments,
  getGapsData,
  getDailyViewData,
  getWeeklyViewData,
  getSemesterViewData,
}; 