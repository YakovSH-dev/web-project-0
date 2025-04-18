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

// Helper function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper function to calculate week index (0-based) from semester start
const getWeekIndex = (date, semesterStartDate) => {
  const diffTime = Math.abs(getStartOfDay(date) - getStartOfDay(semesterStartDate));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
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
      select: 'type courseId description length', // Updated selection, removed startTime
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
      select: 'type description length courseId', 
      populate: {
        path: 'courseId',
        select: 'name color'
      }
    })
    .sort({ date: 1 }); 

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
      // 6. Sort by Course Name then Task Date/Time 
      {
        $sort: {
          'courseInfo.name': 1,
          date: 1 // Sort by instance date directly
        }
      },
      // 7. Group by Course
      {
        $group: {
          _id: '$courseInfo._id',
          courseName: { $first: '$courseInfo.name' },
          courseColor: { $first: '$courseInfo.color' },
          instances: {
            $push: {
              // Include TaskInstance fields
              _id: '$_id',
              date: '$date',
              description: '$description', // Instance-specific description (if any)
              isCompleted: '$isCompleted',
              levelOfUnderstanding: '$levelOfUnderstanding',
              // Construct the nested taskDefinitionId object MANUALLY
              taskDefinitionId: {
                _id: '$taskDefinitionInfo._id', // Get ID from looked-up definition
                type: '$taskDefinitionInfo.type',
                description: '$taskDefinitionInfo.description',
                length: '$taskDefinitionInfo.length',
                schedule: '$taskDefinitionInfo.schedule',
                // Add other definition fields if needed by TaskCard
                // *** Crucially, add the looked-up courseInfo here ***
                courseId: '$courseInfo' 
              }
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

// --- Dashboard: Main View - Semester (Grid Format - Rows = Definitions, Cols = Weeks) --- 
const getSemesterViewData = async (req, res) => {
  console.log(`Processing getSemesterViewData (Def x Week Grid) request for user: ${req.user?.userId}`);
  try {
    const userId = req.user.userId;
    const { semesterId } = req.query;

    if (!semesterId || !mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ message: 'Valid semesterId query parameter is required' });
    }

    // 1. Fetch Semester Details
    const semester = await Semester.findById(semesterId).lean();
    if (!semester || semester.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Semester not found or access denied' });
    }
    if (!semester.startDate || !semester.numberOfWeeks || isNaN(new Date(semester.startDate).getTime()) || semester.numberOfWeeks <= 0) {
      console.error(`Semester ${semesterId} has invalid start date or number of weeks.`);
      return res.status(500).json({ message: 'Invalid semester configuration found (start date or number of weeks).' });
    }

    const semesterStartDate = getStartOfDay(semester.startDate);
    const semesterEndDate = getEndOfDay(addDays(semesterStartDate, (semester.numberOfWeeks * 7) - 1));
    const today = getStartOfDay(new Date());
    const numberOfWeeks = semester.numberOfWeeks;
    const currentWeekIndex = getWeekIndex(today, semesterStartDate); // Might be < 0 or >= numberOfWeeks if today is outside semester

    // 2. Fetch Courses for the semester
    const courses = await Course.find({ semesterId: semesterId, userId: userId }).lean();
    if (!courses || courses.length === 0) return res.status(200).json([]);
    const courseIds = courses.map(c => c._id);

    // 3. Fetch all Task Definitions for these courses
    const definitions = await TaskDefinition.find({ courseId: { $in: courseIds }, userId: userId })
        .select('_id type description courseId') // Select needed fields
        .lean();
    const definitionMap = new Map(definitions.map(d => [d._id.toString(), d]));
    const definitionIds = definitions.map(d => d._id);

    // 4. Fetch all Task Instances for these definitions within the semester date range
    const allInstances = await TaskInstance.find({
      userId: userId,
      taskDefinitionId: { $in: definitionIds }, // Match definitions for this semester
      date: { $gte: semesterStartDate, $lte: semesterEndDate }
    })
    .select('_id date isCompleted taskDefinitionId') // Select only needed fields
    .sort({ date: 1 })
    .lean(); 

    // 5. Process Data into the new Grid Structure [ Course -> Definition -> Weeks -> Tasks ]
    const resultGrid = [];
    for (const course of courses) {
        const courseDefinitions = definitions.filter(d => d.courseId.toString() === course._id.toString());
        
        const processedDefinitions = courseDefinitions.map(def => {
            const definitionWeeks = Array(numberOfWeeks).fill(null).map((_, weekIdx) => ({
                weekIndex: weekIdx,
                tasks: [] // Initialize tasks array for each week
            }));

            // Populate tasks for this definition
            const definitionInstances = allInstances.filter(inst => inst.taskDefinitionId.toString() === def._id.toString());
            for (const instance of definitionInstances) {
                const instanceDate = getStartOfDay(instance.date);
                const weekIndex = getWeekIndex(instanceDate, semesterStartDate);
                
                if (weekIndex >= 0 && weekIndex < numberOfWeeks) {
                    const isMissed = instanceDate < today && !instance.isCompleted;
                    definitionWeeks[weekIndex].tasks.push({
                        instanceId: instance._id,
                        isCompleted: instance.isCompleted,
                        isMissed: isMissed
                    });
                } else {
                     console.warn(`Instance ${instance._id} date ${instance.date} resulted in out-of-bounds week index ${weekIndex}`);
                }
            }

            return {
                definitionId: def._id,
                type: def.type,
                description: def.description,
                weeks: definitionWeeks
            };
        });

        // Sort definitions (e.g., by type, then description)
        processedDefinitions.sort((a, b) => {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            return (a.description || '').localeCompare(b.description || '');
        });

        resultGrid.push({
            courseId: course._id,
            courseName: course.name,
            courseColor: course.color,
            semesterStartDate: semester.startDate.toISOString().split('T')[0],
            numberOfWeeks: numberOfWeeks,
            currentWeekIndex: currentWeekIndex, // Pass current week index
            definitions: processedDefinitions // The processed rows for the grid
        });
    }

    // Sort final result by course name
    resultGrid.sort((a, b) => a.courseName.localeCompare(b.courseName));

    // console.log("Final Def x Week Grid structure:", JSON.stringify(resultGrid, null, 2)); // Keep commented for brevity
    console.log(`Returning semester grid (Def x Week) data for ${resultGrid.length} courses, semester ${semesterId}`);
    res.status(200).json(resultGrid);

  } catch (error) {
    console.error('Error fetching semester grid (Def x Week) view data:', error);
    res.status(500).json({ message: 'Server error while fetching semester grid view data', error: error.message });
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