"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useAchievements } from '@/context/AchievementContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cloud, Waves, Play, Pause, Lightbulb, Target, VolumeX } from 'lucide-react';
import Link from 'next/link';

export default function FocusRoomPage() {
  const { user } = useAuth();
  const { checkForNewAchievements, userData } = useAchievements();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Gentle Pomodoro state management
  const [phase, setPhase] = useState<'launch' | 'transition' | 'flow' | 'break' | 'cycle-complete'>('launch');
  const [sessionType, setSessionType] = useState<'launch' | 'flow' | 'break'>('launch');
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Task state - can be edited inline
  const [task, setTask] = useState(
    searchParams.get('task') || ''
  );
  const [showTaskInput, setShowTaskInput] = useState(true);
  const [yesterdaysTask, setYesterdaysTask] = useState<string | null>(null);

  // Auto-save task to localStorage with debounce and timestamp
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (task.trim()) {
        localStorage.setItem('focus-room-last-task', JSON.stringify({
          task: task,
          date: new Date().toDateString()
        }));
      }
    }, 1000); // Save 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [task]);

  // Extract time from text (e.g., "15 minutes" -> 15, "20 min" -> 20, "15-minute" -> 15)
  const extractTimeFromText = (text: string): number | null => {
    const patterns = [
      /(\d+)\s*(?:minute|minutes|min|mins)/i,  // "15 minutes", "15 min"
      /(\d+)-(?:minute|minutes|min|mins)/i,     // "15-minute", "15-min"
      /(\d+)m\b/i,                               // "15m"
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const time = parseInt(match[1]);
        if (time >= 1 && time <= 120) {
          return time;
        }
      }
    }
    return null;
  };

  // Load last task on component mount and handle timer preset
  useEffect(() => {
    const savedTaskData = localStorage.getItem('focus-room-last-task');
    const today = new Date().toDateString();

    if (savedTaskData && !searchParams.get('task')) {
      try {
        const parsed = JSON.parse(savedTaskData);
        if (parsed.date === today) {
          // Same day - load task normally
          setTask(parsed.task);
          setShowTaskInput(false);
        } else {
          // Different day - show as yesterday's task
          setYesterdaysTask(parsed.task);
          setTask(''); // Clear current task
          setShowTaskInput(true);
        }
      } catch {
        // Old format (string only) - treat as today's task
        setTask(savedTaskData);
        setShowTaskInput(false);
      }
    }

    // Handle timer preset from URL
    const timerParam = searchParams.get('timer');
    const taskParam = searchParams.get('task');

    if (timerParam) {
      // Explicit timer parameter takes priority
      const timerMinutes = parseInt(timerParam);
      if (!isNaN(timerMinutes) && timerMinutes > 0) {
        setMinutes(timerMinutes);
        setSeconds(0);
      }
    } else if (taskParam) {
      // Try to extract time from task text if no explicit timer
      const extractedTime = extractTimeFromText(taskParam);
      if (extractedTime) {
        setMinutes(extractedTime);
        setSeconds(0);
      } else {
        // Default to 5 minutes if coming from a task but no time found
        setMinutes(5);
        setSeconds(0);
      }
    } else if (savedTaskData) {
      // Also check saved task from localStorage for time extraction
      try {
        const parsed = JSON.parse(savedTaskData);
        const extractedTime = extractTimeFromText(parsed.task);
        if (extractedTime) {
          setMinutes(extractedTime);
          setSeconds(0);
        }
      } catch {
        const extractedTime = extractTimeFromText(savedTaskData);
        if (extractedTime) {
          setMinutes(extractedTime);
          setSeconds(0);
        }
      }
    }
    // If no timer param and no task param, keep default (whatever it was before navigation)

    // Auto-hide task input if task is provided
    if (taskParam) {
      setShowTaskInput(false);
    }
  }, [searchParams]);

  // Audio controls with localStorage persistence
  const [activeSound, setActiveSound] = useState<'brown' | 'rain' | 'mute'>('mute');
  const [bodyDoublingCount, setBodyDoublingCount] = useState(142);

  // Audio refs for chimes
  const launchCompleteChimeRef = useRef<HTMLAudioElement>(null);
  const sessionCompleteChimeRef = useRef<HTMLAudioElement>(null);

  // Audio refs
  const brownNoiseRef = useRef<HTMLAudioElement>(null);
  const rainRef = useRef<HTMLAudioElement>(null);

  // Timer interval ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time display
  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Gentle Pomodoro timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer completed - determine next phase
          setIsRunning(false);
          handleTimerComplete();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, minutes, seconds, phase, sessionType]);

  // Helper function to get session duration in minutes
  const getSessionDuration = (type: 'launch' | 'flow' | 'break') => {
    switch (type) {
      case 'launch': return 5;
      case 'flow': return 25;
      case 'break': return 5;
      default: return 25;
    }
  };

  const handleTimerComplete = () => {
    if (sessionType === 'launch') {
      // Phase 1 → Phase 2: Launch complete, show transition
      setPhase('transition');
      playChime('launch');
    } else if (sessionType === 'flow') {
      // Phase 3 → Phase 4: Flow session complete, show cycle complete
      setPhase('cycle-complete');
      playChime('session');

      // Track achievement for completing a flow session
      const sessionLength = getSessionDuration('flow');
      const newTotalSessions = userData.totalFocusSessions + 1;
      const newTotalTime = userData.totalFocusTime + sessionLength;
      const newLongestSession = Math.max(userData.longestSession, sessionLength);

      // Check for time-based achievements
      const now = new Date();
      const hour = now.getHours();
      const isEarlyMorning = hour < 6;
      const isLateNight = hour >= 22;

      checkForNewAchievements({
        totalFocusSessions: newTotalSessions,
        totalFocusTime: newTotalTime,
        longestSession: newLongestSession,
        hasEarlyMorningSession: userData.hasEarlyMorningSession || isEarlyMorning,
        hasLateNightSession: userData.hasLateNightSession || isLateNight,
        // Update streak logic would need additional date tracking
        currentStreak: userData.currentStreak + 1
      });
    } else if (sessionType === 'break') {
      // Break complete, return to launch for next cycle
      setPhase('launch');
      setSessionType('launch');
      setMinutes(5);
      setSeconds(0);
    }
  };

  const playChime = (type: 'launch' | 'session') => {
    const chimeRef = type === 'launch' ? launchCompleteChimeRef : sessionCompleteChimeRef;
    if (chimeRef.current && chimeRef.current.readyState >= 2) {
      try {
        chimeRef.current.play().catch((error) => {
          console.error(`Failed to play ${type} chime:`, error);
        });
      } catch (error) {
        console.error(`Error accessing ${type} chime:`, error);
      }
    }
  };

  // Load preferences from localStorage and start timer
  useEffect(() => {
    // Load sound preference
    const savedSound = localStorage.getItem('focus-room-sound') as 'brown' | 'rain' | 'mute' | null;
    if (savedSound) {
      setActiveSound(savedSound);
    }

    // Load time preference
    const savedTime = localStorage.getItem('focus-room-time');
    if (savedTime) {
      const timeInMinutes = parseInt(savedTime);
      setMinutes(timeInMinutes);
    }

    // Don't auto-start timer, let user control it

    // Simulate body doubling counter updates
    const bodyDoublingInterval = setInterval(() => {
      setBodyDoublingCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(bodyDoublingInterval);
  }, []);

  // Audio loading effect - ensure audio elements are ready
  useEffect(() => {
    const handleAudioLoad = (audioRef: React.RefObject<HTMLAudioElement | null>, name: string) => {
      if (audioRef.current) {
        const handleLoadedData = () => {
          console.log(`${name} audio loaded and ready`);
        };
        const handleError = (e: any) => {
          console.error(`${name} audio failed to load:`, e);
        };

        audioRef.current.addEventListener('loadeddata', handleLoadedData);
        audioRef.current.addEventListener('error', handleError);

        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('loadeddata', handleLoadedData);
            audioRef.current.removeEventListener('error', handleError);
          }
        };
      }
    };

    const cleanupBrown = handleAudioLoad(brownNoiseRef, 'Brown noise');
    const cleanupRain = handleAudioLoad(rainRef, 'Rain');
    const cleanupLaunchChime = handleAudioLoad(launchCompleteChimeRef, 'Launch chime');
    const cleanupSessionChime = handleAudioLoad(sessionCompleteChimeRef, 'Session chime');

    return () => {
      cleanupBrown?.();
      cleanupRain?.();
      cleanupLaunchChime?.();
      cleanupSessionChime?.();
    };
  }, []);

  // Handle sound changes
  useEffect(() => {
    // Stop all sounds first
    if (brownNoiseRef.current) {
      brownNoiseRef.current.pause();
      brownNoiseRef.current.currentTime = 0;
    }
    if (rainRef.current) {
      rainRef.current.pause();
      rainRef.current.currentTime = 0;
    }

    // Only play sounds if they're manually activated (not on page load)
    // The actual playing will happen in handleSoundToggle after user interaction
  }, [activeSound]);

  const handleSoundToggle = async (sound: 'brown' | 'rain' | 'mute') => {
    console.log('Sound toggle clicked:', sound, 'Current:', activeSound);
    const newSound = activeSound === sound ? 'mute' : sound;
    setActiveSound(newSound);
    localStorage.setItem('focus-room-sound', newSound);

    // Stop all sounds first with proper error handling
    try {
      if (brownNoiseRef.current && !brownNoiseRef.current.paused) {
        brownNoiseRef.current.pause();
        brownNoiseRef.current.currentTime = 0;
        console.log('Brown noise stopped');
      }
      if (rainRef.current && !rainRef.current.paused) {
        rainRef.current.pause();
        rainRef.current.currentTime = 0;
        console.log('Rain stopped');
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }

    // Wait a moment for the pause to complete
    await new Promise(resolve => setTimeout(resolve, 150));

    // Only play audio if the element is still in the DOM and ready
    if (newSound === 'brown' && brownNoiseRef.current && brownNoiseRef.current.readyState >= 2) {
      try {
        console.log('Attempting to play brown noise');
        brownNoiseRef.current.loop = true;
        brownNoiseRef.current.volume = 0.5;
        await brownNoiseRef.current.play();
        console.log('Brown noise playing successfully');
      } catch (error) {
        console.error('Brown noise play failed:', error);
        // Reset sound state if play fails
        setActiveSound('mute');
      }
    } else if (newSound === 'rain' && rainRef.current && rainRef.current.readyState >= 2) {
      try {
        console.log('Attempting to play rain');
        rainRef.current.loop = true;
        rainRef.current.volume = 0.5;
        await rainRef.current.play();
        console.log('Rain playing successfully');
      } catch (error) {
        console.error('Rain play failed:', error);
        // Reset sound state if play fails
        setActiveSound('mute');
      }
    }

    console.log('New sound state:', newSound);
  };

  const toggleTimer = () => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);

    // Hide input and show styled task when starting timer
    if (newIsRunning) {
      setShowTaskInput(false);
    }

    // If starting timer and user has selected a sound, play it
    if (newIsRunning && activeSound !== 'mute') {
      console.log('Timer started, playing selected sound:', activeSound);
      setTimeout(() => {
        if (activeSound === 'brown' && brownNoiseRef.current && brownNoiseRef.current.readyState >= 2) {
          try {
            brownNoiseRef.current.loop = true;
            brownNoiseRef.current.volume = 0.5;
            brownNoiseRef.current.play().then(() => {
              console.log('Brown noise started with timer');
            }).catch((error) => {
              console.error('Failed to start brown noise with timer:', error);
            });
          } catch (error) {
            console.error('Error setting up brown noise:', error);
          }
        } else if (activeSound === 'rain' && rainRef.current && rainRef.current.readyState >= 2) {
          try {
            rainRef.current.loop = true;
            rainRef.current.volume = 0.5;
            rainRef.current.play().then(() => {
              console.log('Rain started with timer');
            }).catch((error) => {
              console.error('Failed to start rain with timer:', error);
            });
          } catch (error) {
            console.error('Error setting up rain:', error);
          }
        }
      }, 100); // Small delay to ensure DOM is stable
    }
  };

  // Phase transition handlers
  const startFlow = () => {
    setPhase('flow');
    setSessionType('flow');
    setMinutes(15);
    setSeconds(0);
    setIsRunning(true);
  };

  const startShortBreak = () => {
    setPhase('break');
    setSessionType('break');
    setMinutes(5);
    setSeconds(0);
    setIsRunning(true);
  };

  const startLongBreak = () => {
    setPhase('break');
    setSessionType('break');
    setMinutes(15);
    setSeconds(0);
    setIsRunning(true);
  };

  const finishSession = () => {
    setIsRunning(false);
    setActiveSound('mute');

    // Check if we came from a goal detail page
    const goalId = searchParams.get('goalId');
    const taskCompleted = task || searchParams.get('task') || '';

    if (goalId && sessionType === 'flow') {
      // Redirect back to goal with completion parameters for automatic check-in
      const sessionDuration = getSessionDuration('flow');
      const params = new URLSearchParams({
        sessionComplete: 'true',
        task: taskCompleted,
        duration: sessionDuration.toString()
      });
      router.push(`/goals/${goalId}?${params.toString()}`);
    } else {
      // Default redirect to dashboard
      router.push('/dashboard');
    }
  };

  const handleExit = () => {
    setIsRunning(false);
    setActiveSound('mute');
    router.push('/dashboard');
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to access Focus Room</h1>
          <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Render different phases
  const renderPhaseContent = () => {
    const isBreakMode = sessionType === 'break';
    const timerColor = isBreakMode ? 'text-green-700' : 'text-gray-800';
    const backgroundColor = isBreakMode ? 'bg-green-50' : 'bg-slate-50';

    // Phase 2: Transition Screen
    if (phase === 'transition') {
      return (
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-2" style={{color: '#2E7D32'}}>
            You're in motion! What's next?
          </h2>

          <div className={`text-8xl md:text-9xl lg:text-[12rem] font-bold ${timerColor} leading-none tracking-tight mb-4 opacity-60`}>
            {formatTime(0, 0)}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={startFlow}
              className="text-white font-semibold py-2 px-5 rounded-lg text-base transition-colors"
              style={{backgroundColor: '#2E7D32'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1B5E20'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2E7D32'}
            >
              Keep Focusing (15 mins)
            </button>
            <button
              onClick={startShortBreak}
              className="bg-white hover:bg-gray-50 font-semibold py-2 px-5 rounded-lg text-base border transition-colors"
              style={{color: '#1565C0', borderColor: '#1565C0'}}
            >
              Take a Short Break (5 mins)
            </button>
            <button
              onClick={finishSession}
              className="bg-white hover:bg-gray-50 font-semibold py-2 px-5 rounded-lg text-base border transition-colors"
              style={{color: '#546E7A', borderColor: '#546E7A'}}
            >
              I'm Done for Now (Great job!)
            </button>
          </div>
        </div>
      );
    }

    // Phase 4: Cycle Complete Screen
    if (phase === 'cycle-complete') {
      return (
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-2" style={{color: '#2E7D32'}}>
            Great session! Time for a well-earned break.
          </h2>

          <div className={`text-8xl md:text-9xl lg:text-[12rem] font-bold ${timerColor} leading-none tracking-tight mb-4 opacity-60`}>
            {formatTime(0, 0)}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={startShortBreak}
              className="text-white font-semibold py-2 px-5 rounded-lg text-base transition-colors"
              style={{backgroundColor: '#7B1FA2'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6A1B9A'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7B1FA2'}
            >
              Take a Short Break (5 mins)
            </button>
            <button
              onClick={startLongBreak}
              className="bg-white hover:bg-gray-50 font-semibold py-2 px-5 rounded-lg text-base border transition-colors"
              style={{color: '#1565C0', borderColor: '#1565C0'}}
            >
              Take a Long Break (15 mins)
            </button>
            <button
              onClick={finishSession}
              className="bg-white hover:bg-gray-50 font-semibold py-2 px-5 rounded-lg text-base border transition-colors"
              style={{color: '#546E7A', borderColor: '#546E7A'}}
            >
              Finish Session
            </button>
          </div>
        </div>
      );
    }

    // Phase 1 & 3: Active Timer (Launch, Flow, or Break)
    const handleTaskSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (task.trim()) {
          localStorage.setItem('focus-room-last-task', task);
          setShowTaskInput(false); // Hide input and show styled text
        }
        e.currentTarget.blur(); // Remove focus from input
      }
    };

    const handleTaskBlur = () => {
      if (task.trim()) {
        localStorage.setItem('focus-room-last-task', JSON.stringify({
          task: task,
          date: new Date().toDateString()
        }));
        // Delay hiding to allow for better UX
        setTimeout(() => {
          setShowTaskInput(false);
        }, 500);
      }
    };

    const handleTaskClick = () => {
      setShowTaskInput(true);
    };

    const resumeYesterdaysTask = () => {
      if (yesterdaysTask) {
        setTask(yesterdaysTask);
        setYesterdaysTask(null);
        setShowTaskInput(false);
        localStorage.setItem('focus-room-last-task', JSON.stringify({
          task: yesterdaysTask,
          date: new Date().toDateString()
        }));
      }
    };

    return (
      <div className="text-center w-full max-w-2xl mx-auto">
        {/* Task Input/Display Area */}
        {sessionType === 'launch' && !isRunning && (
          <div className="mb-8 space-y-4">
            {/* Yesterday's Task Resume Option */}
            {yesterdaysTask && (
              <div className="mb-4 max-w-md mx-auto">
                <button
                  onClick={resumeYesterdaysTask}
                  className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-blue-600 mb-1">Continue from yesterday</p>
                      <p className="text-sm text-blue-800 font-medium truncate">{yesterdaysTask}</p>
                    </div>
                    <div className="ml-3 text-blue-600">
                      <Play className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </div>
            )}

            {showTaskInput ? (
              <div className="relative w-full max-w-md mx-auto">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={handleTaskSubmit}
                  onBlur={handleTaskBlur}
                  placeholder="What's the tiny step? (Optional)"
                  className="w-full px-4 py-2 pr-10 text-center border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-700 placeholder-gray-400"
                  style={{
                    borderColor: task ? '#2E7D32' : undefined
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2E7D32';
                    e.target.style.boxShadow = '0 0 0 2px rgba(46, 125, 50, 0.2)';
                  }}
                  autoFocus={task.length === 0}
                />
                {/* Goal Spark Trigger */}
                <button
                  onClick={() => router.push('/goals?spark=true')}
                  className="group absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-green-50 transition-colors"
                  aria-label="Feeling stuck? Let's find a goal"
                  title="Feeling stuck? Let's find a goal"
                >
                  <Lightbulb className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>
              </div>
            ) : task.trim() ? (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleTaskClick}
                  className="max-w-md mx-auto px-4 py-2 text-center rounded-lg transition-colors hover:bg-gray-50"
                  style={{color: '#2E7D32'}}
                >
                  <span className="font-medium">{task}</span>
                  <span className="text-xs ml-2 opacity-60">(click to edit)</span>
                </button>
                <button
                  onClick={() => {
                    const encodedTask = encodeURIComponent(task);
                    router.push(`/goals?saveTask=${encodedTask}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 transition-colors text-xs"
                >
                  <Target className="w-3.5 h-3.5 text-green-700" />
                  <span className="text-green-700 font-medium">Save as Goal</span>
                </button>
              </div>
            ) : null}

            {/* Always visible helper buttons */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => router.push('/goals?spark=true')}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors text-xs"
                title="Feeling stuck? Let's find a goal"
              >
                <Lightbulb className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-600 transition-colors" />
                <span className="text-gray-500 group-hover:text-green-700">Need a goal?</span>
              </button>

              {/* Dev Tools - Only visible in localhost */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    // Set task with yesterday's date to test "continue from yesterday"
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    localStorage.setItem('focus-room-last-task', JSON.stringify({
                      task: 'Yesterday task: Complete the project documentation',
                      date: yesterday.toDateString()
                    }));
                    // Clear current state and reload
                    setTask('');
                    setShowTaskInput(true);
                    window.location.reload();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 transition-colors text-xs"
                  title="Simulate yesterday's task (dev only)"
                >
                  <span className="text-yellow-700 font-medium">📅 Test Yesterday</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Show task during active session */}
        {isRunning && task.trim() && sessionType === 'launch' && (
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full" style={{backgroundColor: 'rgba(46, 125, 50, 0.1)'}}>
              <span className="text-sm font-medium" style={{color: '#2E7D32'}}>
                {task}
              </span>
            </div>
          </div>
        )}

        {isBreakMode && (
          <h2 className="text-xl md:text-2xl font-semibold mb-6" style={{color: '#7B1FA2'}}>
            Time to recharge
          </h2>
        )}

        <div className={`text-8xl md:text-9xl lg:text-[12rem] font-bold ${timerColor} leading-none tracking-tight mb-8`}>
          {formatTime(minutes, seconds)}
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={toggleTimer}
            className="text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors flex items-center gap-3 shadow-lg hover:shadow-xl"
            style={{backgroundColor: '#2E7D32'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1B5E20'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2E7D32'}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Focusing
              </>
            )}
          </button>

          {/* Dev Tool - Finish Timer Instantly */}
          {process.env.NODE_ENV === 'development' && isRunning && (
            <button
              onClick={() => {
                setMinutes(0);
                setSeconds(0);
              }}
              className="px-4 py-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 transition-colors text-sm"
              title="Skip timer (dev only)"
            >
              <span className="text-yellow-700 font-medium">⏭️ Skip Timer</span>
            </button>
          )}
        </div>
      </div>
    );

  };

  // Main Focus Room
  const isBreakMode = sessionType === 'break';
  const backgroundColor = isBreakMode ? 'bg-green-50' : 'bg-slate-50';

  return (
    <div className={`${backgroundColor} flex flex-col overflow-hidden`} style={{height: '85vh', maxHeight: '85vh'}}>
      {/* Top Row - Optional spacing */}
      <div className="flex-shrink-0 pt-4 pb-2 px-4">
        {/* This provides minimal top spacing for the immersive design */}
      </div>

      {/* Middle Row - Timer and Controls */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {renderPhaseContent()}
      </div>

      {/* Bottom Row - Navigation Controls */}
      <div className="flex-shrink-0 py-2 px-4">
        {(phase === 'launch' || phase === 'flow' || phase === 'break') && (
          <div className="w-full flex justify-between items-center">
            {/* Body Doubling Counter - Left */}
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{color: '#546E7A'}}>
                👤 {bodyDoublingCount} others are focusing now
              </p>
            </div>

            {/* Exit Button - Center */}
            <div className="flex-1 flex justify-center gap-3">
              <Link
                href="/goals?spark=false"
                className="bg-white hover:bg-gray-50 font-medium py-1.5 px-3 rounded-lg border transition-colors text-sm cursor-pointer"
                style={{color: '#546E7A', borderColor: '#546E7A'}}
              >
                View My Goals
              </Link>
              <button
                onClick={handleExit}
                className="bg-white hover:bg-gray-50 font-medium py-1.5 px-3 rounded-lg border transition-colors text-sm cursor-pointer"
                style={{color: '#546E7A', borderColor: '#546E7A'}}
              >
                I'm Done for Now
              </button>
            </div>

            {/* Audio Controls - Right */}
            <div className="flex-1 flex justify-end">
              <div className="flex gap-2">
                <button
                  onClick={() => handleSoundToggle('brown')}
                  className={`p-2 rounded-full transition-colors ${
                    activeSound === 'brown'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Brown Noise"
                >
                  <Waves className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSoundToggle('rain')}
                  className={`p-2 rounded-full transition-colors ${
                    activeSound === 'rain'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Rain"
                >
                  <Cloud className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSoundToggle('mute')}
                  className={`p-2 rounded-full transition-colors ${
                    activeSound === 'mute'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Mute"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Audio Elements */}
      <audio
        ref={brownNoiseRef}
        loop
        preload="auto"
      >
        <source src="/sounds/brown-noise.mp3" type="audio/mpeg" />
      </audio>

      <audio
        ref={rainRef}
        loop
        preload="auto"
      >
        <source src="/sounds/rain.mp3" type="audio/mpeg" />
      </audio>

      {/* Chime Audio Elements */}
      <audio
        ref={launchCompleteChimeRef}
        preload="auto"
      >
        <source src="/sounds/gentle-chime.mp3" type="audio/mpeg" />
      </audio>

      <audio
        ref={sessionCompleteChimeRef}
        preload="auto"
      >
        <source src="/sounds/session-complete.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}