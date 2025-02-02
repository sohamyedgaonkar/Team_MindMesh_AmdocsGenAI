import HackathonAlert from "@/components/dashboard/HackathonAlert";
import BuddySystem from "@/components/dashboard/BuddySystem";
import CourseProgress from "@/components/dashboard/CourseProgress";
import QuizModel from "@/components/dashboard/QuizModel";

const Dashboard = () => {
  return (
    <div className="min-h-screen p-6 animate-fade-up">
      <div className="max-w-7xl mx-auto space-y-6">
        <HackathonAlert />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BuddySystem />
          <CourseProgress />
          <QuizModel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;