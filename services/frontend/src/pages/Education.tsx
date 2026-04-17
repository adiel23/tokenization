import { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  ChevronRight,
  Trophy,
  BarChart3,
  CheckCircle,
  Lock
} from 'lucide-react';
import { formatSats } from '@lib/utils';
import { Layout, Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components';

// Mock data
const treasuryStats = {
  totalAllocated: 150000000,
  coursesFunded: 24,
  studentsEnrolled: 3847,
  thisMonth: 2500000,
};

const courses = [
  {
    id: '1',
    title: 'Bitcoin Basics',
    description: 'Learn the fundamentals of Bitcoin, how it works, and why it matters.',
    category: 'beginner',
    difficulty: 'beginner',
    duration_minutes: 120,
    modules: 6,
    enrolled: 1247,
    thumbnail: 'btc-basics',
  },
  {
    id: '2',
    title: 'RWA Tokenization',
    description: 'Understand how real-world assets are tokenized on Bitcoin.',
    category: 'intermediate',
    difficulty: 'intermediate',
    duration_minutes: 180,
    modules: 8,
    enrolled: 892,
    thumbnail: 'rwa-token',
  },
  {
    id: '3',
    title: 'Lightning Network',
    description: 'Deep dive into the Lightning Network and instant payments.',
    category: 'advanced',
    difficulty: 'advanced',
    duration_minutes: 240,
    modules: 10,
    enrolled: 634,
    thumbnail: 'lightning',
  },
  {
    id: '4',
    title: 'Asset Evaluation',
    description: 'Learn how to evaluate tokenized assets using AI and traditional methods.',
    category: 'intermediate',
    difficulty: 'intermediate',
    duration_minutes: 150,
    modules: 7,
    enrolled: 456,
    thumbnail: 'evaluation',
  },
  {
    id: '5',
    title: 'Multisig Security',
    description: 'Master multisignature wallets and secure custody practices.',
    category: 'advanced',
    difficulty: 'advanced',
    duration_minutes: 200,
    modules: 9,
    enrolled: 389,
    thumbnail: 'multisig',
  },
  {
    id: '6',
    title: 'DeFi on Bitcoin',
    description: 'Explore decentralized finance applications on Bitcoin.',
    category: 'advanced',
    difficulty: 'advanced',
    duration_minutes: 300,
    modules: 12,
    enrolled: 518,
    thumbnail: 'defi',
  },
];

const myCourses = [
  {
    course_id: '1',
    progress: 75,
    completed_modules: ['1', '2', '3', '4'],
    enrolled_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    course_id: '2',
    progress: 30,
    completed_modules: ['1'],
    enrolled_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const categories = [
  { value: 'all', label: 'All Courses' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// Components
function TreasuryCounter() {
  return (
    <Card glow="bitcoin">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent-bitcoin/10 flex items-center justify-center">
            <Trophy className="text-accent-bitcoin" size={24} />
          </div>
          <div>
            <h3 className="font-semibold">Education Treasury</h3>
            <p className="text-sm text-foreground-secondary">Platform fees fund free education</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-mono font-bold text-gradient-bitcoin">
              {formatSats(treasuryStats.totalAllocated)}
            </p>
            <p className="text-xs text-foreground-secondary">Total Allocated (sats)</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{treasuryStats.coursesFunded}</p>
            <p className="text-xs text-foreground-secondary">Courses Funded</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{treasuryStats.studentsEnrolled.toLocaleString()}</p>
            <p className="text-xs text-foreground-secondary">Students Enrolled</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{formatSats(treasuryStats.thisMonth)}</p>
            <p className="text-xs text-foreground-secondary">This Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 bg-background-elevated rounded-full overflow-hidden">
      <div 
        className="h-full bg-accent-bitcoin rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function CourseCard({ course, isEnrolled, progress }: { 
  course: typeof courses[0]; 
  isEnrolled?: boolean;
  progress?: number;
}) {
  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  } as const;

  return (
    <Card className="h-full flex flex-col hover:border-accent-bitcoin/30 transition-all group">
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Thumbnail placeholder */}
        <div className="h-32 rounded-lg bg-gradient-to-br from-accent-bitcoin/20 to-accent-bitcoin/5 mb-4 flex items-center justify-center">
          <BookOpen className="text-accent-bitcoin/50" size={40} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <Badge variant={difficultyColors[course.difficulty]} size="sm">
            {course.difficulty}
          </Badge>
          {isEnrolled && (
            <Badge variant="success" size="sm">
              Enrolled
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-1 group-hover:text-accent-bitcoin transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-foreground-secondary line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>

        {/* Progress or Stats */}
        {isEnrolled && progress !== undefined ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-foreground-secondary">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
            <Button fullWidth size="sm" variant="outline">
              Continue Learning
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs text-foreground-secondary">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {course.duration_minutes} min
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {course.modules} modules
              </span>
            </div>
            <Button fullWidth size="sm">
              Enroll Free
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MyCourses() {
  const enrolled = myCourses.map(mc => ({
    ...courses.find(c => c.id === mc.course_id)!,
    ...mc,
  }));

  if (enrolled.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Courses</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolled.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            isEnrolled 
            progress={course.progress}
          />
        ))}
      </div>
    </div>
  );
}

export function Education() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCourses = courses.filter(c => 
    selectedCategory === 'all' || c.difficulty === selectedCategory
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Education Center</h1>
            <p className="text-foreground-secondary">
              Learn about Bitcoin, tokenization, and decentralized finance
            </p>
          </div>
        </div>

        {/* Treasury Stats */}
        <TreasuryCounter />

        {/* My Courses */}
        <MyCourses />

        {/* All Courses */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">All Courses</h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg bg-background-elevated border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Recommended Learning Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 p-4 rounded-lg bg-background-elevated w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center">
                    <CheckCircle size={16} className="text-accent-green" />
                  </div>
                  <span className="font-medium">1. Bitcoin Basics</span>
                </div>
                <p className="text-xs text-foreground-secondary ml-11">Foundation knowledge</p>
              </div>
              <ChevronRight className="hidden md:block text-foreground-secondary" />
              <div className="flex-1 p-4 rounded-lg bg-background-elevated w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent-bitcoin/20 flex items-center justify-center">
                    <Lock size={16} className="text-accent-bitcoin" />
                  </div>
                  <span className="font-medium">2. RWA Tokenization</span>
                </div>
                <p className="text-xs text-foreground-secondary ml-11">Asset tokenization</p>
              </div>
              <ChevronRight className="hidden md:block text-foreground-secondary" />
              <div className="flex-1 p-4 rounded-lg bg-background-elevated w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent-bitcoin/20 flex items-center justify-center">
                    <Lock size={16} className="text-accent-bitcoin" />
                  </div>
                  <span className="font-medium">3. Advanced Trading</span>
                </div>
                <p className="text-xs text-foreground-secondary ml-11">Market strategies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
