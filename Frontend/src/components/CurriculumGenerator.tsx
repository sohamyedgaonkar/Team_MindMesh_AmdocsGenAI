import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Module {
  name: string;
  description: string;
  topicsCovered: string[];
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  videoUrl?: string; // Added YouTube video URL property
}

const staticCurriculum: { [key: string]: { [key: string]: { [key: string]: Module[] } } } = {
  Python: {
    "Free Course": {
      Beginner: [
        {
          name: "Introduction to Python",
          description: "Learn the basics of Python programming.",
          topicsCovered: ["Syntax", "Variables", "Data Types", "Control Flow"],
          difficultyLevel: "Beginner",
          videoUrl: "https://www.youtube.com/embed/eWRfhZUzrAc", // YouTube video embedded
        },
        {
          name: "Functions & Loops",
          description: "Understand how to use functions and loops effectively.",
          topicsCovered: ["Functions", "Loops", "Recursion", "Lambda"],
          difficultyLevel: "Beginner",
        },
      ],
    },
  },
  "Web Development": {
    "Paid Course": {
      Intermediate: [
        {
          name: "Frontend Development",
          description: "Build modern web interfaces using React and Tailwind CSS.",
          topicsCovered: ["React", "JSX", "Tailwind CSS", "State Management"],
          difficultyLevel: "Intermediate",
        },
        {
          name: "Backend Development",
          description: "Learn how to create REST APIs using Node.js and Express.",
          topicsCovered: ["Node.js", "Express", "MongoDB", "Authentication"],
          difficultyLevel: "Intermediate",
        },
      ],
    },
  },
};

const CurriculumGenerator = () => {
  const [subject, setSubject] = useState("");
  const [courseType, setCourseType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [curriculum, setCurriculum] = useState<Module[]>([]);
  const { toast } = useToast();

  const generateCurriculum = async () => {
    if (!subject.trim() || !courseType || !difficulty) {
      toast({
        title: "Error",
        description: "Please enter all details (subject, course type, difficulty)",
        variant: "destructive",
      });
      return;
    }

    const normalizedSubject = subject.trim();
    if (
      staticCurriculum[normalizedSubject] &&
      staticCurriculum[normalizedSubject][courseType] &&
      staticCurriculum[normalizedSubject][courseType][difficulty]
    ) {
      setCurriculum(staticCurriculum[normalizedSubject][courseType][difficulty]);
      toast({
        title: "Success",
        description: "Static curriculum loaded successfully!",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-curriculum", {
        body: { subject },
      });

      if (error) throw error;

      setCurriculum(JSON.parse(data));
      toast({
        title: "Success",
        description: "Curriculum generated successfully!",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate curriculum. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex flex-col gap-4 mb-8">
        <Input
          placeholder="Enter a subject (e.g., Python, Web Development)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="flex-1"
        />

        <Select onValueChange={setCourseType}>
          <SelectTrigger>
            <SelectValue placeholder="Select Course Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Free Course">Free Course</SelectItem>
            <SelectItem value="Paid Course">Paid Course</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Select Difficulty Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={generateCurriculum} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Curriculum"
          )}
        </Button>
      </div>

      {curriculum.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curriculum.map((module, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {module.name}
                  <span className="text-sm font-normal px-2 py-1 rounded-full bg-accent">
                    {module.difficultyLevel}
                  </span>
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {module.topicsCovered.map((topic, i) => (
                    <span key={i} className="text-sm px-2 py-1 rounded-full bg-secondary">
                      {topic}
                    </span>
                  ))}
                </div>

                {module.videoUrl && (
                  <div className="mt-4">
                    <iframe
                      width="100%"
                      height="200"
                      src={module.videoUrl}
                      title="YouTube Video"
                      frameBorder="0"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurriculumGenerator;
