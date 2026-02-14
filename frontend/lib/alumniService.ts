import api from "./axios";

// Types
export interface AlumniProfile {
  id: string;
  email: string;
  createdAt: string;
  profile: {
    name: string;
    branch: string;
    contact: string | null;
    handles: Record<string, string> | null;
    graduationYear: number | null;
    company: string | null;
    position: string | null;
    location: string | null;
    bio: string | null;
    linkedIn: string | null;
  } | null;
}

// Get all approved alumni for the directory
export const getAlumniList = async (): Promise<AlumniProfile[]> => {
  const response = await api.get("/alumni");
  return response.data.data;
};
