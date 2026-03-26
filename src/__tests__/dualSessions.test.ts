import {
  getActiveCalisthenicsSession,
  saveActiveCalisthenicsSession,
  getActiveYogaSession,
  saveActiveYogaSession,
} from "@/lib/storage";
import { WorkoutLog, YogaSession } from "@/lib/types";

describe("Dual Session State", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  describe("Calisthenics Session Storage", () => {
    it("should save and retrieve a calisthenics session", () => {
      const session: WorkoutLog = {
        id: "test-workout-1",
        planId: "plan-1",
        dayIndex: 0,
        date: "2024-01-01T10:00:00Z",
        startTime: "2024-01-01T10:00:00Z",
        endTime: null,
        exercises: [],
        completed: false,
      };

      saveActiveCalisthenicsSession(session);
      const retrieved = getActiveCalisthenicsSession();

      expect(retrieved).toEqual(session);
    });

    it("should clear calisthenics session when saved as null", () => {
      const session: WorkoutLog = {
        id: "test-workout-1",
        planId: "plan-1",
        dayIndex: 0,
        date: "2024-01-01T10:00:00Z",
        startTime: "2024-01-01T10:00:00Z",
        endTime: null,
        exercises: [],
        completed: false,
      };

      saveActiveCalisthenicsSession(session);
      saveActiveCalisthenicsSession(null);
      const retrieved = getActiveCalisthenicsSession();

      expect(retrieved).toBeNull();
    });

    it("should return null when no calisthenics session exists", () => {
      const retrieved = getActiveCalisthenicsSession();
      expect(retrieved).toBeNull();
    });
  });

  describe("Yoga Session Storage", () => {
    it("should save and retrieve a yoga session", () => {
      const session: YogaSession = {
        id: "test-yoga-1",
        planId: "plan-1",
        dayIndex: 0,
        currentPoseIndex: 2,
        flowId: "flow-1",
        startTime: Date.now(),
        completedPoses: [
          { poseId: "pose-1", duration: 30 },
          { poseId: "pose-2", duration: 45 },
        ],
      };

      saveActiveYogaSession(session);
      const retrieved = getActiveYogaSession();

      expect(retrieved).toEqual(session);
    });

    it("should save pausedTime in yoga session", () => {
      const session: YogaSession = {
        id: "test-yoga-1",
        planId: "plan-1",
        dayIndex: 0,
        currentPoseIndex: 1,
        flowId: "flow-1",
        startTime: Date.now(),
        pausedTime: Date.now() + 5000,
        completedPoses: [{ poseId: "pose-1", duration: 30 }],
      };

      saveActiveYogaSession(session);
      const retrieved = getActiveYogaSession();

      expect(retrieved?.pausedTime).toBe(session.pausedTime);
    });

    it("should clear yoga session when saved as null", () => {
      const session: YogaSession = {
        id: "test-yoga-1",
        planId: "plan-1",
        dayIndex: 0,
        currentPoseIndex: 0,
        flowId: "flow-1",
        startTime: Date.now(),
        completedPoses: [],
      };

      saveActiveYogaSession(session);
      saveActiveYogaSession(null);
      const retrieved = getActiveYogaSession();

      expect(retrieved).toBeNull();
    });

    it("should return null when no yoga session exists", () => {
      const retrieved = getActiveYogaSession();
      expect(retrieved).toBeNull();
    });
  });

  describe("Independent Session Storage", () => {
    it("should maintain separate calisthenics and yoga sessions", () => {
      const calSession: WorkoutLog = {
        id: "test-workout-1",
        planId: "plan-1",
        dayIndex: 0,
        date: "2024-01-01T10:00:00Z",
        startTime: "2024-01-01T10:00:00Z",
        endTime: null,
        exercises: [],
        completed: false,
      };

      const yogaSession: YogaSession = {
        id: "test-yoga-1",
        planId: "plan-1",
        dayIndex: 0,
        currentPoseIndex: 0,
        flowId: "flow-1",
        startTime: Date.now(),
        completedPoses: [],
      };

      // Save both sessions
      saveActiveCalisthenicsSession(calSession);
      saveActiveYogaSession(yogaSession);

      // Retrieve and verify both exist
      const retrievedCal = getActiveCalisthenicsSession();
      const retrievedYoga = getActiveYogaSession();

      expect(retrievedCal).toEqual(calSession);
      expect(retrievedYoga).toEqual(yogaSession);
    });

    it("should allow clearing yoga session without affecting calisthenics", () => {
      const calSession: WorkoutLog = {
        id: "test-workout-1",
        planId: "plan-1",
        dayIndex: 0,
        date: "2024-01-01T10:00:00Z",
        startTime: "2024-01-01T10:00:00Z",
        endTime: null,
        exercises: [],
        completed: false,
      };

      const yogaSession: YogaSession = {
        id: "test-yoga-1",
        planId: "plan-1",
        dayIndex: 0,
        currentPoseIndex: 0,
        flowId: "flow-1",
        startTime: Date.now(),
        completedPoses: [],
      };

      // Save both
      saveActiveCalisthenicsSession(calSession);
      saveActiveYogaSession(yogaSession);

      // Clear yoga only
      saveActiveYogaSession(null);

      // Verify yoga is gone but calisthenics remains
      expect(getActiveYogaSession()).toBeNull();
      expect(getActiveCalisthenicsSession()).toEqual(calSession);
    });

    it("should allow clearing calisthenics session without affecting yoga", () => {
      const calSession: WorkoutLog = {
        id: "test-workout-1",
        planId: "plan-1",
        dayIndex: 0,
        date: "2024-01-01T10:00:00Z",
        startTime: "2024-01-01T10:00:00Z",
        endTime: null,
        exercises: [],
        completed: false,
      };

      const yogaSession: YogaSession = {
        id: "test-yoga-1",
        planId: "plan-1",
        dayIndex: 0,
        currentPoseIndex: 0,
        flowId: "flow-1",
        startTime: Date.now(),
        completedPoses: [],
      };

      // Save both
      saveActiveCalisthenicsSession(calSession);
      saveActiveYogaSession(yogaSession);

      // Clear calisthenics only
      saveActiveCalisthenicsSession(null);

      // Verify calisthenics is gone but yoga remains
      expect(getActiveCalisthenicsSession()).toBeNull();
      expect(getActiveYogaSession()).toEqual(yogaSession);
    });
  });
});
