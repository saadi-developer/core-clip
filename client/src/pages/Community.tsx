/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import api from "../configs/axios";
import { toast } from "react-hot-toast";
import { useAuth, useUser, useClerk } from "@clerk/react";

const Community = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { openSignIn } = useClerk();

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      const { data } = await api.get("/api/project/published", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(data.projects);
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      openSignIn();
      return;
    }

    fetchProjects();
  }, [isLoaded, user]);

  return loading ? (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2Icon className="size-7 animate-spin text-pink-500" />
    </div>
  ) : (
    <div className="min-h-screen text-pink-500 p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">Community</h1>
          <p className="text-pink-300">
            See what others are creating within CoreClip.ai
          </p>
        </header>

        {/* projects list */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              gen={project}
              setGenerations={setProjects}
              forCommunity={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
