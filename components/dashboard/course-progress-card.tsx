"use client"

import { BarChart3 } from "lucide-react"
import { DashboardCardJason } from "@/components/ui/dashboard-card-jason"

interface CourseProgress {
  name: string;
  progress: number;
  completed: boolean;
}

interface CourseProgressCardProps {
  data: {
    courses: CourseProgress[];
  };
}

export function CourseProgressCard({ data }: CourseProgressCardProps) {
  // Dados baseados na imagem atual
  const defaultCourses: CourseProgress[] = [
    { name: "Do Zero ao SaaS 01: Autenticação, Banco de Dados e MCP", progress: 100, completed: true },
    { name: "Do Zero ao SaaS 02: Como criar um bom design?", progress: 100, completed: true },
    { name: "Do Zero ao SaaS 01: Primeiros Passos", progress: 100, completed: true },
    { name: "Aulas Extras", progress: 25, completed: false }
  ];

  const courses = data?.courses || defaultCourses;

  return (
    <DashboardCardJason glowColor="green">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Progresso nos Cursos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Acompanhe seu desempenho nos cursos
          </p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 flex-1">
        {courses.map((course, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">
                {course.name}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
                {course.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
          Ver todos os cursos →
        </button>
      </div>
    </DashboardCardJason>
  );
}
